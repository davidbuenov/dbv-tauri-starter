# Backlog - dbv-tauri-starter template-v0.2.0 (Desktop Generative AI Subsystem)

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Proveer la plantilla de inicio oficial de Tauri v2 + dbv-specs-ops con el subsistema canónico completo de IA generativa de escritorio (3 niveles: local, nube con llavero seguro y agentes de suscripción vía ACP), zero-footprint y bilingüe.
* **Estado actual**: ENTREGA COMPLETADA (template-v0.2.0). 40 tests en verde, UI funcional con carga perezosa y documentación bilingüe.
* **Última decisión técnica**: Desacoplamiento total del frontend mediante carga perezosa (`entry.js`), custodia de API keys en llavero del SO vía `keyring` de Rust y soporte ACP para suscripciones existentes sin costes de tokens.
* **Próximo paso**: Sellar versión en Git con tag `template-v0.2.0`.

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

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-10-03
> **Exact point / Punto exacto:** Ciclo completo de la versión template-v0.2.0 cerrado en `dbv-tauri-starter`.
> **Pending / Pendiente:** Ninguno para esta versión.
> **Next step / Próximo paso:** Crear commit y tag `template-v0.2.0` en git.
