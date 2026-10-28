use tauri::command;

use crate::php::detector::{detect_php, check_php_port_in_use};
use crate::php::manager::{
    start_php_cgi, stop_php_cgi, get_php_cgi_status, list_php_cgi_processes, stop_all_php_cgi,
};
use crate::php::models::{
    DetectPhpRequest, PhcgiStatus, PhpControlRequest, PhpInfo,
};

#[command]
pub fn detect_php_cmd(req: DetectPhpRequest) -> PhpInfo {
    detect_php(req)
}

#[command]
pub fn check_php_port_cmd(port: u16) -> bool {
    check_php_port_in_use(port)
}

#[command]
pub fn start_php_cgi_cmd(
    path: String,
    port: u16,
    address: String,
) -> Result<crate::php::models::PhcgiProcessInfo, String> {
    start_php_cgi(&path, port, &address)
}

#[command]
pub fn stop_php_cgi_cmd(port: u16) -> Result<(), String> {
    stop_php_cgi(port)
}

#[command]
pub fn get_php_cgi_status_cmd(port: u16) -> PhcgiStatus {
    get_php_cgi_status(port)
}

#[command]
pub fn list_php_cgi_processes_cmd() -> Vec<crate::php::models::PhcgiProcessInfo> {
    list_php_cgi_processes()
}

#[command]
pub fn stop_all_php_cgi_cmd() -> Result<(), String> {
    stop_all_php_cgi()
}

#[command]
pub fn control_php_cgi_cmd(req: PhpControlRequest) -> Result<String, String> {
    match req.action.as_str() {
        "start" => {
            let port = req.port.ok_or_else(|| "Port tidak ditentukan".to_string())?;
            let address = "127.0.0.1".to_string();
            let info = start_php_cgi(&req.path, port, &address)?;
            Ok(format!(
                "PHP-CGI berjalan pada {} (PID {})",
                info.address, info.pid
            ))
        }
        "stop" => {
            let port = req.port.ok_or_else(|| "Port tidak ditentukan".to_string())?;
            stop_php_cgi(port)?;
            Ok(format!("PHP-CGI pada port {} berhasil dihentikan", port))
        }
        "status" => {
            let port = req.port.ok_or_else(|| "Port tidak ditentukan".to_string())?;
            let status = get_php_cgi_status(port);
            if status.running {
                Ok(format!(
                    "PHP-CGI berjalan pada {}",
                    status.address.unwrap_or_default()
                ))
            } else {
                Ok("PHP-CGI tidak berjalan".to_string())
            }
        }
        _ => Err(format!("Aksi PHP-CGI tidak dikenal: {}", req.action)),
    }
}
