---
name: ng-review-audit-evidence-boundary
description: Use when turning an AI coding audit, PR review, agent handoff, or anonymous case into a publishable report and you need to separate facts, private proof, safe summaries, assumptions, and stop conditions
---

# Audit Evidence Boundary

## Overview

Protect audit credibility by separating what you can prove, what you can publish, what remains unverified, and what must stop before becoming a case study.

Core principle: never make a report more convincing by inventing clients, metrics, root causes, command results, or authorization. If evidence is missing, downgrade the claim to `Unverified`, name `Next evidence needed`, or stop publication.

## When to Use

- Writing an AI coding audit report, PR review summary, or agent final report that will be shared outside the immediate workspace
- Converting a private review into an anonymous case, public sample, sales asset, or portfolio post
- Checking whether a claim has enough proof to say `Pass means`, `Fail means`, `Top risk`, or `Recommended fix`
- Redacting paths, logs, screenshots, customer details, hostnames, tokens, user data, or organization-specific vocabulary
- Deciding whether an audit asset is publishable, should become a method template, or must remain private

## When Not to Use

- The user only wants a technical verification sequence; use `ng-review-next-safe-command-ladder` first
- The task is a private debugging session with no report, handoff, or public artifact
- Publication would require legal, compliance, customer, or employer approval you do not have
- The only available material is fictional; label it as a hypothetical template, not a case

## Procedure

1. **Name the claim class before polishing prose.**
   - `Fact`: directly supported by inspected diff, command output, log, PR discussion, issue, or authorization note.
   - `Inference`: a reasonable conclusion from facts, but not directly observed.
   - `Unverified`: plausible but missing proof.
   - `Private`: supported by proof that cannot be published safely.
   - `Stop`: cannot be shared because authorization, scope, or redaction is unresolved.

2. **Build an evidence ledger.**
   - Capture the source, required proof, publishable safe summary, missing-proof downgrade, and owner for each important claim.
   - Keep private proof out of public text; use it only to decide whether the public summary is honest.

3. **Check scope and authorization.**
   - Write `Included`, `Excluded`, time range, command range, and repository or data boundaries.
   - If authorization is not explicit, publish only a method template or checklist.

4. **Redact without destroying verifiability.**
   - Replace private names with roles and domains, not generic drama.
   - Preserve evidence shape: command name, exit code class, error type, risk category, and next action.
   - Remove absolute paths, tokens, hosts, user data, customer names, screenshots with identities, and internal ticket numbers.

5. **Downgrade unsupported claims.**
   - Missing metric: write `no conversion metric yet`, not `improved conversion`.
   - Missing command result: write `Next evidence needed`, not `tests pass`.
   - Missing root-cause proof: write `suspected cause`, not `caused by`.
   - Missing customer permission: write `method sample`, not `client case`.

6. **Decide publish / narrow / stop.**
   - Publish only if the public-safe summary still preserves at least one concrete piece of evidence.
   - Narrow if the evidence supports only one lesson, command, risk, or checklist item.
   - Stop if redaction removes all proof or approval is missing.

## Evidence Ledger Template

```markdown
## Audit Evidence Boundary

### Scope
- Artifact:
- Audience:
- Included:
- Excluded:
- Authorization / source:

### Evidence ledger
| Claim | Class | Required proof | Public-safe summary | If missing | Owner / next action |
| --- | --- | --- | --- | --- | --- |
|  | Fact / Inference / Unverified / Private / Stop |  |  |  |  |

### Redaction checklist
- [ ] Removed customer / organization names
- [ ] Removed private paths, hosts, URLs, tokens, user data, screenshots, ticket IDs
- [ ] Replaced absolute paths with relative or generalized paths
- [ ] Preserved command shape, risk category, exit status, or reviewer quote where safe
- [ ] Marked claims that lost proof during redaction as `Unverified`

### Decision
- Continue:
- Narrow:
- Stop:
```

## Claim Downgrade Rules

| Tempting claim | Required proof | Safe downgrade when missing |
| --- | --- | --- |
| `客户通过审查减少了返工` | customer-approved result, metric, or quote | `目标是减少返工；尚无结果数据` |
| `root cause was state race` | failing test, trace, minimal reproduction, or maintainer confirmation | `state race is the top suspected risk` |
| `tests passed` | command, exit code, relevant output, environment | `recommended next command is ...` |
| `production risk` | production path, incident, or deployment evidence | `could affect production-like flow if this path is deployed` |
| `匿名客户案例` | source artifact plus permission to publish a redacted version | `anonymous method skeleton` or `sample report` |

## Quality Checklist

- Every public claim maps to a fact, inference, unverified item, private proof, or stop condition
- The public version does not contain absolute paths, credentials, private URLs, user data, or unauthorized identities
- The redacted version still has at least one concrete evidence shape: command, exit code, diff type, reviewer quote, or observed failure class
- `Pass means` / `Fail means` statements only appear when command results or equivalent evidence exist
- The final recommendation says whether to `Continue`, `Narrow`, or `Stop`, not just “looks good”
- The decision can be summarized as `Continue / Narrow / Stop` for handoff consistency

## References

- Trigger examples: `references/trigger-examples.md`
- Anonymous case evidence example: `references/anonymous-case-evidence-example.md`
- Related command ladder skill: `skills/skills/manual/review/next-safe-command-ladder/`
- Public anonymous case skeleton: `docs/documents/trending/ai/anonymous-ai-coding-audit-case-skeleton.md`
