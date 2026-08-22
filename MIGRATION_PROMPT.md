# 🔁 MIGRATION_PROMPT — Añadir escritorio nativo a una app web existente

> **Cómo se usa:** ve al repositorio de **tu app web** (no a una copia de esta plantilla), y dile a tu IA:
>
> > *"Lee `MIGRATION_PROMPT.md` de <https://github.com/davidbuenov/dbv-tauri-starter> y sigue sus fases
> > para convertir este repositorio en una app de escritorio nativa."*
>
> O descarga este único fichero a la raíz de tu proyecto y di: *"Lee `MIGRATION_PROMPT.md` y ejecútalo."*

---

<migration_rules>

## Reglas que la IA debe respetar durante todo el proceso

1. **Se trabaja SIEMPRE en el repositorio de la app existente.** Nunca clones `dbv-tauri-starter` para
   meter dentro la app del usuario: eso crea un repo nuevo y pierde historial, issues, stars, releases y
   las URLs que la gente ya tiene. La plantilla viaja hacia el repo del usuario, no al revés.
2. **No borres el modo web.** El objetivo por defecto es que la app siga funcionando en navegador
   *además* de como binario nativo. Solo se elimina si el usuario lo pide explícitamente.
3. **Las fases tienen puertas de parada (🛑 STOP).** En cada una, presenta tus hallazgos y espera
   confirmación del usuario antes de continuar. No encadenes fases sin permiso.
4. **No inventes.** Toda clasificación se hace leyendo ficheros reales del repositorio
   (`requirements.txt`, `pyproject.toml`, `package.json`, `Cargo.toml`). Si algo no se puede verificar,
   dilo y pregunta.
5. **Ninguna operación destructiva sin confirmación explícita**: borrar ficheros, sobrescribir
   `package.json`, reescribir `.gitignore` o forzar cualquier cosa en git.
6. **Registra las decisiones por escrito** según vayan tomándose (Fase 8), no al final de memoria.

</migration_rules>

---

<phase_0_classification>

## Fase 0 — Clasificar la app (determina todo lo demás)

**No propongas nada hasta completar esta fase.** El coste y la estrategia dependen casi por completo de
qué hay debajo del frontend.

### 0.1 Inventario (lee, no supongas)

Ejecuta y reporta:

- Estructura de directorios de primer y segundo nivel.
- Contenido de los ficheros de dependencias que existan: `package.json`, `requirements.txt`,
  `pyproject.toml`, `Cargo.toml`, `go.mod`.
- ¿Hay un paso de build de frontend? (`vite`, `webpack`, `next`, `parcel` en `package.json`.)
- ¿Hay un servidor propio? (`fastapi`, `flask`, `express`, `uvicorn`, un `main.py`, un `backend/`.)
- ¿Hay scripts de arranque tipo `start.cmd` / `start.sh` / `.bat` que levanten un servidor y abran el
  navegador?
- ¿Existe ya `dbv-specs-ops/` en el repo, o `project.config.md` suelto en la raíz (adopción antigua)?

### 0.2 Asigna el arquetipo

| Arquetipo | Cómo se reconoce | Qué implica |
| --- | --- | --- |
| **A — Estática pura** | HTML/CSS/JS o PWA sin paso de build; sin servidor propio | Coste trivial. `frontendDist` apunta a la carpeta y ya |
| **B — SPA con bundler** | Vite/Webpack + framework; todo el cómputo en el cliente | Coste trivial-bajo. `beforeBuildCommand` + `frontendDist` al `dist/` |
| **C — Servidor local ligero** | Hay servidor, pero su trabajo real son ficheros/formatos con equivalente en crates de Rust | Coste medio. El backend se reescribe como comandos `#[tauri::command]` |
| **D — Servidor local pesado** | El servidor existe por una dependencia que **es la razón de ser de la app** (inferencia ML, OCR, motores de documento) | Coste alto. Sidecar + estrategia de instalación |

> ⚠️ **Ojo con el arquetipo D disfrazado de app web.** Señales: `start.cmd` que levanta servidor y abre
> navegador, `localhost` cableado en el frontend, uso de GPU local, README que promete "sin nube,
> privacidad total". Esa app **ya era de escritorio** y el navegador era el *workaround*.
>
> ⚠️ **Una sola línea del fichero de dependencias mueve una app de C a D** y multiplica el coste por diez
> (`torch`, `easyocr`, `whisperx`, motores de PDF pesados…). Clasifica leyendo, no por la descripción del
> repo.

### 0.3 🛑 STOP — Presenta al usuario

Presenta en un solo mensaje: arquetipo asignado, **con qué evidencia concreta** (ficheros y líneas), y qué
implica en coste. Pide confirmación o corrección antes de la Fase 1.

</phase_0_classification>

---

<phase_1_decisions>

## Fase 1 — Las tres decisiones restantes

Base conceptual completa: [`dbv-specs-ops/docs/WEB_TO_DESKTOP_MIGRATION.md`](https://github.com/davidbuenov/dbv-specs-ops/blob/master/docs/WEB_TO_DESKTOP_MIGRATION.md).
Si el repo del usuario ya tiene `dbv-specs-ops/`, léelo de ahí.

### 1.1 Auditoría de licencias (solo arquetipos C y D) — **antes de escribir código**

Distribuir un binario no es lo mismo que ejecutar un servidor local en tu máquina. Revisa la licencia de
cada dependencia del backend y **marca cualquier copyleft fuerte (GPL / AGPL)**.

Motores de PDF y de vídeo son el caso típico: muy buenos, muy usados y **frecuentemente AGPL con opción
comercial de pago**. Un hallazgo así puede cambiar la decisión de 1.3 (de "sidecar" a "buscar
alternativa", o directamente a "esta app no va a tienda"). Repórtalo aunque el usuario no haya preguntado.

### 1.2 ¿El escritorio sustituye a la web o convive con ella?

**Por defecto: convive.** Excepciones a tener en cuenta al recomendar:

- Si la app es una **PWA usada en móvil**, el modo dual es obligatorio: quitar la web mata su caso de uso.
- Si es **arquetipo D disfrazado**, el escritorio pasa a canal primario y la web queda como modo de
  desarrollo — pero no se borra nada.
- Si era una **CLI**, el escritorio le añade una GUI y la CLI se conserva.

### 1.3 ¿Reescribir el backend en Rust o empaquetarlo como sidecar? (solo C y D)

> **Regla, aplicada por función y no por aplicación:** reescribe en Rust cuando la dependencia es un
> detalle de implementación. Mantén el runtime original como sidecar cuando la dependencia **es la razón
> de existir de la app**.

| Señal | Decisión |
| --- | --- |
| Recorrido de directorios, borrado, copia, watching | **Rust** (`walkdir`, `notify`, `std::fs`) |
| Conversión de formatos de imagen | **Rust** (`image`, `webp`) |
| HTTP, parseo JSON/CSV, plantillas | **Rust** (`reqwest`, `serde`, `csv`) |
| Inferencia ML con modelo y pipeline concretos (ASR, diarización, OCR) | **Sidecar** |
| Motores de documento maduros sin equivalente Rust (PDF complejo, OOXML) | **Sidecar** |
| Reescribir obligaría a rehacer trabajo de GPU/CUDA ya validado | **Sidecar** |

**Si sale sidecar, el usuario debe elegir además la estrategia de instalación**, porque un stack de ML
congelado convierte un instalador de ~15 MB en varios GB (y deja fuera las tiendas curadas):

| Estrategia | Cómo funciona |
| --- | --- |
| **A — Asistente de primera ejecución** ✅ *(recomendada)* | Instalador pequeño; en el primer arranque la app provisiona el entorno y descarga modelos, con progreso visible, cancelable y reintentable |
| **B — Núcleo mínimo embebido + descarga opcional** | Se empaqueta la variante ligera (CPU, modelo pequeño); la GPU se descarga bajo demanda |
| **C — Depender del runtime del sistema** ❌ | Descártala: convierte la matriz de soporte en el entorno de cada usuario |

### 1.4 🛑 STOP — Presenta al usuario

Resume las decisiones tomadas (con el resultado de la auditoría de licencias si aplica) y pide
confirmación explícita antes de tocar un solo fichero.

</phase_1_decisions>

---

<phase_2_repo_prep>

## Fase 2 — Preparar el repositorio

### 2.1 Rama

Verifica que el árbol de trabajo está limpio (`git status`). Si no lo está, **para y avisa**.

```bash
git checkout -b feat/tauri-desktop
```

### 2.2 Framework dbv-specs-ops

Según lo detectado en 0.1:

| Situación | Qué hacer |
| --- | --- |
| Ya existe `dbv-specs-ops/` | **No lo dupliques.** Ejecuta `dbv-specs-ops/docs/UPGRADE_PROMPT.md` para ponerlo al día |
| Existen `project.config.md` / `memory.md` / `task.md` sueltos en la raíz (adopción antigua) | Es una adopción válida. **Actualízala**, no la dupliques: descarga `UPGRADE_PROMPT.md` y ejecútalo |
| No hay nada | Sigue `docs/ADOPTION_PROMPT.md` del framework para adoptarlo en este repo |

</phase_2_repo_prep>

---

<phase_3_bring_artifacts>

## Fase 3 — Traer los artefactos de la plantilla

### 3.1 Obtener la plantilla en un directorio temporal (nunca dentro del repo del usuario)

```bash
git clone --depth 1 https://github.com/davidbuenov/dbv-tauri-starter.git /tmp/dbv-tauri-starter
```

En Windows/PowerShell usa `$env:TEMP\dbv-tauri-starter` como destino.

### 3.2 Copiar exactamente esto, y nada más

| Origen (plantilla) | Destino (repo del usuario) | Nota |
| --- | --- | --- |
| `src-tauri/` (completo, **sin** `target/`) | `src-tauri/` | Incluye `.gitignore`, `capabilities/`, `icons/`, `build.rs`, `Cargo.toml` |
| `.github/workflows/release-windows.yml` | mismo path | |
| `.github/workflows/release-linux.yml` | mismo path | |
| `.github/workflows/release-macos.yml` | mismo path | |

**No copies** `src/` (es la demo de la plantilla — el frontend del usuario ya existe), ni `package.json`,
ni `README.md`, ni `CHANGELOG.md`, ni `TAURI_TUTORIAL.md`, ni este fichero.

> ℹ️ **Excepción útil:** si la app va a tener estado sin guardar, merece la pena copiar de
> `src/main.js` de la plantilla el patrón de `onCloseRequested` + modal propio y adaptarlo. Es el gotcha
> de permisos más caro de resolver a mano y ya viene resuelto (usa `core:window:allow-destroy`, nunca
> `window.confirm()`).

### 3.3 `package.json` — fusionar, nunca sobrescribir

Si el repo **ya tiene** `package.json` (arquetipo B, y muchos A), añádele solo:

```jsonc
{
  "scripts": {
    "tauri": "tauri"          // añadir a los scripts existentes
  },
  "devDependencies": {
    "@tauri-apps/cli": "^2"   // añadir a las devDependencies existentes
  }
}
```

Si **no tiene** `package.json` (arquetipo A puro, o backend-only), créalo con ese contenido mínimo más
`"name"`, `"private": true`, `"version"` y `"type": "module"`.

Después: `npm install`.

### 3.4 Personalizar la identidad de la app

**`src-tauri/tauri.conf.json`** — sustituye todos los valores de la plantilla:

```jsonc
{
  "productName": "Nombre Visible De Tu App",     // el que verá el usuario
  "version": "0.1.0",                            // versión de la app; la leen los 3 workflows
  "identifier": "com.tudominio.tu-app",          // DNS inverso, único, SIN cambiarlo después:
                                                 // determina el directorio de datos de usuario
  "app": {
    "windows": [{ "title": "Nombre Visible De Tu App", "width": 1200, "height": 800 }]
  }
}
```

**`src-tauri/Cargo.toml`** — cambia `[package] name`, `description` y `authors`.

> ⚠️ **No toques `[lib] name = "tauri_app_lib"` salvo que sepas lo que haces.** El sufijo `_lib` existe
> para que el nombre de la librería no colisione con el del binario en Windows. Si aun así lo renombras,
> **debes actualizar también la llamada `tauri_app_lib::run()` en `src-tauri/src/main.rs`**, o el build
> falla.

**Iconos** — sustituye los de la plantilla por los de la app a partir de un PNG cuadrado de 1024×1024:

```bash
npm run tauri icon ruta/a/tu-icono.png
```

Esto regenera todo `src-tauri/icons/` para las tres plataformas. **No los edites a mano.**

### 3.5 ⚠️ Colisión de tags — verifícalo antes de seguir

Los 3 workflows de release se disparan con tags `v*.*.*`. **Si el repo ya usa tags `vX.Y.Z` para releases
de la app web, cada tag futuro lanzará builds nativos.**

Comprueba `git tag --list` y avisa al usuario. Si hay colisión, ofrécele elegir:

- Cambiar el disparador de los 3 workflows a un prefijo propio (p. ej. `desktop-v*.*.*`), o
- Aceptar que a partir de ahora los tags `vX.Y.Z` publiquen también binarios (a menudo es lo deseado).

</phase_3_bring_artifacts>

---

<phase_4_connect_frontend>

## Fase 4 — Conectar el frontend real

Ajusta `src-tauri/tauri.conf.json` según el arquetipo. **Estas dos configuraciones son excluyentes: no
mezcles.**

### Arquetipo A — sin bundler

```jsonc
{
  "build": { "frontendDist": "../ruta/a/tu/carpeta/estatica" },
  "app": { "withGlobalTauri": true }
}
```

`withGlobalTauri: true` expone `window.__TAURI__` sin `import`, que es lo que hace viable el patrón sin
bundler.

> ⚠️ **Con scripts clásicos (sin módulos ES), envuelve CADA fichero JS propio en su propia IIFE**, incluso
> los que "solo definen funciones". Comparten un único ámbito global: si dos ficheros declaran el mismo
> identificador en el nivel superior, el segundo muere entero con un `SyntaxError` de *parseo* — y como es
> un error de parseo, ninguna línea de ese fichero llega a ejecutarse. El síntoma (página que renderiza
> perfecta pero con la interfaz completamente muerta y sin errores visibles) cuesta horas.

### Arquetipo B — con bundler

```jsonc
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  },
  "app": { "withGlobalTauri": false }
}
```

Ajusta `devUrl` al puerto real del dev server y `frontendDist` al directorio de salida real. Aquí el
frontend usa `import { invoke } from '@tauri-apps/api/core'` con normalidad — **no apliques el patrón sin
bundler**, desmontarías un frontend que ya funciona.

Añade `@tauri-apps/api` a `dependencies` y **configura el bundler para que la base sea relativa** (en Vite:
`base: './'`), o los assets no cargarán bajo el protocolo `tauri://`.

</phase_4_connect_frontend>

---

<phase_5_adapter>

## Fase 5 — Capa de adaptación (arquetipos C y D, y cualquier app que quiera modo dual)

**Todo el coste de mantener web y escritorio a la vez se concentra en una sola decisión: que el frontend
no asuma Tauri.** Si `invoke()` aparece esparcido por los componentes, el modo web muere solo.

Crea **un único** módulo que detecta el entorno y enruta:

```js
// src/api.js — ÚNICO fichero de la app que sabe si estamos en Tauri o en el navegador
const isTauri = typeof window !== "undefined" && !!window.__TAURI__;

export async function convertImage(payload) {
  if (isTauri) {
    return window.__TAURI__.core.invoke("convert_image", payload);
  }
  const res = await fetch("/api/convert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Las capacidades exclusivas de escritorio se exponen como consulta, no como excepción:
export const canPickDirectory = isTauri;
```

Reglas al construirla:

- **Una función por operación de negocio**, no por endpoint. La firma la dicta lo que la UI necesita.
- **Ningún otro fichero llama a `invoke()` ni hace `fetch` contra la API propia.** Migra las llamadas
  existentes a esta capa antes de seguir.
- **Normaliza los errores aquí**: `invoke()` rechaza con un string de Rust, `fetch` devuelve un status
  HTTP. La UI debe ver un único formato.
- **Deja la regla verificada en CI** con un `grep` que falle si aparece `invoke(` fuera de `api.js`. Sin
  eso, la regla se erosiona en tres commits.

</phase_5_adapter>

---

<phase_6_backend>

## Fase 6 — El backend, según la decisión de 1.3

### 6.1 Si se reescribe en Rust

Una función a la vez, verificando después de cada una:

1. Añade la dependencia a `src-tauri/Cargo.toml`.
2. Escribe el comando en `src-tauri/src/lib.rs` con `#[tauri::command]` y **registra el nombre** en
   `.invoke_handler(tauri::generate_handler![...])` — olvidarlo es el fallo más común y solo se ve en
   tiempo de ejecución.
3. Devuelve `Result<T, String>` para que el error llegue al frontend como rechazo de la promesa.
4. Añade un test unitario en el mismo fichero (`#[cfg(test)] mod tests`).
5. Enruta la función correspondiente de `api.js` a este comando.

Borra el endpoint del servidor **solo cuando el comando Rust esté verificado**, y solo si el usuario ha
decidido no conservar el modo web para esa función.

### 6.2 Si se empaqueta como sidecar

1. Congela el backend con la herramienta de su ecosistema (PyInstaller o equivalente), **en el runner de
   CI de cada plataforma** — no se puede congelar en una plataforma y distribuir en otra.
2. Declara el binario en `src-tauri/tauri.conf.json` → `bundle.externalBin`, con el sufijo de *target
   triple* por plataforma.
3. Lánzalo desde Rust con `tauri-plugin-shell` (`Command::new_sidecar`).
4. **Mata el proceso hijo explícitamente al cerrar la app.** Un servidor local huérfano ocupando el puerto
   es el fallo más reportado de este patrón.
5. **No cablees el puerto**: pide uno libre al SO y pásaselo al frontend, o elimina el HTTP hablando por
   stdin/stdout. Un puerto fijo choca con la segunda instancia y con cualquier otra app.
6. Implementa la estrategia de instalación elegida en 1.3. El asistente debe ser **cancelable y
   reintentable**, y la app debe arrancar y explicar qué falta si el provisionamiento no se completó — un
   fallo de descarga no puede dejar una app que no abre.

### 6.3 Permisos (`src-tauri/capabilities/default.json`)

Mantenlo **mínimo**. Añade un permiso solo cuando el código realmente lo necesite, nunca preventivamente.
Antes de añadir uno, comprueba si ya es un gotcha conocido en
[`NATIVE_DESKTOP_APPS.md` §6](https://github.com/davidbuenov/dbv-specs-ops/blob/master/docs/NATIVE_DESKTOP_APPS.md)
(p. ej. `core:window:allow-destroy` para `onCloseRequested`, `core:webview:allow-print` en macOS, o el glob
de `windows` para ventanas creadas en tiempo de ejecución).

</phase_6_backend>

---

<phase_7_verification>

## Fase 7 — Verificación (no la des por hecha: ejecútala)

```bash
cd src-tauri && cargo check          # compila el core Rust
cd .. && npm run tauri dev           # arranca la app nativa
```

Comprueba y **reporta el resultado real** de cada punto:

- [ ] La app nativa arranca y la interfaz responde (no solo renderiza).
- [ ] La funcionalidad principal funciona en modo escritorio.
- [ ] **El modo web sigue arrancando y funcionando** (salvo que se decidiera eliminarlo en 1.2).
- [ ] Si hay sidecar: al cerrar la app no queda ningún proceso hijo vivo ni puerto ocupado.
- [ ] `cargo test` pasa (incluidos los tests de los comandos nuevos).
- [ ] `git status` no muestra `src-tauri/target/` como no ignorado.

Si algo falla, **dilo con la salida real**. No lo reportes como hecho.

</phase_7_verification>

---

<phase_8_documentation>

## Fase 8 — Documentar y cerrar

- **`dbv-specs-ops/docs/SPECIFICATIONS.md`**: el escritorio es un **requisito nuevo**, no un detalle de
  despliegue. Documenta plataformas objetivo y canal de distribución.
- **`dbv-specs-ops/docs/ARCHITECTURE.md`**: arquetipo, decisión Rust vs sidecar **por función**, y el
  resultado de la auditoría de licencias de 1.1.
- **`dbv-specs-ops/memory.md`**: registra como ADR, bajo `## 🏗️ Log de Decisiones Técnicas`, cada decisión
  de la Fase 1 **con su razón**. Es lo que evitará rediscutirlas dentro de seis meses.
- **`CHANGELOG.md`** del proyecto: entrada en `[Sin publicar]`.
- **`README.md`** del proyecto: cómo instalar la versión de escritorio y cómo seguir usando la web.

### Publicar el primer instalador

Los 3 workflows ya están listos. Con la versión ya puesta en `tauri.conf.json`:

```bash
git tag v0.1.0 && git push origin v0.1.0
```

Cada workflow compila su plataforma y adjunta el artefacto a un borrador de GitHub Release. Sin firma de
código por defecto — para firmar, auto-actualizar o publicar en tiendas, ver
[`NATIVE_APPS_RELEASE_CI.md`](https://github.com/davidbuenov/dbv-specs-ops/blob/master/docs/NATIVE_APPS_RELEASE_CI.md)
y [`MARKETPLACE_PUBLISHING.md`](https://github.com/davidbuenov/dbv-specs-ops/blob/master/docs/MARKETPLACE_PUBLISHING.md).

</phase_8_documentation>

---

## Si tienes varias apps que migrar

El orden no es por valor de negocio, sino **por riesgo de tubería**: en las primeras migraciones no estás
depurando la app, estás depurando el circuito plantilla → build → CI en tres plataformas → instalador.

1. **La app de arquetipo A más pequeña** — ensayo del circuito completo con cero riesgo de backend.
2. **Un arquetipo C** — valida la reescritura en Rust; suele ser la primera migración con valor nativo real.
3. **Un arquetipo B** — valida el camino "con bundler", el que usarás en cualquier app seria posterior.
4. **Los arquetipos D, al final** — se llega con la tubería fiable y las decisiones de licencias e
   instalación ya tomadas por escrito.

Empezar por un arquetipo D significa depurar a la vez la CI multiplataforma, el empaquetado del sidecar y
el tamaño del instalador: tres problemas nuevos que se enmascaran entre sí.

---

> 🛠️ Framework SDD creado por **[David Bueno Vallejo](https://github.com/davidbuenov)** · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
