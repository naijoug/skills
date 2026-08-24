# Filled Example: Agent Release Gate

This is a redacted example showing how to turn launch-review evidence into a gate decision. Use placeholder IDs and relative paths; do not paste customer data, secrets, or local absolute paths.

## Scenario

- Release: enable an internal support-agent canary for read-only knowledge lookup plus draft-response generation.
- Planned scope: 5 internal reviewers, 10% of support sandbox traffic, no direct ticket mutation.
- Risk note: write tools exist in the codebase, but they are not enabled for this canary.

## Agent Release Gate

### Release object

- `release_id`: `support-agent-canary-2026-07-16-r1`
- Agent / model / prompt / tool schema versions: `agent@0.8.3`, `model@vendor-x-2026-07`, `prompt_sha=9f3a2c1`, `tool_schema@2026-07-15`
- Retrieval / policy / security suite versions: `kb_index@2026-07-15.2`, `policy@support-readonly-v4`, `safety_suite@agent-release-2026-07-16`

### Evidence map

| Evidence | Field | Status | Link / ID | Owner / next action |
| --- | --- | --- | --- | --- |
| Workspace boundary | `status_snapshot`, `owned_release_paths`, `avoided_dirty_paths` | clean for release paths; unrelated dirty docs avoided | `git status --short -- prompts/support-agent policies/support-readonly evals/support-agent runbooks/support-agent` -> no output; avoided `docs/drafts/support-copy.md` | `release-owner`: keep avoided draft out of release proof |
| Golden Tasks | `golden_tasks_version`, `evaluation_summary` | present | `evals/support-agent/golden-tasks-v12.md`, 42/44 pass | `eval-owner`: classify two misses before write-tool rollout |
| Failed cases | `evidence.failed_case_ids` | present, non-blocking for read-only scope | `GT-018`, `GT-037` | `prompt-owner`: add retrieval disambiguation case |
| Safe traces | `evidence.safe_trace_links` | present and redacted | `runs/2026-07-16/safe-traces/support-agent-readonly.md` | `release-owner`: keep trace sample attached to report |
| Approval binding | `evidence.approval_binding_cases` | not applicable for enabled scope | `policy@support-readonly-v4` disables write tools | `tool-owner`: required before ticket mutation canary |
| Audit events | `evidence.audit_event_ids` | present | `AUD-20260716-1020` through `AUD-20260716-1042` | `observability-owner`: verify first live canary window |
| Rollback | `rollback.version_switch`, `capability_switch`, `traffic_switch` | rehearsed | `runbooks/support-agent/rollback-readonly-canary.md` | `release-owner`: on-call during first hour |

### Gate decision

- Decision: `warn`
- Allowed scope: internal reviewers only; read-only lookup and draft-response generation; 10% sandbox traffic; no external customer traffic.
- Disabled scope: ticket mutation, refund/credit actions, customer-visible auto-send, and external tenant rollout.
- Reason: Golden Tasks and safe traces support a read-only canary, but two retrieval misses remain unresolved and approval binding has not been tested for write tools.
- Re-entry condition: resolve `GT-018` and `GT-037`, run `safety_suite@agent-release-2026-07-16` again, and provide approval-binding traces for every write tool before expanding scope.
- Next safe command/check: `npm run eval:support-agent -- --suite safety_suite@agent-release-2026-07-16 --scope readonly-canary`

## Why this is `warn`, not `pass`

The release object is reproducible, audit events exist, rollback is rehearsed, and the enabled scope is low risk. However, a `pass` would imply the planned production scope is fully supported. Because unresolved failures and missing write-tool approval evidence still exist, the correct decision is a restricted `warn` with disabled capabilities named explicitly.

## External publish block example

This second, smaller example covers a public deploy, email send, social post, or repository push. It is intentionally a `block`: the goal is to show that a green rehearsal or working URL is not enough to authorize an external side effect.

### Scenario

- Release: publish the daily AI digest to a public static site and announce it in one external channel.
- Planned scope: one public page, one RSS item, one social post, no paid promotion.
- Risk note: the local build and no-push rehearsal passed, but the positive fixture still inherits the developer machine's deploy CLI and real `origin` remote.

### External publish gate

| Layer | Status | Evidence | Decision impact |
| --- | --- | --- | --- |
| Field gate | partial | `docs/publish-review-2026-08-11.md` exists, but `Final decision` is `Dry-run only` and `Authorization confirmation` is `Review` | `block`; do not infer `Publish` from rehearsal text |
| Fixture gate | partial | checker covers missing hard gate and publish-all-go, but not wrong-date note or auto-evidence review | `block`; add the missing fixtures before wiring `--push` |
| Environment gate | failed | positive fixture uses real `origin`, inherited `PUBLIC_SITE_TOKEN`, and the normal deploy CLI | `block`; isolate temp repo/output, stub deploy/send tools, and fake or remove remotes |
| Guard helper | weak | shell test checks non-zero exit only | `warn` until it also checks actionable reason and absence of build / commit / upload / push logs |

### Gate decision

- Decision: `block`
- Allowed scope: local no-push rehearsal and reviewer-only preview artifact.
- Disabled scope: real `push`, public deploy, RSS upload, social post, email send, and any command that reads production credentials or real remotes.
- Reason: external publication lacks an explicit `Final decision: Publish`, two regression fixtures, and an isolated positive fixture; a green local rehearsal does not prove human authorization or safe side-effect boundaries.
- Re-entry condition: update the canonical review note so every hard field is `Go` and `Final decision: Publish`; add wrong-date and auto-evidence review fixtures; rerun the checker in a temp repo with stubbed deploy/send tools and no inherited production token or remote.
- Next safe command/check: `tests/test-publish-gate.sh --fixture wrong-date --fixture auto-evidence-review --fixture publish-all-go --no-real-deploy`

## Common mistakes avoided

- It does not say “tests passed” without naming versions and evidence IDs.
- It does not treat unrelated dirty drafts as release evidence; the workspace boundary names the release paths and avoided path.
- It does not allow write tools just because they are present in the agent codebase.
- It does not hide unresolved failed cases; it maps them to disabled scope and re-entry conditions.
- It does not treat rehearsal pass, working URL, or inherited deploy credentials as external publish authorization.
- It does not include customer data, secret values, or local absolute paths.
