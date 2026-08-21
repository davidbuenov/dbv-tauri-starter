# Project Instructions for Gemini CLI & Antigravity — dbv-tauri-starter

This project follows **Spec-Driven Development (SDD)** with the **dbv-specs-ops** framework.
All documentation, rules and specifications live in the `dbv-specs-ops/` subdirectory:

| File | Purpose |
| --- | --- |
| `dbv-specs-ops/project.config.md` | Project identity: name, author, license and file header template |
| `dbv-specs-ops/docs/MASTER_PROMPT.md` | Mandatory workflow, rules and boundaries |
| `dbv-specs-ops/docs/SPECIFICATIONS.md` | Current project requirements |
| `dbv-specs-ops/docs/ARCHITECTURE.md` | Stack and technical decisions |
| `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` | Native desktop app architecture pattern (Tauri v2) |
| `dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` | Cross-platform GitHub Actions CI/CD for native binaries |
| `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` | Marketplace publishing guide (Microsoft Store, Uptodown, etc.) |
| `dbv-specs-ops/memory.md` | **Context and Decisions:** Qualitative knowledge (ADRs, lessons learned) |
| `dbv-specs-ops/task.md` | Current state + Context Snapshot |

> **Note:** This file is auto-loaded by both **Gemini CLI** and **Antigravity**. For Antigravity-specific setup (Planning Mode, Knowledge Items), see `ANTIGRAVITY.md`.

## ⚠️ Core Rules (Strong Pointer)

**Read `dbv-specs-ops/docs/MASTER_PROMPT.md` and follow its workflow strictly.**

## 🆕 First step when starting a new project from this template

Before writing any application code, say: **"Read `dbv-specs-ops/docs/UPGRADE_PROMPT.md` and update the framework"** — this guarantees you're on the latest dbv-specs-ops version even if this template was synced a while ago. Then type `/spec` to start the specification interview.

---

> 🛠️ Framework SDD creado por **[David Bueno Vallejo](https://github.com/davidbuenov)** — libre y gratuito · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
