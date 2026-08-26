---
name: ng-design-inline-command-palette-minimum
description: Use when a product already has a search field and you want to add command-palette value without introducing a full overlay, fake commands, or unverified action routing
---

# Inline Command Palette Minimum

## Overview

Use this skill to turn an existing search box into a small, verifiable command entry point. The goal is not to imitate a full command palette. The goal is to expose a few real actions where the user already focuses, while preserving the original search task and product information architecture.

Core rule: add command rows only after every row maps to an existing state transition, existing adapter capability, or explicitly disabled reason that can be tested.

## When to Use

- A product already has search, shortcut focus, or a quick filter field.
- Users need a few high-frequency actions near the search context.
- A full overlay would be visually or architecturally premature.
- Some tempting actions are not safe yet because they need confirmation, target selection, runtime capability, credentials, or async status design.
- You can verify the behavior with pure command registry tests plus a small UI/DOM proof.

## When Not to Use

- The requested feature is primarily global navigation across many app domains.
- Commands require complex arguments, destructive side effects, or multi-step confirmation.
- The product has no trustworthy execution path for the proposed actions.
- You would need to change the placeholder to promise commands before any real command exists.
- Accessibility, keyboard behavior, or status feedback cannot be tested in the current slice.

## Procedure

### 1. Start with a no-fake-command boundary

Write a short decision record before coding:

```markdown
## Minimal command set

| Command | Stable keywords | Real action | Available when | Disabled reason | Verification |
| --- | --- | --- | --- | --- | --- |
| Search existing content | search, find | focus/select search | always | - | focus helper test |
```

Rules for the table:

- A command that cannot name a real action stays out.
- A command that is runtime-gated can appear only with a stable disabled reason.
- A command that needs confirmation or target selection stays in its existing UI until that flow is designed.

### 2. Keep search as the default task

Do not replace the search box with an overlay first. Add an explicit command trigger such as `>`:

- normal query: filter/search exactly as before;
- command query: display inline command rows under the search field;
- empty command query: show only the top 3-4 high-frequency rows;
- filtered command query: match stable keywords and allow lower-frequency commands to be discovered.

This keeps `⌘K` / `Ctrl+K` as "focus search" instead of prematurely becoming a global command surface.

### 3. Build a pure command registry

Represent commands as data before connecting React/UI state:

```ts
interface CommandRow {
  id: string;
  title: string;
  hint: string;
  keywords: string[];
  disabledReason?: string;
}
```

The registry should know availability and stable keywords. It should not own UI state, route changes, or async side effects.

Keyword rules:

- Match stable ids and explicit keywords.
- Do not match dynamic selected item titles.
- Do not match descriptive hints or runtime warning copy.
- New aliases require tests.

### 4. Make disabled rows selectable

Use `aria-disabled` instead of native `disabled` for command rows. Let disabled rows enter the same execution layer as enabled rows so the nearby live region can explain why the command is unavailable.

Recommended feedback split:

- row hint: short reason, such as `Select a skill first`;
- global status: same short operational reason;
- command-local live region: explicit execution feedback, such as `Command unavailable: Select a skill first`.

### 5. Define the keyboard contract before visual polish

Minimum keyboard behavior:

- `ArrowDown` / `ArrowUp`: move active row among visible rows;
- `Enter`: execute the active row, including disabled rows for feedback;
- `Escape`: clear command mode and remove rows;
- typing: clear command-local status;
- active row: expose `aria-activedescendant` and `aria-selected`.

Only after this works should you tune row height, padding, shadow, or active indicators.

### 6. Add status lifecycle for enabled commands

If enabled commands clear the query and remove rows, the user still needs visible feedback. For async or fallback actions, add explicit lifecycle text:

- pending: `Copying path: ...`, `Exporting bundle...`;
- success: `Copied ...`, `Downloaded ...`, `Opened ... panel.`;
- fallback: name the fallback, not just `Done`.

Avoid adding high-risk commands until their pending, success, failure, and fallback messages are designed.

## Verification Checklist

Use the smallest useful proof stack:

1. **Registry unit tests**
   - command order;
   - selected vs unselected availability;
   - runtime-gated disabled reason;
   - keyword filtering and non-matching dynamic titles/hints.
2. **Static render test**
   - rows appear only for explicit trigger;
   - `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-selected`, `aria-disabled` are present as expected;
   - local status uses a live region.
3. **DOM interaction proof**
   - click disabled row and see local unavailable feedback;
   - `ArrowDown` + `Enter` executes the active row;
   - `Escape` removes rows from the DOM.
4. **Project checks**
   - run UI tests/typecheck or the project equivalent;
   - run whitespace/diff checks on changed paths.

## Common Pitfalls

- Changing the placeholder to `Search or run a command...` before commands exist.
- Matching command text against dynamic item titles, which creates surprising aliases.
- Hiding disabled commands entirely, making runtime capability invisible.
- Using native `disabled` and losing the ability to explain why the command failed.
- Turning four inline rows into a large pseudo-overlay that blocks the underlying list.
- Adding destructive commands before confirmation and status design exist.

## Output Template

```markdown
## Inline Command Palette Minimum

### Boundary
- Existing search behavior preserved:
- Explicit trigger:
- Not implementing yet:

### Commands
| Command | Action | Availability | Disabled reason |
| --- | --- | --- | --- |

### Accessibility and feedback
- Keyboard contract:
- Local live region:
- Global status:

### Verification
- Registry tests:
- Static render proof:
- DOM interaction proof:
- Type/build/check command:

### Next safe slice
-
```

## Related Assets

- `skills/apps/docs/plans/2026-08-25-skills-manager-command-palette-minimum.md`
