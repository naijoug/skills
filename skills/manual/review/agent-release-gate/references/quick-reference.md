# Quick Reference: Agent Release Gate

Use this one-page checklist during a release review meeting. It compresses the full skill into the minimum fields needed to decide `pass`, `warn`, or `block` without inventing evidence.

## 0. Workspace evidence boundary must be frozen

Before reading evaluation output, record the repo or release-package status. Do not let unowned dirty prompts, policies, generated artifacts, or handoff notes become release proof by accident.

| Field | Required proof | If missing or unowned |
| --- | --- | --- |
| `status_snapshot` | Narrow `git status --short` or equivalent for release paths | `block` production if changed files are required for the gate |
| `owned_release_paths` | Paths intentionally reviewed or changed for this release | Keep outside the evidence map until ownership is clear |
| `avoided_dirty_paths` | Pre-existing dirty paths plus one-line reason | `warn` only for read-only/demo scope; `block` for production |
| Large dirty diff receipt | Diff size, sampled shape, companion paths, and `Continue / Narrow / Stop / Switch` decision | Do not trust the diff as release evidence; write/receive the receipt first |

## 1. Release object must be reproducible

Do not decide the gate until these versions are named:

| Field | Required proof | If missing |
| --- | --- | --- |
| `release_id` | Stable release or canary ID | `block` production; allow only local review |
| Agent / model version | Tag, commit, provider model ID, or config snapshot | `block` if behavior cannot be reproduced |
| Prompt / policy version | Prompt hash and policy bundle/version | `warn` for low-risk internal demo; `block` for external traffic |
| Tool schema version | Tool manifest, permission matrix, or API schema ID | `block` for any tool-enabled rollout |
| Retrieval/index version | Corpus/index build ID, if retrieval affects answers | `warn` or restrict retrieval-dependent intents |

## 2. Evidence fields to collect

| Evidence | Minimum acceptable form | Consumed by |
| --- | --- | --- |
| Golden Tasks | Suite version plus pass/fail count | Release report `evaluation_summary` |
| Failed cases | Case IDs, affected intent/tool, owner, next action | Disabled scope or re-entry condition |
| Safe traces | Redacted success/failure/approval traces | Safety gate and audit review |
| Approval binding | Trace or test showing human approval is bound to high-risk action parameters | Write-tool gate |
| Audit events | Event IDs for tool calls, approvals, denials, and rollback | Observability gate |
| Rollback proof | Rehearsed version, capability, or traffic switch | Release/rollback decision |

## 3. Hard gates

Default to `block` when any enabled path has one of these signals:

- Release object cannot be reproduced from versions or hashes.
- Release package depends on unowned dirty prompts, policies, generated artifacts, or handoff files.
- Forbidden tool call happened during evaluation.
- Sensitive data appears in a trace or report that will be shared.
- Enabled write tool lacks approval binding for exact action parameters.
- Enabled high-risk tool lacks audit events.
- Rollback switch is missing, unowned, or untested for the planned scope.

## 4. External publish push/send/deploy gate

Use this quick gate before any action that can publish externally, including `push`, deploy, social post, email send, or public artifact upload.

| Layer | Required proof | If missing |
| --- | --- | --- |
| Field gate | Explicit canonical review note path; every hard field is `Go`; `Final decision: Publish` is present | `block`; do not auto-pick the latest note |
| Fixture gate | Checker covers dry-run sample, rehearsal-only pass, missing hard gate, auto-evidence review, wrong-date note, and publish-all-go | `block`; add the smallest missing fixture before wiring publish |
| Environment gate | Positive fixture runs with temp repo/output, stubbed tools, no production token, no real remote, no deploy/post/send CLI, no production artifact dir | `block`; isolate the fixture before trusting a green result |
| Guard helper | Blocking tests assert non-zero exit, actionable guard message, and no build / commit / upload / push log before the guard | `warn` or `block`; a generic non-zero exit only proves “some failure” |

Minimum handoff wording:

```markdown
- External publish gate: `pass` / `block`
- Canonical review note: `path/to/review-note.md`
- Fixture matrix: dry-run sample / rehearsal-only pass / missing hard gate / auto-evidence review / wrong-date note / publish-all-go
- Environment boundary: temp output, stubbed deploy/send tools, no inherited production credentials or remotes
- First real publish command remains disabled until the three layers are green in the same release run.
```

## 5. Decision rules

| Decision | Use when | Required wording |
| --- | --- | --- |
| `pass` | Hard gates are zero; evidence is traceable; rollback is rehearsed; planned scope is narrow and monitored | Name the allowed canary scope and first monitoring window |
| `warn` | Low-risk subset is supported, but some tenants, tools, intents, traffic, or write actions lack proof | Name allowed scope, disabled scope, and upgrade proof |
| `block` | Reproducibility, safety, approval, audit, or rollback is missing for an enabled path | Name re-entry condition and first safe command/check |

## 6. `warn` scope pattern

A useful `warn` decision usually has this shape:

```markdown
- Decision: `warn`
- Allowed scope: [internal/tenant group], [read-only or limited tool set], [traffic percent], [time window].
- Disabled scope: [write tools], [external tenants], [auto-send], [affected intents], [higher traffic].
- Reason: [evidence supports allowed scope] but [specific missing proof or unresolved failures remain].
- Re-entry condition: [evidence to add] and [suite/check to rerun].
- Next safe command/check: `[non-destructive verification command]`
```

## 7. Final self-check

Before handing off the gate report, confirm:

- Every enabled capability has a proof link or evidence ID.
- The workspace boundary lists owned release paths and avoided dirty paths.
- Every missing proof narrows scope instead of being hand-waved.
- `warn` and `block` both include a next safe command/check.
- Paths are relative and traces are redacted.
- External publish has field, fixture, and environment gates before any real push/send/deploy.
- Blocking helpers prove the intended guard by checking exit status, concrete reason, and absence of build / commit / upload / push logs.
- The report can be copied into a release note without adding undocumented claims.
