# 🤖 Usar una IA con dbv-tauri-starter

> 🌐 **Español** · [English](./IA.en.md) · [← Volver al README](../README.md)

El asistente de IA de dbv-tauri-starter es **opcional**. Sin configurar nada, el editor funciona exactamente igual que siempre: funciona exactamente igual que siempre de forma local. Esta guía explica **qué necesitas tener en tu ordenador** según la IA que quieras usar.

## Lo esencial en una tabla

| Quiero usar… | Qué necesito instalar o tener | ¿Sale algo de mi equipo? | ¿Cuesta dinero? |
| --- | --- | --- | --- |
| **Una IA local** (Ollama, LM Studio, llama.cpp…) | El programa servidor y al menos un modelo descargado | No | No (gasta tu CPU/GPU y disco) |
| **Claude, ChatGPT, Gemini u OpenRouter con clave de API** | Una clave de API de ese proveedor | Sí, al proveedor | Sí, por uso, según la tarifa del proveedor |
| **Mi suscripción** (Claude Pro/Max, ChatGPT Plus, Gemini, Copilot) | El **agente** de ese servicio instalado y con la sesión iniciada: Claude Code, Codex, Gemini CLI o GitHub Copilot CLI | Sí, al servicio del agente | Lo cubre tu suscripción |

> ⚠️ **Una suscripción no es una clave de API.** Pagar Claude Pro, ChatGPT Plus o Gemini no te da una clave de API (se contratan por separado). Con una suscripción, la vía es el **agente instalado** (tercera fila).

Para abrir el asistente de conexión: **Herramientas → Conectar una IA**. Al abrirlo, el editor **detecta lo que ya tienes** (Ollama, LM Studio y los agentes) y lo marca con ✓; lo que no encuentra aparece con un enlace de instalación. Esta detección solo ocurre al abrir esa pantalla, nunca al arrancar la aplicación.

Una vez conectada, el panel de la IA se abre con el botón **IA**, junto a P/E/V.

---

## 1. Una IA local (nada sale de tu equipo)

Es la opción más privada: los documentos no abandonan tu ordenador y no hay coste por uso. A cambio, la calidad depende del tamaño del modelo y de tu hardware.

### Ollama

1. Instala [Ollama](https://ollama.com/download).
2. Descarga un modelo, por ejemplo: `ollama pull qwen2.5:3b` (o `llama3`).
3. Comprueba qué tienes instalado con `ollama list`.
4. En el editor: **Herramientas → Conectar una IA**. Si Ollama está en marcha, aparece con ✓ y un botón **Usar**. Elige el modelo de la lista, pulsa **Probar conexión** y **Guardar**.

Ollama escucha en `http://localhost:11434`. El editor habla con él por su **API nativa** (`/api/chat`) y le indica él mismo el tamaño de contexto, porque Ollama usa por defecto uno pequeño (2 048–4 096 tokens) y recorta en silencio lo que no cabe.

### LM Studio

1. Instala [LM Studio](https://lmstudio.ai), descarga un modelo y **arranca su servidor local** (pestaña *Developer / Local Server*).
2. Escucha en `http://localhost:1234`; el editor lo detecta igual que a Ollama.

### Tu propio servidor compatible con OpenAI (llama.cpp, vLLM, Jan…)

Cualquier servidor que ofrezca la API de OpenAI sirve. El caso típico es `llama-server` de [llama.cpp](https://github.com/ggml-org/llama.cpp) con un modelo `.gguf` que tú mismo has descargado. **Este servidor no lo detecta el asistente: hay que añadirlo a mano.**

1. **Herramientas → Conectar una IA → Añadir una IA en la nube (clave de API)…** *(el botón se llama así, pero abre un formulario nuevo con todos los proveedores)*.
2. En **Proveedor**, elige **Servidor compatible con OpenAI (local o propio)**.
   - ⚠️ **No elijas «Ollama»** para un servidor que no es Ollama: ese modo usa un protocolo distinto y el editor no entenderá la respuesta. Y al **editar** una conexión el proveedor no se puede cambiar: hay que crear una nueva.
3. Rellena el formulario:

   | Campo | Valor |
   | --- | --- |
   | Nombre | el que quieras |
   | Dirección | `http://127.0.0.1:8080/v1` (puerto de tu servidor, **terminada en `/v1`**) |
   | Clave | vacía, salvo que arrancaras el servidor con `--api-key` |
   | Modelo | el `id` que devuelve `curl http://127.0.0.1:8080/v1/models` |
   | Contexto (tokens) | el `n_ctx` del servidor dividido entre sus slots (ver abajo) |
   | Herramientas | *Detectar* |

4. **Probar conexión** y **Guardar**. Marca la conexión como activa y elígela en el selector del panel.

Los datos del formulario (modelo, contexto, herramientas) se consultan con unos comandos: ver [Averiguar los datos del formulario](#averiguar-los-datos-del-formulario).

**Tres trampas habituales con llama.cpp:**

- **El contexto no es `n_ctx_train`.** `/v1/models` muestra `n_ctx_train`, el máximo con el que se entrenó el modelo, no el que tiene tu servidor. El valor real es el flag `-c` con el que arrancaste.
- **Los *slots* reparten el contexto.** Con varios slots (`-np`), el contexto se divide entre ellos; con `-np 4` y `-c 32768`, cada petición dispone de 8 192. Para dárselo entero a una conversación: `-np 1`.
- **Los modelos que «piensan» pueden parecer mudos.** Algunos modelos (Gemma 4, por ejemplo) escriben primero su razonamiento en un campo aparte (`reasoning_content`) y dejan la respuesta (`content`) vacía hasta terminar. El editor muestra `content`, así que ves una respuesta vacía mientras el modelo consume cientos o miles de tokens. Arranca el servidor con `--reasoning-budget 0` para desactivar el razonamiento.

Ejemplo de arranque razonable:

```bash
llama-server -m modelo.gguf -c 32768 -np 1 --reasoning-budget 0 --port 8080
```

### Qué esperar de un modelo local

- **Herramientas.** Con un modelo que las admite, la IA lee el proyecto por su cuenta, consulta la documentación de Typst y propone cambios que DBV **compila en memoria** antes de enseñártelos. Sin herramientas, el asistente sigue sirviendo para conversar y para trabajar sobre el contexto que se le envía, pero hace menos por sí mismo. El campo *Herramientas* del formulario las detecta; si falla la detección, puedes forzarlas a *Sí* o *No*.
- **Tamaño.** Los modelos de 2–3 mil millones de parámetros (que ocupan unos 2–3 GB) responden rápido en un portátil, pero se quedan cortos en propuestas largas o complejas. Si las respuestas salen flojas, prueba antes con un modelo mayor que tocar la configuración.
- **Contexto.** Un contexto de 4 096 tokens es el mínimo y se queda corto con documentos largos o imágenes. 8 192 es cómodo para trabajar; 32 768, holgado.
- **Memoria.** Un modelo más grande o un contexto mayor necesitan más RAM o VRAM. Empieza pequeño y sube.

---

## Averiguar los datos del formulario

Para conectar una IA local el formulario pide tres cosas: **modelo**, **contexto** y si admite **herramientas**. Se consultan en tu propio equipo con los comandos de abajo, y el resultado es lo que hay que escribir en cada campo.

> En **PowerShell** usa `curl.exe` (con la extensión): `curl` a secas es un alias de otro comando y no devuelve lo mismo. En CMD, macOS y Linux vale `curl`.

### Ollama (puerto 11434)

| Quiero saber… | Comando | Campo del formulario |
| --- | --- | --- |
| Qué modelos tengo descargados | `ollama list` | **Modelo**: la columna `NAME`, completa (por ejemplo `qwen2.5:3b`; `llama3:latest` también vale como `llama3`) |
| Lo mismo, por la API | `curl http://localhost:11434/api/tags` | — |
| Qué modelos están cargados en memoria ahora | `ollama ps` | — |
| Detalles de un modelo (arquitectura, parámetros, contexto máximo, cuantización) | `ollama show qwen2.5:3b` | **Contexto**: el máximo que muestra es el del modelo; elige un valor igual o menor que quepa en tu memoria |
| Descargar un modelo nuevo | `ollama pull qwen2.5:3b` | — |

El editor **fija el contexto por su cuenta** en Ollama, así que el campo *Contexto* es el que tú decides, no el que tenga Ollama configurado. Si lo dejas vacío, usa un valor prudente (4 096).

### LM Studio (puerto 1234)

Con su servidor local arrancado:

```bash
curl http://localhost:1234/v1/models      # el campo "id" de cada modelo → campo Modelo
lms ls                                    # modelos descargados (si tienes instalada su herramienta `lms`)
```

El contexto se fija en LM Studio al cargar el modelo (ajuste *Context Length*); copia ese número en el formulario.

### Servidor propio con llama.cpp (`llama-server`)

Con el servidor arrancado (el puerto por defecto es `8080`):

```bash
curl http://127.0.0.1:8080/v1/models      # "data" → "id": nombre del modelo → campo Modelo
curl http://127.0.0.1:8080/props          # contexto, slots y capacidades
```

Y en PowerShell, ya masticado:

```powershell
# Nombre del modelo → campo Modelo
(curl.exe -s http://127.0.0.1:8080/v1/models | ConvertFrom-Json).data.id

# Contexto, slots, herramientas e imágenes
$p = curl.exe -s http://127.0.0.1:8080/props | ConvertFrom-Json
"n_ctx=$($p.default_generation_settings.n_ctx)  slots=$($p.total_slots)  tools=$($p.chat_template_caps.supports_tools)  vision=$($p.modalities.vision)"
```

| Dato que devuelve | Qué significa | Campo del formulario |
| --- | --- | --- |
| `id` en `/v1/models` | Nombre del modelo (suele ser el fichero `.gguf`) | **Modelo** |
| `n_ctx` en `/props` | Contexto **total** del servidor (el flag `-c`) | **Contexto (tokens)**, dividido entre `total_slots` |
| `total_slots` en `/props` | Slots en paralelo: cada petición recibe `n_ctx / total_slots` (con 4 slots y 32 768, 8 192). Con `-np 1`, todo el contexto | Divide `n_ctx` entre este número (ver «Tres trampas habituales», arriba) |
| `supports_tools` en `/props` | Si el modelo admite herramientas | **Herramientas**: déjalo en *Detectar*; fuérzalo a *No* si ves que falla |
| `vision` en `/props` | Si el servidor lleva visión (`--mmproj`) | — |
| `n_ctx_train` en `/v1/models` | Contexto con el que se **entrenó** el modelo: **no es el del servidor** | No lo uses |

### El botón «Probar conexión»

Es la comprobación definitiva: si el servidor responde y la dirección es correcta, devuelve la lista real de modelos. Para Ollama y LM Studio, esa lista sale en el desplegable del campo **Modelo**; para un servidor propio, comprueba que el nombre que escribes es uno de los que devuelve `/v1/models`.

---

## 2. En la nube, con tu clave de API

Para usar un modelo de un proveedor con **clave de API**:

| Proveedor | Dónde se consigue la clave | Dirección (ya preconfigurada) |
| --- | --- | --- |
| Anthropic (Claude) | consola de Anthropic | `https://api.anthropic.com/v1` |
| OpenAI (ChatGPT) | plataforma de OpenAI | `https://api.openai.com/v1` |
| Google (Gemini) | Google AI Studio | `https://generativelanguage.googleapis.com/v1beta/openai` |
| OpenRouter | openrouter.ai | `https://openrouter.ai/api/v1` |

**Herramientas → Conectar una IA → Añadir una IA en la nube (clave de API)…** → elige el proveedor → pega la clave → **Probar conexión** → elige el modelo de la lista que devuelve el propio proveedor → **Guardar**.

- **La clave** se guarda en el **almacén de credenciales del sistema** (Administrador de credenciales de Windows, Llavero de macOS, Secret Service en Linux), nunca en un fichero ni en `localStorage`. Al editar una conexión el campo de la clave queda vacío: dejarlo así conserva la guardada. Eliminar la conexión borra también la clave.
- **Privacidad:** para responder, se envía al proveedor el contexto del proyecto (fichero abierto, selección, errores y lo que adjuntes). **La primera vez por proyecto y proveedor, el editor te pregunta** antes de enviar nada. Puedes quitar cualquier elemento del contexto desde el propio panel.
- **Coste:** lo factura el proveedor por uso.

---

## 3. Con tu suscripción: agentes instalados

Si pagas **Claude Pro/Max, ChatGPT Plus, Gemini o GitHub Copilot**, no necesitas clave de API: DBV puede hablar con el **agente de línea de comandos** de ese servicio, que usa tu cuenta. DBV **no ve ni guarda tus credenciales**: el inicio de sesión lo hace el propio agente.

| Agente | Qué debe estar instalado | Cómo lo lanza DBV |
| --- | --- | --- |
| **Claude Code** | Claude Code y **Node.js** (incluye `npx`) | `npx -y @agentclientprotocol/claude-agent-acp` |
| **Codex** (OpenAI) | Codex y **Node.js** (incluye `npx`) | `npx -y @zed-industries/codex-acp` |
| **Gemini CLI** | Gemini CLI | `gemini --experimental-acp` |
| **GitHub Copilot CLI** | Copilot CLI | `copilot --acp` |

Enlaces de instalación: [Claude Code](https://docs.anthropic.com/en/docs/claude-code/setup) · [Codex](https://github.com/openai/codex) · [Gemini CLI](https://github.com/google-gemini/gemini-cli) · [Copilot CLI](https://docs.github.com/copilot/how-tos/set-up/install-copilot-cli) · [Node.js](https://nodejs.org).

**Pasos:**

1. Instala el agente (y Node.js si lo necesita) para que quede en el `PATH` de tu sistema.
2. **Ábrelo una vez en una terminal** e inicia sesión con tu cuenta. DBV no puede iniciar sesión por ti.
3. En el editor: **Herramientas → Conectar una IA**. El agente aparece con ✓ *instalado* y un botón **Conectar**.
4. La primera vez puede tardar: para Claude Code y Codex se descarga su adaptador con `npx`.

**Cómo funciona:**

- DBV lanza el agente **con la carpeta del proyecto como directorio de trabajo**; se cierra al cerrar el proyecto o la aplicación.
- **Permisos:** cada vez que el agente pide permiso para algo (ejecutar una orden, editar, leer), DBV te lo muestra con lo que pide. Puedes **Permitir una vez**, **Permitir siempre en esta conversación** o **Denegar**. Nada se aprueba solo, y lo que quede fuera de la carpeta del proyecto se deniega.
- **Seguridad de tus ficheros:** antes de cada turno, DBV guarda un **punto de restauración** de los ficheros de texto del proyecto. Lo que el agente cambie directamente en disco aparece al terminar bajo el título **«El agente cambió N ficheros en disco»**, con sus diferencias y **Deshacer** por fichero o en bloque.

---

## Privacidad de un vistazo

| Vía | Qué sale de tu equipo |
| --- | --- |
| IA local | Nada. La conversación no abandona tu ordenador. |
| API en la nube | El contexto que se envía, al proveedor. Se pregunta la primera vez por proyecto. |
| Agente con suscripción | Lo que el agente envíe a su servicio. DBV no controla su red; los permisos sí pasan por DBV. |

Las herramientas de los modelos directos **no acceden a la red ni ejecutan programas**: solo leen el proyecto y proponen cambios que tú revisas trozo a trozo antes de aplicarlos, con **Deshacer**.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| Escribo y **no responde nada** (servidor propio) | Proveedor en *Ollama* en lugar de *compatible con OpenAI* | Crea una conexión nueva con el proveedor correcto |
| Respuesta vacía y muchos tokens «recibidos» | El modelo razona y no llega a escribir `content` | Arranca el servidor con `--reasoning-budget 0` |
| «Servidor local apagado» | Ollama, LM Studio o tu servidor no están en marcha | Arráncalo y vuelve a **Probar conexión** |
| Error de dirección o 404 con un servidor propio | Falta `/v1` al final de la dirección | `http://127.0.0.1:PUERTO/v1` |
| Clave no válida | Clave mal pegada o de otro proveedor | Vuelve a pegarla; una suscripción no sirve como clave |
| Un agente no aparece o no conecta | No está en el `PATH`, falta Node.js o no has iniciado sesión | Instálalo, ábrelo una vez en una terminal y abre de nuevo **Conectar una IA** |
| El agente dice que necesita Node.js | Claude Code y Codex usan `npx` | Instala [Node.js](https://nodejs.org) |
| El modelo olvida el principio del documento | Contexto demasiado pequeño | Sube el contexto del servidor y el campo **Contexto (tokens)** |

## Para quien construye una app con esta plantilla

Todo lo de arriba funciona **de fábrica** en la demo: pulsa ✨ (`Ctrl/Cmd+Mayús+I`), conecta una IA y pídele cambios sobre el documento de ejemplo (`notas.md`, que se crea en la carpeta de datos de la app). Esta sección explica cómo está hecho y **qué cambiar** al convertir la demo en tu aplicación. La implementación viene de [`dbv-md-reader`](https://github.com/davidbuenov/dbv-md-reader) (v0.18.0, usada en producción) y de `dbv-typst-editor`; aquí se ha generalizado.

### Dónde está cada cosa

| Capa | Fichero | Qué hace |
| --- | --- | --- |
| Rust | `src-tauri/src/ai/` | Conexiones y proveedores (`providers.rs`), claves en el almacén del SO (`secrets.rs`), agentes por ACP (`acp.rs`, `detect.rs`), **ficheros confinados** (`files.rs`), comprobación de propuestas (`check.rs`), conversaciones (`store.rs`) |
| Rust | `src-tauri/src/lib.rs` | Registra los comandos (`#[cfg(desktop)]`) y el comando de la demo `demo_workspace` |
| Frontend | `src/ai/` | Módulos **ES** cargados bajo demanda (`entry.js` → `aiApp.js`): panel, revisión por trozos, IA en línea, asistente de conexión |
| Frontend | `src/main.js` (`buildAiHost`) | **El único puente con tu app**: le dice a la IA cuál es el documento abierto, cómo cambiarlo y cómo pintar Markdown |
| Tests | `tests/ai/`, `scripts/e2e/` | 154 tests de Vitest/jsdom y un banco de interfaz en Edge/Chromium con el backend simulado |

### Qué adaptar (lista de comprobación)

1. **`src/ai/appInfo.js`**: `APP_NAME` y `DOCUMENT_KIND` (con qué trabaja tu usuario). Van a las instrucciones del modelo y a los agentes.
2. **Extensiones que la IA puede leer y proponer**: `TEXT_EXTENSIONS` en `src-tauri/src/ai/files.rs` (la barrera de verdad) y `src/ai/paths.js` (la primera barrera). Por defecto `.md`, `.markdown`, `.txt`.
3. **Nombre del servicio del almacén de claves**: `SERVICE` en `src-tauri/src/ai/secrets.rs`. Cámbialo **antes de publicar**: después, las claves ya guardadas quedarían huérfanas.
4. **`check.rs`**: la comprobación previa de una propuesta (aquí, de Markdown: bloque de código sin cerrar, `$$` sin pareja, enlaces rotos). Sustitúyela por la de tu formato (JSON válido, tu compilador, un linter…); si no hay nada que comprobar, devuelve una lista vacía.
5. **Instrucciones y herramientas** (`src/ai/context.js`, `src/ai/tools.js`): hablan de «documentos»; ajusta el dominio si tu app trabaja con otra cosa.
6. **`buildAiHost` en `main.js`** y **`demo_workspace` en `lib.rs`**: sustituye el `<textarea>` de la demo y la carpeta de ejemplo por tu documento y tu carpeta reales. La IA solo necesita una **carpeta de trabajo** (`root`) y, si lo hay, **un documento abierto** con su texto.
7. **Estilos**: `src/ai/ai.css` trae sus propios tokens (claro/oscuro). Si tu app ya tiene tokens con esos nombres, borra el bloque `:root` y usa los tuyos.
8. **Privacidad (obligatorio antes de publicar)**: tu política de privacidad y las fichas de las tiendas deben decir que, **solo si el usuario lo activa**, el texto del documento puede enviarse al proveedor que él elija. Mira `docs/privacidad.html` de `dbv-md-reader` como ejemplo.
9. **Móvil**: la IA es solo de escritorio (`#[cfg(desktop)]`, dependencias `keyring`/`tokio`/`walkdir` bajo `cfg(not(any(android, ios)))`).

### Lo que ya está resuelto (no lo desharás sin querer)

- **Cero huella**: sin IA conectada no se descarga ni un fichero de `src/ai/` (el banco `ai-assistant.e2e.mjs` lo comprueba).
- **Nada se escribe sin que el usuario lo vea**: la IA propone, tú revisas trozo a trozo; el documento abierto se cambia **en el editor** (se deshace con `Ctrl+Z`), los demás con escritura atómica confinada en Rust.
- **Confinamiento en Rust** (`resolve_inside`): sin `..`, rutas absolutas, `.git` ni enlaces simbólicos que salgan de la carpeta; solo las extensiones de la lista.
- **El contenido de los documentos es un dato, no una orden** (inyección indirecta), y **la salida de la IA no puede cargar medios remotos** (exfiltración por imagen Markdown): `src/ai/markdown.js` construye nodos y no usa `innerHTML`. Si lo sustituyes por otro renderizador, **sanea antes de crear el DOM** (el navegador pide la URL en cuanto aparece la `<img>`).
- **Sin agente «a medida»**: solo los cuatro reconocidos (Claude Code, Gemini CLI, Codex, Copilot CLI). Una orden libre recibida por IPC sería ejecución arbitraria de código.
- **Rutas de Windows**: `fs::canonicalize` devuelve `\\?\C:\…` y los agentes hablan en `C:\…`; la comparación lo normaliza (si no, todo se denegaba «por salir de la carpeta» sin preguntar).
- **Finales de línea CRLF**: el modelo propone con `\n`; la IA lee todo con LF y restaura el final de línea original al escribir en disco.
- **Escritura atómica con respaldo**: si el renombrado falla en Windows (otro programa tiene el fichero abierto), se escribe directamente y los errores nombran el fichero.

### Cómo probarlo

```bash
npm run test:ai       # Vitest + jsdom (módulos de src/ai/)
npm run test:e2e      # Edge/Chromium headless con el backend simulado (define EDGE_PATH si no está en la ruta habitual)
npm test              # cargo test --lib (Rust)
```

> ⚠️ **Sin verificar en esta plantilla:** Linux y macOS (los módulos ES con `import()` se probaron en el motor Chromium, el de WebView2; WebKitGTK/WKWebView no), y la IA dentro de un paquete MSIX de la Microsoft Store (agentes como procesos hijos y almacén de credenciales).

---

---

> Esta guía describe la IA de la plantilla (`template-v0.3.0`, basada en `dbv-md-reader` 0.18.0). La ayuda dentro de la aplicación (**?** → *Asistente de IA*) resume lo esencial; la especificación completa está en [`RF-90`–`RF-96` de SPECIFICATIONS.md](../dbv-specs-ops/docs/SPECIFICATIONS.md).
