use std::path::Path;
use std::process::Command;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use crate::nginx::detector::{check_nginx_config, check_port_in_use};
use crate::nginx::models::{NginxControlRequest, NginxStatus};

const CONTROL_TIMEOUT_SECS: u64 = 15;

fn run_nginx_control(exe_path: &str, args: &[&str]) -> Result<(String, String, i32), String> {
    let (tx, rx) = mpsc::channel();
    let exe_path_owned = exe_path.to_string();
    let args_owned: Vec<String> = args.iter().map(|s| s.to_string()).collect();

    let handler = thread::spawn(move || {
        let result = Command::new(&exe_path_owned).args(&args_owned).output();
        let _ = tx.send(result);
    });

    match rx.recv_timeout(Duration::from_secs(CONTROL_TIMEOUT_SECS)) {
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
            Err(format!("Timeout melebihi {} detik", CONTROL_TIMEOUT_SECS))
        }
    }
}

pub fn control_nginx(req: NginxControlRequest) -> Result<String, String> {
    if req.action == "start" || req.action == "restart" || req.action == "reload" {
        let check = check_nginx_config(&req.path);
        if !check.valid {
            return Err(format!("Konfigurasi Nginx tidak valid: {}", check.output));
        }
    }

    match req.action.as_str() {
        "start" => {
            // Periksa konflik port sebelum memulai Nginx
            if check_port_in_use(80) {
                return Err(
                    "Port 80 sudah digunakan oleh proses lain. Tidak dapat memulai Nginx."
                        .to_string(),
                );
            }
            let (_, _, code) = run_nginx_control(&req.path, &[])?;
            if code == 0 {
                Ok("Nginx berhasil dimulai".to_string())
            } else {
                Err(format!("Gagal memulai Nginx (exit code {})", code))
            }
        }
        "stop" => {
            let (_, _, code) = run_nginx_control(&req.path, &["-s", "stop"])?;
            if code == 0 {
                Ok("Nginx berhasil dihentikan".to_string())
            } else {
                Err(format!("Gagal menghentikan Nginx (exit code {})", code))
            }
        }
        "quit" => {
            let (_, _, code) = run_nginx_control(&req.path, &["-s", "quit"])?;
            if code == 0 {
                Ok("Nginx berhenti dengan baik".to_string())
            } else {
                Err(format!("Gagal menghentikan Nginx (exit code {})", code))
            }
        }
        "restart" => {
            let _ = run_nginx_control(&req.path, &["-s", "stop"]);
            thread::sleep(Duration::from_secs(2));
            let (_, _, code) = run_nginx_control(&req.path, &[])?;
            if code == 0 {
                Ok("Nginx berhasil di-restart".to_string())
            } else {
                Err(format!(
                    "Gagal memulai Nginx setelah restart (exit code {})",
                    code
                ))
            }
        }
        "reload" => {
            let (_, _, code) = run_nginx_control(&req.path, &["-s", "reload"])?;
            if code == 0 {
                Ok("Konfigurasi Nginx berhasil di-reload".to_string())
            } else {
                Err(format!("Gagal reload Nginx (exit code {})", code))
            }
        }
        _ => Err(format!("Aksi Nginx tidak dikenal: {}", req.action)),
    }
}

pub fn get_nginx_status(exe_path: &str) -> NginxStatus {
    if crate::nginx::detector::is_nginx_running() {
        NginxStatus::Running
    } else if Path::new(exe_path).exists() {
        NginxStatus::Stopped
    } else {
        NginxStatus::NotFound
    }
}
