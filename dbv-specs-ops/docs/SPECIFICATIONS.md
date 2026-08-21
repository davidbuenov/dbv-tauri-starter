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
- [ ] **Identidad de proyecto rellenada:** `project.config.md`, `LICENSE`, y limpieza de `README.template.md` ya consumido (esta misma sesión).

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
- [ ] ¿Se ejecuta al menos un `workflow_dispatch` real de cada workflow de CI antes del primer `/ship`, o se acepta el riesgo de "compila en teoría, sin verificar en este repo" para la primera versión? (ver Riesgo 2 en §6).

## 🧪 8. Criterios de Evaluación y Evals (No Deterministas)

No aplica — el starter no incluye componentes de IA ni prompts en tiempo de ejecución.

---
**Instrucción para la IA:** No pases a la fase `/plan` hasta que las "Preguntas Abiertas" críticas hayan sido resueltas o tengan un camino de solución definido.
