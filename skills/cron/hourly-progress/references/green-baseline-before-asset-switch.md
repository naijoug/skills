# Green Baseline Before Asset Switch

Use this reference after one or more runs have fixed a real engineering failure and the next handoff proposes switching from code work to a durable asset such as docs, a book card, or a reusable skill.

The goal is to prevent two opposite failure modes:

- switching too early while the project still has a cheap red check;
- staying too long in the same repo after the project is already demonstrably green.

## Decision gate

Before switching away from the engineering repo, answer these in order:

1. **Was there a real failure or risk?** Name the failing command, missing coverage, broken build, or dirty boundary that motivated the engineering work.
2. **Is the project-level baseline green now?** Prefer the repo's canonical validation command. If none exists, combine the strongest cheap checks available: lint, format, focused tests, full tests, build, and `git diff --check` for touched paths.
3. **Is there a remaining blocker that is both clear and cheap?** If yes, fix that blocker first. If no, stop polishing and switch to an asset.
4. **Can the lesson be made reusable?** If the completed work produced a repeatable rule, checklist, template, or decision table, capture it in `docs/...`, `books/...`, or `skills/skills/...`.

## Continue / switch table

| State after engineering work | Decision | Next action |
| --- | --- | --- |
| Focused test passes, but lint/build still has new failures from touched files | Continue | Fix or document the new failure before switching |
| Full validation fails on unrelated startup-dirty files | Switch carefully | Record the excluded boundary and verify touched paths narrowly |
| Canonical validation command passes | Switch | Convert the lesson into one durable asset instead of adding more low-value tests |
| No canonical command exists, but focused checks and structural checks pass | Switch with caveat | Report the missing canonical command and capture a small verification recipe |
| The next code task needs product judgment or broad refactor | Switch | Leave a handoff and choose a smaller asset-building task |

## Minimal notebook language

```text
上一段已修复 <failure>；本轮先跑 <canonical validation or check chain>，确认 <result>。由于没有剩余清晰低风险红灯，本轮把经验沉淀到 <asset path>，停止继续在同一区域机械扩展。
```

## Verification recipe

For a typical frontend/app repo, prefer this order:

```bash
npm run validate
# if no validate script exists, use the repo's equivalents:
npm run lint -- --quiet
npm run format:check
npx vitest --run
npm run build
git diff --check -- <touched-paths>
```

For a docs/books/skills asset derived from the green baseline:

```bash
git diff --check -- <asset-paths>
# plus the repo-specific build or link checker when available
```

## Stop rule

Once the baseline is green and the asset has been created, do not create another derivative artifact on the same lesson in the next run unless it serves a different execution surface. A docs tutorial, a book card, and a cron-skill reference can be useful as distinct surfaces; a fourth near-duplicate summary is usually planning comfort, not progress.
