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

0. **Freeze the workspace evidence boundary.**
   - Run the narrowest status command for the repo or release package before interpreting evaluation results.
   - If release files, prompts, policies, generated artifacts, or handoff notes are already dirty and unowned, do not fold them into the gate. Use `block` for production release or `warn` only for a smaller read-only/demo scope.
   - For a large pre-existing dirty diff, require a handoff receipt with diff size, sampled shape, companion paths, and `Continue / Narrow / Stop / Switch` before trusting the changed files as release evidence.

1. **Name the release object.**
   - Record `release_id`, agent version, model version, prompt hash, tool schema version, retrieval/index version, and policy version.
   - If any version cannot be identified, default to `block` for production and allow only local/demo review.

2. **Collect evaluation-side evidence.**
   - Golden Tasks version and result summary.
   - Failed case IDs with owner and next action.
   - Safety regression suite version.
   - Safe trace links for representative success, failure, and approval paths.
   - Decision record refs (`decision_record_refs`) for the ADRs behind this release's model, framework, tool, and rollout choices; a record whose status is not discernible (`accepted` / `trial` / `rejected`) or is `rejected` cannot back this release.
   - Sample coverage (`eval_sample_coverage`) mapping decision-card fields to Golden Tasks / security samples: `covered_decision_refs`, `covered_fields`, `missing_samples`, and `coverage_decision`.

3. **Collect release-side controls.**
   - Rollout scope: tenant group, traffic percent, allowed tools, blocked tools, read/write mode.
   - Approval layer inside the rollout scope: `rollout_scope.approval_required_tools`, the tools that may execute only after human approval. Keep it as an explicit empty array when none apply: an empty array declares "approval layer checked, nothing pending", while omitting the field cannot be distinguished from "forgot to check". Never fold an approval-required tool into `allowed_tools` to pass it silently.
   - Rollback switches: version switch, capability switch, traffic switch, and human owner.
   - Monitoring and alert owner for the first rollout window.

4. **Collect safety-side gates.**
   - Forbidden tool violations, sensitive trace leaks, missing approval binding, missing audit events, and rollback rehearsal result.
   - Treat high-risk write tools without approval binding, audit events, or rollback as `block`.

5. **Decide `pass`, `warn`, or `block`.**
   - `pass`: all hard gates are zero, evidence is traceable, rollout and rollback are scoped.
   - `warn`: read-only or low-risk scope is supported, but some tools, tenants, traffic, or write actions remain disabled.
   - `block`: release object is unreproducible, a forbidden action occurred, sensitive data leaked, approval/audit evidence is missing for enabled write tools, or rollback cannot be executed.
   - Sample coverage gap rule (two-dimensional, from the source chapters): if `missing_samples` touches write permissions, cross-tenant access, memory writes, approval parameter binding, kill switch, or incident-replay samples, the gate cannot be above `warn`. If the affected capability is still enabled in this rollout, it is `block`; only if it is already disabled in `rollout_scope.blocked_tools` or the disabled scope may the release enter read-only or manual-approval gray release. A missing `eval_sample_coverage` field is never a default pass: treat it as "decision-card fields not yet mapped to samples", which caps the gate at `warn`.

6. **For external publication, apply the project's actual release contract.**
   - Identify the authorized action, release version, destination and applicable project gates. Existing user authorization or an approved project workflow is sufficient within its scope; do not require a second approval or a particular note filename or phrase.
   - Missing authority blocks only the affected external action. Complete authorized local preparation and verification while any required decision is pending.
   - If this task creates or changes an automated publish guard, test the applicable allow/deny cases in an isolated fixture. Assert the intended rejection reason and absence of forbidden side effects, not merely a non-zero exit.
   - A project-specific note parser or fixture matrix is required only when that project uses it. See the conditional example in [quick reference](references/quick-reference.md); do not introduce a checker solely to satisfy this skill.

7. **Write the restriction, not just the decision.**
   - For `warn`, list exactly what remains disabled and what proof would upgrade it.
   - For every `warn`, record the runtime escalation line `block_conditions`: when any listed condition occurs, the on-call first narrows to read-only or rolls back via `rollback`, then backfills the trigger into `block_reasons` before discussing re-review. A `warn` without an escalation line is indefinite risk acceptance, not a gate.
   - Record `next_review.tasks` so the restriction converts into the next entry point: which evidence upgrades the gate and which suite rerun is required.
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
| Workspace boundary | `status_snapshot`, `owned_release_paths`, `avoided_dirty_paths` | clean / owned / unowned-dirty |  |  |
| Golden Tasks | `golden_tasks_version`, `evaluation_summary` | present / missing / failed |  |  |
| Decision records | `decision_record_refs` | present / status-unclear / rejected-entry |  |  |
| Sample coverage | `eval_sample_coverage` (`covered_decision_refs`, `covered_fields`, `missing_samples`, `coverage_decision`) | full / gaps / unmapped |  |  |
| Failed cases | `evidence.failed_case_ids` | present / none / unresolved |  |  |
| Safe traces | `evidence.safe_trace_links` | present / missing / redaction needed |  |  |
| Approval binding | `evidence.approval_binding_cases` | present / missing / partial |  |  |
| Approval layer scope | `rollout_scope.approval_required_tools` | explicit-empty / pending-list / omitted |  |  |
| Audit events | `evidence.audit_event_ids` | present / missing |  |  |
| Rollback | `rollback.version_switch`, `capability_switch`, `traffic_switch` | rehearsed / documented / missing |  |  |

### Gate decision
- Decision: `pass` / `warn` / `block`
- Allowed scope:
- Disabled scope:
- Reason:
- Runtime escalation line (`block_conditions`, required for `warn`):
- Next review tasks (`next_review.tasks`):
- Re-entry condition:
- Next safe command/check:
```

## Decision Cheatsheet

| Signal | Default decision | Scope rule |
| --- | --- | --- |
| All hard gates zero, rollback rehearsed, safe traces present | `pass` | allow planned canary only; still monitor |
| Golden Tasks pass but write-tool approval evidence is partial | `warn` | allow read-only rollout; keep write tools disabled; keep `approval_required_tools` explicit (empty array when none) so approval gray release is not misread as automatic rollout |
| Failed cases are unresolved but not on enabled path | `warn` | restrict affected tenants, tools, or intents; write `block_conditions` as the runtime escalation line |
| `warn` has no runtime escalation line (`block_conditions`) | not a valid `warn` | an escalation-free `warn` is indefinite risk acceptance; add the conditions and the rollback path before handing off |
| Release object lacks prompt/model/tool versions | `block` | cannot release because result is not reproducible |
| Release package has unowned dirty prompts, policies, generated artifacts, or handoff files | `block` | production gate cannot rely on mixed-ownership evidence; first write/receive a handoff receipt or narrow to demo/read-only review |
| External action lacks authority or fails a project-required release gate | `block` for that action | name the missing authority or failed gate; finish independent local work |
| A publish guard being introduced or changed has no meaningful rejection test | `warn` or `block` for the affected path | test the expected rejection and absence of forbidden side effects in isolation |
| Forbidden tool call, sensitive trace leak, or missing audit for enabled write tool | `block` | fix, rerun safety suite, then re-enter review |
| Rollback switch missing or owner unknown | `warn` or `block` | `block` for external traffic or high-risk tools |

## Quality Checklist

- The decision names the release object and versions, not just “current agent”
- The workspace boundary names clean, owned, and avoided dirty release paths before claiming a gate decision
- Every `pass` has Golden Tasks, safe traces, audit events, and rollback evidence where relevant
- Every gate above `block` names the `eval_sample_coverage` outcome, and every high-risk sample gap states whether the affected capability is disabled or still enabled
- Every `warn` has explicit disabled tools, tenants, traffic, or capabilities, a runtime escalation line (`block_conditions`), and next review tasks that name the upgrading evidence
- Every `block` has a concrete re-entry condition and first safe check
- The report uses relative paths and redacted evidence links; no local absolute paths, secrets, or customer data
- The final handoff can be copied into a release report without adding undocumented claims
- External actions follow existing authorization and applicable project gates; missing template wording alone does not block release
- Changed guard helpers prove the intended rejection and absence of forbidden side effects using isolated fixtures

## Quick Reference

- For a release review meeting or a project with an automated publish guard: [quick reference](references/quick-reference.md).

## Examples

- For output calibration: [filled examples](references/filled-example.md).

## References

- Agent release evidence field map: `docs/documents/trending/ai/agent-release-evidence-field-map.md`
- Agent 90-minute release review template: `docs/documents/trending/ai/agent-release-90-minute-review-template.md`
- AI Agent best practices release report chapter: `books/ai-agent-best-practices/chapters/09-deployment-monitoring.md`
- AI Agent best practices safety gate chapter: `books/ai-agent-best-practices/chapters/10-safety-ethics.md`
- Related handoff skill: `ng-review-handoff-receipt` (if installed) (use its Large Dirty Diff Intake before trusting large pre-existing release diffs)
- Related evidence boundary skill: `ng-review-audit-evidence-boundary` (if installed)
