# 🧠 Memory & Context

> **Frontera de uso (Memory vs. Tasks):**
> - `task.md` → progreso **operativo**: checklist de tareas, Snapshot de Contexto (el paso exacto siguiente), y estado de la sesión.
> - `memory.md` → contexto **cualitativo y temático**: conocimiento persistente, decisiones técnicas profundas, lecciones, y el área del producto en foco (no el paso específico).
> Si hay info que sirva para los dos, prioriza: datos con fecha/paso exacto → `task.md`; razonamiento/por-qué/lecciones → `memory.md`.
>
> *Instrucción para la IA: Consulta este archivo al inicio de cada sesión para recuperar el hilo técnico. Actualiza las secciones correspondientes cuando el workflow lo indique (triggers en `/plan`, `/build`, `/test` y gate en `/ship`).*

## 🎯 Contexto Activo
- **Estado actual del desarrollo:** `/plan` aprobado para RF-01 a RF-04 (demo mínima funcional + guía de arranque). Pendiente `/build`.
- **Foco inmediato:** Convertir el "Hola Mundo" vacío del scaffold en un ejemplo vivo del patrón correcto de cierre de ventana con confirmación (el gotcha más caro documentado en `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §6).

## 🏗️ Log de Decisiones Técnicas (ADR Ligero)
*Registro de por qué se tomaron ciertas rutas (ej. cambios en librerías, arquitectura o patrones).*

- **2026-08-21 - Origen del proyecto:** `dbv-tauri-starter` nace de una sesión de trabajo sobre `dbv-md-reader` donde se detectó que meses de lecciones reales de Tauri v2 (permisos, WebView2, NSIS, CI) vivían solo en el `memory.md` de un proyecto concreto, sin generalizar. Esas lecciones se llevaron primero al framework (`dbv-specs-ops` v2.5.1: nueva §6 de `NATIVE_DESKTOP_APPS.md`, nuevas secciones de `MARKETPLACE_PUBLISHING.md`, plantillas de CI en `NATIVE_APPS_RELEASE_CI.md`), y este repo es el starter que las hereda vía `git subtree` para que cualquier proyecto nuevo o migrado no tenga que redescubrirlas.
- **2026-08-21 - Versionado con dos esquemas de tag distintos:** `vX.Y.Z` queda reservado para las Releases reales de una app construida a partir de este starter (dispara `release-{windows,linux,macos}.yml`). La evolución del starter en sí se versiona con `template-vX.Y.Z` (tag ya creado: `template-v0.1.0`) y su propio `CHANGELOG.md` en la raíz, distinto del `CHANGELOG.md` de `dbv-specs-ops/` (que es el del framework). Ver `docs/ARCHITECTURE.md` (Restricciones).
- **2026-08-21 - `capabilities/default.json` se mantiene mínimo por YAGNI:** no se amplían preventivamente permisos como `core:window:allow-destroy` solo porque se sabe que son un gotcha documentado — se añaden únicamente cuando el propio código del starter los necesita de verdad (ver RF-01 en `SPECIFICATIONS.md`, que sí los necesitará al implementar la demo de cierre de ventana).

## ⚠️ Lecciones Aprendidas / Errores Evitados
*Notas sobre bugs específicos, configuraciones que fallaron o refactors intentados para no repetirlos.*

- **[2026-08-21] BUG CRÍTICO de la demo — dos scripts clásicos comparten UN solo ámbito global; sin IIFE, una colisión de nombres mata el fichero entero con un SyntaxError silencioso.** Síntoma real: ningún listener funcionaba (botones, selector de idioma, saludo) pese a que la página renderizaba bien y no había ningún error visible. Causa: `i18n.js` declaraba `function t(...)` en el ámbito global y `main.js` hacía `const { t, ... } = window.dbvI18n` en su top-level — al ser ambos `<script src>` clásicos (no módulos), comparten el mismo ámbito léxico global, y redeclarar `t` produce `Uncaught SyntaxError: Identifier 't' has already been declared`. **Un SyntaxError es de tiempo de parseo: el fichero completo muere antes de ejecutar una sola línea** — ni se registran los listeners ni se ejecuta ningún handler de error definido dentro del propio fichero. La regla que lo previene ya estaba escrita en `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` §3 ("encapsular el código propio en una IIFE clásica") y `dbv-md-reader` la sigue (su `app.js` es una IIFE, ADR-006) — el scaffold de esta demo la ignoró al escribir `main.js`/`i18n.js` como scripts globales planos. **Regla dura para este proyecto y todos los derivados: TODO fichero JS propio se envuelve en IIFE, sin excepciones, aunque "solo tenga funciones".**
- **[2026-08-21] Cómo se encontró (y por qué costó tanto) — método para la próxima vez:**
  1. **El capturador de errores debe ir INLINE en el `<head>` del HTML, antes de cualquier script diferido.** Los handlers `window.onerror`/`unhandledrejection` definidos dentro del propio fichero que falla nunca llegan a registrarse si el fallo es de parseo — punto ciego que consumió varias rondas de diagnóstico. Un `<script>` inline sin `defer` en el head sí lo caza todo, y mostró el error exacto a la primera.
  2. **Un repro "simplificado" que elimina la línea culpable no prueba nada.** Las dos pruebas de diagnóstico (script mínimo y verificación paso a paso) funcionaron perfectamente porque *no incluían* el `const { t } = ...` del top-level — accedían a todo dentro del handler. Dieron falsa confianza de que "la base funciona". Al simplificar un repro, conservar la *estructura* del código real (mismos top-levels), no solo sus llamadas.
  3. **Falso negativo de verificación de ACL:** grep del binario buscando `core:window:allow-destroy` da 0 aunque el permiso esté — el ACL serializado embebe los identificadores sin el prefijo de namespace (`allow-destroy` sí aparece). No descartar (ni confirmar) permisos compilados por grep del prefijo completo.
  4. **`taskkill /F` sobre el exe mientras cargo tiene un rebuild pendiente** puede dejar `failed to remove file... (os error 5)` y builds a medias; y el cierre forzoso repetido activa la restauración de sesión de WebView2 (formulario con texto viejo tras relanzar). Preferir cerrar la ventana normalmente; si hay que forzar, esperar ~1s antes de recompilar.
  5. **Cuando existe una implementación de referencia que funciona (dbv-md-reader), copiar su patrón PRIMERO** — el usuario lo señaló explícitamente a mitad de depuración y tenía razón: comparar contra `app.js` de dbv-md-reader (IIFE) habría revelado la diferencia estructural en minutos.
- **[2026-08-21] Resiliencia añadida a raíz del bug:** en `DOMContentLoaded`, los listeners se registran ANTES de los `await` de inicialización — si una llamada al backend fallara, la interfaz seguiría respondiendo en vez de quedarse muerta sin error visible (el patrón anterior anexaba listeners después de los awaits, así que cualquier rechazo abortaba el handler async y dejaba la UI inerte).
- **[2026-08-21] CSS — empate de especificidad entre `.hidden` y `.modal-overlay`:** ambos selectores de una sola clase; ganaba el declarado más tarde en la hoja (`.modal-overlay { display:flex }`), dejando el modal visible desde el arranque. Resuelto con `.modal-overlay.hidden { display:none }`. Al crear componentes con clase de estado + clase de layout, comprobar el orden/especificidad, no asumir que "hidden siempre gana".
- **[Meta] `task.md`/`memory.md` vendorizados por subtree traían el historial propio de `dbv-specs-ops` (v2.5.0), no el de este proyecto.** Al vendorizar el framework por primera vez, estos dos ficheros llegaron con el contexto del framework hablando de sí mismo — hubo que resetearlos explícitamente al arrancar `/plan` de este proyecto. **Lección para cualquier proyecto nuevo que vendorice `dbv-specs-ops` por primera vez:** revisar `task.md`/`memory.md` nada más clonar/vendorizar, no asumir que ya están vacíos solo porque son "ficheros de framework".

## 🗺️ Mapa de Relaciones
*Breve descripción de cómo interactúan los módulos actuales para ayudar a la IA a navegar el código.*

- **`src-tauri/src/lib.rs`:** comandos `#[tauri::command]`, capa fina de I/O. `run()` registra el `invoke_handler`.
- **`src/main.js`:** único fichero JS del frontend (IIFE, sin módulos ES) — invoca comandos Rust vía `window.__TAURI__.core.invoke`, gestiona el estado de la demo y el guardián de cierre de ventana.
- **`dbv-specs-ops/`:** framework vendorizado, no se edita a mano salvo los ficheros de identidad propios de este proyecto (`project.config.md`, `docs/SPECIFICATIONS.md`, `docs/ARCHITECTURE.md`, `task.md`, `memory.md`) — el resto se sincroniza vía `git subtree pull`.

---

## 🧹 Política de Mantenimiento

*Aplicar en cada `/ship` de tipo Major, o cuando este fichero supere las 200 líneas activas:*

- **Consolida** decisiones relacionadas en una sola entrada.
- **Archiva** lecciones ya internalizadas en el código: muévelas a `memory.archive.md` (créalo si no existe).
- **Elimina** entradas que describan decisiones revertidas o ya obsoletas.
- **Objetivo:** mantener `memory.md` por debajo de ~200 líneas activas para que la IA pueda leerlo íntegramente en cada sesión sin pérdida de atención.
