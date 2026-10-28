use tauri::command;

use crate::nginx::detector::{check_nginx_config, detect_nginx};
use crate::nginx::manager::control_nginx;
use crate::nginx::models::{
    CreateVHostRequest, DeleteVHostRequest, DetectNginxRequest, NginxControlRequest,
    UpdateVHostRequest,
};
use crate::nginx::vhost::{create_vhost, delete_vhost, list_vhosts, update_vhost};

#[command]
pub fn detect_nginx_cmd(req: DetectNginxRequest) -> crate::nginx::models::NginxInfo {
    detect_nginx(req.path)
}

#[command]
pub fn get_nginx_status_cmd(path: String) -> crate::nginx::models::NginxInfo {
    detect_nginx(Some(path))
}

#[command]
pub fn check_nginx_config_cmd(path: String) -> crate::nginx::models::NginxConfigCheck {
    check_nginx_config(&path)
}

#[command]
pub fn control_nginx_cmd(req: NginxControlRequest) -> Result<String, String> {
    control_nginx(req)
}

#[command]
pub fn list_vhosts_cmd() -> Vec<crate::nginx::models::VirtualHost> {
    list_vhosts()
}

#[command]
pub fn create_vhost_cmd(
    req: CreateVHostRequest,
) -> Result<crate::nginx::models::VirtualHost, String> {
    create_vhost(req)
}

#[command]
pub fn update_vhost_cmd(
    req: UpdateVHostRequest,
) -> Result<crate::nginx::models::VirtualHost, String> {
    update_vhost(req)
}

#[command]
pub fn delete_vhost_cmd(req: DeleteVHostRequest) -> Result<(), String> {
    delete_vhost(req)
}
