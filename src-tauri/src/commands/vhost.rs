use tauri::command;

use crate::nginx::fastcgi::detect_php_cgi;

#[command]
pub fn detect_php_cgi_cmd() -> Option<String> {
    detect_php_cgi()
}
