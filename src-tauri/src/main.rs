#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod runtime;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::general::get_app_info,
            commands::runtime::detect_runtimes,
            commands::runtime::detect_runtime_by_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
