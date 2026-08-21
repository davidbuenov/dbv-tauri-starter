# dbv-tauri-starter

> *Punto de partida para convertir cualquier idea (o app web existente) en una aplicación de escritorio nativa multiplataforma — con el framework de ingeniería [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops) ya integrado.*

Plantilla de proyecto: **Tauri v2 + WebView nativo del sistema (WebView2/WebKitGTK/WKWebView) + Vanilla JS**, con `dbv-specs-ops` vendorizado en `dbv-specs-ops/` vía `git subtree` y activado para Claude Code, Copilot, Gemini CLI, Antigravity y Windsurf.

Nace del conocimiento real extraído de [dbv-md-reader](https://github.com/davidbuenov/dbv-md-reader), llevado hasta publicación en Microsoft Store y Uptodown — ese conocimiento vive ahora generalizado en el propio framework: [`dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md`](./dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md), [`NATIVE_APPS_RELEASE_CI.md`](./dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md) y [`MARKETPLACE_PUBLISHING.md`](./dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md).

---

## 🚀 Primeros pasos

### 1. Crea tu proyecto a partir de esta plantilla

Usa el botón **"Use this template"** de GitHub, o clona y desvincula:

```bash
git clone https://github.com/davidbuenov/dbv-tauri-starter.git mi-app
cd mi-app
rm -rf .git && git init
```

### 2. Ponte al día con el framework

Antes de tocar código, dile a tu IA (Claude Code, Copilot, Gemini CLI...):

> "Lee `dbv-specs-ops/docs/UPGRADE_PROMPT.md` y actualiza el framework."

Esto trae cualquier versión de `dbv-specs-ops` publicada después de que se sincronizara esta plantilla, sin que tengas que preocuparte por el desfase.

### 3. Arranca la especificación de tu app real

Escribe `/spec` y sigue la entrevista de arranque. La IA rellenará `dbv-specs-ops/docs/SPECIFICATIONS.md` y `dbv-specs-ops/docs/ARCHITECTURE.md` con los detalles concretos de tu aplicación.

### 4. Migrando una app web existente en vez de empezar de cero

Si ya tienes una app web (React, Vue, vanilla, lo que sea) que quieres envolver como app de escritorio, sustituye el contenido de `src/` por tu build de frontend y sigue [`dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md`](./dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md) para adaptar los comandos Rust de `src-tauri/` a las necesidades de tu app (acceso a filesystem, watchers, etc.).

### 5. Desarrollo local

```bash
npm install
npm run tauri dev
```

La demo que arranca no es un "Hola Mundo" vacío: incluye un comando Rust real
(`get_greeting_name`), confirmación de cierre de ventana con modal propio (ejemplo vivo de
[`NATIVE_DESKTOP_APPS.md` §6](./dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md), el gotcha de permisos
más caro de resolver a mano), un selector de idioma ES/EN sin librería (`src/i18n.js`, mismo
patrón que la lección 7 del mismo documento), y una barra superior con Always on Top y "Acerca de".

📖 **¿Primera vez con Tauri?** Lee [`TAURI_TUTORIAL.md`](./TAURI_TUTORIAL.md) — 10 minutos, usa el
propio código de la demo como ejemplo para explicar cómo añadir algo a la interfaz, cómo añadir un
comando al backend Rust, y cómo se conectan (con enlaces a la documentación oficial).

---

## 🧹 Qué hacer ahora (sustituir la demo por tu app real)

1. **Borra la demo, no la adaptes poco a poco:** en `src/index.html`/`main.js` puedes quitar
   directamente el `<textarea>` de ejemplo, el mensaje de saludo y el banner "esto es una demo" —
   son solo para enseñar el patrón. **Conserva**, en cambio, el patrón de `onCloseRequested` +
   modal propio de `main.js` si tu app también va a tener estado sin guardar (es exactamente el
   caso más común en apps de escritorio) — cópialo tal cual, ya está resuelto.
2. **`src/i18n.js`**: si tu app necesita más de dos idiomas o crece de unas pocas decenas de
   strings, revisa la lección 7 de `NATIVE_DESKTOP_APPS.md` antes de decidir si sigue bastando sin
   librería. Si te vale, solo tienes que añadir tus propias claves a los objetos `es`/`en`.
3. **`src-tauri/capabilities/default.json`** se mantiene deliberadamente mínimo (YAGNI) — añade
   permisos nuevos solo cuando tu código realmente los necesite, nunca preventivamente. Antes de
   añadir uno, comprueba si ya es un gotcha conocido en
   [`NATIVE_DESKTOP_APPS.md` §6](./dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md) (p. ej. impresión en
   macOS, ventanas creadas dinámicamente).
4. **Arranca `/spec`** (paso 3 de arriba) para documentar tu app real en
   `dbv-specs-ops/docs/SPECIFICATIONS.md` — no hace falta esperar a haber borrado la demo primero,
   pueden ir en paralelo.
5. **Cuando quieras publicar un instalador**, los 3 workflows de `.github/workflows/` ya están
   listos (`release-windows.yml`/`-linux.yml`/`-macos.yml`) — solo etiqueta `git tag vX.Y.Z` y
   empújalo. Sin firma de código por defecto: lee
   [`MARKETPLACE_PUBLISHING.md`](./dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md) si necesitas
   añadirla o publicar en una tienda.

---

## 📂 Qué trae esta plantilla

| Ruta | Contenido |
| --- | --- |
| `src/`, `src-tauri/` | Scaffold mínimo de Tauri v2 (`create-tauri-app`, template vanilla) — un "Hola Mundo" que compila y arranca tal cual |
| `dbv-specs-ops/` | Framework SDD completo, vendorizado vía `git subtree` desde [davidbuenov/dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops) |
| `CLAUDE.md`, `GEMINI.md`, `ANTIGRAVITY.md`, `.windsurfrules`, `.github/copilot-instructions.md` | Ficheros de activación por plataforma IA, ya apuntando a `dbv-specs-ops/` |
| `.github/workflows/sync-dbv-specs-ops.yml` | Action periódica que trae lo último de `dbv-specs-ops` y abre un PR si hay cambios |

## 🔄 Cómo se mantiene esta plantilla actualizada

`dbv-specs-ops/` se trae con `git subtree`, no con copy-paste manual. Una GitHub Action semanal ejecuta `git subtree pull` contra el repo original y abre un Pull Request si hay novedades — así este repo plantilla nunca queda más de unos días desfasado del framework.

Eso **no** sustituye al paso 2 de arriba: cada proyecto creado a partir de esta plantilla queda desconectado de este repo en el momento del clone, así que su propia frescura depende de que tú (o tu IA) ejecutéis `dbv-specs-ops/docs/UPGRADE_PROMPT.md` de vez en cuando.

---

> 🛠️ Framework SDD creado por **[David Bueno Vallejo](https://github.com/davidbuenov)** · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
