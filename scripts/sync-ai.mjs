#!/usr/bin/env node
// =============================================================================
// dbv-tauri-starter — Sincronización del subsistema canónico de conexión a IAs
// Copyright (c) 2026 David Bueno Vallejo
// Licensed under the MIT License. See LICENSE for details.
// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops
// =============================================================================
//
// Uso:
//   node scripts/sync-ai.mjs --check ../dbv-unreal-ai
//   node scripts/sync-ai.mjs --apply ../dbv-md-reader [--name "DBV Markdown Reader"]
//
// Garantiza que todas las aplicaciones de la familia DBV utilicen exactamente
// la misma implementación de referencia de conexión a IAs (Locales, Suscripción
// CLI/ACP con consulta real de modelos y niveles de razonamiento, y Nube por API)
// mantenida en `dbv-tauri-starter`, preservando la cabecera de cada repositorio.
//
// Tres partes:
//   1. Ficheros canónicos: se copian tal cual (conservando la cabecera del destino).
//   2. Guía de usuario (`docs/IA.md`, `docs/IA.en.md` y `src/ai/guideContent.js`, el texto que
//      muestra la propia app con guide.js): se genera desde la plantilla de dbv-specs-ops con el
//      nombre visible de la app; lo que la app tenga en sus .md debajo de la marca
//      `<!-- dbv-ia:fin-guia-comun` es suyo y se conserva.
//   3. Puntos de integración: lo que cada app adapta a mano (traducciones, registro de
//      comandos en `lib.rs`, `appInfo.js`, el puente de `aiApp.js`). Solo se comprueban y se
//      avisa de lo que falta; nunca se tocan.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Ficheros canónicos 100 % agnósticos del dominio de la aplicación que componen
 * el subsistema de detección, conexión y configuración de IAs y agentes ACP.
 */
export const CANONICAL_AI_CONNECTION_FILES = [
  'src-tauri/src/ai/detect.rs',
  'src-tauri/src/ai/connections.rs',
  'src-tauri/src/ai/acp.rs',
  'src-tauri/src/ai/commands.rs',
  'src/ai/connectWizard.js',
  'src/ai/acpSession.js',
  'src/ai/backend.js',
  'src/ai/guide.js',
  'src/ai/markdown.js',
  'tests/ai/connectWizard.test.js',
  'tests/ai/acp.test.js',
  'tests/ai/guide.test.js',
];

/** Guías de usuario generadas desde la plantilla común de dbv-specs-ops. */
export const USER_GUIDES = [
  { lang: 'es', doc: 'docs/IA.md', template: 'dbv-specs-ops/docs/templates/IA.template.md', title: /^# 🤖 Usar una IA con (.+)$/m },
  { lang: 'en', doc: 'docs/IA.en.md', template: 'dbv-specs-ops/docs/templates/IA.en.template.md', title: /^# 🤖 Using an AI with (.+)$/m },
];

/** Texto de la guía que muestra la propia app (`guide.js`): se genera, como las guías, con el nombre de la app. */
export const GUIDE_CONTENT_FILE = 'src/ai/guideContent.js';

/** Marca que cierra la parte común de la guía; lo de debajo es propio de cada app. */
export const GUIDE_END_MARKER = '<!-- dbv-ia:fin-guia-comun';

/** Fragmentos que el puente de cada app (`aiApp.js`) debe contener para que funcione lo canónico. */
const BRIDGE_SNIPPETS = [
  { snippet: 'reasoningEffort', why: 'pasar el modelo y el razonamiento elegidos con ⚙️ al lanzar el agente' },
  { snippet: 'onAuthenticate', why: 'avisar en el panel cuando el agente pide iniciar sesión' },
];

/** Claves que usa ese puente (no están en los ficheros canónicos, así que no se deducen solas). */
const BRIDGE_KEYS = ['ai.agentSigningIn'];

/** Estilos que el `ai.css` de cada app debe tener para lo canónico. */
const CSS_SNIPPETS = [{ snippet: '.ai-guide', why: 'la ventana de la guía (guide.js)' }];

function splitHeaderAndBody(content) {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  // Cabecera estándar de 6 líneas (// === ... // ===)
  if (lines.length >= 6 && lines[0].startsWith('// ===') && lines[5].startsWith('// ===')) {
    return {
      header: lines.slice(0, 6).join('\n'),
      body: lines.slice(6).join('\n'),
    };
  }
  return { header: '', body: normalized };
}

function resolveTargetFile(targetRoot, relPath) {
  const direct = path.join(targetRoot, relPath);
  if (fs.existsSync(direct)) return direct;
  // En dbv-typst-editor los tests de IA viven en src/ai/*.test.js
  if (relPath.startsWith('tests/ai/')) {
    const inSrc = path.join(targetRoot, 'src/ai', path.basename(relPath));
    if (fs.existsSync(inSrc)) return inSrc;
  }
  return direct;
}

const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null);

/** Parte común y parte propia de una guía (la propia empieza en la línea siguiente a la marca). */
export function splitGuide(text) {
  const at = text.indexOf(GUIDE_END_MARKER);
  if (at < 0) return { common: text, own: null };
  const lineEnd = text.indexOf('\n', at);
  const end = lineEnd < 0 ? text.length : lineEnd + 1;
  return { common: text.slice(0, end), own: text.slice(end) };
}

/** Nombre visible de la app: `--name`, el título de su guía actual o el `Name` de `project.config.md`. */
function appName(targetRoot, explicit) {
  if (explicit) return explicit;
  for (const guide of USER_GUIDES) {
    const match = read(path.join(targetRoot, guide.doc))?.match(guide.title);
    if (match) return match[1].trim();
  }
  const config = read(path.join(targetRoot, 'dbv-specs-ops/project.config.md'));
  return config?.match(/^- \*\*Name:\*\* (.+)$/m)?.[1].trim() ?? null;
}

function syncCanonicalFiles(targetRoot, mode) {
  let diverged = 0;
  for (const relPath of CANONICAL_AI_CONNECTION_FILES) {
    const srcFile = path.join(ROOT, relPath);
    const dstFile = resolveTargetFile(targetRoot, relPath);
    const srcContent = fs.readFileSync(srcFile, 'utf8');
    const srcParts = splitHeaderAndBody(srcContent);

    if (!fs.existsSync(dstFile)) {
      diverged += 1;
      if (mode === 'apply') {
        fs.mkdirSync(path.dirname(dstFile), { recursive: true });
        fs.writeFileSync(dstFile, srcContent.replace(/\r\n/g, '\n'), 'utf8');
        console.log(`[CREADO]       ${path.relative(targetRoot, dstFile)}`);
      } else {
        console.log(`[FALTA]        ${path.relative(targetRoot, dstFile)}`);
      }
      continue;
    }

    const dstContent = fs.readFileSync(dstFile, 'utf8');
    const dstParts = splitHeaderAndBody(dstContent);
    if (srcParts.body === dstParts.body) {
      console.log(`[IDÉNTICO]     ${path.relative(targetRoot, dstFile)}`);
    } else {
      diverged += 1;
      if (mode === 'apply') {
        const header = dstParts.header || srcParts.header;
        const merged = header ? `${header}\n${srcParts.body}` : srcParts.body;
        fs.writeFileSync(dstFile, merged, 'utf8');
        console.log(`[ACTUALIZADO]  ${path.relative(targetRoot, dstFile)}`);
      } else {
        console.log(`[DIVERGENTE]   ${path.relative(targetRoot, dstFile)}`);
      }
    }
  }
  return diverged;
}

/** Texto de la guía para mostrarlo en la app: la parte común sin la línea de navegación entre `.md` ni la marca. */
export function guideForApp(common) {
  const lines = common.split('\n').filter((line) => !line.startsWith('> 🌐') && !line.startsWith(GUIDE_END_MARKER));
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

/** Módulo `guideContent.js` con la guía de cada idioma. */
function guideContentModule(name, texts) {
  return [
    '// =============================================================================',
    `// ${name} — Texto de la guía de conexión de IAs (lo muestra guide.js)`,
    '// GENERADO por scripts/sync-ai.mjs (dbv-tauri-starter) desde dbv-specs-ops/docs/templates/IA*.template.md:',
    '// no lo edites a mano; cambia la plantilla y vuelve a sincronizar.',
    '// Built with dbv-specs-ops · https://github.com/davidbuenov/dbv-specs-ops',
    '// =============================================================================',
    '',
    `export const GUIDE = ${JSON.stringify(texts, null, 2)};`,
    '',
  ].join('\n');
}

function syncGuides(targetRoot, mode, name) {
  let diverged = 0;
  const texts = {};
  for (const guide of USER_GUIDES) {
    const template = read(path.join(ROOT, guide.template));
    if (template === null) {
      console.error(`No existe la plantilla ${guide.template} en dbv-tauri-starter.`);
      process.exit(1);
    }
    const common = template.replaceAll('{{APP_NAME}}', name);
    texts[guide.lang] = guideForApp(common);
    const dstFile = path.join(targetRoot, guide.doc);
    const current = read(dstFile);
    const parts = current === null ? null : splitGuide(current);
    if (parts && parts.own !== null && parts.common === common) {
      console.log(`[IDÉNTICO]     ${guide.doc}`);
      continue;
    }
    diverged += 1;
    if (mode === 'apply') {
      fs.mkdirSync(path.dirname(dstFile), { recursive: true });
      fs.writeFileSync(dstFile, common + (parts?.own ?? ''), 'utf8');
      const note = current !== null && parts.own === null ? ' (no tenía la marca: lo propio de la app que hubiera, recupéralo de git y ponlo debajo)' : '';
      console.log(`[${current === null ? 'CREADO' : 'ACTUALIZADO'}]${current === null ? '       ' : '  '}${guide.doc}${note}`);
    } else {
      console.log(`[${current === null ? 'FALTA' : 'DIVERGENTE'}]${current === null ? '        ' : '   '}${guide.doc}`);
    }
  }

  const module = guideContentModule(name, texts);
  const contentFile = path.join(targetRoot, GUIDE_CONTENT_FILE);
  const current = read(contentFile);
  if (current === module) {
    console.log(`[IDÉNTICO]     ${GUIDE_CONTENT_FILE}`);
  } else {
    diverged += 1;
    if (mode === 'apply') {
      fs.mkdirSync(path.dirname(contentFile), { recursive: true });
      fs.writeFileSync(contentFile, module, 'utf8');
      console.log(`[${current === null ? 'CREADO' : 'ACTUALIZADO'}]${current === null ? '       ' : '  '}${GUIDE_CONTENT_FILE}`);
    } else {
      console.log(`[${current === null ? 'FALTA' : 'DIVERGENTE'}]${current === null ? '        ' : '   '}${GUIDE_CONTENT_FILE}`);
    }
  }
  return diverged;
}

/** Lo que cada app adapta a mano: se comprueba y se avisa, nunca se toca. */
function checkIntegration(targetRoot) {
  const issues = [];
  const translationsFile = ['src/ai/translations.js', 'src/i18n.js'].map((f) => path.join(targetRoot, f)).find((f) => fs.existsSync(f));
  const translations = translationsFile ? read(translationsFile) : '';
  const usedKeys = new Set(BRIDGE_KEYS);
  for (const relPath of CANONICAL_AI_CONNECTION_FILES.filter((f) => f.startsWith('src/') && f.endsWith('.js'))) {
    for (const match of read(path.join(ROOT, relPath)).matchAll(/\bt\(\s*'([a-z]\w*\.[\w.]+)'/g)) usedKeys.add(match[1]);
  }
  const missingKeys = [...usedKeys].filter((key) => !translations.includes(`'${key}'`) && !translations.includes(`"${key}"`)).sort();
  if (missingKeys.length) issues.push(`traducciones sin las claves que usan los ficheros canónicos (añádelas en ES y EN): ${missingKeys.join(', ')}`);

  const libRs = read(path.join(targetRoot, 'src-tauri/src/lib.rs')) ?? '';
  const commands = [];
  for (const relPath of CANONICAL_AI_CONNECTION_FILES.filter((f) => f.endsWith('.rs'))) {
    for (const match of read(path.join(ROOT, relPath)).matchAll(/#\[tauri::command\]\s*pub (?:async )?fn (\w+)/g)) commands.push(match[1]);
  }
  const unregistered = commands.filter((name) => !new RegExp(`::${name}\\b`).test(libRs));
  if (unregistered.length) issues.push(`src-tauri/src/lib.rs no registra estos comandos en generate_handler!: ${unregistered.join(', ')}`);

  const needsAppInfo = CANONICAL_AI_CONNECTION_FILES.some((f) => f.endsWith('.js') && read(path.join(ROOT, f)).includes("'./appInfo.js'"));
  if (needsAppInfo && !fs.existsSync(path.join(targetRoot, 'src/ai/appInfo.js'))) {
    issues.push('falta src/ai/appInfo.js (exporta APP_NAME y DOCUMENT_KIND): lo importa acpSession.js');
  }

  const aiApp = read(path.join(targetRoot, 'src/ai/aiApp.js'));
  if (aiApp !== null) {
    for (const { snippet, why } of BRIDGE_SNIPPETS) {
      if (!aiApp.includes(snippet)) issues.push(`src/ai/aiApp.js no usa «${snippet}»: hace falta para ${why} (mira el de dbv-tauri-starter)`);
    }
  }

  const css = read(path.join(targetRoot, 'src/ai/ai.css'));
  if (css !== null) {
    for (const { snippet, why } of CSS_SNIPPETS) {
      if (!css.includes(snippet)) issues.push(`src/ai/ai.css no tiene los estilos «${snippet}» de ${why} (cópialos del de dbv-tauri-starter)`);
    }
  }

  for (const issue of issues) console.log(`[REVISAR]      ${issue}`);
  if (!issues.length) console.log('[INTEGRACIÓN]  traducciones, comandos registrados, appInfo.js, puente de aiApp.js y estilos correctos');
  return issues.length;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--apply') ? 'apply' : 'check';
  const nameAt = args.indexOf('--name');
  const explicitName = nameAt >= 0 ? args[nameAt + 1] : null;
  const targetArg = args.find((a, i) => !a.startsWith('--') && i !== nameAt + 1);
  if (!targetArg) {
    console.error('Uso: node scripts/sync-ai.mjs [--check | --apply] <ruta-repositorio-destino> [--name "Nombre visible"]');
    process.exit(1);
  }
  const targetRoot = path.resolve(process.cwd(), targetArg);
  if (!fs.existsSync(targetRoot)) {
    console.error(`No existe el directorio destino: ${targetRoot}`);
    process.exit(1);
  }
  const name = appName(targetRoot, explicitName);
  if (!name) {
    console.error('No se pudo deducir el nombre visible de la app: pásalo con --name "Nombre".');
    process.exit(1);
  }

  console.log('— Ficheros canónicos');
  const diverged = syncCanonicalFiles(targetRoot, mode);
  console.log(`— Guía de usuario («${name}»)`);
  const guides = syncGuides(targetRoot, mode, name);
  console.log('— Puntos de integración (a mano)');
  const issues = checkIntegration(targetRoot);

  if (mode === 'check' && diverged + guides > 0) {
    console.error(`\n❌ ${diverged + guides} fichero(s) difieren de la implementación canónica de dbv-tauri-starter.`);
    process.exit(2);
  }
  if (issues > 0) {
    console.error(`\n⚠️  ${issues} punto(s) de integración por revisar a mano (ver [REVISAR]).`);
    process.exit(3);
  }
  console.log(`\n✅ Subsistema de conexión de IA ${mode === 'apply' ? 'sincronizado' : 'verificado'} con dbv-tauri-starter.`);
}

main();
