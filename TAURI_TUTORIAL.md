# 🧭 Tutorial rápido: cómo se conecta esta app (Tauri v2)

> Guía de 10 minutos usando el propio código de la demo (`src/`, `src-tauri/`) como ejemplo. No sustituye
> a la documentación oficial — cada sección enlaza a la página exacta para profundizar.

---

## 1. La arquitectura en una frase

Hay dos mundos separados que se hablan por IPC (paso de mensajes), nunca comparten memoria directamente:

```
FRONTEND (WebView — HTML/CSS/JS, carpeta src/)  ←──IPC──→  CORE (Rust, carpeta src-tauri/)
```

- El **frontend** es lo que ve el usuario: `src/index.html`, `src/main.js`, `src/i18n.js`, `src/styles.css`.
- El **core** es Rust: `src-tauri/src/lib.rs`. Aquí van filesystem, red, procesos del sistema — todo lo que
  un navegador normal no puede hacer.
- La conexión entre ambos son los **comandos** (frontend pide algo al backend) y los **eventos** (el
  backend avisa al frontend de algo, sin que se lo hayan pedido).

Referencia general: [tauri.app/concept/architecture](https://tauri.app/concept/inter-process-communication/)

---

## 2. Añadir algo a la interfaz (frontend)

Todo vive en `src/`. Sigue el patrón "sin bundler" del starter (ver
[`dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md`](./dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md) §3):

1. **Markup**: añade el HTML en `src/index.html`. Si el texto debe traducirse, usa `data-i18n="clave"`
   (o `data-i18n-title`/`data-i18n-placeholder`) en vez de escribir el texto fijo — mira cómo lo hace el
   banner de demo o el modal de "Acerca de".
2. **Estilos**: añádelos a `src/styles.css`. Si el elemento debe verse bien en modo oscuro, añade también
   la variante dentro del bloque `@media (prefers-color-scheme: dark)` al final del fichero.
3. **Comportamiento**: la lógica va en `src/main.js` (o un fichero nuevo, ver §4 sobre por qué necesita
   IIFE). Ejemplo real ya en el código: `btnAlwaysOnTop.addEventListener("click", toggleAlwaysOnTop)`.
4. **Traducciones**: si el texto es nuevo, añade la clave a los dos objetos (`es`/`en`) de `src/i18n.js`.

No hace falta ningún paso de build para el frontend — guarda el fichero y relanza `npm run tauri dev`
(o usa el propio hot-reload si tu WebView lo soporta para ese cambio).

---

## 3. Añadir algo al "servidor" (backend Rust)

El backend son funciones Rust normales, expuestas al frontend con una anotación:

```rust
// src-tauri/src/lib.rs
#[tauri::command]
fn mi_comando(parametro: &str) -> String {
    // lógica aquí — puede leer ficheros, llamar a una API, lo que necesites
    parametro.trim().to_string()
}
```

Después, regístralo en el mismo fichero, dentro de `tauri::Builder::default()`:

```rust
.invoke_handler(tauri::generate_handler![get_greeting_name, mi_comando])
```

(la demo ya tiene `get_greeting_name` — añade el nombre de tu comando nuevo a la misma lista, separado
por comas).

**Reglas del propio framework para esta capa** (`dbv-specs-ops/docs/MASTER_PROMPT.md`, Estándares de
Codificación): Guard Clauses al principio de la función, un único punto de retorno, y para operaciones que
puedan fallar de verdad (leer un fichero, llamar a una red) usa el patrón `Result<T, E>` de Rust en vez de
`panic!`/`unwrap()`.

Referencia oficial: [tauri.app/develop/calling-rust](https://tauri.app/develop/calling-rust/)

---

## 4. Cómo se conectan realmente

### 4.1. Frontend → Backend: `invoke()`

```js
// src/main.js — patrón usado en toda la demo
const { invoke } = window.__TAURI__.core;
const resultado = await invoke("mi_comando", { parametro: "valor" });
```

El nombre del comando (string) y las claves del objeto de argumentos deben coincidir **exactamente** con
el nombre de la función Rust y sus parámetros (Tauri convierte `snake_case` de Rust a `camelCase` de JS
automáticamente si hace falta, pero el nombre del comando en sí es literal).

### 4.2. Backend → Frontend: eventos (para cuando Rust necesita avisar sin que se lo pidan)

No hay ningún ejemplo en la demo todavía (no lo necesita), pero es el mecanismo a usar si algo pasa en
Rust en segundo plano y el frontend debe enterarse (p. ej. un fichero que cambia en disco, como hace
`dbv-md-reader` con su `file-watcher`):

```rust
// Rust: emitir
app.emit("mi-evento", payload)?;
```

```js
// JS: escuchar
window.__TAURI__.event.listen("mi-evento", (evento) => {
  console.log(evento.payload);
});
```

Referencia oficial: [tauri.app/develop/calling-frontend](https://tauri.app/develop/calling-frontend/)

### 4.3. Ventana/App: no todo pasa por comandos propios

Para gestión de ventana (cerrar, minimizar, Always on Top...) y datos de la app (versión, nombre), Tauri
ya expone una API JS lista para usar, sin que tengas que escribir un comando Rust — así es como funcionan
la chincheta y el panel "Acerca de" de esta demo:

```js
const { getCurrentWindow } = window.__TAURI__.window;
await getCurrentWindow().setAlwaysOnTop(true);

const { getVersion } = window.__TAURI__.app;
const version = await getVersion();
```

Referencia oficial: [API de Window](https://v2.tauri.app/reference/javascript/api/namespacewindow/) ·
[API de App](https://v2.tauri.app/reference/javascript/api/namespaceapp/)

---

## 5. El paso que se olvida: permisos (`capabilities`)

Cada API de la §4.3, y cualquier plugin oficial (diálogos, filesystem, etc.), necesita permiso explícito en
`src-tauri/capabilities/default.json` — si no está, la llamada falla en tiempo de ejecución (rechazo de la
promesa), no en compilación. La demo ya tiene 4 ejemplos reales:

```json
"permissions": [
  "core:default",
  "core:window:allow-destroy",
  "core:window:allow-set-always-on-top",
  "core:app:allow-version",
  "opener:default"
]
```

`core:default` trae un conjunto básico (incluye, p. ej., la *lectura* de si la ventana está siempre
visible) — pero cualquier permiso que **escriba** o **cierre** algo casi siempre hay que añadirlo a mano.
Antes de asumir qué permiso hace falta, dos formas fiables de comprobarlo:

- Buscar el identificador exacto en `src-tauri/gen/schemas/*.json` (se regenera en cada build) — si no
  aparece, ese identificador no existe en esta versión de Tauri.
- Ver la lista completa en la documentación oficial: [tauri.app/reference/acl](https://tauri.app/reference/acl/)

Los comandos que tú mismo escribas (como `get_greeting_name`) **no** necesitan entrada en `capabilities` —
el sistema de permisos solo gobierna los plugins oficiales/de terceros, no el código de tu propia app.

Referencia oficial (capabilities): [tauri.app/security/capabilities](https://tauri.app/security/capabilities/)

---

## 6. Chuleta de enlaces oficiales

| Qué necesitas | Enlace |
| --- | --- |
| Arquitectura / IPC en general | https://tauri.app/concept/inter-process-communication/ |
| Llamar a Rust desde el frontend (comandos) | https://tauri.app/develop/calling-rust/ |
| Llamar al frontend desde Rust (eventos) | https://tauri.app/develop/calling-frontend/ |
| Sistema de permisos (capabilities/ACL) | https://tauri.app/security/capabilities/ |
| Lista completa de permisos disponibles | https://tauri.app/reference/acl/ |
| API JS — Window (ventanas) | https://v2.tauri.app/reference/javascript/api/namespacewindow/ |
| API JS — App (versión, nombre) | https://v2.tauri.app/reference/javascript/api/namespaceapp/ |
| `tauri.conf.json` completo | https://tauri.app/reference/config/ |
| Plugins oficiales (filesystem, dialog, updater...) | https://tauri.app/plugin/ |

---

Para las trampas reales ya resueltas en este starter (permisos que faltan, WebView2 cacheando assets
viejos, por qué todo JS propio va en IIFE), no las repitas por tu cuenta — ya están documentadas en
[`dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md`](./dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md).
