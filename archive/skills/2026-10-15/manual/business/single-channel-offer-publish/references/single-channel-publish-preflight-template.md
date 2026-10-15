# Single-Channel Publish Preflight Template

Use this template before any external publication of a paid offer. If a field is unknown, the decision is `Wait for authorization`; do not publish.

## Authorization packet

```text
Offer:
Channel authorization:
Posting account / identity:
Contact path:
Observation window:
Do-not-publish boundary:
```

## Candidate channel table

| Candidate channel | Authorized? | Account known? | Contact path works? | Fits offer audience? | Pick? |
| --- | --- | --- | --- | --- | --- |
| X / Twitter |  |  |  |  |  |
| LinkedIn |  |  |  |  |  |
| GitHub Discussion / Issue |  |  |  |  |  |
| Personal blog / docs site |  |  |  |  |  |
| Private DM / email |  |  |  |  |  |

## Publish preflight

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

## Decision

- `Publish` if all authorization packet fields are explicit and the preflight passes.
- `Wait for authorization` if any authorization packet field is missing.
- `Narrow` if the offer is authorized but the boundary or CTA is too broad.
- `Switch` if publishing is blocked but the reusable part can become a local asset.

## Evidence log

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

## Example: blocked unattended cron

```markdown
## Single-Channel Offer Publish Result

### Decision
- Wait for authorization

### Authorization packet
- Offer: LLM cost and observability quick audit
- Channel authorization: missing
- Posting account / identity: missing
- Contact path: missing
- Observation window: missing
- Do-not-publish boundary: do not publish, do not invent a contact path, do not expand delivery scope

### Action taken
- Converted the blocker into `makemoney/docs/offer-authorization-request-brief.md`.
- Left a next safe command: ask the user to choose one offer, one channel, one account, one contact path, and one observation window.

### Evidence
- URL or draft path: none; no external publish occurred
- Verification / preflight: local markdown and repository checks only
- Evidence log: `makemoney/runs/2026-07-08-0546.md`

### Next safe command
- Fill the authorization packet, then rerun this preflight for exactly one channel.
```
