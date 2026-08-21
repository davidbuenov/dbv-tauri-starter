# 📋 Especificaciones: dbv-tauri-starter

> **Fase:** `/spec` (Especificación)
> **Estado:** Validado
> **Última Revisión:** 2026-08-21

---

## 🎯 1. Contexto y Objetivos
*Basado en la filosofía de "entender el problema antes de proponer la solución".*

- **Problema:** Convertir una app web en una app de escritorio nativa multiplataforma (Tauri v2 + dbv-specs-ops) implica redescubrir cada vez el mismo andamiaje — scaffold de Tauri, vendorizado del framework, CI de release por plataforma, y una lista larga de gotchas ya resueltos una vez en `dbv-md-reader` (permisos de Tauri, caché de WebView2, trampas del instalador NSIS) que no estaban capturados en ningún sitio reutilizable.
- **Objetivo (Éxito):** Un repositorio plantilla ("Use this template" en GitHub o `git clone`) que, nada más clonarse, ya compila y arranca ("Hola Mundo" real de Tauri v2), ya trae `dbv-specs-ops` integrado y actualizable, y ya trae CI funcional para generar instaladores de Windows/Linux/macOS — de forma que crear un proyecto nuevo o usarlo como referencia para migrar uno existente tome minutos, no la tarde que costó la primera vez.

## 👥 2. Usuarios y Escenarios
*Identifica para quién construimos y en qué situaciones usarán el sistema.*

- **Perfil de Usuario:** David Bueno Vallejo (autor y primer usuario) y cualquier desarrollador que use `dbv-specs-ops` y quiera empezar una app de escritorio nativa sin partir de cero.
- **Escenarios Clave:**
  - *Escenario A (proyecto nuevo):* El usuario clona la plantilla, ejecuta `dbv-specs-ops/docs/UPGRADE_PROMPT.md` para ponerse al día, y arranca `/spec` sobre su app real — el andamiaje técnico (Tauri, framework, CI) ya está resuelto de antemano.
  - *Escenario B (migración de una app web existente):* El usuario sustituye `src/` por su build de frontend y usa `src-tauri/` y `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` como referencia para adaptar los comandos Rust que necesite (filesystem, watchers, etc.), sin tener que averiguar desde cero cómo se integra Tauri con dbv-specs-ops.
  - *Escenario C (publicación multiplataforma):* El usuario etiqueta una versión (`vX.Y.Z`) y los 3 workflows de CI generan los instaladores de Windows/Linux/macOS como borrador de GitHub Release, sin tener que configurar runners a mano.

## ✨ 3. Funcionalidades Principales (Requisitos)
*El "Qué" del sistema. Estas tareas se trasladarán luego a `task.md`.*

- [x] **Scaffold Tauri v2 funcional:** `src/` (Vanilla JS/HTML/CSS, sin bundler) + `src-tauri/` (Rust), compila con `cargo check` y arranca con `npm run tauri dev` tal cual, sin edición previa necesaria.
- [x] **`dbv-specs-ops` vendorizado y actualizable:** integrado en `dbv-specs-ops/` vía `git subtree` (no copia manual), con una GitHub Action semanal que hace `git subtree pull` y abre un PR si hay novedades del framework.
- [x] **Ficheros de activación multi-IA:** `CLAUDE.md`, `GEMINI.md`, `ANTIGRAVITY.md`, `.windsurfrules`, `.github/copilot-instructions.md` en la raíz, todos redirigiendo a `dbv-specs-ops/`.
- [x] **CI de Release para 3 plataformas:** `release-windows.yml`, `release-linux.yml`, `release-macos.yml` — build sin firmar en cada plataforma, adjuntado como borrador de GitHub Release en cada tag `vX.Y.Z`, siguiendo el patrón validado en `dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` §9.
- [x] **README de arranque:** instrucciones de "clona → actualiza framework → `/spec`" y de cómo migrar una app existente, más explicación de cómo se mantiene la plantilla al día.
- [x] **Identidad de proyecto rellenada:** `project.config.md`, `LICENSE`, y limpieza de `README.template.md` ya consumido.
- [ ] **RF-01 — Demo mínima funcional, no un "Hola Mundo" vacío:** sustituir el saludo por defecto de `create-tauri-app` por un ejemplo pequeño pero real: un comando Rust propio (`#[tauri::command]`) + un input de texto que marca "cambios sin guardar" en memoria. Criterio de aceptación: al cerrar la ventana con cambios sin guardar, aparece un modal propio de confirmación (nunca `window.confirm()`/`window.alert()` nativos — ver `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §6, ítems 1-2) con permiso `core:window:allow-destroy` correctamente concedido en `capabilities/default.json`. Sin cambios sin guardar, la ventana cierra sin preguntar.
- [ ] **RF-02 — Aviso visible de "esto es una demo":** el propio `index.html` debe indicar claramente, sin necesidad de leer el repo, que este contenido es de ejemplo y remitir a `README.md` para los próximos pasos.
- [ ] **RF-04 — Corregir `index.html` para no usar `<script type="module">`:** el scaffold de `create-tauri-app` lo trae por defecto, pero contradice el patrón "sin bundler" que este mismo framework documenta en `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §3 (fallos silenciosos en algunos WebViews embebidos bajo protocolo custom). Un starter que documenta la lección debe también seguirla.
- [ ] **RF-03 — Guía de "qué hacer ahora" en `README.md`:** sección nueva explicando en pasos concretos cómo sustituir la demo por la app real (qué borrar de `src/`/`src-tauri/src/`, cuándo ampliar `capabilities/`, y el flujo `/spec` ya documentado) — el objetivo de §2 en `SPECIFICATIONS.md` ("crear proyecto nuevo") no está completo si el usuario tiene que adivinar por dónde empezar a editar.
- [ ] **RF-06 — Barra superior con botones de icono:** reestructurar la cabecera actual (título + selector de idioma) en una barra de herramientas con botones tipo `.btn-icon`, mismo patrón visual que `dbv-md-reader` — punto de anclaje para RF-07/RF-08 y para lo que cada proyecto derivado añada después.
- [ ] **RF-07 — Botón Always on Top:** `getCurrentWindow().isAlwaysOnTop()`/`.setAlwaysOnTop()`, sin comando Rust nuevo. Requiere el permiso `core:window:allow-set-always-on-top` (verificado contra el ACL real: no incluido en `core:default`, que solo trae la lectura `allow-is-always-on-top` — mismo gotcha que ADR-024 de `dbv-md-reader`). Estado visual (`.active`) y `data-i18n-title` dinámico.
- [ ] **RF-08 — Panel "Acerca de" con hueco para actualizaciones:** modal (`#about-modal`, reutiliza `.modal-overlay`/`.modal-card`) con nombre de la app, versión leída vía `window.__TAURI__.app.getVersion()` (permiso `core:app:allow-version`, tampoco en `core:default`) y crédito a dbv-specs-ops. Incluye un botón "Buscar actualizaciones" deshabilitado con explicación de por qué (RF-05 de `NATIVE_DESKTOP_APPS.md` §4: no se incluye `tauri-plugin-updater` de fábrica, ver Fuera de Alcance) — enseña dónde iría, sin implementarlo.
- [x] **RF-09 — Tutorial `TAURI_TUTORIAL.md`:** guía práctica de 10 minutos (cómo añadir UI, cómo añadir un comando Rust, cómo se conectan `invoke()`/eventos/API de ventana, cuándo hace falta un permiso nuevo en `capabilities`) usando el propio código de la demo como ejemplo, con enlaces verificados a la documentación oficial de Tauri v2. Enlazado desde `README.md`.
- [ ] **RF-05 — Selector de idioma ES/EN con i18n mínima:** `src/i18n.js` nuevo, mismo patrón sin librería que `dbv-md-reader` (ADR-017 en su `memory.md`) — dos objetos planos `es`/`en`, `t(clave, vars)`, `applyTranslations()` sobre atributos `data-i18n`/`data-i18n-title`/`data-i18n-placeholder`, detección `localStorage` → `navigator.language` → fallback español. Cubre solo las frases de la demo (RF-01/RF-02). Doble propósito: usabilidad básica y ejemplo vivo de la lección 7 de `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §4 ("i18n sin librería es válido para apps pequeñas").

## 🏗️ 4. Propuesta de Solución Técnica (Resumen)
*Enlace directo con `ARCHITECTURE.md`.*

- **Enfoque:** Tauri v2 con WebView nativo del SO (WebView2/WebKitGTK/WKWebView) + frontend Vanilla JS sin bundler — mismo patrón "sin bundler" documentado en `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §3, elegido explícitamente sobre React/Svelte para no forzar un stack de frontend a proyectos que migren una app web ya escrita en otra tecnología.
- **Dependencias Críticas:** `@tauri-apps/cli` v2, `create-tauri-app` (solo para el scaffold inicial, no es una dependencia en tiempo de ejecución), `tauri-apps/tauri-action` en CI.
- **Oportunidades de Skills y MCPs:** Ninguna identificada — el starter no expone lógica de negocio propia que se beneficie de un servidor MCP local.
- **Sistema de Diseño:** No aplica en esta fase — el "Hola Mundo" usa los estilos por defecto de `create-tauri-app`; cada proyecto derivado define su propio `docs/DESIGN.md` al especificar su app real.

### 4.1. Agent Readiness Checklist (Proyectos Web)
No aplica — `Agent Readiness (Web)` está marcado `Not Applicable` en `project.config.md` (app de escritorio nativa, no expone API/web pública).

## 🚫 5. Fuera de Alcance (Out of Scope)
*Vital para evitar el "scope creep" (crecimiento descontrolado del proyecto).*

- **Firma de código y notarización** (Authenticode en Windows, notarización de Apple en macOS): decisión de cada proyecto derivado según su presupuesto y volumen de usuarios, no del starter — ver `dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` §8.
- **`tauri-plugin-updater` (auto-actualización):** no viene instalado de fábrica — añadirlo implica gestionar un par de claves de firma fuera del repo (`dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §4), una decisión que cada proyecto derivado debe tomar conscientemente, no heredar sin saberlo.
- **Publicación real en marketplaces** (Microsoft Store, Uptodown, etc.): el "Hola Mundo" en sí no es un producto publicable; el checklist de `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` se aplica en el proyecto derivado cuando exista una app real que publicar.
- **Framework de frontend con bundler (React/Vue/Svelte):** decisión ya tomada (ver `memory.md`) de mantener el starter en Vanilla JS; un proyecto derivado que lo necesite migra su propio `src/` como prefiera, no es responsabilidad del starter ofrecerlo como alternativa integrada.
- **Migración automática de una app web existente:** el starter da el andamiaje y la referencia (`NATIVE_DESKTOP_APPS.md`), pero no incluye ninguna herramienta que "convierta" un proyecto web en Tauri de forma automática.

## ⚠️ 6. Riesgos y Mitigación
*Anticipar problemas es de ingenieros senior.*

- **Riesgo:** El framework `dbv-specs-ops` vendorizado queda desfasado respecto al repo original con el tiempo.
  - **Mitigación:** Ya implementada — Action semanal (`sync-dbv-specs-ops.yml`) con `git subtree pull` + PR automático, y el README instruye ejecutar `UPGRADE_PROMPT.md` como primer paso de cualquier proyecto nuevo (cubre el desfase entre la última sincronización de la plantilla y el momento real de clonado, que ninguna Action puede eliminar del todo — ver discusión previa sobre por qué un `git clone`/ZIP nunca trae "lo último" en el instante exacto).
- **Riesgo:** Los 3 workflows de CI nunca se han ejecutado de verdad contra este repo concreto (sí están validados en `dbv-md-reader`, pero adaptados aquí).
  - **Mitigación:** Verificar en `/test` lanzando al menos uno manualmente (`workflow_dispatch`) antes de dar la tarea por cerrada, no asumir que "compilan en otro repo" es suficiente evidencia.
- **Riesgo de Seguridad:** Los workflows de release tienen `permissions: contents: write`.
  - **Mitigación:** Ya aplicada — el permiso se concede solo a nivel de job, no como valor por defecto de todo el repositorio (`dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` §4).

## ❓ 7. Preguntas Abiertas
*Cosas que aún no sabemos o decisiones que dependen del usuario.*

- [x] ¿Vanilla JS o un framework con bundler para el frontend del starter? — **Resuelto:** Vanilla JS + sin Tailwind (decisión explícita del usuario, coherente con lo que realmente usa `dbv-md-reader` pese a lo que decía su `ARCHITECTURE.md`).
- [x] ¿Incluir `tauri-plugin-updater` de fábrica? — **Resuelto:** No, fuera de alcance (§5).
- [x] ¿Se ejecuta un `workflow_dispatch` real de cada workflow de CI antes del primer `/ship`? — **Resuelto:** No en este repo. Los 3 `release-{windows,linux,macos}.yml` se disparan con `push: tags: ["v*.*.*"]` — el mismo patrón que usaría este propio repo si algún día se etiquetara una versión de la plantilla (p. ej. `v1.0.0`). Empujar ese tag aquí generaría una Release real de GitHub con instaladores del Hola Mundo literal, sin sentido en un repo que no es un producto publicable. **Decisión:** este repo **nunca empuja tags con el patrón `vX.Y.Z`**; si se necesita versionar la evolución del propio starter, usar un esquema que no case con el trigger (p. ej. `template-v1.0.0`). Verificación de los 3 workflows en esta fase: lint estático (`actionlint` u equivalente) sobre los YAML, sin disparar una Release real. La verificación end-to-end (que de verdad compilen y publiquen instaladores) queda para el primer proyecto derivado real, donde sí tiene sentido publicar una versión — se retoma este repo entonces para confirmar que el patrón copiado funciona.

## 🧪 8. Criterios de Evaluación y Evals (No Deterministas)

No aplica — el starter no incluye componentes de IA ni prompts en tiempo de ejecución.

---
**Instrucción para la IA:** No pases a la fase `/plan` hasta que las "Preguntas Abiertas" críticas hayan sido resueltas o tengan un camino de solución definido.
