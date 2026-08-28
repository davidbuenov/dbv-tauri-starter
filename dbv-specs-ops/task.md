# Backlog - dbv-tauri-starter

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Plantilla Tauri v2 + dbv-specs-ops lista para clonar, con CI de release por plataforma y una demo mínima funcional que enseña el patrón correcto de cierre de ventana con confirmación.
* **Estado actual**: `/plan` aprobado (RF-01 a RF-04), `implementation_plan.md` escrito, pendiente `/build`.
* **Última decisión técnica**: Adversarial Architect Review resolvió 2 riesgos por diseño (orden de implementación del permiso `core:window:allow-destroy` antes que la lógica del modal; flag `closeConfirmPending` contra doble disparo de `onCloseRequested`) — ver `implementation_plan.md`.
* **Próximo paso**: Ejecutar los 6 pasos de `implementation_plan.md` en orden, luego `/test` manual en `tauri dev`.

## Checklist de Tareas

- [x] **Fase 1: Bootstrap y `/spec`**
  - [x] `project.config.md` relleno, `LICENSE`, limpieza de `README.template.md`.
  - [x] `docs/SPECIFICATIONS.md` — starter como producto (RF-01 a RF-04, fuera de alcance, riesgos).
  - [x] `docs/ARCHITECTURE.md` — stack real, estructura de directorios, decisión de `capabilities` mínimas por YAGNI.
  - [x] Resuelta la pregunta abierta de versionado: `vX.Y.Z` reservado para apps derivadas (comparten trigger con `release-*.yml`), `template-vX.Y.Z` + `CHANGELOG.md` propio para el starter en sí. Tag `template-v0.1.0` creado.

- [x] **Fase 2: `/plan`**
  - [x] Adversarial Architect Review (impreso en la sesión, resumido arriba).
  - [x] `implementation_plan.md` con frontmatter (`dependencies`/`risks`/`rollback_strategy`).

- [x] **Fase 3: `/build`** (RF-05 de i18n añadido a mitad de plan, ver `implementation_plan.md`)
  - [x] 1. `capabilities/default.json` — añadido `core:window:allow-destroy`.
  - [x] 2. `src-tauri/src/lib.rs` — comando `get_greeting_name` (Guard Clause, devuelve datos no frase — la presentación con i18n vive en JS).
  - [x] 3. `src/i18n.js` (nuevo) — objetos `es`/`en`, `t()`, `applyTranslations()`, detección de idioma.
  - [x] 4. `src/main.js` — estado `isDirty`, `onCloseRequested` (patrón validado contra `dbv-md-reader/src/app.js` ADR-030: solo `preventDefault()` al cancelar, nunca `.destroy()` manual), `closeConfirmPending`, wiring de idioma.
  - [x] 5. `src/index.html` — quitado `type="module"`, markup de demo + aviso + modal + selector ES/EN.
  - [x] 6. `src/styles.css` — estilos del modal/banner/selector (claro/oscuro).
  - [x] 7. `README.md` — sección "Qué hacer ahora".

- [x] **Fase 4: `/test`** — completada tras una sesión de depuración real (ver Lecciones en `memory.md`)
  - [x] `cargo check` + `node --check` en verde.
  - [x] **Bug crítico encontrado y corregido:** colisión de identificador `t` entre `i18n.js` y `main.js` por falta de IIFE (scripts clásicos comparten ámbito global) — mataba `main.js` entero con un SyntaxError de parseo silencioso; toda la interfaz quedaba muerta. Ambos ficheros envueltos en IIFE. Detalle completo y método de diagnóstico en `memory.md`.
  - [x] Bug de CSS corregido: modal visible en el arranque por empate de especificidad `.hidden` vs `.modal-overlay`.
  - [x] Verificado en vivo (UI Automation + capturas + confirmación del usuario): saludo desde Rust al escribir, cambio de idioma ES/EN aplicado a toda la UI, Always on Top con bit `WS_EX_TOPMOST` real confirmado por Win32, panel Acerca de con versión leída de `getVersion()`. RF-06/07/08 (barra superior, chincheta, Acerca de) añadidos y verificados en la misma sesión a petición del usuario ("Hola Mundo empowered").
  - [x] Confirmación final del usuario en la app real: "ya funciona todo bien".

- [x] **Fase 5: `/code-simplify`**
  - [x] `currentWindow`/`aboutVersionEl` cacheados en vez de repetir `getCurrentWindow()`/`getElementById` — consistencia y una llamada menos por interacción.
  - [x] Revisión de seguridad: sin secretos, sin dependencias nuevas, `name` del comando Rust se muestra vía `textContent` (nunca `innerHTML`) — sin riesgo de XSS.
  - [x] Verificado en vivo tras el refactor (chincheta + Acerca de por UI Automation) — sin regresión.

- [x] **RF-09 (añadido a petición del usuario tras el `/ship` inicial): `TAURI_TUTORIAL.md`** — guía de cómo añadir UI/comandos Rust/cómo se conectan, con enlaces oficiales verificados con WebFetch antes de publicarlos.

- [x] **Fase 6: `/ship`**
  - [x] `CHANGELOG.md` de la raíz ampliado con RF-01..09 y los 2 bugs corregidos, dentro de la sección `template-v0.1.0` (nunca publicada hasta ahora, no reescribe historia pública).
  - [x] `walkthrough.md` completado (fichero local, gitignored por el framework).
  - [x] Memory Gate ya hecho en la ronda anterior (lección del bug crítico + método de diagnóstico).
  - [x] Tag `template-v0.1.0` movido a este commit final y publicado con `git push --tags`.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-08-28
> **Exact point / Punto exacto:** **3 apps ya en tienda** construidas o migradas con este starter: `dbv-md-reader` (v0.13.1), `dbv-teleprompter` (v0.2.0, MSIX + Partner Center) y `eer-studio` (v1.4.0). Framework subido a **v2.7.0** con la cosecha de lecciones de las tres (ver ADR 2026-08-28) — commit local en `dbv-specs-ops` y sincronizado a este repo; **sin push a `origin` en ninguno de los dos**, pendiente de revisión del usuario.
> **Pending / Pendiente:** (1) Push de `dbv-specs-ops` — 3 commits locales por delante de `origin`. (2) `dbv-img2webp` tiene el framework vendorizado en **v2.3.0** pese a un commit del 22-ago que dice haberlo subido a v2.6.0: sync de subtree fallido en silencio, hay que reejecutar `UPGRADE_PROMPT.md` ahí. (3) `unreal-smart-cleaner` (item 2 del roadmap) sigue sin empezar, congelado desde 2024.
> **Next step / Próximo paso:** Planificar la migración de **`dbv-pdf2deck`** (prioridad del usuario). Arquetipo D — FastAPI + PyMuPDF + easyocr + torch. Dos bloqueantes a resolver **antes** de escribir código: la licencia AGPL-3.0 de PyMuPDF frente a la distribución en tienda, y la estrategia de instalador para un sidecar de varios GB (ver `WEB_TO_DESKTOP_MIGRATION.md` §5 y §6).
