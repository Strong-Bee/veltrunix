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
    Python,
    MySql,
    MariaDb,
    PostgreSql,
    Redis,
    Docker,
    Go,
    Java,
    Rust,
    Sqlite,
    MySqlServer,
    MariaDbServer,
}

impl RuntimeType {
    pub fn as_str(&self) -> &str {
        match self {
            RuntimeType::Php => "php",
            RuntimeType::Node => "node",
            RuntimeType::Npm => "npm",
            RuntimeType::Composer => "composer",
            RuntimeType::Git => "git",
            RuntimeType::Python => "python",
            RuntimeType::MySql => "mysql",
            RuntimeType::MariaDb => "mariadb",
            RuntimeType::PostgreSql => "postgresql",
            RuntimeType::Redis => "redis",
            RuntimeType::Docker => "docker",
            RuntimeType::Go => "go",
            RuntimeType::Java => "java",
            RuntimeType::Rust => "rust",
            RuntimeType::Sqlite => "sqlite",
            RuntimeType::MySqlServer => "mysql-server",
            RuntimeType::MariaDbServer => "mariadb-server",
        }
    }

    pub fn version_args(&self) -> Vec<&'static str> {
        match self {
            RuntimeType::Php => vec!["-v"],
            RuntimeType::Node => vec!["--version"],
            RuntimeType::Npm => vec!["--version"],
            RuntimeType::Composer => vec!["--version"],
            RuntimeType::Git => vec!["--version"],
            RuntimeType::Python => vec!["--version"],
            RuntimeType::MySql => vec!["--version"],
            RuntimeType::MariaDb => vec!["--version"],
            RuntimeType::PostgreSql => vec!["--version"],
            RuntimeType::Redis => vec!["--version"],
            RuntimeType::Docker => vec!["--version"],
            RuntimeType::Go => vec!["version"],
            RuntimeType::Java => vec!["-version"],
            RuntimeType::Rust => vec!["--version"],
            RuntimeType::Sqlite => vec!["--version"],
            RuntimeType::MySqlServer => vec!["--version"],
            RuntimeType::MariaDbServer => vec!["--version"],
        }
    }

    pub fn executable_names(&self) -> Vec<&'static str> {
        match self {
            RuntimeType::Php => vec!["php.exe", "php"],
            RuntimeType::Node => vec!["node.exe", "node"],
            RuntimeType::Npm => vec!["npm.exe", "npm", "npm.cmd"],
            RuntimeType::Composer => vec!["composer.exe", "composer", "composer.bat"],
            RuntimeType::Git => vec!["git.exe", "git"],
            RuntimeType::Python => vec!["python.exe", "python", "python3.exe", "py.exe"],
            RuntimeType::MySql => vec!["mysql.exe", "mysql"],
            RuntimeType::MariaDb => vec!["mariadb.exe", "mariadb"],
            RuntimeType::PostgreSql => vec!["psql.exe", "psql"],
            RuntimeType::Redis => vec!["redis-server.exe", "redis-server"],
            RuntimeType::Docker => vec!["docker.exe", "docker"],
            RuntimeType::Go => vec!["go.exe", "go"],
            RuntimeType::Java => vec!["java.exe", "java"],
            RuntimeType::Rust => vec!["rustc.exe", "rustc"],
            RuntimeType::Sqlite => vec!["sqlite3.exe", "sqlite3"],
            RuntimeType::MySqlServer => vec!["mysqld.exe", "mysqld"],
            RuntimeType::MariaDbServer => vec!["mariadbd.exe", "mariadbd"],
        }
    }

    pub fn all() -> Vec<RuntimeType> {
        vec![
            RuntimeType::Php,
            RuntimeType::Node,
            RuntimeType::Npm,
            RuntimeType::Composer,
            RuntimeType::Git,
            RuntimeType::Python,
            RuntimeType::MySql,
            RuntimeType::MariaDb,
            RuntimeType::PostgreSql,
            RuntimeType::Redis,
            RuntimeType::Docker,
            RuntimeType::Go,
            RuntimeType::Java,
            RuntimeType::Rust,
            RuntimeType::Sqlite,
            RuntimeType::MySqlServer,
            RuntimeType::MariaDbServer,
        ]
    }
}
