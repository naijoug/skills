# Content quality tools

Run from the repository root:

```bash
bash scripts/skills-quality-check
```

This checks metadata, archived content integrity, content-tool fixtures, the error-boundary skill, trigger coverage, and the perfect-predictor scoring pipeline. The pipeline smoke is not a real model evaluation. No Manager application, Node/Tauri workspace, or Loom checkout is required.

The implementations live in `scripts/quality/`; regression tests live in `tests/quality/`. Skill-owned scripts and application templates remain inside their skill packages.

Management, installation, doctor, TUI/ng and translation now belong to Loom. This directory has no app launcher, preview server or macOS package script. See the root README for the bundled Loom CLI path.
