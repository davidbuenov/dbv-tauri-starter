# 🏗 Arquitectura Técnica: dbv-tauri-starter

> **Fase:** `/plan` (Planificación Técnica)
> **Estado:** Validado
> **Última Revisión:** 2026-08-21

---

## 🛠 Stack Tecnológico

| Capa | Tecnología | Justificación |
| --- | --- | --- |
| **Core / Backend** | Rust + Tauri v2 | WebView nativo del SO (WebView2/WebKitGTK/WKWebView) en vez de empaquetar Chromium — instalador ~15-20 MB y RAM en reposo <64 MB frente a Electron. Ver `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §1. |
| **Frontend** | Vanilla JS + HTML/CSS, sin bundler | `withGlobalTauri: true`, sin `<script type="module">` — carga instantánea, offline, y no fuerza un framework a proyectos que migren una app web ya escrita en otra tecnología. Ver `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §3. |
| **Framework de metodología** | dbv-specs-ops (vendorizado vía `git subtree`) | Da SDD (`/spec`→`/plan`→`/build`→`/test`→`/code-simplify`→`/ship`), persistencia de contexto (`memory.md`/`task.md`) y las guías de arquitectura nativa/CI/marketplace ya generalizadas desde `dbv-md-reader`. |
| **Empaquetado** | `@tauri-apps/cli` v2, `bundle.targets: "all"` | Resuelve NSIS/`.deb`+`.AppImage`/`.dmg`+`.app` automáticamente según el SO de build, sin lógica condicional propia. |
| **CI/CD** | GitHub Actions (`tauri-apps/tauri-action@v0`) | 3 workflows por plataforma (`release-windows.yml`/`release-linux.yml`/`release-macos.yml`), patrón "Release como borrador acumulativo". Ver `dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` §9. |
| **Testing** | `cargo test` (backend Rust) | Sin framework de tests JS — el frontend del "Hola Mundo" no tiene lógica propia que testear; cada proyecto derivado añade su propia suite cuando implemente funcionalidad real. |

---

## 📂 Estructura de Directorios

```text
/
├── src/                      # Frontend Vanilla JS/HTML/CSS (sin bundler)
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── assets/
├── src-tauri/                # Backend Rust + configuración de empaquetado
│   ├── src/                  # lib.rs / main.rs — comandos #[tauri::command]
│   ├── capabilities/         # Permisos ACL por ventana (core:*, ver NATIVE_DESKTOP_APPS.md §6)
│   ├── icons/
│   └── tauri.conf.json
├── dbv-specs-ops/            # Framework SDD, vendorizado vía git subtree (no editar a mano salvo /ship del propio framework)
├── .github/
│   └── workflows/
│       ├── sync-dbv-specs-ops.yml   # Sincronización semanal del framework (subtree pull + PR)
│       ├── release-windows.yml
│       ├── release-linux.yml
│       └── release-macos.yml
├── CLAUDE.md / GEMINI.md / ANTIGRAVITY.md / .windsurfrules / .github/copilot-instructions.md
└── LICENSE, README.md
```

No hay separación domain/application/infrastructure: el "Hola Mundo" no tiene lógica de negocio propia que justifique esa capas — cada proyecto derivado adapta `src-tauri/src/` a la complejidad real de su propia app cuando la especifique.

---

## 🔑 Decisiones Técnicas Clave

### Seguridad

- **Permisos (Tauri ACL):** `capabilities/default.json` con el mínimo necesario para el scaffold (`core:default`) — deliberadamente **sin** ampliar de forma preventiva con permisos como `core:window:allow-destroy` (necesario solo si se implementa `onCloseRequested`) o `core:webview:allow-print` (solo si se usa `window.print()`), ya documentados como gotchas en `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §6/§9 — YAGNI: añadirlos cuando el proyecto derivado implemente la funcionalidad que los necesita, no antes.
- **Autenticación/Autorización:** No aplica — app de escritorio local, sin backend propio ni sesión de usuario.
- **Datos sensibles:** Ninguno en el starter. Si un proyecto derivado añade auto-actualización (`tauri-plugin-updater`), la clave privada de firma nunca debe vivir en el repo — ver `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §4.
- **CI:** `permissions: contents: write` acotado a nivel de job en cada workflow de release, no como valor por defecto del repo (`dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` §4).

### Estilo de Código

- **Paradigma:** Rust idiomático (comandos `#[tauri::command]` finos sobre lógica pura testeable) + JS clásico encapsulado en IIFE.
- **Convenciones:** Ver `dbv-specs-ops/docs/MASTER_PROMPT.md` (Normas de Desarrollo / Estándares de Codificación).
- **Complejidad:** No aplica un límite específico todavía — el scaffold es mínimo; cada proyecto derivado hereda las normas generales del framework al crecer.

### Gestión de Estado

- No aplica — el "Hola Mundo" no mantiene estado propio más allá de lo que ya gestiona Tauri (ventana única, sin persistencia).

---

## 🔗 Integraciones Externas

| Servicio | Propósito | Notas / Límites |
| --- | --- | --- |
| GitHub Actions | CI de release por plataforma | Sin firma de código en ninguna plataforma (§8 de `NATIVE_APPS_RELEASE_CI.md`) — SmartScreen/Gatekeeper avisarán al usuario final hasta que un proyecto derivado añada firma. |
| `github.com/davidbuenov/dbv-specs-ops` | Origen del framework vendorizado | Sincronizado vía `git subtree`, nunca editado directamente dentro de este repo salvo que el cambio sea específico de esta plantilla (p. ej. `project.config.md`). |

---

## ⚠️ Restricciones y Riesgos Técnicos

- **Restricción:** El repo debe seguir siendo clonable/usable como GitHub Template sin pasos manuales previos — cualquier cambio que rompa `npm install && npm run tauri dev` en limpio invalida el propósito del starter.
- **Restricción:** Este repo **nunca empuja tags con el patrón `vX.Y.Z`** — los 3 `release-{windows,linux,macos}.yml` se disparan con ese mismo patrón (`push: tags: ["v*.*.*"]`), y ese tag debe quedar reservado para cuando exista un proyecto derivado real con una app que sí tenga sentido publicar. Si se necesita versionar la evolución del propio starter, usar un esquema distinto (p. ej. `template-v1.0.0`) que no case con el trigger.
- **Riesgo:** Los 3 workflows de CI no se han ejecutado todavía de extremo a extremo (adaptados de `dbv-md-reader`, donde sí están validados, pero nunca disparados en este repo — ver restricción anterior, no se puede probar aquí con una Release real).
  - **Mitigación:** Verificación estática (`actionlint` u otro linter de GitHub Actions) sobre los 3 YAML en esta fase. La verificación end-to-end queda para el primer proyecto derivado real — se retoma este repo entonces para confirmar que el patrón copiado funciona de verdad.
- **Riesgo:** El subtree vendorizado de `dbv-specs-ops` puede quedar desfasado.
  - **Mitigación:** Ya implementada — Action semanal + instrucción de arranque de ejecutar `UPGRADE_PROMPT.md` (ver `docs/SPECIFICATIONS.md` §6).

---

## 🤖 Agent Harness (Arnés del Agente)

No aplica en esta fase — el starter no expone servidores MCP propios, no tiene lógica de dominio que un agente necesite orquestar más allá de lo que ya cubren los ficheros de activación estándar del framework (`CLAUDE.md`/`GEMINI.md`/etc., ya presentes en la raíz) y `dbv-specs-ops/memory.md`/`task.md`. Un proyecto derivado que sí necesite un MCP local o skills propias los añade al especificar su app real, siguiendo `dbv-specs-ops/docs/AGENT_PLUGINS.md`.

---

**Instrucción para la IA:** Respeta las decisiones y configuraciones del arnés documentadas aquí. Si necesitas desviarte por un motivo técnico o sugerir una nueva herramienta MCP/Skill para el proyecto, regístralo como "Decisión Técnica" en `memory.md` y obtén la aprobación del desarrollador.
