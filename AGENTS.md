# Repository Instructions

外部账号操作前读取 `/Users/guojian/Workspace/naijoug/AGENTS.md`；个人工作区账号路由规则在临时 checkout 中同样适用。

## Content and tooling

- This repository maintains skill content, archives, and standalone content quality tools. Manager application code and launchers have been retired; management functionality belongs to Loom.
- For skill authoring or routing changes, use `docs/skill-authoring.md`; read only the target skill and references governing the changed behavior.
- For skill/tooling verification, run `bash scripts/skills-quality-check`. It uses disposable local fixtures and needs no network, Node/Tauri workspace, Loom checkout, or production access. Run affected checks again after fixing failures caused by the change.
- Preserve skill content, archives, credentials and installed skills. Old Manager data and local artifacts have been removed; do not import, adopt or recreate them.
- Complete authorized local edits and validation without an extra confirmation step. Cite any constraint that actually blocks requested work.
- Do not recreate a Manager application or forwarding launcher here. Use Loom's Settings → Skills or its bundled CLI; usage is described in README and `docs/skills-manager-migration.md`.

## Documentation and code discrepancies

- When repository documentation conflicts with the existing code, follow the conventions in the code. Explicit changes requested by the user take precedence.
- In the final response, report every documentation/code discrepancy found during the task individually, including the documentation location, corresponding code location, specific difference, and how it was handled. Report only verified differences; do not claim unchecked areas are consistent.
