# Backlog - dbv-tauri-starter template-v0.4.0 (Implementación de referencia de la conexión a IAs)

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Plantilla de inicio de Tauri v2 + dbv-specs-ops con la IA opcional (local, nube con clave en el almacén del SO y agentes por suscripción vía ACP) que sirve de **implementación de referencia** para todas las apps DBV.
* **Estado actual**: `template-v0.4.0` (2026-10-29). Agentes ACP probados de punta a punta en la app real (Claude Code, Codex, Google Antigravity, GitHub Copilot CLI) y Ollama. 176 tests de Vitest, 78 de Rust y el banco e2e en verde. Framework `dbv-specs-ops` 3.2.0.
* **Última decisión técnica**: Una sola guía de IA para todas las apps (plantilla de `dbv-specs-ops`, generada en cada app por `scripts/sync-ai.mjs` y mostrada dentro de la app con `guide.js`); nunca se pasa a un agente un flag no documentado (ADR-036 de `memory.md`).
* **Próximo paso**: Propagar a `dbv-unreal-ai` (v0.2.3) con `node scripts/sync-ai.mjs --apply ../dbv-unreal-ai`; después, `dbv-md-reader` y `dbv-typst-editor`.

## Histórico
* **template-v0.2.0 (2026-10-03)**: subsistema de IA de tres niveles (resultó ser un esqueleto: ver ADR-035).
* **template-v0.3.0 (2026-10-19)**: la IA real de `dbv-md-reader` 0.18.0, demo de punta a punta y banco e2e.
* **template-v0.4.0 (2026-10-29)**: lo de abajo.

## Checklist de Tareas — template-v0.4.0

- [x] **Revisión de lo heredado de `dbv-unreal-ai` 0.2.2** (categorías del asistente, ⚙️ modelo y razonamiento, resumen junto al agente, `sync-ai.mjs` con 9 ficheros). Hallazgos: el `task.md` describía comandos y clases que no existían, el script copiaba ficheros que dependían de otros que no copiaba, y los ficheros canónicos citaban requisitos de `dbv-unreal-ai`.
- [x] **Ventana en blanco en `tauri dev`**: BOM en `src/index.html` (servido como `application/octet-stream`). Quitado de `index.html`, `main.js`, `i18n.js` y `README.md`.
- [x] **Agentes, uno a uno en la app real**:
  - [x] Antigravity: `agy` no habla ACP → `agy_acp_server` (registro ACP), carpetas de búsqueda e instrucciones; `authenticate` cuando el agente lo pide.
  - [x] Codex: adaptador `@agentclientprotocol/codex-acp` y `CODEX_CONFIG` en vez de `-c`.
  - [x] Copilot: el lanzador de VS Code no tapa a la CLI de verdad.
  - [x] Claude Code y Ollama: sin cambios, funcionan.
- [x] **Guía**: plantilla común en `dbv-specs-ops` 3.2.0 (publicada), `docs/IA*.md` generadas, guía dentro de la app (`guide.js`, `markdown.js` con anclas y listas con bloques dentro, botón *Copiar*).
- [x] **`scripts/sync-ai.mjs`**: ficheros canónicos (ahora con `guide.js`, `markdown.js` y sus tests), guías y `guideContent.js` generados, y avisos `[REVISAR]` (traducciones, comandos de `lib.rs`, `appInfo.js`, puente de `aiApp.js`, estilos).
- [x] **Aspecto**: `styles.css` reescrito (fuente del sistema a 13 px, tokens comunes con `ai.css`), panel con la clase `ai-panel` (la barra de contexto ya no se corta), logo de DBV como icono.
- [x] **Framework**: `git subtree pull` de `dbv-specs-ops` v3.2.0 (conflictos resueltos según `UPGRADE_PROMPT`), `Framework Version` 3.2.0, `AGENTS.md` en la raíz.
- [x] **Entrega**: versión 0.4.0 en `package.json`, `package-lock.json`, `Cargo.toml`, `Cargo.lock` y `tauri.conf.json`; `CHANGELOG.md`; README con tecnologías y GIF de la configuración de IA; commit, tag `template-v0.4.0` y push.

## Deuda / Pendiente
- Sin verificar en Linux y macOS (módulos ES con `import()` en WebKitGTK/WKWebView) ni dentro de un paquete MSIX.
- `README.en.md` no existe: el enlace «Back to the README» de `docs/IA.en.md` (que viene de la plantilla común) apunta a él.
- Copilot: el primer mensaje tras instalar la CLI respondió *Internal error* y los siguientes funcionaron; si se repite tras elegir modelo con ⚙️, revisar si su modo ACP acepta `--model`.
- Las lecciones 33-35 de `dbv-md-reader` siguen en la lista de la cosecha del `task.md` de `dbv-specs-ops`, para su próxima versión.
- Trazabilidad: `dbv-lint.py` avisa de que los 21 requisitos del starter no tienen `@spec` en tests. Los tests de la IA son canónicos (compartidos con otras apps, cuya numeración difiere) y ya no citan requisitos (ADR-036); el starter necesita sus propios tests de recorrido (p. ej. el banco e2e) etiquetados con sus IDs.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-10-29
> **Exact point / Punto exacto:** `template-v0.4.0` cerrada (código, guía, framework 3.2.0, versión y CHANGELOG).
> **Pending / Pendiente:** ver «Deuda / Pendiente».
> **Next step / Próximo paso:** `node scripts/sync-ai.mjs --apply ../dbv-unreal-ai` y ciclo completo de `dbv-unreal-ai` v0.2.3.
