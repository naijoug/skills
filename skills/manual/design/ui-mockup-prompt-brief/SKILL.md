---
name: ng-design-ui-mockup-prompt-brief
description: Use when turning an existing product screen into a high-fidelity UI mockup prompt that preserves real workflow context while exploring one focused design direction
---

# UI Mockup Prompt Brief

## Overview

Use this skill to turn an existing application screen, product concept, or rough feature idea into a precise image-generation or design-agent brief. The goal is to get mockups that are useful for product decisions instead of generic dribbble-style screens.

A good brief does three things at once:

1. Anchors the model to the real product, content, and user workflow.
2. Chooses one design direction and one hero task.
3. States layout, content, visual system, constraints, and avoid-list tightly enough that outputs can be compared.

## When to Use

- You have a current screenshot or existing UI and want one or more redesign directions.
- The desired output is a high-fidelity desktop or web app mockup, not code.
- You need to compare alternatives such as reading-first, command-first, or library-browsing-first layouts.
- The product has real entities, labels, paths, dates, states, or actions that should appear in the mockup.
- You want a reusable prompt that another agent or image tool can rerun.

## When Not to Use

- The task is to implement UI code; use a design-to-code or frontend implementation workflow instead.
- The product workflow is unknown and the agent would need to invent core features.
- The output requires private customer data, logos, screenshots, or brand assets that are not provided or authorized.
- You need a broad moodboard; this skill is for one focused screen per prompt.
- You cannot verify whether generated content preserves the required workflow.

## Procedure

### 1. Freeze the product and input reference

Write the first lines as hard context, not inspiration:

```text
Use case:
Asset type:
Input image / existing screen:
Product identity:
Core workflow to preserve:
Target dimensions:
No browser chrome / device frame / presentation mockup unless explicitly requested.
```

If there is no screenshot, replace `Input image` with a short current-state description and list the real content that must be preserved.

### 2. Pick one direction and one hero task

Name the direction in the request so outputs are comparable:

```text
Primary request: Create a production-quality redesign direction named "<Direction Name>".
Hero task: Make <discovery / reading / command search / setup / review> the dominant task.
User goal: <one sentence describing what the user must accomplish on this screen>.
```

Avoid asking for "modern", "beautiful", and "professional" without a direction. Better directions are concrete, for example:

- `Library Studio`: approachable browsing and organization.
- `Command Workspace`: keyboard-first search and rapid switching.
- `Calm Reference`: reading and understanding the selected item.

### 3. Specify layout as a composition, not decoration

Describe the screen structure in measurable terms:

```text
Layout:
- Left navigation: <width and purpose>.
- Main region: <search / list / editor / reading canvas>.
- Detail region: <width or proportion and selected item>.
- Primary action: <exact label>.
- Secondary actions: <where they live and how quiet they are>.
```

State negative layout constraints when they matter: no permanent import form, no dashboard metrics, no masonry grid, no cards inside cards, no oversized hero, no equal-weight action bars.

### 4. Provide real content inventory

Force the output to stay grounded by giving exact copy, states, dates, and nearby records:

```text
Content:
- Product name:
- Count / state:
- Selected item:
- Status:
- Category / source:
- Path or metadata:
- Date anchor:
- Nearby rows:
- Tabs or secondary sections:
```

Use a date anchor when relative dates or updated-at labels appear. This prevents chronologically impossible UI copy.

### 5. Define visual system and hierarchy

Do not just name a style. Specify color role, type use, density, and hierarchy:

```text
Visual system:
- Theme:
- Canvas / surface colors:
- Text and accent colors:
- Success / warning colors:
- Typography:
- Spacing and radius:
- Borders and elevation:

Hierarchy:
- Dominant element:
- Secondary element:
- Tertiary element:
- What should remain visually quiet:
```

The visual system should support the hero task. For a reading-first direction, make typography and document width explicit. For a command-first direction, make focus rings, row density, and shortcut cues explicit.

### 6. Add constraints and avoid-list

End with explicit failure prevention:

```text
Constraints:
- One focused primary screen.
- No clipped content.
- No fake metrics or invented analytics.
- No watermark.
- No marketing illustration unless requested.

Avoid:
- <style traps>
- <workflow traps>
- <content traps>
- <visual hierarchy traps>
```

The avoid-list should name problems seen in previous generations, such as repeated runtime notices, all-monospace typography, tiny gray copy, duplicated status indicators, or too many equal-weight toolbar buttons.

## Brief Template

```text
Use case: ui-mockup
Asset type: high-fidelity <desktop/web/mobile> application redesign
Input image: <existing screen or "no screenshot; use the content inventory below">
Product identity: <product name and domain>
Primary request: Create a production-quality redesign direction named "<Direction Name>". Make <hero task> the hero task.
Target dimensions: exactly <width> x <height> <surface>. No browser chrome, device frame, wallpaper, or presentation mockup.
User goal: <one sentence>.

Layout: <navigation width and role>. <main composition>. <detail/inspector/reading region>. <primary action>. <where secondary actions live>.

Content: <exact labels, counts, selected item, states, metadata, nearby rows, tabs, date anchor>.

Visual system: <theme, palette roles, typography, spacing, density, border/elevation rules>.

Hierarchy: <what leads, what supports, what stays quiet>.

Constraints: <hard output constraints>.
Avoid: <known failure modes>.
```

## Decision Table

| Situation | Direction choice | Prompt emphasis |
| --- | --- | --- |
| Users browse many items and compare states | Library / catalog direction | Search, grouped list, selected preview, category/source filters |
| Users jump quickly between commands or records | Command workspace direction | Prominent command search, dense result list, keyboard focus, shortcut hints |
| Users need to understand one selected artifact | Reference / reading direction | Reading canvas, document width, metadata, quiet tabs, one primary action |
| Current UI feels noisy | Simplification direction | Remove duplicated notices, merge secondary actions, reduce equal-weight controls |
| Generated mocks keep inventing features | Grounded redesign direction | Exact content inventory, forbidden fake metrics, preserve workflow line |

## Quality Gate

Before accepting a generated mockup or handing off the prompt, check:

- The target dimensions and surface are respected.
- The selected product, item names, status labels, paths, and dates match the brief.
- The hero task is visually dominant.
- There is exactly one primary action unless the workflow requires otherwise.
- Secondary actions are present but quiet.
- The mockup does not invent dashboards, fake analytics, marketing imagery, or unrelated product areas.
- The screenshot can be explained as an evolution of the real current UI.

## Handoff Block

```markdown
- Direction name:
- Input reference:
- Hero task:
- Required content preserved:
- Main constraints:
- Avoid-list:
- Generated outputs reviewed:
- Decision: Continue / Revise prompt / Discard direction
```

## Related References

- Prompt source examples can be kept as temporary generation artifacts, but only promote them into repo assets when the design direction has a clear product decision or implementation use.
- Pair with review skills when the mockup will become code, especially `skills/manual/review/agent-release-gate/SKILL.md` for external release boundaries and `skills/manual/review/content-only-docs-proof-gate/SKILL.md` for documentation-only handoffs.
