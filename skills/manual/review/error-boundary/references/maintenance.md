# Maintaining Error Boundary Review

Read this only when editing this skill or its routing fixtures, not while reviewing application code.

Paths and commands below are relative to the skill directory. These checks
validate packaging and deterministic routing rules, not model behavior.

1. **Keep routing examples consistent when editing scope**
   - If the prompt only asks for syntax, concept explanation, broad API design, or debugging, compare it with `references/near-miss-eval.md` before triggering this skill.
   - Use `TRIGGER`, `NO_TRIGGER`, or `NARROW_FIRST` routing when the request mentions errors but lacks a concrete boundary review target.
   - When tuning triggers, keep the scriptable routing cases in `references/near-miss-eval.md` balanced across trigger, no-trigger, and narrow-first examples.
   - Keep the machine-readable fixture in `references/routing-cases.json` synchronized with the markdown table before changing trigger wording.
   - Use `scripts/dry_run_routing_cases.py` for a no-model sanity check that the fixture labels still match the documented routing rule.
   - Add `--report` when you need a readable per-case PASS/FAIL handoff for trigger tuning.
   - Add `--json` when CI or another agent needs machine-readable `expected_route` / `actual_route` / `passed` results.
   - Add `--json --output <path>` when the routing result should be saved as an artifact instead of pasted into the conversation.
   - If the artifact is for CI or cross-agent handoff, record the output path next to the PR, issue, or notebook entry and treat non-zero `failure_count` as a routing regression.
   - For PR/CI handoff, copy the compact `CI / agent handoff example` from `references/near-miss-eval.md` so the next reviewer gets artifact path, command, gate, route drift, and PR comment evidence in one place.

2. **Run the lightweight regression check after editing this skill**
   - From this skill directory, run `python3 scripts/validate_error_boundary_skill.py`.
   - Also run `python3 scripts/dry_run_routing_cases.py` after changing trigger wording or routing fixtures.
   - Run `python3 scripts/dry_run_routing_cases.py --report` when a route drifts, so the next editor can see which prompt label failed without opening the fixture first.
   - Run `python3 scripts/dry_run_routing_cases.py --json` when you need a machine-readable routing result for automation or cross-agent handoff.
   - Run `python3 scripts/dry_run_routing_cases.py --json --output <path>` when CI or another agent needs a saved artifact.
   - The validation script checks required references, trigger keywords, trigger-example coverage, near-miss eval markers, scriptable routing cases, routing fixture shape, dry-run script presence, sample-output markers including the PR-comments-only mini fixture and insufficient-evidence fixture, language probe sections, version metadata, and accidental absolute user paths.


The routing dry-run is deterministic tooling validation, not a model behavior evaluation.
