# Backlog - dbv-tauri-starter template-v0.2.0 (Desktop Generative AI Subsystem)

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Proveer la plantilla de inicio oficial de Tauri v2 + dbv-specs-ops con el subsistema canónico completo de IA generativa de escritorio (3 niveles: local, nube con llavero seguro y agentes de suscripción vía ACP), zero-footprint y bilingüe.
* **Estado actual**: ENTREGA COMPLETADA (template-v0.2.0). 40 tests en verde, UI funcional con carga perezosa y documentación bilingüe.
* **Última decisión técnica**: Desacoplamiento total del frontend mediante carga perezosa (`entry.js`), custodia de API keys en llavero del SO vía `keyring` de Rust y soporte ACP para suscripciones existentes sin costes de tokens.
* **Próximo paso**: Sellar versión en Git con tag `template-v0.2.0`.
* **Actualización 2026-10-19 (`template-v0.3.0`)**: la IA es ahora la real de `dbv-md-reader` 0.18.0 (ver `CHANGELOG.md` y ADR-035): demo funcional de punta a punta, 154 tests de Vitest + banco e2e + 71 de Rust. **Publicada** (commit, tag `template-v0.3.0` y push).
* **Actualización 2026-10-29 (`template-v0.4.0` — Fuente Canónica Única de Conexión IA)**: `dbv-tauri-starter` es ahora la **implementación canónica de referencia** del subsistema de conexión a IAs de escritorio para toda la familia DBV (sincronizada desde `dbv-unreal-ai` v0.2.2) e incluye el script oficial `scripts/sync-ai.mjs` (`--check` / `--apply`) para propagar los 9 módulos core de conexión sin divergencias. **77 tests de Rust + 160 tests de Vitest en verde.**

## Checklist de Tareas

- [x] **Fase 1: Especificaciones (`/spec`)**
  - [x] Formalizados los requisitos funcionales de IA: RF-IA-01 a RF-IA-04 en `docs/SPECIFICATIONS.md`.
  - [x] Formalizados los requisitos no funcionales: RNF-IA.1 a RNF-IA.4 (keyring, zero-footprint, offline, privacidad).
  - [x] Marcados los requisitos RF-01 a RF-08 de la v0.1.0 como completados.

- [x] **Fase 2: Planificación Técnica (`/plan`)**
  - [x] Redactado `implementation_plan.md` con dependencias de Rust, análisis de riesgos y estrategia de rollback.
  - [x] Actualizado `docs/ARCHITECTURE.md` con el diagrama de flujo y la arquitectura modular del subsistema de IA.

- [x] **Fase 3: Construcción (`/build`)**
  - [x] Backend Rust: 8 submódulos en `src-tauri/src/ai/` (`secrets`, `detect`, `connections`, `providers`, `acp`, `store`, `check`, `commands`).
  - [x] Registro en `src-tauri/src/lib.rs` y dependencias en `Cargo.toml`.
  - [x] Frontend: Carga perezosa en `src/ai/entry.js`, chat, wizard de conexiones, visor de diffs e i18n reactivo.
  - [x] Integración en `src/index.html` y `src/styles.css`.

- [x] **Fase 4: Pruebas y Verificación (`/test`)**
  - [x] `cargo test` ejecutado: **40 tests unitarios y de integración pasando al 100%**.
  - [x] Validación de streaming SSE, transporte ACP y operaciones con el llavero del SO.

- [x] **Fase 5: Simplificar (`/code-simplify`)**
  - [x] Generalización del identificador de servicio en `secrets.rs` (`"dbv-tauri-starter"`).
  - [x] Desacoplamiento de i18n mediante `i18nBridge.js` con fallback automático a español.

- [x] **Fase 6: Entrega (`/ship`)**
  - [x] Documentación de usuario final creada en `docs/IA.md` (ES) y `docs/IA.en.md` (EN).
  - [x] `README.md` actualizado con la guía del subsistema de IA.
  - [x] Sincronización de versión a `0.2.0` en `package.json`, `src-tauri/Cargo.toml` y `src-tauri/tauri.conf.json`.
  - [x] `CHANGELOG.md` promovido a `## [template-v0.2.0] — 2026-10-03`.
  - [x] Sincronización de los ficheros del framework `dbv-specs-ops` a v2.9.0.

---

## 📌 Versión Actual (`template-v0.4.0`) — Fuente Canónica Única del Subsistema de Conexión a IAs

- [x] **Sincronización del Subsistema de IA canónico (heredado de `dbv-unreal-ai` v0.2.1 + v0.2.2)**
  - **Objetivo**: Establecer `dbv-tauri-starter` como la **única fuente de verdad (Single Source of Truth)** del sistema de conexión a IAs para todas las aplicaciones de la familia DBV (`dbv-unreal-ai`, `dbv-typst-editor`, `dbv-md-reader` y futuros proyectos).
  - **Cambios incorporados y verificados (77 tests Rust + 160 tests Vitest)**:
    1. **Categorización visual tripartita en UI (`src/ai/connectWizard.js`)**:
       - 1. IAs Locales (LM Studio, Ollama).
       - 2. IAs por Suscripción / Agentes CLI vía ACP (Google Antigravity CLI `agy`, Claude Code, Gemini CLI, Codex, Copilot CLI) que conectan cuentas Pro/Plus/Team/One sin coste de tokens.
       - 3. IAs en la nube por clave de API (Anthropic, OpenAI, Gemini, OpenRouter, compatibles).
    2. **Descubrimiento dinámico real de modelos y niveles de razonamiento por CLI (`src-tauri/src/ai/detect.rs`, `src-tauri/src/ai/commands.rs`)**:
       - Consulta en vivo al ejecutable del agente (`agy --help`, JSON-RPC `initialize` a `claude --output-format stream-json`, `codex debug clear-memories --model __probe__`, `copilot --help`) con extracción de modelos reales (p. ej. `gemini-4-argon`, `claude-sonnet-4-6`, `gpt-5.3-codex`, etc.) y niveles de esfuerzo (`low`, `medium`, `high`, `max`).
       - Caché de sesión en frontend (`src/ai/connectWizard.js`): se consulta automáticamente solo la primera vez por sesión al abrir el asistente o el panel `⚙️`, con botón manual de refresco (`🔄`) para re-interrogar al CLI bajo demanda.
    3. **Resumen visual estilo Visual Studio (`src/ai/connectWizard.js`, `src/ai/ai.css`)**:
       - Etiqueta resumen `.ai-agent-model-summary` junto al nombre del agente conectado/activo mostrando de un vistazo el modelo y nivel de razonamiento seleccionados (p. ej. `"Gemini 4 Argon Medium"`, `"Claude Sonnet 4.6 Medium"`).
    4. **Detección extendida en Windows y propagación ACP (`src-tauri/src/ai/detect.rs`, `src-tauri/src/ai/connections.rs`, `src-tauri/src/ai/acp.rs`)**:
       - `extended_path()` para añadir rutas de usuario (`LOCALAPPDATA/agy/bin`, etc.) y alias `antigravity` -> `agy.exe`.
       - Validación de `"acp:antigravity"` y `"acp:agy"` en `Connection::validate()`.
       - Propagación de `--model <id>` y `--effort <level>` / `-c model_reasoning_effort=<level>` al invocar el subproceso ACP (`spawn_for_agent_with_options`) y en `session/new` (`acpSession.js`).
    5. **Script de sincronización determinista (`scripts/sync-ai.mjs`)**:
       - Verifica (`node scripts/sync-ai.mjs --check <ruta-repo>`) o aplica (`node scripts/sync-ai.mjs --apply <ruta-repo>`) los **9 ficheros canónicos 100% agnósticos del dominio** (`detect.rs`, `connections.rs`, `acp.rs`, `commands.rs`, `connectWizard.js`, `acpSession.js`, `backend.js`, `tests/ai/connectWizard.test.js`, `tests/ai/acp.test.js`) preservando la cabecera de copyright del repositorio destino y adaptando automáticamente la ruta de tests en `dbv-typst-editor` (`src/ai/*.test.js`).

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-10-29
> **Exact point / Punto exacto:** Subsistema canónico de conexión a IAs (`template-v0.4.0`) y `scripts/sync-ai.mjs` completados y verificados en `dbv-tauri-starter` (77 tests Rust + 160 tests Vitest; 9/9 ficheros `[IDÉNTICO]` frente a `dbv-unreal-ai` v0.2.2).
> **Pending / Pendiente:** Ninguno. Listo para propagar a `dbv-typst-editor` y `dbv-md-reader` mediante `node scripts/sync-ai.mjs --apply`.
> **Next step / Próximo paso:** Ejecutar `scripts/sync-ai.mjs` cuando se abra el ciclo de actualización en `dbv-typst-editor` y `dbv-md-reader`.
