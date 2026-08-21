// IIFE obligatoria (dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md §3): los scripts clásicos comparten
// el ámbito global — sin este cierre, `const t` colisionaría con cualquier declaración de i18n.js
// y el SyntaxError resultante mataría este fichero entero en silencio, sin listeners ni error visible.
(function () {
  const { invoke } = window.__TAURI__.core;
  const { getCurrentWindow } = window.__TAURI__.window;
  const { getVersion } = window.__TAURI__.app;
  const { t, applyTranslations, setLanguage, getLanguage } = window.dbvI18n;

  let demoInputEl;
  let greetMsgEl;
  let discardModalEl;
  let langSelectEl;
  let aboutModalEl;
  let btnAlwaysOnTop;

  let isDirty = false;
  let closeConfirmPending = false;

  async function updateGreeting() {
    const name = await invoke("get_greeting_name", { name: demoInputEl.value });
    greetMsgEl.textContent = name ? t("demo.greetingHello", { name }) : t("demo.greetingEmpty");
  }

  function setDirty(value) {
    isDirty = value;
    document.body.classList.toggle("is-dirty", isDirty);
  }

  function confirmDiscardChanges() {
    return new Promise((resolve) => {
      discardModalEl.classList.remove("hidden");
      const confirmBtn = discardModalEl.querySelector("#discard-confirm");
      const cancelBtn = discardModalEl.querySelector("#discard-cancel");
      const cleanup = () => {
        discardModalEl.classList.add("hidden");
        confirmBtn.removeEventListener("click", onConfirm);
        cancelBtn.removeEventListener("click", onCancel);
      };
      const onConfirm = () => {
        cleanup();
        resolve(true);
      };
      const onCancel = () => {
        cleanup();
        resolve(false);
      };
      confirmBtn.addEventListener("click", onConfirm);
      cancelBtn.addEventListener("click", onCancel);
    });
  }

  function setAlwaysOnTopButtonState(active) {
    const key = active ? "toolbar.alwaysOnTopActive" : "toolbar.alwaysOnTop";
    btnAlwaysOnTop.classList.toggle("active", active);
    btnAlwaysOnTop.setAttribute("data-i18n-title", key);
    btnAlwaysOnTop.title = t(key);
  }

  async function toggleAlwaysOnTop() {
    const current = await getCurrentWindow().isAlwaysOnTop();
    await getCurrentWindow().setAlwaysOnTop(!current);
    setAlwaysOnTopButtonState(!current);
  }

  async function openAboutModal() {
    const version = await getVersion();
    document.getElementById("about-version").textContent = t("about.version", { version });
    aboutModalEl.classList.remove("hidden");
  }

  function closeAboutModal() {
    aboutModalEl.classList.add("hidden");
  }

  async function handleCloseRequested(event) {
    // Sin cambios sin guardar: no se llama a event.preventDefault(), así que Tauri completa el
    // cierre por su cuenta (internamente invoca destroy() — no hace falta llamarlo a mano).
    if (!isDirty) return;

    // Sin este guardián, un segundo cierre (doble clic en la X, Alt+F4 repetido) mientras el modal
    // ya está abierto reabriría un segundo modal encima del primero.
    if (closeConfirmPending) {
      event.preventDefault();
      return;
    }
    closeConfirmPending = true;

    const shouldClose = await confirmDiscardChanges();
    closeConfirmPending = false;

    // Solo se cancela el cierre si el usuario NO confirma. Si confirma, no se llama a
    // preventDefault() y Tauri procede a cerrar la ventana por su cuenta (patrón validado en
    // dbv-md-reader, ADR-030 de su memory.md: el wrapper de @tauri-apps/api/window hace destroy()
    // internamente cuando el handler no cancela el evento).
    if (!shouldClose) {
      event.preventDefault();
    }
  }

  window.addEventListener("DOMContentLoaded", async () => {
    demoInputEl = document.querySelector("#demo-input");
    greetMsgEl = document.querySelector("#greet-msg");
    discardModalEl = document.querySelector("#discard-modal");
    langSelectEl = document.querySelector("#lang-select");
    aboutModalEl = document.querySelector("#about-modal");
    btnAlwaysOnTop = document.querySelector("#btn-always-on-top");

    // Listeners primero: si alguna llamada async al backend fallara, la interfaz seguiría
    // respondiendo en vez de quedarse muerta sin ningún error visible.
    demoInputEl.addEventListener("input", () => {
      setDirty(demoInputEl.value.trim().length > 0);
      updateGreeting();
    });

    langSelectEl.addEventListener("change", () => {
      setLanguage(langSelectEl.value);
      updateGreeting();
    });

    btnAlwaysOnTop.addEventListener("click", toggleAlwaysOnTop);
    document.querySelector("#btn-about").addEventListener("click", openAboutModal);
    document.querySelector("#about-close").addEventListener("click", closeAboutModal);

    langSelectEl.value = getLanguage();
    applyTranslations();
    await updateGreeting();
    setAlwaysOnTopButtonState(await getCurrentWindow().isAlwaysOnTop());

    await getCurrentWindow().onCloseRequested(handleCloseRequested);
  });
})();
