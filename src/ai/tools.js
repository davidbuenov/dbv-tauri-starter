// =============================================================================
// dbv-tauri-starter — Herramientas del asistente (Tool Calling)
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
//
// Herramientas seguras que un modelo puede ejecutar:
//   · list_files: listar ficheros del proyecto
//   · read_file: leer ficheros de texto (respetando cambios en memoria)
//   · search_project: buscar texto en el proyecto
//   · propose_changes: proponer cambios para revisión visual del usuario
//
// Ninguna herramienta escribe directamente en disco ni ejecuta comandos sin
// la aprobación expresa y visual del usuario.

import { applyChange, normalizePath } from './proposal.js';

export const MAX_FIX_ATTEMPTS = 2;
const READ_LIMIT = 24000;
const LIST_LIMIT = 400;

export function isSafeRelativePath(path) {
  const clean = String(path ?? '').replace(/\\/g, '/');
  return !clean.startsWith('/') && !clean.includes('../');
}

const object = (properties, required = []) => ({ type: 'object', properties, required, additionalProperties: false });

export function newErrors(baseline, checked) {
  const key = (d) => `${d.file}|${d.message}`;
  const known = new Map();
  for (const d of (baseline || []).filter((x) => x.severity === 'error' || x.level === 'error')) {
    known.set(key(d), (known.get(key(d)) ?? 0) + 1);
  }
  const fresh = [];
  for (const d of (checked || []).filter((x) => x.severity === 'error' || x.level === 'error')) {
    const count = known.get(key(d)) ?? 0;
    if (count > 0) known.set(key(d), count - 1);
    else fresh.push(d);
  }
  return fresh;
}

export function describeCheck(baseline, checked) {
  const baseList = baseline || [];
  const checkList = checked || [];
  const fresh = newErrors(baseList, checkList);
  const baseErrCount = baseList.filter((d) => d.severity === 'error' || d.level === 'error').length;
  const checkErrCount = checkList.filter((d) => d.severity === 'error' || d.level === 'error').length;
  const fixed = baseErrCount - (checkErrCount - fresh.length);
  return { fresh, fixed: Math.max(0, fixed), errors: checkErrCount };
}

/**
 * @param {object} deps
 * @param {() => string} deps.getRoot
 * @param {(root: string, relative: string) => string} [deps.join]
 * @param {(relative: string) => Promise<string|null>} deps.readText
 * @param {() => Promise<string[]>} deps.listFiles
 * @param {(query: string, regex: boolean) => Promise<Array<{relative: string, line: number, text: string}>>} [deps.search]
 * @param {() => Promise<Array>} [deps.diagnostics]
 * @param {(proposal: object) => Promise<Array|null>} deps.checkProposal
 * @param {() => object} deps.getProposal
 */
export function createTools(deps) {
  let fixAttempts = 0;
  const safe = (path) => {
    const relative = normalizePath(path);
    if (!isSafeRelativePath(relative)) throw new Error(`Ruta fuera del proyecto: ${path}`);
    return relative;
  };

  const tools = [
    {
      name: 'list_files',
      description: 'List the files in the workspace / project (relative paths).',
      parameters: object({}),
      label: () => 'Listando ficheros del proyecto',
      run: async () => {
        const files = await deps.listFiles();
        const shown = files.slice(0, LIST_LIMIT);
        return `${shown.join('\n')}${files.length > shown.length ? `\n… (${files.length - shown.length} más)` : ''}`;
      },
    },
    {
      name: 'read_file',
      description: 'Read a text file from the project. Optional 1-based start_line and end_line.',
      parameters: object({ path: { type: 'string' }, start_line: { type: 'integer' }, end_line: { type: 'integer' } }, ['path']),
      label: (args) => `Leyendo ${args.path ?? ''}`,
      run: async ({ path, start_line: start, end_line: end }) => {
        const relative = safe(path);
        const content = await deps.readText(relative);
        if (content === null) return `error: el fichero «${relative}» no existe`;
        let text = content;
        if (start || end) {
          const lines = content.split('\n');
          text = lines.slice(Math.max(0, (start ?? 1) - 1), end ?? lines.length).join('\n');
        }
        if (text.length > READ_LIMIT) {
          return `${text.slice(0, READ_LIMIT)}\n… [recortado a ${READ_LIMIT} caracteres]`;
        }
        return text;
      },
    },
    {
      name: 'propose_changes',
      description: 'Propose additions, edits or deletions across files. The user reviews them before applying.',
      parameters: object({
        explanation: { type: 'string', description: 'Brief explanation of the changes.' },
        changes: {
          type: 'array',
          items: object(
            {
              type: { type: 'string', enum: ['edit', 'create', 'delete'] },
              path: { type: 'string' },
              search: { type: 'string', description: 'For edit: exact current text to be replaced.' },
              replace: { type: 'string', description: 'For edit: new replacement text.' },
              content: { type: 'string', description: 'For create: full content of the new file.' },
            },
            ['type', 'path']
          ),
        },
      }, ['explanation', 'changes']),
      label: () => 'Proponiendo cambios...',
      run: async ({ explanation, changes }) => {
        const proposal = deps.getProposal();
        if (explanation) proposal.explanation = explanation;
        for (const change of changes ?? []) {
          const relative = safe(change.path);
          const current = (await deps.readText(relative)) ?? '';
          applyChange(proposal, { ...change, path: relative }, current);
        }
        const baseline = (await deps.diagnostics?.()) ?? [];
        const checked = await deps.checkProposal(proposal);
        if (!checked) return 'Propuesta registrada. El usuario la revisará en la interfaz.';
        const summary = describeCheck(baseline, checked);
        proposal.check = summary;
        if (summary.fresh.length > 0 && fixAttempts < MAX_FIX_ATTEMPTS) {
          fixAttempts += 1;
          const errorsText = summary.fresh.map((e) => `• ${e.file || ''}:${e.line ?? '?'}: ${e.message}`).join('\n');
          return `Atención: la propuesta introduce errores. Corrige los cambios con otra llamada a propose_changes:\n${errorsText}`;
        }
        return summary.fresh.length === 0
          ? 'Propuesta verificada sin errores. El usuario la revisará en la interfaz.'
          : 'Propuesta registrada con advertencias.';
      },
    },
  ];

  if (deps.search) {
    tools.push({
      name: 'search_project',
      description: 'Search for text or regex across project files.',
      parameters: object({ query: { type: 'string' }, regex: { type: 'boolean' } }, ['query']),
      label: (args) => `Buscando «${args.query ?? ''}»`,
      run: async ({ query, regex }) => {
        const results = await deps.search(query, regex ?? false);
        return results.map((r) => `${r.relative}:${r.line}: ${r.text}`).slice(0, 50).join('\n') || 'Sin coincidencias.';
      },
    });
  }

  return tools;
}