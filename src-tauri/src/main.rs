#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod nginx;
mod php;
mod runtime;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::general::get_app_info,
            commands::nginx::detect_nginx_cmd,
            commands::nginx::get_nginx_status_cmd,
            commands::nginx::check_nginx_config_cmd,
            commands::nginx::control_nginx_cmd,
            commands::nginx::list_vhosts_cmd,
            commands::nginx::create_vhost_cmd,
            commands::nginx::update_vhost_cmd,
            commands::nginx::delete_vhost_cmd,
            commands::php::detect_php_cmd,
            commands::php::check_php_port_cmd,
            commands::php::start_php_cgi_cmd,
            commands::php::stop_php_cgi_cmd,
            commands::php::get_php_cgi_status_cmd,
            commands::php::list_php_cgi_processes_cmd,
            commands::php::stop_all_php_cgi_cmd,
            commands::php::control_php_cgi_cmd,
            commands::runtime::detect_runtimes,
            commands::runtime::detect_runtime_by_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
