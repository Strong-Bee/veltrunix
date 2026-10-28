use std::fs;
use std::path::Path;

use crate::nginx::detector::{
    check_nginx_config, find_executable_in_path, find_nginx_in_standard_locations,
};
use crate::nginx::models::{
    CreateVHostRequest, DeleteVHostRequest, UpdateVHostRequest, VirtualHost,
};

const VHOSTS_DIR: &str = "C:\\nginx\\conf\\conf.d";

fn ensure_vhosts_dir() -> Result<(), String> {
    if !Path::new(VHOSTS_DIR).exists() {
        fs::create_dir_all(VHOSTS_DIR)
            .map_err(|e| format!("Gagal membuat direktori conf.d: {}", e))?;
    }
    Ok(())
}

fn vhost_config_path(domain: &str) -> String {
    format!("{}\\{}.conf", VHOSTS_DIR, domain)
}

fn generate_nginx_config(vhost: &VirtualHost) -> String {
    let php_block = if vhost.php_enabled {
        let fastcgi_port = vhost.php_fastcgi_port.unwrap_or(9000);
        let fastcgi_address = vhost
            .php_fastcgi_address
            .as_deref()
            .unwrap_or("127.0.0.1");
        format!(
            r#"
        location ~ \.php$ {{
            fastcgi_pass   {}:{};
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
            fastcgi_param  PATH_INFO        $fastcgi_script_name;
            include        fastcgi_params;
        }}"#,
            fastcgi_address, fastcgi_port
        )
    } else {
        String::new()
    };

    format!(
        r#"server {{
    listen {port};
    server_name {domain};
    root "{root}";
    index index.php index.html index.htm;

    location / {{
        try_files $uri $uri/ /index.php?$query_string;
    }}
{php_block}
}}"#,
        port = vhost.port,
        domain = vhost.domain,
        root = vhost.root,
        php_block = php_block
    )
}

/// Validasi path Windows: harus dimulai dengan huruf drive (mis. C:\) atau UNC path (\\server\share),
/// dan tidak boleh mengandung karakter larangan Windows.
fn is_valid_windows_path(path: &str) -> bool {
    if path.is_empty() {
        return false;
    }
    let invalid_chars = ['<', '>', '"', '|', '?', '*'];
    if path.chars().any(|c| invalid_chars.contains(&c)) {
        return false;
    }
    let chars: Vec<char> = path.chars().collect();
    if chars.len() >= 2 && chars[1] == ':' && chars[0].is_ascii_alphabetic() {
        return true;
    }
    if chars.len() >= 2 && chars[0] == '\\' && chars[1] == '\\' {
        return true;
    }
    false
}

fn find_nginx_executable() -> Option<String> {
    find_executable_in_path("nginx.exe").or(find_nginx_in_standard_locations())
}

fn validate_nginx_config(nginx_path: &str) -> Result<(), String> {
    let check = check_nginx_config(nginx_path);
    if !check.valid {
        return Err(format!("Konfigurasi Nginx tidak valid: {}", check.output));
    }
    Ok(())
}

fn apply_vhost_config(
    config_path: &str,
    config: &str,
    backup_path: Option<&str>,
    nginx_path: &str,
) -> Result<(), String> {
    // Backup existing config if any
    if let Some(bp) = backup_path {
        fs::copy(config_path, bp)
            .map_err(|e| format!("Gagal membuat backup konfigurasi: {}", e))?;
    }

    // Tulis konfigurasi baru
    fs::write(config_path, config)
        .map_err(|e| format!("Gagal menulis konfigurasi virtual host: {}", e))?;

    // Validasi dengan nginx -t sebelum mengaktifkan perubahan
    if let Err(e) = validate_nginx_config(nginx_path) {
        // Roll back: kembalikan dari backup atau hapus konfigurasi baru
        if let Some(bp) = backup_path {
            let _ = fs::copy(bp, config_path);
        } else {
            let _ = fs::remove_file(config_path);
        }
        return Err(e);
    }

    Ok(())
}

fn extract_domain_from_config(content: &str) -> Option<String> {
    for line in content.lines() {
        let line = line.trim();
        if line.starts_with("server_name") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                return Some(parts[1].trim_end_matches(';').to_string());
            }
        }
    }
    None
}

fn extract_root_from_config(content: &str) -> Option<String> {
    for line in content.lines() {
        let line = line.trim();
        if line.starts_with("root") {
            let start = line.find('"')?;
            let end = line[start + 1..].rfind('"')?;
            return Some(line[start + 1..start + 1 + end].to_string());
        }
    }
    None
}

fn extract_port_from_config(content: &str) -> Option<u16> {
    for line in content.lines() {
        let line = line.trim();
        if line.starts_with("listen") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let port_str = parts[1].trim_end_matches(';');
                return port_str.parse().ok();
            }
        }
    }
    None
}

fn extract_fastcgi_pass_from_config(content: &str) -> Option<(String, u16)> {
    for line in content.lines() {
        let line = line.trim();
        if line.starts_with("fastcgi_pass") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                let addr = parts[1].trim_end_matches(';');
                let addr_parts: Vec<&str> = addr.split(':').collect();
                if addr_parts.len() == 2 {
                    let address = addr_parts[0].to_string();
                    let port = addr_parts[1].parse().ok()?;
                    return Some((address, port));
                }
            }
        }
    }
    None
}

pub fn list_vhosts() -> Vec<VirtualHost> {
    let mut vhosts = Vec::new();
    if let Ok(entries) = fs::read_dir(VHOSTS_DIR) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().map_or(false, |e| e == "conf") {
                if let Some(name) = path.file_stem().and_then(|n| n.to_str()) {
                    if let Ok(content) = fs::read_to_string(&path) {
                        let domain = extract_domain_from_config(&content)
                            .unwrap_or_else(|| name.to_string());
                        let root = extract_root_from_config(&content).unwrap_or_default();
                        let port = extract_port_from_config(&content).unwrap_or(80);
                        let php_enabled = content.contains("fastcgi_pass");
                        let (fastcgi_address, fastcgi_port) =
                            extract_fastcgi_pass_from_config(&content)
                                .unwrap_or_else(|| ("127.0.0.1".to_string(), 9000));

                        vhosts.push(VirtualHost {
                            name: name.to_string(),
                            domain,
                            root,
                            port,
                            php_enabled,
                            php_fastcgi_port: Some(fastcgi_port),
                            php_fastcgi_address: Some(fastcgi_address),
                            enabled: true,
                            config_path: Some(path.to_string_lossy().to_string()),
                            error: None,
                        });
                    }
                }
            }
        }
    }
    vhosts
}

pub fn create_vhost(req: CreateVHostRequest) -> Result<VirtualHost, String> {
    if !is_valid_domain(&req.domain) {
        return Err(format!("Nama domain tidak valid: {}", req.domain));
    }

    if !is_valid_windows_path(&req.root) {
        return Err(format!(
            "Path direktori root tidak valid (Windows): {}",
            req.root
        ));
    }

    if !Path::new(&req.root).exists() {
        return Err(format!("Direktori root tidak ditemukan: {}", req.root));
    }

    let existing = list_vhosts();
    if existing.iter().any(|v| v.port == req.port && v.enabled) {
        return Err(format!(
            "Port {} sudah digunakan oleh virtual host lain",
            req.port
        ));
    }

    if existing.iter().any(|v| v.domain == req.domain && v.enabled) {
        return Err(format!("Domain {} sudah terdaftar", req.domain));
    }

    ensure_vhosts_dir()?;

    let vhost = VirtualHost {
        name: req.domain.clone(),
        domain: req.domain.clone(),
        root: req.root.clone(),
        port: req.port,
        php_enabled: req.php_enabled,
        php_fastcgi_port: req.php_fastcgi_port,
        php_fastcgi_address: req.php_fastcgi_address,
        enabled: true,
        config_path: None,
        error: None,
    };

    let config = generate_nginx_config(&vhost);
    let config_path = vhost_config_path(&req.domain);

    let backup_path = if Path::new(&config_path).exists() {
        Some(format!("{}.bak", config_path))
    } else {
        None
    };

    let detected_nginx = find_nginx_executable();
    let nginx_path = req
        .nginx_path
        .as_deref()
        .or(detected_nginx.as_deref())
        .ok_or_else(|| {
            "Executable Nginx tidak ditemukan. Silakan deteksi Nginx terlebih dahulu.".to_string()
        })?;

    apply_vhost_config(&config_path, &config, backup_path.as_deref(), nginx_path)?;

    Ok(VirtualHost {
        config_path: Some(config_path),
        ..vhost
    })
}

pub fn update_vhost(req: UpdateVHostRequest) -> Result<VirtualHost, String> {
    let mut vhosts = list_vhosts();
    let existing = vhosts.clone();
    let vhost = vhosts
        .iter_mut()
        .find(|v| v.name == req.name)
        .ok_or_else(|| format!("Virtual host tidak ditemukan: {}", req.name))?;

    if let Some(domain) = &req.domain {
        if !is_valid_domain(domain) {
            return Err(format!("Nama domain tidak valid: {}", domain));
        }
        vhost.domain = domain.clone();
    }
    if let Some(root) = &req.root {
        if !is_valid_windows_path(root) {
            return Err(format!(
                "Path direktori root tidak valid (Windows): {}",
                root
            ));
        }
        if !Path::new(root).exists() {
            return Err(format!("Direktori root tidak ditemukan: {}", root));
        }
        vhost.root = root.clone();
    }
    if let Some(port) = req.port {
        if existing
            .iter()
            .any(|v| v.port == port && v.enabled && v.name != req.name)
        {
            return Err(format!("Port {} sudah digunakan", port));
        }
        vhost.port = port;
    }
    if let Some(php_enabled) = req.php_enabled {
        vhost.php_enabled = php_enabled;
    }
    if let Some(fastcgi_port) = req.php_fastcgi_port {
        vhost.php_fastcgi_port = Some(fastcgi_port);
    }
    if let Some(fastcgi_address) = req.php_fastcgi_address {
        vhost.php_fastcgi_address = Some(fastcgi_address);
    }
    if let Some(enabled) = req.enabled {
        vhost.enabled = enabled;
    }

    let config_path = vhost
        .config_path
        .as_ref()
        .ok_or_else(|| format!("Path konfigurasi tidak ditemukan untuk {}", req.name))?;

    let config = generate_nginx_config(vhost);

    let backup_path = if Path::new(config_path).exists() {
        Some(format!("{}.bak", config_path))
    } else {
        None
    };

    let detected_nginx = find_nginx_executable();
    let nginx_path = req
        .nginx_path
        .as_deref()
        .or(detected_nginx.as_deref())
        .ok_or_else(|| {
            "Executable Nginx tidak ditemukan. Silakan deteksi Nginx terlebih dahulu.".to_string()
        })?;

    apply_vhost_config(config_path, &config, backup_path.as_deref(), nginx_path)?;

    Ok(vhost.clone())
}

pub fn delete_vhost(req: DeleteVHostRequest) -> Result<(), String> {
    let vhosts = list_vhosts();
    let vhost = vhosts
        .iter()
        .find(|v| v.name == req.name)
        .ok_or_else(|| format!("Virtual host tidak ditemukan: {}", req.name))?;

    let config_path = vhost
        .config_path
        .as_ref()
        .ok_or_else(|| format!("Path konfigurasi tidak ditemukan untuk {}", req.name))?;

    if Path::new(config_path).exists() {
        let backup_path = format!("{}.deleted.bak", config_path);
        fs::copy(config_path, &backup_path)
            .map_err(|e| format!("Gagal membuat backup sebelum hapus: {}", e))?;
    }

    fs::remove_file(config_path)
        .map_err(|e| format!("Gagal menghapus konfigurasi virtual host: {}", e))?;

    Ok(())
}

fn is_valid_domain(domain: &str) -> bool {
    if domain.is_empty() || domain.len() > 253 {
        return false;
    }
    let parts: Vec<&str> = domain.split('.').collect();
    if parts.len() < 2 {
        return false;
    }
    for part in &parts {
        if part.is_empty() || part.len() > 63 {
            return false;
        }
        if !part.chars().all(|c| c.is_alphanumeric() || c == '-') {
            return false;
        }
        if part.starts_with('-') || part.ends_with('-') {
            return false;
        }
    }
    true
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_valid_windows_path() {
        assert!(is_valid_windows_path("C:\\projek\\myproject"));
        assert!(is_valid_windows_path("D:\\xampp\\htdocs"));
        assert!(is_valid_windows_path("\\\\server\\share\\folder"));
        assert!(!is_valid_windows_path(""));
        assert!(!is_valid_windows_path("relatif/path"));
        assert!(!is_valid_windows_path("C:<invalid>"));
        assert!(!is_valid_windows_path("C:\\valid|path"));
    }

    #[test]
    fn test_generate_nginx_config() {
        let vhost = VirtualHost {
            name: "myproject.test".to_string(),
            domain: "myproject.test".to_string(),
            root: "C:\\projek\\myproject\\public".to_string(),
            port: 80,
            php_enabled: true,
            php_fastcgi_port: Some(9000),
            php_fastcgi_address: Some("127.0.0.1".to_string()),
            enabled: true,
            config_path: None,
            error: None,
        };

        let config = generate_nginx_config(&vhost);
        assert!(config.contains("listen 80;"));
        assert!(config.contains("server_name myproject.test;"));
        assert!(config.contains(r#"root "C:\projek\myproject\public";"#));
        assert!(config.contains("fastcgi_pass"));
    }

    #[test]
    fn test_generate_nginx_config_without_php() {
        let vhost = VirtualHost {
            name: "mysite.test".to_string(),
            domain: "mysite.test".to_string(),
            root: "C:\\projek\\mysite".to_string(),
            port: 8080,
            php_enabled: false,
            php_fastcgi_port: None,
            php_fastcgi_address: None,
            enabled: true,
            config_path: None,
            error: None,
        };

        let config = generate_nginx_config(&vhost);
        assert!(config.contains("listen 8080;"));
        assert!(config.contains("server_name mysite.test;"));
        assert!(!config.contains("fastcgi_pass"));
    }

    #[test]
    fn test_is_valid_domain_vhost() {
        assert!(is_valid_domain("myproject.test"));
        assert!(is_valid_domain("example.com"));
        assert!(!is_valid_domain(""));
        assert!(!is_valid_domain("invalid domain"));
        assert!(!is_valid_domain("-invalid.com"));
        assert!(!is_valid_domain("invalid-.com"));
    }

    #[test]
    fn test_generate_nginx_config_with_fastcgi_port() {
        let vhost = VirtualHost {
            name: "myproject.test".to_string(),
            domain: "myproject.test".to_string(),
            root: "C:\\projek\\myproject\\public".to_string(),
            port: 80,
            php_enabled: true,
            php_fastcgi_port: Some(9000),
            php_fastcgi_address: Some("127.0.0.1".to_string()),
            enabled: true,
            config_path: None,
            error: None,
        };

        let config = generate_nginx_config(&vhost);
        assert!(config.contains("fastcgi_pass   127.0.0.1:9000;"));
        assert!(config.contains("SCRIPT_FILENAME  $document_root$fastcgi_script_name;"));
    }

    #[test]
    fn test_generate_nginx_config_with_custom_fastcgi_port() {
        let vhost = VirtualHost {
            name: "myproject.test".to_string(),
            domain: "myproject.test".to_string(),
            root: "C:\\projek\\myproject\\public".to_string(),
            port: 80,
            php_enabled: true,
            php_fastcgi_port: Some(9001),
            php_fastcgi_address: Some("127.0.0.1".to_string()),
            enabled: true,
            config_path: None,
            error: None,
        };

        let config = generate_nginx_config(&vhost);
        assert!(config.contains("fastcgi_pass   127.0.0.1:9001;"));
    }

    #[test]
    fn test_extract_fastcgi_pass_from_config() {
        let content = r#"
server {
    listen 80;
    server_name myproject.test;
    root "C:\projek\myproject\public";

    location ~ \.php$ {
        fastcgi_pass   127.0.0.1:9001;
        fastcgi_index  index.php;
        fastcgi_param  SCRIPT_FILENAME  $document_root$fastcgi_script_name;
        include        fastcgi_params;
    }
}
"#;
        let result = extract_fastcgi_pass_from_config(content);
        assert!(result.is_some());
        let (addr, port) = result.unwrap();
        assert_eq!(addr, "127.0.0.1");
        assert_eq!(port, 9001);
    }

    #[test]
    fn test_extract_fastcgi_pass_from_config_no_fastcgi() {
        let content = r#"
server {
    listen 80;
    server_name mysite.test;
    root "C:\projek\mysite";
}
"#;
        let result = extract_fastcgi_pass_from_config(content);
        assert!(result.is_none());
    }
}
