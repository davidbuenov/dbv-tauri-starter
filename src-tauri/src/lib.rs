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
        .invoke_handler(tauri::generate_handler![get_greeting_name])
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
