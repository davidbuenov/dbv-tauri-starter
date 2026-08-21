# Instrucciones del Proyecto para Claude Code — dbv-tauri-starter

Este proyecto sigue la metodología **Spec-Driven Development (SDD)** con el framework **dbv-specs-ops**.
Toda la documentación, normas y especificaciones residen en el subdirectorio `dbv-specs-ops/`:

| Archivo | Propósito |
| --- | --- |
| `dbv-specs-ops/project.config.md` | Identidad del proyecto: nombre, autor, licencia y plantilla de cabeceras |
| `dbv-specs-ops/docs/MASTER_PROMPT.md` | Workflow obligatorio, normas y límites de desarrollo |
| `dbv-specs-ops/docs/SPECIFICATIONS.md` | Requisitos del proyecto actual |
| `dbv-specs-ops/docs/ARCHITECTURE.md` | Stack técnico |
| `dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md` | Patrón de arquitectura para apps de escritorio nativas (Tauri v2) |
| `dbv-specs-ops/docs/NATIVE_APPS_RELEASE_CI.md` | CI/CD multiplataforma (GitHub Actions) para compilar y publicar binarios nativos |
| `dbv-specs-ops/docs/MARKETPLACE_PUBLISHING.md` | Publicación en marketplaces (Microsoft Store, Uptodown, etc.) |
| `dbv-specs-ops/memory.md` | Contexto y Decisiones cualitativas (ADRs) |
| `dbv-specs-ops/task.md` | Estado actual de tareas + Snapshot de Contexto |

## ⚠️ Reglas Core
**Lee `dbv-specs-ops/docs/MASTER_PROMPT.md` y sigue su flujo de trabajo estrictamente.**

## 🆕 Primer paso al empezar un proyecto nuevo a partir de esta plantilla

Antes de escribir ninguna línea de código de la app final:

1. Di a tu IA: **"Lee `dbv-specs-ops/docs/UPGRADE_PROMPT.md` y actualiza el framework"** — esto garantiza que partes de la versión más reciente de dbv-specs-ops aunque haya pasado tiempo desde que se sincronizó esta plantilla.
2. Escribe `/spec` para arrancar la entrevista de especificación de tu aplicación real.

> 🛠️ Framework SDD creado por **[David Bueno Vallejo](https://github.com/davidbuenov)** · [dbv-specs-ops](https://github.com/davidbuenov/dbv-specs-ops)
