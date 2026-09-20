# Skills Manager TUI

This directory owns the local CLI/TUI tools for managing this repository's
skills.

- `skills-linker` installs, uninstalls, lists, and checks skill status.
- `tui` is the fzf-based wrapper around `skills-linker tui`.
- `ng` is the manual-skill helper.
- `trigger_examples_tool.py`, `run_trigger_eval.sh`, `trigger_eval_report.py`,
  and `predictor_adapter_template.py` support blind routing checks. The scorer
  distinguishes selecting a skill, rejecting a near miss, and asking for
  clarification; `perfect` is only a plumbing smoke test.

Run commands from the repository root:

```bash
./apps/skills-manager-tui/tui
./apps/skills-manager-tui/skills-linker list
./apps/skills-manager-tui/ng list
./apps/skills-manager-tui/run_trigger_eval.sh --mode perfect --no-details
```

For a real predictor, the runner exports opaque `id`/`prompt` cases and a
candidate catalog. The predictor writes `id`, `predicted`, and `decision`
(`select`, `none`, or `clarify`) to the predictions JSONL file.

Run `bash apps/scripts/skills-quality-check` for isolated regression tests and
full routing coverage. The [authoring guide](../../docs/skill-authoring.md) defines
the case labels, blind-input contract and limits of deterministic smoke tests.

`skills-linker doctor --category auto` checks injection drift without writing.
Reinstall symlinks to refresh managed instruction blocks. Existing copy installs
are skipped by default to preserve edits inside the installed copy; use `--force`
only when replacing that copy is intended. Malformed blocks fail without rewriting
surrounding user instructions.
