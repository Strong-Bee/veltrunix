use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuntimeStatus {
    Installed,
    NotFound,
    Error,
}

impl RuntimeStatus {
    #[allow(dead_code)]
    pub fn as_str(&self) -> &str {
        match self {
            RuntimeStatus::Installed => "Installed",
            RuntimeStatus::NotFound => "Not found",
            RuntimeStatus::Error => "Error",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeInfo {
    pub name: String,
    pub status: RuntimeStatus,
    pub version: Option<String>,
    pub path: Option<String>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RuntimeType {
    Php,
    Node,
    Npm,
    Composer,
    Git,
}

impl RuntimeType {
    pub fn as_str(&self) -> &str {
        match self {
            RuntimeType::Php => "php",
            RuntimeType::Node => "node",
            RuntimeType::Npm => "npm",
            RuntimeType::Composer => "composer",
            RuntimeType::Git => "git",
        }
    }

    pub fn version_args(&self) -> Vec<&'static str> {
        match self {
            RuntimeType::Php => vec!["-v"],
            RuntimeType::Node => vec!["--version"],
            RuntimeType::Npm => vec!["--version"],
            RuntimeType::Composer => vec!["--version"],
            RuntimeType::Git => vec!["--version"],
        }
    }

    pub fn executable_names(&self) -> Vec<&'static str> {
        match self {
            RuntimeType::Php => vec!["php.exe", "php"],
            RuntimeType::Node => vec!["node.exe", "node"],
            RuntimeType::Npm => vec!["npm.exe", "npm", "npm.cmd"],
            RuntimeType::Composer => vec!["composer.exe", "composer", "composer.bat"],
            RuntimeType::Git => vec!["git.exe", "git"],
        }
    }

    pub fn all() -> Vec<RuntimeType> {
        vec![
            RuntimeType::Php,
            RuntimeType::Node,
            RuntimeType::Npm,
            RuntimeType::Composer,
            RuntimeType::Git,
        ]
    }
}
