use std::path::Path;

pub fn detect_php_cgi() -> Option<String> {
    if let Ok(path_var) = std::env::var("PATH") {
        for dir in path_var.split(';') {
            let dir = dir.trim();
            if dir.is_empty() {
                continue;
            }
            let clean_dir = dir.trim_end_matches('\\').trim_end_matches('/');
            let full_path = format!("{}\\php-cgi.exe", clean_dir);
            if Path::new(&full_path).exists() && Path::new(&full_path).is_file() {
                return Some(full_path);
            }
        }
    }
    None
}
