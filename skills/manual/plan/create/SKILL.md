---
name: ng-plan-create
description: Create an implementation plan or review an existing plan against current code. Use when a written plan or plan assessment is requested.
---


# Implementation Plans

Produce a plan that can be executed and verified, or assess an existing plan
against current evidence. The canonical ID remains `ng-plan-create` for existing
installations; it now supports both creation and review.

## Choose the requested mode

- New or revised plan: read [create a plan](references/create-plan.md).
- Check an existing plan: read [review a plan](references/review-plan.md).
- Multiple reviews explicitly requested: use
  [cross-review](references/cross-review.md) after the review mode. Do not add
  agents by default.

Use the user's objective, project conventions and available source. Inspect only
the code needed to make the plan concrete. Ask for a missing target or decision
only when it cannot be inferred and materially changes the work.

Planning does not authorize implementation. Reviewing does not authorize rewriting
the plan unless requested. If the user requested planning and execution together,
complete the authorized work without introducing an extra approval stop.

## Deliver

Creation delivers the requested plan, saved under the project's convention when a
file is requested or already expected. Review delivers evidence-backed findings
and a verdict; it does not manufacture a new plan. Match depth to task complexity.

For routing maintenance, use [trigger examples](references/trigger-examples.md).
