use std::process::Command;
use std::sync::mpsc;
use std::thread;
use std::time::Duration;

use crate::runtime::models::{RuntimeInfo, RuntimeStatus, RuntimeType};

const VERSION_TIMEOUT_SECS: u64 = 10;

fn find_executable_in_path(exe_name: &str) -> Option<String> {
    if let Ok(path_var) = std::env::var("PATH") {
        for dir in path_var.split(';') {
            let dir = dir.trim();
            if dir.is_empty() {
                continue;
            }
            // Gabungkan direktori dan nama executable; handles path dengan spasi
            let clean_dir = dir.trim_end_matches('\\').trim_end_matches('/');
            let full_path = format!("{}\\{}", clean_dir, exe_name);
            if std::path::Path::new(&full_path).exists()
                && std::path::Path::new(&full_path).is_file()
            {
                return Some(full_path);
            }
        }
    }
    None
}

/// Cari executable dalam PATH untuk RuntimeType yang diberikan.
fn find_executable(rt: &RuntimeType) -> Option<String> {
    for exe_name in rt.executable_names() {
        if let Some(path) = find_executable_in_path(exe_name) {
            return Some(path);
        }
    }
    None
}

/// Jalankan perintah versi dengan timeout melalui channel.
/// Mengembalikan (stdout, stderr, exit_code).
fn run_version_command(exe_path: &str, args: &[&str]) -> Result<(String, String, i32), String> {
    let (tx, rx) = mpsc::channel();

    let exe_path_owned = exe_path.to_string();
    let args_owned: Vec<String> = args.iter().map(|s| s.to_string()).collect();

    let handler = thread::spawn(move || {
        let result = Command::new(&exe_path_owned).args(&args_owned).output();
        let _ = tx.send(result);
    });

    match rx.recv_timeout(Duration::from_secs(VERSION_TIMEOUT_SECS)) {
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
            // Thread masih berjalan di background; abaikan
            let _ = handler.join();
            Err(format!("Timeout melebihi {} detik", VERSION_TIMEOUT_SECS))
        }
    }
}

/// Ekstrak angka versi dari output baris pertama.
/// Contoh: "PHP 8.2.12 (cli)" -> "8.2.12", "v18.17.0" -> "v18.17.0",
/// "git version 2.40.1.windows.1" -> "2.40.1"
fn extract_version(output: &str) -> String {
    let first_line = output.lines().next().unwrap_or(output);
    let chars: Vec<char> = first_line.chars().collect();

    let mut version_chars: Vec<char> = Vec::new();
    let mut started = false;
    let mut digit_count = 0;
    let mut i = 0;

    while i < chars.len() {
        let ch = chars[i];
        if ch.is_ascii_digit() {
            if !started {
                started = true;
            }
            version_chars.push(ch);
            digit_count += 1;
            i += 1;
        } else if ch == '.' && started && i + 1 < chars.len() && chars[i + 1].is_ascii_digit() {
            version_chars.push(ch);
            i += 1;
        } else if ch == 'v'
            && !started
            && digit_count == 0
            && i + 1 < chars.len()
            && chars[i + 1].is_ascii_digit()
        {
            version_chars.push(ch);
            started = true;
            i += 1;
        } else if started {
            break;
        } else {
            i += 1;
        }
    }

    let result: String = version_chars.into_iter().collect();
    if result.is_empty() || result == "v" {
        first_line.to_string()
    } else {
        result
    }
}

/// Deteksi satu runtime. Mengembalikan RuntimeInfo dengan status terbaru.
pub fn detect_runtime(rt: RuntimeType) -> RuntimeInfo {
    match find_executable(&rt) {
        Some(path) => {
            let args = rt.version_args();
            match run_version_command(&path, &args) {
                Ok((stdout, stderr, code)) => {
                    if code == 0 {
                        let output = if !stdout.is_empty() {
                            stdout
                        } else if !stderr.is_empty() {
                            stderr
                        } else {
                            format!("exit code {}", code)
                        };
                        let version = extract_version(&output);
                        RuntimeInfo {
                            name: rt.as_str().to_string(),
                            status: RuntimeStatus::Installed,
                            version: Some(version),
                            path: Some(path),
                            error: None,
                        }
                    } else {
                        RuntimeInfo {
                            name: rt.as_str().to_string(),
                            status: RuntimeStatus::Error,
                            version: None,
                            path: Some(path),
                            error: Some(format!("Exit code {}: {}", code, stderr)),
                        }
                    }
                }
                Err(err) => RuntimeInfo {
                    name: rt.as_str().to_string(),
                    status: RuntimeStatus::Error,
                    version: None,
                    path: Some(path),
                    error: Some(err),
                },
            }
        }
        None => RuntimeInfo {
            name: rt.as_str().to_string(),
            status: RuntimeStatus::NotFound,
            version: None,
            path: None,
            error: None,
        },
    }
}

/// Deteksi semua runtime yang didukung.
pub fn detect_all_runtimes() -> Vec<RuntimeInfo> {
    RuntimeType::all().into_iter().map(detect_runtime).collect()
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_extract_version_php() {
        let output = "PHP 8.2.12 (cli) (built: Oct 24 2023 15:23:45) (ZTS Visual C++ 2019 x64)\nCopyright (c) The PHP Group\nZend Engine v4.2.12";
        assert_eq!(extract_version(output), "8.2.12");
    }

    #[test]
    fn test_extract_version_node() {
        let output = "v18.17.0";
        assert_eq!(extract_version(output), "v18.17.0");
    }

    #[test]
    fn test_extract_version_npm() {
        let output = "9.6.7";
        assert_eq!(extract_version(output), "9.6.7");
    }

    #[test]
    fn test_extract_version_git() {
        let output = "git version 2.40.1.windows.1";
        assert_eq!(extract_version(output), "2.40.1");
    }

    #[test]
    fn test_extract_version_composer() {
        let output = "Composer 2.5.8 2023-06-15 14:30:20";
        assert_eq!(extract_version(output), "2.5.8");
    }

    #[test]
    fn test_extract_version_unknown_format() {
        let output = "Some unknown output without version";
        assert_eq!(
            extract_version(output),
            "Some unknown output without version"
        );
    }

    #[test]
    fn test_extract_version_empty() {
        assert_eq!(extract_version(""), "");
    }

    #[test]
    fn test_runtime_type_as_str() {
        assert_eq!(RuntimeType::Php.as_str(), "php");
        assert_eq!(RuntimeType::Node.as_str(), "node");
        assert_eq!(RuntimeType::Npm.as_str(), "npm");
        assert_eq!(RuntimeType::Composer.as_str(), "composer");
        assert_eq!(RuntimeType::Git.as_str(), "git");
    }

    #[test]
    fn test_runtime_type_all_count() {
        assert_eq!(RuntimeType::all().len(), 5);
    }

    #[test]
    fn test_runtime_status_as_str() {
        assert_eq!(RuntimeStatus::Installed.as_str(), "Installed");
        assert_eq!(RuntimeStatus::NotFound.as_str(), "Not found");
        assert_eq!(RuntimeStatus::Error.as_str(), "Error");
    }

    #[test]
    fn test_find_executable_in_path_handles_spaces() {
        // Buat direktori temporary dengan spasi dalam nama
        let tmp_dir = std::env::temp_dir().join("Veltrunix Test Dir");
        let _ = std::fs::create_dir_all(&tmp_dir);

        let fake_exe = tmp_dir.join("php.exe");
        let _ = std::fs::File::create(&fake_exe);

        // Tambahkan direktori ke PATH untuk tes ini
        let old_path = std::env::var("PATH").unwrap_or_default();
        unsafe {
            std::env::set_var(
                "PATH",
                format!("{}{}{}", tmp_dir.to_string_lossy(), ";", old_path),
            );
        }

        let result = find_executable_in_path("php.exe");
        assert!(result.is_some());
        assert!(result.unwrap().contains("Veltrunix Test Dir"));

        // Bersihkan
        let _ = std::fs::remove_file(&fake_exe);
        let _ = std::fs::remove_dir(&tmp_dir);
        unsafe {
            std::env::set_var("PATH", &old_path);
        }
    }

    #[test]
    fn test_detect_all_runtimes_returns_five() {
        let results = detect_all_runtimes();
        assert_eq!(results.len(), 5);
        let names: Vec<&str> = results.iter().map(|r| r.name.as_str()).collect();
        assert!(names.contains(&"php"));
        assert!(names.contains(&"node"));
        assert!(names.contains(&"npm"));
        assert!(names.contains(&"composer"));
        assert!(names.contains(&"git"));
    }

    #[test]
    fn test_runtime_info_serialization() {
        let info = RuntimeInfo {
            name: "php".to_string(),
            status: RuntimeStatus::Installed,
            version: Some("8.2.12".to_string()),
            path: Some("C:\\PHP\\php.exe".to_string()),
            error: None,
        };
        let json = serde_json::to_string(&info).unwrap();
        assert!(json.contains("php"));
        assert!(json.contains("Installed"));
        assert!(json.contains("8.2.12"));
    }
}
