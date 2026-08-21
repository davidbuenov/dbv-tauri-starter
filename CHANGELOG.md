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
