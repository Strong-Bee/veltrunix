use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NginxStatus {
    Installed,
    NotFound,
    Running,
    Stopped,
    Error,
}

impl NginxStatus {
    pub fn as_str(&self) -> &str {
        match self {
            NginxStatus::Installed => "Installed",
            NginxStatus::NotFound => "Not found",
            NginxStatus::Running => "Running",
            NginxStatus::Stopped => "Stopped",
            NginxStatus::Error => "Error",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NginxInfo {
    pub name: String,
    pub status: NginxStatus,
    pub version: Option<String>,
    pub path: Option<String>,
    pub config_path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NginxConfigCheck {
    pub valid: bool,
    pub output: String,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VirtualHost {
    pub name: String,
    pub domain: String,
    pub root: String,
    pub port: u16,
    pub php_enabled: bool,
    pub php_fastcgi_port: Option<u16>,
    pub php_fastcgi_address: Option<String>,
    pub enabled: bool,
    pub config_path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectNginxRequest {
    pub path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NginxControlRequest {
    pub path: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateVHostRequest {
    pub domain: String,
    pub root: String,
    pub port: u16,
    pub php_enabled: bool,
    pub php_fastcgi_port: Option<u16>,
    pub php_fastcgi_address: Option<String>,
    pub nginx_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateVHostRequest {
    pub name: String,
    pub domain: Option<String>,
    pub root: Option<String>,
    pub port: Option<u16>,
    pub php_enabled: Option<bool>,
    pub php_fastcgi_port: Option<u16>,
    pub php_fastcgi_address: Option<String>,
    pub enabled: Option<bool>,
    pub nginx_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeleteVHostRequest {
    pub name: String,
}
