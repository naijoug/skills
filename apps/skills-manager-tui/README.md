# Skills Manager TUI

This directory owns the local CLI/TUI tools for managing this repository's
skills.

- `skills-linker` installs, uninstalls, lists, and checks skill status.
- `tui` is the fzf-based wrapper around `skills-linker tui`.
- `ng` is the manual-skill helper.
- `trigger_examples_tool.py`, `run_trigger_eval.sh`, `trigger_eval_report.py`,
  and `predictor_adapter_template.py` support trigger recall/precision checks.

Run commands from the repository root:

```bash
./apps/skills-manager-tui/tui
./apps/skills-manager-tui/skills-linker list
./apps/skills-manager-tui/ng list
./apps/skills-manager-tui/run_trigger_eval.sh --mode perfect --no-details
```
