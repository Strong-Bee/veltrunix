use serde::{Deserialize, Serialize};
use tauri::command;

use crate::runtime::detector::{detect_all_runtimes, detect_runtime};
use crate::runtime::models::RuntimeType;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectRuntimeRequest {
    pub name: String,
}

#[command]
pub fn detect_runtimes() -> Vec<crate::runtime::models::RuntimeInfo> {
    detect_all_runtimes()
}

#[command]
pub fn detect_runtime_by_name(req: DetectRuntimeRequest) -> crate::runtime::models::RuntimeInfo {
    let rt = match req.name.as_str() {
        "php" => RuntimeType::Php,
        "node" => RuntimeType::Node,
        "npm" => RuntimeType::Npm,
        "composer" => RuntimeType::Composer,
        "git" => RuntimeType::Git,
        _ => {
            return crate::runtime::models::RuntimeInfo {
                name: req.name,
                status: crate::runtime::models::RuntimeStatus::Error,
                version: None,
                path: None,
                error: Some("Tipe runtime tidak dikenal".to_string()),
            };
        }
    };
    detect_runtime(rt)
}
