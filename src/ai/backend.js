// =============================================================================
// dbv-tauri-starter — Capa de comunicación IPC con el backend Tauri (IA)
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

const invoke = (cmd, args) => {
  if (window.__TAURI__?.core?.invoke) {
    return window.__TAURI__.core.invoke(cmd, args);
  }
  console.warn(`[Tauri Mock] invoke("${cmd}", ${JSON.stringify(args)})`);
  return Promise.reject(new Error(`Tauri core.invoke not available for ${cmd}`));
};

const listen = (event, callback) => {
  if (window.__TAURI__?.event?.listen) {
    return window.__TAURI__.event.listen(event, (e) => callback(e.payload));
  }
  return Promise.resolve(() => {});
};

export const call = async (cmd, args) => {
  try {
    const value = await invoke(cmd, args);
    return { ok: true, value };
  } catch (error) {
    const parsed = typeof error === 'object' && error !== null ? error : { kind: 'server', message: String(error) };
    return { ok: false, error: parsed };
  }
};

// ─── Conexiones y Modelos ───────────────────────────────────────────────────

export const aiConnections = () => call('ai_connections');
export const aiSaveConnection = (connection, apiKey, activate = false) =>
  call('ai_save_connection', { request: { connection, apiKey: apiKey ?? null, activate } });
export const aiDeleteConnection = (id) => call('ai_delete_connection', { id });
export const aiSetPreferences = ({ active, showAi } = {}) =>
  call('ai_set_preferences', { active: active ?? null, showAi: showAi ?? null });
export const aiProviders = () => call('ai_providers');
export const aiDetect = () => call('ai_detect');
export const aiListModels = (connection, apiKey) => call('ai_list_models', { connection, apiKey: apiKey ?? null });
export const aiChat = (requestId, connectionId, request) => call('ai_chat', { requestId, connectionId, request });
export const aiCancel = (requestId) => call('ai_cancel', { requestId });
export const aiCheckProposal = (root, main, files) => call('ai_check_proposal', { root, main: main ?? 'main', files });
export const aiProjectStateLoad = (root) => call('ai_project_state_load', { root });
export const aiProjectStateSave = (root, value) => call('ai_project_state_save', { root, value });
export const aiRelease = () => call('ai_release');

// ─── Agentes ACP ─────────────────────────────────────────────────────────────

export const acpStart = (spec, cwd) => call('acp_start', { spec, cwd });
export const acpRequest = (method, params) => call('acp_request', { method, params });
export const acpNotify = (method, params) => call('acp_notify', { method, params });
export const acpRespond = (id, result, error) => call('acp_respond', { id, result: result ?? null, error: error ?? null });
export const acpStop = () => call('acp_stop');
export const acpRunning = () => call('acp_running');
export const acpSnapshot = (root) => call('acp_snapshot', { root });
export const acpChanges = () => call('acp_changes');

// ─── Eventos y Utilidades ───────────────────────────────────────────────────

export const on = (event, callback) => listen(event, callback);

export const openExternalUrl = async (url) => {
  if (window.__TAURI__?.opener?.openUrl) {
    await window.__TAURI__.opener.openUrl(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};