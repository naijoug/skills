---
name: ng-review-deployed-is-not-public-go
description: Review whether deployment evidence supports a claimed public launch or GO decision, separating endpoint availability, verified behavior and existing launch authorization. Use for launch-status reviews, not routine deployment implementation.
---

# Deployed Is Not Public GO

Produce a launch-status assessment whose claims match the observed deployment,
verification results and authorized audience. A working URL proves reachability
at the time checked; it does not establish that the intended release works or
that public traffic or an announcement has been authorized.

## Establish the release boundary

Use the user's request, existing authorization and the project's actual release
contract to identify the version, environment, destination and intended audience.
A review request authorizes inspection; it does not by itself request a deploy,
traffic change or announcement. Ask only for a missing decision that changes the
requested action, and continue independent authorized preparation.

Distinguish three kinds of evidence:

| Claim | Supporting evidence | What it does not establish |
| --- | --- | --- |
| Deployed or reachable | Deployment result, version identity, endpoint observation and check time | Correct user flows, launch approval or public readiness |
| Verified for a scope | Checks against that release/environment, with outcomes and untested paths | Behavior outside the tested audience, data or traffic scope |
| Authorized for public launch | Existing user instruction or applicable project approval covering this release, destination and audience | Successful execution or verification of that launch |

Evidence may support one row without supporting the others. An access-controlled
preview, staging endpoint or internal canary remains limited to its observed and
authorized scope. An externally reachable endpoint alone is not a GO decision;
if its exposure exceeds the requested scope, report the discrepancy without
changing access controls unless that correction is authorized.

## Assess the requested claim

- Match results to the claimed release and environment. Mark stale results,
  unknown versions and untested user flows as gaps instead of treating nearby
  logs or a different deployment's pass as proof.
- Use the project's required checks and rollback criteria. A rollback note shows
  a documented plan; distinguish it from a rollback that was exercised. Do not
  invent a mandatory note filename, approval phrase or checker for every project.
- Accept existing authorization within its scope. When public launch was already
  authorized and the applicable checks pass, do not require a second approval
  merely because deployment and public launch are separate concepts.
- If authority or evidence is missing, limit only the affected claim or action.
  Complete the review and any authorized local fixes or verification. Do not
  silently expand a preview approval into public traffic or external messaging.

## Deliver the assessment

State what is deployed, what was verified, the authorized audience and whether
the evidence supports the requested GO claim. Link the relevant evidence and
name any remaining gap together with the specific check or decision needed.
Distinguish an approved next action from an action actually performed. A
review-only task is complete when that assessment is delivered.

For routing maintenance, see [trigger examples](references/trigger-examples.md).
