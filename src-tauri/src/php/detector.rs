use std::fs;
use std::path::Path;
use std::process::Command;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use crate::php::models::{DetectPhpRequest, PhpInfo, PhpStatus};

const VERSION_TIMEOUT_SECS: u64 = 10;
const CONFIG_TIMEOUT_SECS: u64 = 10;

const STANDARD_PHP_DIRS: &[&str] = &[
    "C:\\php",
    "C:\\xampp\\php",
    "C:\\laragon\\bin\\php",
    "C:\\Program Files\\PHP",
    "C:\\Program Files (x86)\\PHP",
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

pub fn find_php_in_standard_locations(exe_name: &str) -> Option<String> {
    for dir in STANDARD_PHP_DIRS {
        let path = Path::new(dir);
        if !path.exists() || !path.is_dir() {
            continue;
        }
        let exe = path.join(exe_name);
        if exe.is_file() {
            return Some(exe.to_string_lossy().to_string());
        }
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let subpath = entry.path();
                if subpath.is_dir() {
                    let exe = subpath.join(exe_name);
                    if exe.is_file() {
                        return Some(exe.to_string_lossy().to_string());
                    }
                }
            }
        }
    }
    None
}

pub fn find_php_ini(exe_path: &str) -> Option<String> {
    match run_php_command(exe_path, &["-i"], CONFIG_TIMEOUT_SECS) {
        Ok((stdout, _, code)) => {
            if code == 0 {
                for line in stdout.lines() {
                    let line = line.trim();
                    if line.starts_with("Loaded Configuration File") {
                        let parts: Vec<&str> = line.splitn(2, "=>").collect();
                        if parts.len() >= 2 {
                            let ini_path = parts[1].trim();
                            if !ini_path.is_empty() && ini_path != "(none)" {
                                return Some(ini_path.to_string());
                            }
                        }
                    }
                }
            }
        }
        Err(_) => {}
    }
    // Fallback: look for php.ini next to php.exe
    if let Some(dir) = Path::new(exe_path).parent() {
        let ini = dir.join("php.ini");
        if ini.exists() {
            return Some(ini.to_string_lossy().to_string());
        }
    }
    None
}

pub fn extract_php_extensions(exe_path: &str) -> Vec<String> {
    match run_php_command(exe_path, &["-m"], CONFIG_TIMEOUT_SECS) {
        Ok((stdout, _, code)) => {
            if code == 0 {
                let mut extensions = Vec::new();
                let mut in_extensions = false;
                for line in stdout.lines() {
                    let line = line.trim();
                    if line == "[PHP Modules]" {
                        in_extensions = true;
                        continue;
                    }
                    if line.starts_with('[') && line.ends_with(']') {
                        if in_extensions {
                            break;
                        }
                        continue;
                    }
                    if in_extensions && !line.is_empty() {
                        extensions.push(line.to_string());
                    }
                }
                return extensions;
            }
        }
        Err(_) => {}
    }
    Vec::new()
}

pub fn extract_php_version(output: &str) -> String {
    // PHP version output: PHP 8.2.12 (cli) (built: ...)
    for line in output.lines() {
        let line = line.trim();
        if line.starts_with("PHP ") {
            let parts: Vec<&str> = line.split_whitespace().collect();
                if parts.len() >= 2 {
                    return parts[1].trim().to_string();
                }
        }
    }
    // Fallback: try to find version pattern
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

fn run_php_command(
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

pub fn detect_php(req: DetectPhpRequest) -> PhpInfo {
    let exe_path = match req.path {
        Some(p) => {
            if Path::new(&p).exists() && Path::new(&p).is_file() {
                p
            } else {
                return PhpInfo {
                    name: "php".to_string(),
                    status: PhpStatus::Error,
                    version: None,
                    path: Some(p),
                    php_ini_path: None,
                    extensions: Vec::new(),
                    error: Some(
                        "Executable PHP yang diberikan tidak ditemukan atau bukan file"
                            .to_string(),
                    ),
                };
            }
        }
        None => match find_executable_in_path("php.exe")
            .or_else(|| find_php_in_standard_locations("php.exe"))
        {
            Some(p) => p,
            None => {
                return PhpInfo {
                    name: "php".to_string(),
                    status: PhpStatus::NotFound,
                    version: None,
                    path: None,
                    php_ini_path: None,
                    extensions: Vec::new(),
                    error: None,
                };
            }
        },
    };

    let version = match run_php_command(&exe_path, &["-v"], VERSION_TIMEOUT_SECS) {
        Ok((stdout, stderr, code)) => {
            if code == 0 {
                let output = if !stdout.is_empty() { stdout } else { stderr };
                extract_php_version(&output)
            } else {
                return PhpInfo {
                    name: "php".to_string(),
                    status: PhpStatus::Error,
                    version: None,
                    path: Some(exe_path.clone()),
                    php_ini_path: None,
                    extensions: Vec::new(),
                    error: Some(format!(
                        "Gagal mendapatkan versi PHP (exit code {}): {}",
                        code, stderr
                    )),
                };
            }
        }
        Err(err) => {
            return PhpInfo {
                name: "php".to_string(),
                status: PhpStatus::Error,
                version: None,
                path: Some(exe_path.clone()),
                php_ini_path: None,
                extensions: Vec::new(),
                error: Some(err),
            };
        }
    };

    let php_ini_path = find_php_ini(&exe_path);
    let extensions = extract_php_extensions(&exe_path);

    // Check if php-cgi.exe exists next to php.exe
    let php_cgi_path = Path::new(&exe_path)
        .parent()
        .and_then(|dir| Some(dir.join("php-cgi.exe")))
        .filter(|p| p.exists() && p.is_file())
        .and_then(|p| p.to_str().map(|s| s.to_string()));

    let has_cgi = php_cgi_path.is_some();

    PhpInfo {
        name: "php".to_string(),
        status: if has_cgi {
            PhpStatus::Installed
        } else {
            PhpStatus::Installed
        },
        version: Some(version),
        path: Some(exe_path),
        php_ini_path,
        extensions,
        error: None,
    }
}

pub fn check_php_port_in_use(port: u16) -> bool {
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

pub fn is_php_cgi_running_on_port(port: u16) -> bool {
    check_php_port_in_use(port)
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_php_version() {
        assert_eq!(
            extract_php_version("PHP 8.2.12 (cli) (built: Oct  8 2023 14:28:10)"),
            "8.2.12"
        );
        assert_eq!(
            extract_php_version("PHP 8.1.0 (cli) (built: ...)"),
            "8.1.0"
        );
    }

    #[test]
    fn test_extract_php_version_unknown() {
        assert_eq!(extract_php_version("unknown output"), "unknown output");
    }

    #[test]
    fn test_extract_php_version_empty() {
        assert_eq!(extract_php_version(""), "");
    }

    #[test]
    fn test_check_php_port_in_use() {
        // Port 0 tidak valid, hanya memastikan fungsi tidak panic
        let _ = check_php_port_in_use(0);
    }
}
