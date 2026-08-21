// i18n mínima sin librería — mismo patrón que dbv-md-reader (ver dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md
// §4, lección 7): dos objetos planos, sustitución simple de {placeholder}, sin dependencia nueva.
//
// IIFE obligatoria (NATIVE_DESKTOP_APPS.md §3): los scripts clásicos comparten el ámbito global —
// sin este cierre, cualquier nombre declarado aquí (t, currentLang...) colisionaría con main.js
// y el SyntaxError resultante mataría el script entero en silencio.
(function () {
  const translations = {
    es: {
      "app.title": "dbv-tauri-starter",
      "demo.banner": "Esto es una demo de dbv-tauri-starter — ver README.md para los próximos pasos.",
      "demo.heading": "Prueba el comando Rust",
      "demo.inputPlaceholder": "Escribe tu nombre...",
      "demo.greetingEmpty": "Escribe tu nombre para ver un saludo generado desde Rust.",
      "demo.greetingHello": "¡Hola, {name}! Este saludo viene de un comando #[tauri::command].",
      "demo.dirtyHint": "Tienes cambios sin guardar en memoria — cierra la ventana para probar la confirmación.",
      "modal.title": "¿Cerrar sin guardar?",
      "modal.body": "Hay texto sin guardar en el campo de la demo. Si cierras ahora, se perderá.",
      "modal.confirm": "Cerrar de todas formas",
      "modal.cancel": "Cancelar",
      "lang.label": "Idioma",
      "toolbar.alwaysOnTop": "Mantener siempre visible",
      "toolbar.alwaysOnTopActive": "Siempre visible (activado)",
      "toolbar.about": "Acerca de",
      "about.title": "Acerca de dbv-tauri-starter",
      "about.version": "Versión {version}",
      "about.builtWith": "Construido con dbv-specs-ops.",
      "about.updatesTitle": "Actualizaciones",
      "about.updatesHint": "Este starter no incluye tauri-plugin-updater de fábrica — añádelo cuando tu app real lo necesite (ver NATIVE_DESKTOP_APPS.md §4).",
      "about.checkUpdates": "Buscar actualizaciones",
      "about.close": "Cerrar",
    },
    en: {
      "app.title": "dbv-tauri-starter",
      "demo.banner": "This is a dbv-tauri-starter demo — see README.md for the next steps.",
      "demo.heading": "Try the Rust command",
      "demo.inputPlaceholder": "Type your name...",
      "demo.greetingEmpty": "Type your name to see a greeting generated from Rust.",
      "demo.greetingHello": "Hello, {name}! This greeting comes from a #[tauri::command].",
      "demo.dirtyHint": "You have unsaved in-memory changes — close the window to test the confirmation.",
      "modal.title": "Close without saving?",
      "modal.body": "There's unsaved text in the demo field. Closing now will discard it.",
      "modal.confirm": "Close anyway",
      "modal.cancel": "Cancel",
      "lang.label": "Language",
      "toolbar.alwaysOnTop": "Keep always on top",
      "toolbar.alwaysOnTopActive": "Always on top (active)",
      "toolbar.about": "About",
      "about.title": "About dbv-tauri-starter",
      "about.version": "Version {version}",
      "about.builtWith": "Built with dbv-specs-ops.",
      "about.updatesTitle": "Updates",
      "about.updatesHint": "This starter doesn't ship tauri-plugin-updater by default — add it when your real app needs it (see NATIVE_DESKTOP_APPS.md §4).",
      "about.checkUpdates": "Check for updates",
      "about.close": "Close",
    },
  };

  const STORAGE_KEY = "dbv-tauri-starter:lang";

  function detectLanguage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
    const browserLang = (navigator.language || "es").slice(0, 2);
    return browserLang === "en" ? "en" : "es";
  }

  let currentLang = detectLanguage();

  function t(key, vars) {
    const dict = translations[currentLang] || translations.es;
    let text = dict[key] || key;
    if (vars) {
      for (const [placeholder, value] of Object.entries(vars)) {
        text = text.replace(`{${placeholder}}`, value);
      }
    }
    return text;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.title = t(el.getAttribute("data-i18n-title"));
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
  }

  function setLanguage(lang) {
    if (lang !== "es" && lang !== "en") return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
  }

  function getLanguage() {
    return currentLang;
  }

  window.dbvI18n = { t, applyTranslations, setLanguage, getLanguage };
})();
