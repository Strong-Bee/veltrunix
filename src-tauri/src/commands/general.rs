use serde_json::json;

#[tauri::command]
pub fn get_app_info() -> serde_json::Value {
    json!({
        "name": "Veltrunix",
        "version": env!("CARGO_PKG_VERSION"),
        "platform": std::env::consts::OS,
    })
}
