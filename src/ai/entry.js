// =============================================================================
// dbv-tauri-starter — Punto de entrada perezoso para el subsistema de IA
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import * as backend from './backend.js';

let app = null;
let loading = null;

function ensureStyles() {
  if (!document.getElementById('ai-styles')) {
    const link = document.createElement('link');
    link.id = 'ai-styles';
    link.rel = 'stylesheet';
    link.href = 'ai/ai.css';
    document.head.appendChild(link);
  }
}

export async function initAi(deps) {
  async function loadApp(initialFile) {
    ensureStyles();
    loading ??= import('./aiApp.js').then(({ createAiApp }) => {
      app = createAiApp({
        ...deps,
        backend,
        initialFile,
        onOpenConnect: () => {
          deps.connectModal?.classList.remove('hidden');
        },
        onCloseConnect: () => {
          deps.connectModal?.classList.add('hidden');
        },
        onTogglePanel: (forceState) => {
          const isHidden = deps.panelContainer?.classList.contains('hidden');
          const shouldShow = forceState !== undefined ? forceState : isHidden;
          if (shouldShow) {
            deps.panelContainer?.classList.remove('hidden');
            deps.btnAi?.classList.add('active');
          } else {
            deps.panelContainer?.classList.add('hidden');
            deps.btnAi?.classList.remove('active');
          }
        },
      });
      return app;
    });
    return loading;
  }

  // Comprobar conexiones guardadas al arrancar (rápido, sin cargar módulos pesados)
  const res = await backend.aiConnections();
  const file = res.ok ? res.value : { connections: [], active: null, showAi: true };

  // Si no se deben mostrar funciones de IA, se oculta el botón
  if (file.showAi === false && deps.btnAi) {
    deps.btnAi.style.display = 'none';
  }

  // Si ya hay conexiones configuradas, se precarga
  if (file.connections?.length > 0 && file.showAi !== false) {
    await loadApp(file);
  }

  // Conectar botón superior de la barra de herramientas
  deps.btnAi?.addEventListener('click', async () => {
    const instance = await loadApp(file);
    if (!instance.isReady()) {
      instance.openConnect();
    } else {
      instance.togglePanel();
    }
  });

  // Conectar botón de cerrar del modal de conexión
  deps.connectClose?.addEventListener('click', () => {
    deps.connectModal?.classList.add('hidden');
  });

  // Atajo de teclado: Ctrl+Shift+I
  window.addEventListener('keydown', async (event) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'i') {
      event.preventDefault();
      const instance = await loadApp(file);
      if (!instance.isReady()) {
        instance.openConnect();
      } else {
        instance.togglePanel();
      }
    }
  });

  return {
    getApp: () => app,
    openConnect: async () => {
      const instance = await loadApp(file);
      instance.openConnect();
    },
  };
}