---
name: ng-review-agent-release-gate
description: Use when reviewing an AI Agent release, launch checklist, canary rollout, or handoff and you need to map evaluation evidence into a pass/warn/block release gate without inventing missing proof
---

# Agent Release Gate

## Overview

Turn scattered Agent evaluation results into a release decision that can be audited. The goal is to connect Golden Tasks, failed cases, safe traces, audit events, rollback switches, and human approval evidence to one `pass`, `warn`, or `block` gate.

Core principle: a release gate is not a confidence sentence. It is a field-level evidence map: every allowed capability has proof, every missing proof narrows scope, and every hard-gate failure blocks the matching rollout.

## When to Use

- Preparing an Agent for internal beta, canary, limited production, or high-risk tool enablement
- Reviewing whether Golden Tasks and safety regression output are sufficient for a release report
- Converting a 90-minute launch review into a machine-readable release report
- Deciding whether a `warn` gate should mean read-only rollout, smaller tenant scope, disabled tools, or delayed launch
- Receiving another agent's handoff where `tests passed` is too vague for production approval

## When Not to Use

- The change is a pure documentation or UI change with no Agent behavior, tool permission, model, prompt, retrieval, or policy impact
- There are no runnable evaluation cases or safe traces yet; first create a minimal evaluation set
- The next step requires production credentials, customer data, or destructive commands not authorized in the current session
- The workspace has unowned dirty changes that would be mixed into the release evidence

## Procedure

1. **Name the release object.**
   - Record `release_id`, agent version, model version, prompt hash, tool schema version, retrieval/index version, and policy version.
   - If any version cannot be identified, default to `block` for production and allow only local/demo review.

2. **Collect evaluation-side evidence.**
   - Golden Tasks version and result summary.
   - Failed case IDs with owner and next action.
   - Safety regression suite version.
   - Safe trace links for representative success, failure, and approval paths.

3. **Collect release-side controls.**
   - Rollout scope: tenant group, traffic percent, allowed tools, blocked tools, read/write mode.
   - Rollback switches: version switch, capability switch, traffic switch, and human owner.
   - Monitoring and alert owner for the first rollout window.

4. **Collect safety-side gates.**
   - Forbidden tool violations, sensitive trace leaks, missing approval binding, missing audit events, and rollback rehearsal result.
   - Treat high-risk write tools without approval binding, audit events, or rollback as `block`.

5. **Decide `pass`, `warn`, or `block`.**
   - `pass`: all hard gates are zero, evidence is traceable, rollout and rollback are scoped.
   - `warn`: read-only or low-risk scope is supported, but some tools, tenants, traffic, or write actions remain disabled.
   - `block`: release object is unreproducible, a forbidden action occurred, sensitive data leaked, approval/audit evidence is missing for enabled write tools, or rollback cannot be executed.

6. **Write the restriction, not just the decision.**
   - For `warn`, list exactly what remains disabled and what proof would upgrade it.
   - For `block`, list the re-entry condition and the first safe command/check.

## Release Gate Template

```markdown
## Agent Release Gate

### Release object
- `release_id`:
- Agent / model / prompt / tool schema versions:
- Retrieval / policy / security suite versions:

### Evidence map
| Evidence | Field | Status | Link / ID | Owner / next action |
| --- | --- | --- | --- | --- |
| Golden Tasks | `golden_tasks_version`, `evaluation_summary` | present / missing / failed |  |  |
| Failed cases | `evidence.failed_case_ids` | present / none / unresolved |  |  |
| Safe traces | `evidence.safe_trace_links` | present / missing / redaction needed |  |  |
| Approval binding | `evidence.approval_binding_cases` | present / missing / partial |  |  |
| Audit events | `evidence.audit_event_ids` | present / missing |  |  |
| Rollback | `rollback.version_switch`, `capability_switch`, `traffic_switch` | rehearsed / documented / missing |  |  |

### Gate decision
- Decision: `pass` / `warn` / `block`
- Allowed scope:
- Disabled scope:
- Reason:
- Re-entry condition:
- Next safe command/check:
```

## Decision Cheatsheet

| Signal | Default decision | Scope rule |
| --- | --- | --- |
| All hard gates zero, rollback rehearsed, safe traces present | `pass` | allow planned canary only; still monitor |
| Golden Tasks pass but write-tool approval evidence is partial | `warn` | allow read-only rollout; keep write tools disabled |
| Failed cases are unresolved but not on enabled path | `warn` | restrict affected tenants, tools, or intents |
| Release object lacks prompt/model/tool versions | `block` | cannot release because result is not reproducible |
| Forbidden tool call, sensitive trace leak, or missing audit for enabled write tool | `block` | fix, rerun safety suite, then re-enter review |
| Rollback switch missing or owner unknown | `warn` or `block` | `block` for external traffic or high-risk tools |

## Quality Checklist

- The decision names the release object and versions, not just “current agent”
- Every `pass` has Golden Tasks, safe traces, audit events, and rollback evidence where relevant
- Every `warn` has explicit disabled tools, tenants, traffic, or capabilities
- Every `block` has a concrete re-entry condition and first safe check
- The report uses relative paths and redacted evidence links; no local absolute paths, secrets, or customer data
- The final handoff can be copied into a release report without adding undocumented claims

## Examples

- Filled `warn` gate for a read-only support-agent canary: `skills/skills/manual/review/agent-release-gate/references/filled-example.md`

## References

- Agent release evidence field map: `docs/documents/trending/ai/agent-release-evidence-field-map.md`
- Agent 90-minute release review template: `docs/documents/trending/ai/agent-release-90-minute-review-template.md`
- AI Agent best practices release report chapter: `books/ai-agent-best-practices/chapters/09-deployment-monitoring.md`
- AI Agent best practices safety gate chapter: `books/ai-agent-best-practices/chapters/10-safety-ethics.md`
- Related handoff skill: `skills/skills/manual/review/handoff-receipt/`
- Related evidence boundary skill: `skills/skills/manual/review/audit-evidence-boundary/`
