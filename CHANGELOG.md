# Changelog — dbv-tauri-starter

Registro de cambios del propio starter (la plantilla en sí, no de una app construida a partir de
ella). Formato [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versionado semántico con
el prefijo `template-v` en los tags de git (`template-vX.Y.Z`) — deliberadamente distinto de
`vX.Y.Z`, que este repo reserva para las Releases reales que dispararían los workflows de
`release-{windows,linux,macos}.yml` en un proyecto derivado. Ver `dbv-specs-ops/docs/SPECIFICATIONS.md`
§7 y `dbv-specs-ops/docs/ARCHITECTURE.md` (Restricciones) para el razonamiento completo.

---

## [Sin publicar] / [Unreleased]

---

## [template-v0.1.0] — 2026-08-21

### Added
- Scaffold Tauri v2 + Vanilla JS (`create-tauri-app`), renombrado y verificado (`cargo check`, `npm install`).
- `dbv-specs-ops` vendorizado vía `git subtree` desde el framework (v2.5.0 en el momento de la sincronización).
- Ficheros de activación multi-IA en la raíz (`CLAUDE.md`, `GEMINI.md`, `ANTIGRAVITY.md`, `.windsurfrules`, `.github/copilot-instructions.md`).
- GitHub Action semanal (`sync-dbv-specs-ops.yml`) que sincroniza el framework vendorizado vía `git subtree pull` y abre un PR si hay cambios.
- 3 workflows de Release por plataforma (`release-windows.yml`, `release-linux.yml`, `release-macos.yml`), sin firma ni auto-actualización, adaptados de los validados en producción de `dbv-md-reader`.
- `LICENSE` (MIT), `project.config.md` relleno, `dbv-specs-ops/docs/SPECIFICATIONS.md` y `ARCHITECTURE.md` especificando el propio starter como producto.
- **Demo mínima funcional (RF-01 a RF-08):** el "Hola Mundo" vacío del scaffold se sustituyó por un ejemplo vivo — comando Rust real (`get_greeting_name`) con Guard Clause y tests unitarios; confirmación de cierre de ventana con modal propio (`onCloseRequested` + `core:window:allow-destroy`, nunca `window.confirm()`); i18n ES/EN sin librería (`src/i18n.js`); barra de herramientas con botón Always on Top (`core:window:allow-set-always-on-top`, verificado contra `WS_EX_TOPMOST` real) y panel "Acerca de" con la versión (`core:app:allow-version`) y un hueco explicado para auto-actualización futura.
- **`TAURI_TUTORIAL.md` (RF-09):** guía práctica de 10 minutos — cómo añadir algo a la interfaz, cómo añadir un comando al backend Rust, cómo se conectan (`invoke()`, eventos, API de ventana) y cuándo hace falta un permiso nuevo — con enlaces verificados a la documentación oficial de Tauri v2. Enlazada desde `README.md`.

### Fixed
- **Crítico:** `i18n.js`/`main.js` como scripts clásicos sin IIFE colisionaban en el identificador global `t`, matando `main.js` entero con un `SyntaxError` de parseo silencioso — la interfaz completa quedaba muerta sin ningún error visible. Ambos ficheros envueltos en IIFE (ver lección detallada en `dbv-specs-ops/memory.md` y generalizada en `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §3 del framework).
- Modal de confirmación visible desde el arranque por empate de especificidad CSS entre `.hidden` y `.modal-overlay` — resuelto con `.modal-overlay.hidden`.
