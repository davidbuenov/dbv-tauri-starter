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

- [ ] **Fase 5: `/code-simplify`**
  - [ ] Revisión de seguridad estándar (sin secretos, sin dependencias nuevas que auditar).

- [ ] **Fase 6: `/ship`**
  - [ ] Actualizar `CHANGELOG.md` de la raíz (`[Sin publicar]` → nueva versión `template-vX.Y.Z`).
  - [ ] Memory Gate: registrar en `memory.md` la decisión de la demo como ejemplo vivo del gotcha de cierre de ventana.
  - [ ] Tag `template-vX.Y.Z` siguiente.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-08-21
> **Exact point / Punto exacto:** `/plan` aprobado, `implementation_plan.md` escrito. Nada de `/build` ejecutado todavía.
> **Pending / Pendiente:** Los 6 pasos de `/build` + verificación manual en `tauri dev`.
> **Next step / Próximo paso:** Empezar por el paso 1 (permiso en `capabilities/default.json`) antes que ningún otro cambio, por el orden que exige la mitigación del Riesgo 1 del Adversarial Review.
