use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PhpStatus {
    Installed,
    NotFound,
    Running,
    Stopped,
    Error,
}

impl PhpStatus {
    pub fn as_str(&self) -> &str {
        match self {
            PhpStatus::Installed => "Installed",
            PhpStatus::NotFound => "Not found",
            PhpStatus::Running => "Running",
            PhpStatus::Stopped => "Stopped",
            PhpStatus::Error => "Error",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhpInfo {
    pub name: String,
    pub status: PhpStatus,
    pub version: Option<String>,
    pub path: Option<String>,
    pub php_ini_path: Option<String>,
    pub extensions: Vec<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectPhpRequest {
    pub path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhpControlRequest {
    pub path: String,
    pub action: String,
    pub port: Option<u16>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhcgiProcessInfo {
    pub port: u16,
    pub pid: u32,
    pub address: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhcgiStatus {
    pub running: bool,
    pub port: Option<u16>,
    pub pid: Option<u32>,
    pub address: Option<String>,
    pub error: Option<String>,
}
