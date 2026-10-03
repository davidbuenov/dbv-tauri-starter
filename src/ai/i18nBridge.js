// =============================================================================
// dbv-tauri-starter — Puente de internacionalización para el módulo de IA
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

export function t(key, vars) {
  if (typeof window !== 'undefined' && window.dbvI18n?.t) {
    return window.dbvI18n.t(key, vars);
  }
  return key;
}

export function getLanguage() {
  if (typeof window !== 'undefined' && window.dbvI18n?.getLanguage) {
    return window.dbvI18n.getLanguage();
  }
  return 'es';
}

export function registerTranslations(more) {
  if (typeof window !== 'undefined' && window.dbvI18n?.registerTranslations) {
    window.dbvI18n.registerTranslations(more);
  }
}