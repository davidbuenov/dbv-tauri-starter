// =============================================================================
// dbv-tauri-starter — Orquestador del subsistema de IA
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================

import { t, getLanguage, registerTranslations } from './i18nBridge.js';
import { AI_TRANSLATIONS } from './translations.js';
import { proposeNudge, runAgent } from './agentLoop.js';
import { createChatPanel, mentionedPaths } from './chatPanel.js';
import { createConnectWizard } from './connectWizard.js';
import { createAcpSession } from './acpSession.js';
import { createChangesCard, createPermissionCard } from './acpView.js';
import { buildContext, estimateTokens, RESPONSE_RESERVE, systemPrompt } from './context.js';
import { createModelClient } from './modelClient.js';
import { applyChange, createProposal, parseChangeBlocks } from './proposal.js';
import { createReviewCard } from './reviewView.js';
import { createTools, describeCheck } from './tools.js';
import * as defaultBackend from './backend.js';

// Registrar cadenas de traducción de la IA
registerTranslations(AI_TRANSLATIONS);

const HISTORY_TURNS = 12;
const CLOUD = new Set(['anthropic', 'openAi', 'gemini', 'openRouter', 'agent']);

export const agentId = (connection) => String(connection?.baseUrl ?? '').replace(/^acp:/, '');

export function newConversation() {
  return { id: `c${Date.now().toString(36)}`, title: '', createdAt: Date.now(), entries: [] };
}

export function titleFrom(text) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  return clean.length > 48 ? `${clean.slice(0, 47)}…` : clean;
}

export function historyMessages(entries, budget) {
  const turns = entries.filter((e) => e.role === 'user' || e.role === 'assistant').slice(-HISTORY_TURNS * 2);
  const result = [];
  let left = budget;
  for (const entry of [...turns].reverse()) {
    const cost = estimateTokens(entry.content);
    if (cost > left) break;
    left -= cost;
    result.unshift({ role: entry.role, content: entry.content });
  }
  return result;
}

/**
 * Crea y monta la aplicación de IA dentro de los hosts DOM proporcionados.
 */
export function createAiApp(deps) {
  const backend = deps.backend || defaultBackend;
  let file = deps.initialFile || { connections: [], active: null, showAi: true };
  let projectRoot = deps.projectRoot || '.';
  let projectState = { conversations: [newConversation()], activeConversation: null, consents: [], usage: { input: 0, output: 0 } };
  let busy = false;
  let cancel = null;
  let acp = null;
  let excludedContext = new Set();
  let attachments = [];

  const client = createModelClient({
    aiChat: backend.aiChat,
    aiCancel: backend.aiCancel,
    on: backend.on,
  });

  const activeConn = () => file.connections.find((c) => c.id === file.active) || file.connections[0] || null;

  function currentConversation() {
    const list = projectState.conversations;
    if (!list.length) list.push(newConversation());
    return list.find((c) => c.id === projectState.activeConversation) || list[0];
  }

  // ─── Montaje del Asistente de Conexión ────────────────────────────────────
  const wizard = createConnectWizard({
    host: deps.connectBody,
    backend,
    notify: (msg) => console.log(`[AI] ${msg}`),
    onChanged: (updatedFile) => {
      file = updatedFile;
      syncUi();
    },
    onAgent: async (tool) => {
      file.active = tool.connectionId;
      syncUi();
      deps.onCloseConnect?.();
    },
  });

  // ─── Montaje del Panel de Chat ───────────────────────────────────────────
  const panel = createChatPanel({
    host: deps.panelContainer,
    onSend: (text) => handleSend(text),
    onStop: () => handleStop(),
    onSelectConnection: async (id) => {
      file.active = id;
      await backend.aiSetPreferences({ active: id });
      syncUi();
    },
    onOpenConnect: () => deps.onOpenConnect?.(),
    onNewConversation: () => {
      const conv = newConversation();
      projectState.conversations.push(conv);
      projectState.activeConversation = conv.id;
      syncUi();
    },
    onSelectConversation: (id) => {
      projectState.activeConversation = id;
      syncUi();
    },
    onRemoveContext: (id) => {
      excludedContext.add(id);
      renderContextPreview();
    },
    onClose: () => deps.onTogglePanel?.(false),
  });

  function syncUi() {
    panel.setConnections(file.connections, file.active);
    const conn = activeConn();
    if (conn) {
      const isCloud = CLOUD.has(conn.provider);
      panel.setDestination(isCloud ? t('ai.destCloud').replace('{provider}', conn.name) : t('ai.destLocal').replace('{provider}', conn.name), isCloud);
    } else {
      panel.setDestination(t('ai.noConnection'), false);
    }
    panel.setConversations(projectState.conversations, currentConversation().id);
    panel.renderEntries(currentConversation().entries);
    renderContextPreview();
  }

  function renderContextPreview() {
    const conn = activeConn();
    const budget = conn?.contextTokens || 4096;
    const context = buildContext({
      projectName: 'Proyecto',
      excluded: [...excludedContext],
      attachments: attachments.map((a) => ({ path: a.path, content: a.content })),
    }, budget);
    panel.setContext(context.items);
  }

  async function handleStop() {
    if (cancel) {
      cancel();
      cancel = null;
    }
    if (acp && (await backend.acpRunning?.())) {
      await backend.acpStop?.();
    }
    busy = false;
    panel.setBusy(false);
  }

  async function handleSend(text) {
    if (!text.trim() || busy) return;
    const conn = activeConn();
    if (!conn) {
      deps.onOpenConnect?.();
      return;
    }

    const conv = currentConversation();
    if (!conv.title) conv.title = titleFrom(text);
    conv.entries.push({ role: 'user', content: text });
    panel.addUserMessage(text);
    busy = true;
    panel.setBusy(true);

    try {
      if (conn.provider === 'agent') {
        await handleAgentSend(conn, text, conv);
      } else {
        await handleDirectSend(conn, text, conv);
      }
    } catch (error) {
      console.error('[AI Error]', error);
      const errMsg = error.message || String(error);
      panel.addNote(`${t('ai.error.server')}: ${errMsg}`, 'error');
      conv.entries.push({ role: 'note', content: errMsg, tone: 'error' });
    } finally {
      busy = false;
      panel.setBusy(false);
      await persistState();
    }
  }

  async function handleDirectSend(conn, text, conv) {
    const budget = conn.contextTokens || 4096;
    const sys = systemPrompt({ lang: getLanguage(), tools: conn.supportsTools !== false });
    const context = buildContext({ excluded: [...excludedContext], attachments }, budget);
    const histBudget = Math.max(0, budget - estimateTokens(sys) - estimateTokens(context.text) - estimateTokens(text) - RESPONSE_RESERVE);
    const hist = historyMessages(conv.entries.slice(0, -1), histBudget);

    const messages = [
      { role: 'system', content: sys },
      ...(context.text ? [{ role: 'system', content: `# Context\n\n${context.text}` }] : []),
      ...hist,
      { role: 'user', content: text },
    ];

    const proposal = createProposal();
    const toolset = createTools({
      getRoot: () => projectRoot,
      readText: async (rel) => null,
      listFiles: async () => [],
      checkProposal: async (p) => {
        const files = Array.from(p.files.entries()).map(([path, f]) => ({ path, content: f.proposedText || '' }));
        const res = await backend.aiCheckProposal(projectRoot, 'main', files);
        return res.ok ? res.value : [];
      },
      getProposal: () => proposal,
    });

    let bubble = null;
    let cancelled = false;

    const result = await runAgent({
      tools: toolset,
      messages,
      useTools: conn.supportsTools !== false,
      isCancelled: () => cancelled,
      onStep: (step) => panel.addStep(step.label),
      callModel: async (request) => {
        bubble = panel.addAssistant();
        return client.call(conn.id, request, {
          onText: (chunk) => bubble.append(chunk),
          register: (fn) => (cancel = fn),
        });
      },
    });

    const finalText = result.messages.filter((m) => m.role === 'assistant').map((m) => m.content).filter(Boolean).join('\n\n');
    if (finalText) {
      conv.entries.push({ role: 'assistant', content: finalText });
    }

    if (proposal.files.size > 0) {
      const card = createReviewCard({
        proposal,
        onApply: async () => panel.addNote(t('ai.applied')),
        onReject: () => panel.addNote(t('ai.rejected')),
      });
      panel.addCard(card);
    }
  }

  async function handleAgentSend(conn, text, conv) {
    const id = agentId(conn);
    panel.addStep(`Conectando con agente ${id}...`);
    await backend.acpStart({ id }, projectRoot);
    const bubble = panel.addAssistant();
    bubble.append(`(Sesión iniciada con ${id})`);
    conv.entries.push({ role: 'assistant', content: `[Agente ${id} ejecutado]` });
  }

  async function persistState() {
    try {
      await backend.aiProjectStateSave(projectRoot, projectState);
    } catch (err) {
      console.warn('[AI State Save]', err);
    }
  }

  async function loadState() {
    try {
      const saved = await backend.aiProjectStateLoad(projectRoot);
      if (saved.ok && saved.value && typeof saved.value === 'object') {
        projectState = { ...projectState, ...saved.value };
      }
    } catch (err) {
      console.warn('[AI State Load]', err);
    }
  }

  // Carga inicial
  loadState().then(() => syncUi());

  return {
    openConnect: () => {
      wizard.render();
      deps.onOpenConnect?.();
    },
    togglePanel: () => {
      deps.onTogglePanel?.();
    },
    isReady: () => file.connections.length > 0,
    sync: () => syncUi(),
  };
}