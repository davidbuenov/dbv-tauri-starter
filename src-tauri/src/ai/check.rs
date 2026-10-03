// =============================================================================
// dbv-tauri-starter — Comprobación de propuestas de cambios de la IA
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
//
// Comprueba los cambios propuestos por la IA en memoria antes de enseñárselos
// o aplicarlos. En esta plantilla starter se realiza una comprobación de
// seguridad de rutas y de sintaxis JSON básica.
// Las aplicaciones reales pueden conectar aquí su propio validador o compilador.

use std::sync::Mutex;

use serde::{Deserialize, Serialize};

use super::AiError;

/// Un fichero con su contenido (sin guardar o propuesto).
#[derive(Debug, Clone, Deserialize, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct FileContent {
    pub path: String,
    pub content: String,
}

/// Diagnóstico devuelto al frontend (error o advertencia).
#[derive(Debug, Clone, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Diagnostic {
    pub file: String,
    pub line: Option<usize>,
    pub message: String,
    pub severity: String,
}

/// Estado o mundo de comprobación reutilizable entre turnos.
#[derive(Default)]
pub struct CheckWorlds {
    _exclusive: Mutex<()>,
}

impl CheckWorlds {
    /// Libera recursos al cerrar el proyecto.
    pub fn release(&self) {}
}

/// Comprueba en memoria los ficheros de una propuesta.
pub fn check(
    _worlds: &CheckWorlds,
    _root: &str,
    _main: &str,
    files: &[FileContent],
) -> Result<Vec<Diagnostic>, AiError> {
    let mut diagnostics = Vec::new();

    for file in files {
        // Seguridad: evitar que la ruta intente escapar de la raíz del proyecto
        let path = file.path.replace('\\', "/");
        if path.starts_with('/') || path.contains("../") || path.contains("..\\") {
            diagnostics.push(Diagnostic {
                file: file.path.clone(),
                line: None,
                message: "La ruta del fichero no puede escapar de la raíz del proyecto («..» o ruta absoluta)".into(),
                severity: "error".into(),
            });
            continue;
        }

        // Validación sintáctica básica si es un JSON
        if path.ends_with(".json") {
            if let Err(error) = serde_json::from_str::<serde_json::Value>(&file.content) {
                diagnostics.push(Diagnostic {
                    file: file.path.clone(),
                    line: Some(error.line()),
                    message: format!("Error de sintaxis JSON: {error}"),
                    severity: "error".into(),
                });
            }
        }
    }

    Ok(diagnostics)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn propuesta_valida_no_produce_diagnosticos() {
        let worlds = CheckWorlds::default();
        let files = vec![FileContent {
            path: "config.json".into(),
            content: r#"{"version": "1.0"}"#.into(),
        }];
        let diags = check(&worlds, "C:/project", "main", &files).unwrap();
        assert!(diags.is_empty());
    }

    #[test]
    fn json_invalido_produce_error() {
        let worlds = CheckWorlds::default();
        let files = vec![FileContent {
            path: "config.json".into(),
            content: r#"{"version": "#.into(),
        }];
        let diags = check(&worlds, "C:/project", "main", &files).unwrap();
        assert_eq!(diags.len(), 1);
        assert_eq!(diags[0].severity, "error");
    }

    #[test]
    fn ruta_insegura_se_rechaza() {
        let worlds = CheckWorlds::default();
        let files = vec![FileContent {
            path: "../escape.txt".into(),
            content: "hola".into(),
        }];
        let diags = check(&worlds, "C:/project", "main", &files).unwrap();
        assert_eq!(diags.len(), 1);
        assert_eq!(diags[0].severity, "error");
    }
}