// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub date: Option<String>,
    pub state: String,
    pub subtasks: Vec<Subtask>,
    pub energy_tag: Option<String>,
    pub order: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Subtask {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub completed: bool,
    pub order: i32,
}

/// Generate a unique ID
#[tauri::command]
fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis();
    format!("{}-{}", timestamp, uuid::Uuid::new_v4().to_string()[..8].to_string())
}

/// Example command - can be expanded for task operations
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, generate_id])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
