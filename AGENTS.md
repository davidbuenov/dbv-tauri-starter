# AGENTS.md — Project Instructions for AI Coding Agents — dbv-tauri-starter

This project follows **Spec-Driven Development (SDD)** with the **dbv-specs-ops** framework.
All documentation, rules and specifications live in the `dbv-specs-ops/` subdirectory. Read these files at the start of each session before proposing any code or plan:

| File | Purpose |
| --- | --- |
| `dbv-specs-ops/project.config.md` | Project identity: name, author, license and file header template |
| `dbv-specs-ops/docs/MASTER_PROMPT.md` | Mandatory workflow, rules and boundaries |
| `dbv-specs-ops/docs/SPECIFICATIONS.md` | Current project requirements |
| `dbv-specs-ops/docs/ARCHITECTURE.md` | Stack and technical decisions |
| `dbv-specs-ops/docs/WEB_TO_DESKTOP_MIGRATION.md` | Strategic decisions for migrating an **existing** web app to desktop — read **before** `NATIVE_DESKTOP_APPS.md` |
| `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` | Native desktop app architecture pattern (Tauri v2) |
| `dbv-specs-ops/docs/AI_DESKTOP_ARCHITECTURE.md` | Built-in AI (local, cloud with API key, subscription agents over ACP) |
| `dbv-specs-ops/memory.md` | **Context and Decisions:** Qualitative knowledge (ADRs, lessons learned, active context) |
| `dbv-specs-ops/task.md` | Current state + Context Snapshot |

## ⚠️ Core Rules (Strong Pointer)

**Read `dbv-specs-ops/docs/MASTER_PROMPT.md` and follow its workflow strictly. If you detect contradictions between the prompt and project specs, halt and report before proceeding.**

The AI connection code shared by every DBV app (`scripts/sync-ai.mjs` lists the canonical files) and the shared part of `docs/IA.md` are kept in sync from this repository: do not fork them per app.

---

> 🛠️ SDD Framework created by **[David Bueno Vallejo](https://github.com/davidbuenov)** — free and open source · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
