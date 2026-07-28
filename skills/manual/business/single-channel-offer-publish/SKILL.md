---
name: ng-business-single-channel-offer-publish
description: Use when an agent has authorization to publish a paid offer and must reduce launch risk by publishing one channel, one contact path, one observation window, with explicit do-not-publish gates
---

# Single-Channel Offer Publish

## Overview

Use this skill when a paid offer is ready enough to test, but the next action touches an external audience. The goal is to prevent an unattended agent from turning drafts into public promises without clear authorization, contact routing, and follow-up capacity.

This skill turns a publish decision into one safe slice: one offer, one channel, one account/identity, one contact path, one observation window, and one evidence log.

## When to Use

- The user explicitly authorized publishing or preparing a specific paid offer.
- The offer already has a delivery boundary, price or pricing placeholder, and a first response plan.
- There are multiple possible channels, but only one should be tested first.
- The agent needs to distinguish local drafting from external publication.
- A previous run produced a publish brief such as `makemoney/docs/offer-authorization-request-brief.md` or a preflight such as `docs/documents/trending/ai/single-channel-offer-publish-preflight.md`.

## When Not to Use

- Channel authorization, account identity, contact path, or observation window is missing.
- The task is to improve a local artifact only, with no external posting.
- The offer's delivery boundary is still unclear enough that a buyer could reasonably misunderstand what is included.
- The agent would need to invent testimonials, demand signals, private customer details, or contact information.
- The user asked for broad market research rather than a single publish action.

## Workflow

### 1. Freeze the authorization packet

Do not publish until these six lines are filled from user-provided or already recorded context:

```text
Offer:
Channel authorization:
Account / identity:
Contact path:
Observation window:
Do-not-publish boundary:
```

If any line is blank, the decision is `Wait for authorization`. Stop external actions and ask for the missing line in the final report or handoff note.

### 2. Select exactly one channel

Use this table to prevent accidental multi-channel launch:

| Candidate channel | Authorized? | Account known? | Contact path works? | Fits offer audience? | Pick? |
| --- | --- | --- | --- | --- | --- |
| X / Twitter |  |  |  |  |  |
| LinkedIn |  |  |  |  |  |
| GitHub Discussion / Issue |  |  |  |  |  |
| Personal blog / docs site |  |  |  |  |  |
| Private DM / email |  |  |  |  |  |

Pick one row only. If two rows look plausible, choose the one with the clearest contact path and smallest follow-up burden.

### 3. Run the publish preflight

Before posting, write or verify this checklist:

```markdown
## Single-Channel Publish Preflight

- Offer:
- Channel:
- Account / identity:
- Contact path:
- Observation window:
- Post draft path:
- Delivery boundary:
- What the post does not promise:
- First response template:
- Evidence log path:
```

Required checks:

- The post contains exactly one call to action.
- The contact path is visible and controlled by the user or explicitly authorized account.
- The offer boundary says what is not included.
- The observation window says when to review evidence.
- The evidence log path is ready before posting.

### 4. Publish or stop

Use this decision table:

| Decision | Use when | Next action |
| --- | --- | --- |
| `Publish` | All authorization packet fields are explicit and the preflight passes | Publish one channel, then record URL/time/contact path |
| `Wait for authorization` | Any authorization packet field is missing | Do not publish; report the exact missing fields |
| `Narrow` | The offer is authorized but the boundary or CTA is too broad | Rewrite the post to one smaller promise, then rerun preflight |
| `Switch` | Publishing is blocked but the artifact can become a local asset | Convert the reusable part into docs, book card, skill, or internal checklist |

### 5. Record the evidence immediately

After posting, create or update a run note:

```markdown
## Offer Publish Evidence

- Offer:
- Channel:
- Published URL:
- Published at:
- Account / identity:
- Contact path:
- Observation window:
- Initial post text hash or committed draft path:
- First response handling:
- Next review time:
```

Do not optimize the offer again until the observation window ends or the user gives a new instruction. During the window, only record replies, clicks, signups, or the absence of signal.

## Quality Bar

- External publication happens only after explicit `Channel authorization` and `Contact path` are known.
- The run publishes one channel, not a bundle of channels.
- The public promise is no broader than the verified delivery boundary.
- The evidence log is created before or immediately after posting.
- If blocked, the final output says `do not publish` and names the missing authorization fields.

## Output Template

```markdown
## Single-Channel Offer Publish Result

### Decision
- Publish / Wait for authorization / Narrow / Switch:

### Authorization packet
- Offer:
- Channel authorization:
- Account / identity:
- Contact path:
- Observation window:
- Do-not-publish boundary:

### Action taken
-

### Evidence
- URL or draft path:
- Verification / preflight:
- Evidence log:

### Next safe command
-
```
