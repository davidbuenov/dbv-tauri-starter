// =============================================================================
// dbv-tauri-starter — Punto de entrada de la aplicación Tauri
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

pub mod ai;

// Ejemplo mínimo pero real de comando Tauri: Guard Clause + flujo de salida único
// (ver dbv-specs-ops/docs/MASTER_PROMPT.md, Estándares de Codificación §1). Devuelve datos, no una
// frase ya construida — la presentación (con i18n) vive en el frontend, no aquí.
#[tauri::command]
fn get_greeting_name(name: &str) -> String {
    name.trim().to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(ai::AiState::default())
        .manage(ai::acp::AcpState::default())
        .invoke_handler(tauri::generate_handler![
            get_greeting_name,
            ai::commands::ai_connections,
            ai::commands::ai_save_connection,
            ai::commands::ai_delete_connection,
            ai::commands::ai_set_preferences,
            ai::commands::ai_providers,
            ai::commands::ai_detect,
            ai::commands::ai_list_models,
            ai::commands::ai_chat,
            ai::commands::ai_cancel,
            ai::commands::ai_check_proposal,
            ai::commands::ai_project_state_load,
            ai::commands::ai_project_state_save,
            ai::commands::ai_release,
            ai::acp::acp_start,
            ai::acp::acp_request,
            ai::acp::acp_notify,
            ai::acp::acp_respond,
            ai::acp::acp_stop,
            ai::acp::acp_running,
            ai::acp::acp_snapshot,
            ai::acp::acp_changes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trims_surrounding_whitespace() {
        assert_eq!(get_greeting_name("  David  "), "David");
    }

    #[test]
    fn empty_input_returns_empty_string() {
        assert_eq!(get_greeting_name("   "), "");
    }
}