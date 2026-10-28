use std::fs;
use std::path::Path;
use std::process::Command;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use crate::nginx::models::{NginxConfigCheck, NginxInfo, NginxStatus};

const VERSION_TIMEOUT_SECS: u64 = 10;
const CONFIG_TIMEOUT_SECS: u64 = 10;

const STANDARD_NGINX_DIRS: &[&str] = &[
    "C:\\nginx",
    "C:\\Program Files\\nginx",
    "C:\\Program Files (x86)\\nginx",
    "C:\\xampp\\nginx",
    "C:\\laragon\\bin\\nginx",
];

pub fn find_executable_in_path(exe_name: &str) -> Option<String> {
    if let Ok(path_var) = std::env::var("PATH") {
        for dir in path_var.split(';') {
            let dir = dir.trim();
            if dir.is_empty() {
                continue;
            }
            let clean_dir = dir.trim_end_matches('\\').trim_end_matches('/');
            let full_path = format!("{}\\{}", clean_dir, exe_name);
            if Path::new(&full_path).exists() && Path::new(&full_path).is_file() {
                return Some(full_path);
            }
        }
    }
    None
}

pub fn find_nginx_in_standard_locations() -> Option<String> {
    for dir in STANDARD_NGINX_DIRS {
        let path = Path::new(dir);
        if !path.exists() || !path.is_dir() {
            continue;
        }
        let exe = path.join("nginx.exe");
        if exe.is_file() {
            return Some(exe.to_string_lossy().to_string());
        }
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let subpath = entry.path();
                if subpath.is_dir() {
                    let exe = subpath.join("nginx.exe");
                    if exe.is_file() {
                        return Some(exe.to_string_lossy().to_string());
                    }
                }
            }
        }
    }
    None
}

fn run_nginx_command(
    exe_path: &str,
    args: &[&str],
    timeout_secs: u64,
) -> Result<(String, String, i32), String> {
    let (tx, rx) = mpsc::channel();
    let exe_path_owned = exe_path.to_string();
    let args_owned: Vec<String> = args.iter().map(|s| s.to_string()).collect();

    let handler = thread::spawn(move || {
        let result = Command::new(&exe_path_owned).args(&args_owned).output();
        let _ = tx.send(result);
    });

    match rx.recv_timeout(Duration::from_secs(timeout_secs)) {
        Ok(Ok(output)) => {
            let _ = handler.join();
            let stdout = String::from_utf8_lossy(&output.stdout).trim().to_string();
            let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
            let code = output.status.code().unwrap_or(-1);
            Ok((stdout, stderr, code))
        }
        Ok(Err(e)) => {
            let _ = handler.join();
            Err(format!("Gagal menjalankan {}: {}", exe_path, e))
        }
        Err(_) => {
            let _ = handler.join();
            Err(format!("Timeout melebihi {} detik", timeout_secs))
        }
    }
}

fn extract_version(output: &str) -> String {
    // nginx version: nginx/1.24.0
    for line in output.lines() {
        let line = line.trim();
        if line.starts_with("nginx/") {
            return line["nginx/".len()..].trim().to_string();
        }
    }
    let first_line = output.lines().next().unwrap_or(output);
    let chars: Vec<char> = first_line.chars().collect();
    let mut version_chars: Vec<char> = Vec::new();
    let mut started = false;
    let mut i = 0;

    while i < chars.len() {
        let ch = chars[i];
        if ch.is_ascii_digit() {
            if !started {
                started = true;
            }
            version_chars.push(ch);
            i += 1;
        } else if ch == '.' && started && i + 1 < chars.len() && chars[i + 1].is_ascii_digit() {
            version_chars.push(ch);
            i += 1;
        } else if started {
            break;
        } else {
            i += 1;
        }
    }

    let result: String = version_chars.into_iter().collect();
    if result.is_empty() {
        first_line.to_string()
    } else {
        result
    }
}

fn find_nginx_config(exe_path: &str) -> Option<String> {
    match run_nginx_command(exe_path, &["-V"], CONFIG_TIMEOUT_SECS) {
        Ok((stdout, _, code)) => {
            if code == 0 {
                for line in stdout.lines() {
                    let line = line.trim();
                    if line.starts_with("--conf-path=") {
                        return Some(line["--conf-path=".len()..].trim().to_string());
                    }
                }
            }
        }
        Err(_) => {}
    }
    if let Some(dir) = Path::new(exe_path).parent() {
        let conf = dir.join("..").join("conf").join("nginx.conf");
        if conf.exists() {
            return Some(conf.to_string_lossy().to_string());
        }
        let conf = dir.join("conf").join("nginx.conf");
        if conf.exists() {
            return Some(conf.to_string_lossy().to_string());
        }
    }
    None
}

pub fn detect_nginx(explicit_path: Option<String>) -> NginxInfo {
    let exe_path = match explicit_path {
        Some(p) => {
            if Path::new(&p).exists() && Path::new(&p).is_file() {
                p
            } else {
                return NginxInfo {
                    name: "nginx".to_string(),
                    status: NginxStatus::Error,
                    version: None,
                    path: Some(p),
                    config_path: None,
                    error: Some(
                        "Executable Nginx yang diberikan tidak ditemukan atau bukan file"
                            .to_string(),
                    ),
                };
            }
        }
        None => match find_executable_in_path("nginx.exe")
            .or_else(|| find_nginx_in_standard_locations())
        {
            Some(p) => p,
            None => {
                return NginxInfo {
                    name: "nginx".to_string(),
                    status: NginxStatus::NotFound,
                    version: None,
                    path: None,
                    config_path: None,
                    error: None,
                };
            }
        },
    };

    let version = match run_nginx_command(&exe_path, &["-v"], VERSION_TIMEOUT_SECS) {
        Ok((stdout, stderr, code)) => {
            if code == 0 {
                let output = if !stdout.is_empty() { stdout } else { stderr };
                extract_version(&output)
            } else {
                return NginxInfo {
                    name: "nginx".to_string(),
                    status: NginxStatus::Error,
                    version: None,
                    path: Some(exe_path.clone()),
                    config_path: None,
                    error: Some(format!(
                        "Gagal mendapatkan versi Nginx (exit code {}): {}",
                        code, stderr
                    )),
                };
            }
        }
        Err(err) => {
            return NginxInfo {
                name: "nginx".to_string(),
                status: NginxStatus::Error,
                version: None,
                path: Some(exe_path.clone()),
                config_path: None,
                error: Some(err),
            };
        }
    };

    let config_path = find_nginx_config(&exe_path);

    NginxInfo {
        name: "nginx".to_string(),
        status: NginxStatus::Installed,
        version: Some(version),
        path: Some(exe_path),
        config_path,
        error: None,
    }
}

pub fn check_nginx_config(exe_path: &str) -> NginxConfigCheck {
    match run_nginx_command(exe_path, &["-t"], CONFIG_TIMEOUT_SECS) {
        Ok((stdout, stderr, code)) => {
            let output = if !stdout.is_empty() { stdout } else { stderr };
            let valid = code == 0;
            NginxConfigCheck {
                valid,
                output,
                error: if valid {
                    None
                } else {
                    Some(format!(
                        "Konfigurasi Nginx tidak valid (exit code {})",
                        code
                    ))
                },
            }
        }
        Err(err) => NginxConfigCheck {
            valid: false,
            output: String::new(),
            error: Some(err),
        },
    }
}

pub fn check_port_in_use(port: u16) -> bool {
    if let Ok(output) = Command::new("netstat").args(&["-ano"]).output() {
        let output_str = String::from_utf8_lossy(&output.stdout);
        let port_str = port.to_string();
        for line in output_str.lines() {
            let line = line.trim();
            if line.contains(&format!(":{port_str}")) && line.contains("LISTENING") {
                return true;
            }
        }
    }
    false
}

pub fn is_nginx_running() -> bool {
    if let Ok(output) = Command::new("tasklist")
        .args(&["/FI", "IMAGENAME eq nginx.exe"])
        .output()
    {
        let output_str = String::from_utf8_lossy(&output.stdout);
        return output_str.contains("nginx.exe");
    }
    false
}

pub fn get_nginx_status(exe_path: &str) -> NginxStatus {
    if is_nginx_running() {
        NginxStatus::Running
    } else if Path::new(exe_path).exists() {
        NginxStatus::Stopped
    } else {
        NginxStatus::NotFound
    }
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_version_nginx() {
        assert_eq!(extract_version("nginx/1.24.0"), "1.24.0");
        assert_eq!(extract_version("nginx version: nginx/1.24.0"), "1.24.0");
    }

    #[test]
    fn test_extract_version_unknown() {
        assert_eq!(extract_version("unknown output"), "unknown output");
    }

    #[test]
    fn test_extract_version_empty() {
        assert_eq!(extract_version(""), "");
    }

    #[test]
    fn test_check_port_in_use() {
        // Port 0 tidak valid, hanya memastikan fungsi tidak panic
        let _ = check_port_in_use(0);
    }

    #[test]
    fn test_is_valid_domain() {
        assert!(is_valid_domain("myproject.test"));
        assert!(is_valid_domain("example.com"));
        assert!(!is_valid_domain(""));
        assert!(!is_valid_domain("invalid domain"));
        assert!(!is_valid_domain("-invalid.com"));
        assert!(!is_valid_domain("invalid-.com"));
    }

    fn is_valid_domain(domain: &str) -> bool {
        if domain.is_empty() || domain.len() > 253 {
            return false;
        }
        let parts: Vec<&str> = domain.split('.').collect();
        if parts.len() < 2 {
            return false;
        }
        for part in &parts {
            if part.is_empty() || part.len() > 63 {
                return false;
            }
            if !part.chars().all(|c| c.is_alphanumeric() || c == '-') {
                return false;
            }
            if part.starts_with('-') || part.ends_with('-') {
                return false;
            }
        }
        true
    }
}
