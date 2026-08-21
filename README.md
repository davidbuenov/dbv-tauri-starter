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
