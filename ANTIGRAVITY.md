# Antigravity Reference — SDD Extended Behavior — dbv-tauri-starter

> **How Antigravity loads context:** `GEMINI.md` is **automatically read** from the workspace root at the start of every session (same mechanism as Gemini CLI). You do NOT need to paste anything manually.
>
> This file documents the **Antigravity-specific features** built on top of the base SDD workflow defined in `GEMINI.md`.

---

This project follows **Spec-Driven Development (SDD)**. All documentation lives in `dbv-specs-ops/` (see `GEMINI.md` for the full file table).

## Antigravity-Specific Behavior

- **Planning Mode**: When creating a plan, activate Antigravity's native Planning Mode. Create the artifacts (`dbv-specs-ops/implementation_plan.md`, `dbv-specs-ops/task.md`, `dbv-specs-ops/walkthrough.md`) **inside the project workspace**, not only in the conversation brain directory.
- **Knowledge Items (KIs)**: After completing a significant milestone, offer to create a Knowledge Item summarizing the project context.
- **Context Snapshot**: At the end of each session, write a Context Snapshot to `dbv-specs-ops/task.md` with the exact next step.

---

> 🛠️ SDD Framework created by **[David Bueno Vallejo](https://github.com/davidbuenov)** — free and open source · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
