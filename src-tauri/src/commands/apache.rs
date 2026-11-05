use tauri::command;
use crate::apache::{detect_apache, control_apache, ApacheInfo};

#[command]
pub fn detect_apache_cmd(path: Option<String>) -> ApacheInfo { detect_apache(path) }

#[command]
pub fn control_apache_cmd(path: String, action: String) -> Result<String, String> { control_apache(path, action) }
