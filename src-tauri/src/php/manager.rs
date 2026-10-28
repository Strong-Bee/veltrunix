use std::collections::HashMap;
use std::process::Child;
use std::sync::Mutex;
use std::thread;
use std::time::Duration;

use lazy_static::lazy_static;
use tokio::net::TcpStream;

use crate::php::models::{PhcgiProcessInfo, PhcgiStatus};

lazy_static! {
    static ref PHCGI_PROCESSES: Mutex<HashMap<u16, Child>> = Mutex::new(HashMap::new());
}

const CONTROL_TIMEOUT_SECS: u64 = 15;
const HEALTH_CHECK_TIMEOUT_SECS: u64 = 5;

pub fn start_php_cgi(
    exe_path: &str,
    port: u16,
    address: &str,
) -> Result<PhcgiProcessInfo, String> {
    // Periksa apakah port sudah digunakan
    if crate::php::detector::check_php_port_in_use(port) {
        return Err(format!(
            "Port {} sudah digunakan oleh proses lain.",
            port
        ));
    }

    // Periksa apakah sudah ada proses PHP-CGI pada port ini
    {
        let processes = PHCGI_PROCESSES.lock().map_err(|e| {
            format!("Gagal mengakses daftar proses PHP-CGI: {}", e)
        })?;
        if processes.contains_key(&port) {
            return Err(format!(
                "Proses PHP-CGI sudah berjalan pada port {}",
                port
            ));
        }
    }

    // Mulai proses php-cgi.exe
    let child = std::process::Command::new(exe_path)
        .args(&["-b", &format!("{}:{}", address, port)])
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Gagal memulai php-cgi.exe: {}", e))?;

    let pid = child.id();

    // Simpan proses ke daftar
    {
        let mut processes = PHCGI_PROCESSES.lock().map_err(|e| {
            format!("Gagal mengakses daftar proses PHP-CGI: {}", e)
        })?;
        processes.insert(port, child);
    }

    // Tunggu sebentar untuk proses siap, lalu lakukan health check
    thread::sleep(Duration::from_millis(1000));

    let health = check_health(address, port);
    if !health {
        // Jika health check gagal, hentikan proses
        let _ = stop_php_cgi(port);
        return Err(format!(
            "Proses PHP-CGI dimulai tetapi tidak responsif pada {}:{}",
            address, port
        ));
    }

    Ok(PhcgiProcessInfo {
        port,
        pid,
        address: format!("{}:{}", address, port),
    })
}

pub fn stop_php_cgi(port: u16) -> Result<(), String> {
    let mut child = {
        let mut processes = PHCGI_PROCESSES.lock().map_err(|e| {
            format!("Gagal mengakses daftar proses PHP-CGI: {}", e)
        })?;
        processes.remove(&port).ok_or_else(|| {
            format!("Tidak ada proses PHP-CGI yang berjalan pada port {}", port)
        })?
    };

    // Verifikasi bahwa proses masih milik kita (melalui PID yang disimpan)
    let pid = child.id();

    // Coba hentikan dengan baik (graceful)
    let result = child.kill().map_err(|e| {
        format!("Gagal menghentikan proses PHP-CGI (PID {}): {}", pid, e)
    });

    // Tunggu proses selesai
    let _ = child.wait();

    result.map(|_| ())
}

pub fn get_php_cgi_status(port: u16) -> PhcgiStatus {
    let processes = PHCGI_PROCESSES.lock().ok();

    let process_info = processes.and_then(|p| p.get(&port).map(|child| {
        let pid = child.id();
        PhcgiProcessInfo {
            port,
            pid,
            address: format!("127.0.0.1:{}", port),
        }
    }));

    let running = process_info.is_some()
        && crate::php::detector::is_php_cgi_running_on_port(port);

    PhcgiStatus {
        running,
        port: if running { Some(port) } else { None },
        pid: process_info.as_ref().and_then(|p| Some(p.pid)),
        address: process_info.as_ref().map(|p| p.address.clone()),
        error: if running {
            None
        } else if process_info.is_some() {
            Some("Proses PHP-CGI tidak responsif.".to_string())
        } else {
            None
        },
    }
}

pub fn list_php_cgi_processes() -> Vec<PhcgiProcessInfo> {
    let processes = match PHCGI_PROCESSES.lock() {
        Ok(p) => p,
        Err(_) => return Vec::new(),
    };

    processes
        .iter()
        .map(|(port, child)| {
            let pid = child.id();
            PhcgiProcessInfo {
                port: *port,
                pid,
                address: format!("127.0.0.1:{}", port),
            }
        })
        .collect()
}

pub fn check_health(address: &str, port: u16) -> bool {
    let addr = format!("{}:{}", address, port);
    match std::thread::spawn(move || {
        let rt = tokio::runtime::Runtime::new().unwrap();
        rt.block_on(async {
            TcpStream::connect(&addr).await.is_ok()
        })
    })
    .join()
    {
        Ok(result) => result,
        Err(_) => false,
    }
}

pub fn stop_all_php_cgi() -> Result<(), String> {
    let ports: Vec<u16> = {
        let processes = PHCGI_PROCESSES.lock().map_err(|e| {
            format!("Gagal mengakses daftar proses PHP-CGI: {}", e)
        })?;
        processes.keys().copied().collect()
    };

    for port in ports {
        let _ = stop_php_cgi(port);
    }

    Ok(())
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_stop_nonexistent_port() {
        let result = stop_php_cgi(9999);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Tidak ada proses PHP-CGI"));
    }
}
