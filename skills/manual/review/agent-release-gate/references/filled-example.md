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

## Common mistakes avoided

- It does not say “tests passed” without naming versions and evidence IDs.
- It does not allow write tools just because they are present in the agent codebase.
- It does not hide unresolved failed cases; it maps them to disabled scope and re-entry conditions.
- It does not include customer data, secret values, or local absolute paths.
