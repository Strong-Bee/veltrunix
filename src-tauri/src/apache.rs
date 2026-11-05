use serde::Serialize;
use std::{path::Path, process::Command};

#[derive(Debug, Clone, Serialize)]
pub struct ApacheInfo {
    pub name: String,
    pub status: String,
    pub version: Option<String>,
    pub path: Option<String>,
    pub config_path: Option<String>,
    pub error: Option<String>,
}

fn find_apache() -> Option<String> {
    if let Ok(path) = std::env::var("PATH") {
        for dir in path.split(';') {
            let candidate = Path::new(dir.trim()).join("httpd.exe");
            if candidate.is_file() { return Some(candidate.to_string_lossy().into_owned()); }
        }
    }
    for root in [r"C:\Apache24\bin\httpd.exe", r"C:\xampp\apache\bin\httpd.exe",
        r"C:\laragon\bin\apache\httpd-2.4.\bin\httpd.exe",
        r"C:\Program Files\Apache Group\Apache2\bin\httpd.exe"] {
        let p = Path::new(root);
        if p.is_file() { return Some(p.to_string_lossy().into_owned()); }
    }
    None
}

fn is_running() -> bool {
    Command::new("tasklist").args(["/FI", "IMAGENAME eq httpd.exe"]).output()
        .map(|o| String::from_utf8_lossy(&o.stdout).contains("httpd.exe")).unwrap_or(false)
}

pub fn detect_apache(explicit_path: Option<String>) -> ApacheInfo {
    let path = explicit_path.or_else(find_apache);
    let Some(path) = path else {
        return ApacheInfo { name: "Apache".into(), status: "Not found".into(), version: None, path: None, config_path: None, error: None };
    };
    if !Path::new(&path).is_file() {
        return ApacheInfo { name: "Apache".into(), status: "Error".into(), version: None, path: Some(path), config_path: None, error: Some("httpd.exe tidak ditemukan.".into()) };
    }
    let output = Command::new(&path).arg("-v").output();
    let (version, error) = match output {
        Ok(o) if o.status.success() => {
            let text = String::from_utf8_lossy(&o.stdout).to_string();
            (text.lines().find(|l| l.contains("Apache/")).map(str::to_string), None)
        }
        Ok(o) => (None, Some(String::from_utf8_lossy(&o.stderr).to_string())),
        Err(e) => (None, Some(e.to_string())),
    };
    let config = Path::new(&path).parent().map(|p| p.join("../conf/httpd.conf")).filter(|p| p.is_file()).map(|p| p.to_string_lossy().into_owned());
    ApacheInfo { name: "Apache".into(), status: if is_running() { "Running".into() } else { "Installed".into() }, version, path: Some(path), config_path: config, error }
}

pub fn control_apache(path: String, action: String) -> Result<String, String> {
    if !Path::new(&path).is_file() { return Err("httpd.exe tidak ditemukan.".into()); }
    if !matches!(action.as_str(), "start" | "stop" | "restart") { return Err("Aksi Apache tidak dikenal.".into()); }
    if action == "start" || action == "restart" {
        if crate::nginx::detector::check_port_in_use(80) && !is_running() {
            return Err("Port 80 sedang digunakan. Hentikan service yang memakai port tersebut terlebih dahulu.".into());
        }
        let test = Command::new(&path).arg("-t").output().map_err(|e| e.to_string())?;
        if !test.status.success() {
            return Err(format!("Konfigurasi Apache tidak valid: {}", String::from_utf8_lossy(&test.stderr)));
        }
    }
    let verb = if action == "restart" { "restart" } else if action == "start" { "start" } else { "stop" };
    let output = Command::new(&path).args(["-k", verb]).output().map_err(|e| format!("Gagal menjalankan Apache: {e}"))?;
    if output.status.success() { Ok(format!("Apache berhasil {verb}.")) }
    else { Err(format!("Apache gagal {verb}: {}", String::from_utf8_lossy(&output.stderr))) }
}
