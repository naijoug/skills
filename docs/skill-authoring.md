# Skill authoring and verification

Write the capability and its decision boundaries first. Include only guidance
that changes how the task should be done: the requested result, relevant inputs,
non-obvious constraints, and evidence of completion. Keep descriptions short and
specific; ordinary implementation should not enter a coaching or audit workflow
just because it mentions a matching keyword.

Use this guide while creating or changing a skill. It is not required reading for
every repository edit.

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| `SKILL.md` frontmatter | Host discovery: stable name and a discriminating description |
| `SKILL.md` body | Shared purpose, essential constraints, completion criteria, conditional links |
| `skill.yaml` | Repository catalog ID, version, title, summary, tags and compatibility |
| `agents/openai.yaml` | Codex invocation policy and optional UI metadata |
| `inject.md` | Short auto-skill instruction, synchronized by the CLI/TUI linker |
| `references/trigger-examples.md` | Routing fixtures discovered by the evaluator; not a runtime prerequisite |

Keep `name` and `id` identical. The README includes the complete metadata shape.
Use a patch version for compatible fixes or fixture updates, and a minor version
for intentional workflow changes. Catalog summaries should describe the current
behavior; they do not need to duplicate the host description word for word.

Manual skills in this repository use `policy.allow_implicit_invocation: false` in
Codex. This is a local product choice, not a universal recommendation. Other hosts
may have different invocation mechanisms. Preserve optional interface and tool
dependency fields when editing policy.

## Instructions that scale with the task

- Describe an observable result and when the work is complete. Add a fixed order
  only when an operation depends on it.
- Treat explicit user requests and existing authorization as sufficient for scoped
  local work, within the host's permissions. Ask only for material missing inputs
  or authority; continue independent authorized work in the meantime.
- Preserve concrete constraints such as change ownership and publication scope.
  Formatting preferences and past examples are not unconditional stopping rules.
- Put substantial mode-specific detail in references with a clear reading trigger.
  Do not copy the same rule into the workflow, reference map and final checklist.
- Keep ordinary use and maintenance instructions separate. Avoid tests that pin
  exact headings, wording, or the previous version number.

## Routing evaluation

Author genuine user prompts in `Positive (Chinese)`, `Positive (English)`,
`Negative / Near Miss`, and, when useful, `Narrow first` sections. Keep operational
notes under a different heading so they do not become input cases. Quote prompts
to separate them from explanatory notes.

| Route | Meaning | Prediction that satisfies it |
| --- | --- | --- |
| `select` | Choose a known skill or exact set of skills | Matching canonical IDs and `decision: select` |
| `not_this_skill` | The source skill is inappropriate; other choices are unspecified | Do not select the source skill |
| `none` | No skill is needed | Empty prediction and `decision: none` |
| `clarify` | A material missing input prevents selection | Empty prediction and `decision: clarify` |

Positive cases default to selecting their source skill. Negative cases default to
`not_this_skill`, not rejection of every other skill. `Narrow first` defaults to
`clarify`. Use explicit annotations for redirects or a strict no-skill result:

```markdown
- "Review this existing plan" <!-- eval: {"route":"select","skills":["ng-plan-review"]} -->
- "What is two plus two?" <!-- eval: {"route":"none"} -->
```

The export contains only opaque `id` and `prompt` by default. `--with-labels` is for
the scorer's own smoke test and dataset inspection. Real predictors should receive
only the blind export and candidate catalog, not paths, answer annotations or the
gold dataset. Return one JSONL record per input:

```json
{"id":"<opaque input id>","predicted":["ng-plan-review"],"decision":"select"}
```

The scorer rejects unknown or duplicate identities and malformed decisions.
`--fail-on-miss` fails on incorrect, extra or missing decisions. Exact routing
accuracy includes all routes; positive recall alone can hide unwanted extra skills.
Near-miss acceptance leaves the correctness of alternative choices unspecified;
use an explicit `select`, `none` or `clarify` label for stronger assertions.

## Verification

```bash
bash apps/scripts/skills-quality-check
```

This runs metadata checks, disposable-fixture regression tests, the error-boundary
package checks, coverage checks, and the perfect-predictor scorer smoke. It does
not access production, require an API key, or start a preview. App changes should
use the appropriate checks in [Skills Manager operations](../apps/docs/skills-manager.md).

For model comparisons, keep the model, reasoning settings, inputs, tools and
mandatory host constraints fixed. Compare no optional skill, the current skill,
and the revised skill on representative tasks. Record actual completion, unwanted
questions, tool calls, time and available token usage. A score from perfect or
keyword-demo predicts none of those outcomes; do not label it a model evaluation.

## Installed instructions

The CLI/TUI linker's `doctor --category auto` compares source injection text with
managed blocks without writing files. Symlink installs see source edits; reinstall
to synchronize their injected block. Existing copy installs are skipped unless
`--force` explicitly permits replacement, since the copy may contain user edits.
Review local edits before forcing a refresh. Unmanaged same-name destinations
remain protected without `--force`.

Only the marked block is updated; surrounding user rules are preserved. Malformed
or duplicate markers fail without rewriting the instruction file. The desktop
installer copies or symlinks skill files but does not implement this injection
lifecycle. Do not infer that a desktop install refreshed a global AGENTS.md.

## Sources

This repository applies concise discovery and conditional references from the
[OpenAI skills article](https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra#better-skills),
and task completion and proportional verification from the
[Astra guide](https://developers.openai.com/api/docs/guides/latest-model?model=gpt-6-astra).
Codex policy fields are documented in
[Build skills](https://learn.chatgpt.com/docs/build-skills#optional-metadata).
These conventions were reviewed on 2026-09-20; model-specific API settings are
outside this skill-authoring change.
