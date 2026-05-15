# Handoff Quality Checklist for Hourly Progress Runs

Use this reference when writing `下一段计划`, `后续接力`, and the final response. The goal is to make the next hourly run executable without forcing it to rediscover the whole workspace state.

A good handoff is not a wish like “continue improving tests.” It is a small decision packet: where to look first, what to decide, what to change, and how to verify that the next slice is done.

## Minimum fields

Every handoff should answer these five questions:

1. **Preferred target:** Which repo/path should the next run inspect first?
2. **Next slice:** What is the smallest concrete task that can be completed in one run?
3. **Decision gate:** What condition should make the next run continue, switch, or stop?
4. **Verification:** What focused command or review standard proves the slice worked?
5. **Boundary warning:** What existing dirty state or unrelated area should not be touched?

If any answer is unknown, say what should be checked first rather than inventing certainty.

## Good handoff shape

```text
下一次优先从 `skills/skills/cron/hourly-progress/references/<file>.md` 继续：先检查 `skills` 是否干净；若干净，补 <specific reference/topic>；验证用 readback/path audit + `git diff --check`；不要触碰 `docs`/`books` 的既有改动。
```

For code work:

```text
下一次优先从 `bytebite/src/pages/<Page>.tsx` 继续：先确认 `bytebite` 干净；补 <one behavior> 的测试；验证用 `npm run test:run -- <test file>`，必要时再跑 `npm run lint -- --quiet` 和 `npm run build`。
```

For writing work:

```text
下一次优先从 `books/<project>/<chapter>.md` 继续：只补 <one section>; 验证用 readback 检查标题层级、相对路径和重复段落；若该 repo 仍有大量既有改动，则不要提交项目文件，只记录观察或改选干净 repo。
```

## Decision gates

Use explicit gates so the next run can make a fast autonomous choice:

- **Clean target repo:** proceed with the named slice.
- **Target repo dirty but path isolated:** edit only the named new file/path and stage explicitly.
- **Target repo dirty in overlapping paths:** do not edit; choose a clean repo or write a planning-only notebook entry with the blocker.
- **Verification too expensive for the hour:** shrink the slice until a focused check is available.
- **Previous handoff already completed:** pick the next adjacent asset, not a random new direction.

## Bad vs better handoffs

| Weak handoff | Better handoff |
| --- | --- |
| Continue tests. | In `bytebite`, inspect `src/pages/SearchPage.tsx`; add one page-level test for empty query and results rendering; verify with `npm run test:run -- src/pages/SearchPage.test.tsx`. |
| Improve docs. | In `docs`, if the repo is clean enough, add a 600-word section to `documents/programmer/ai-agent-workflow.md` about verification loops; read back the section and check relative links. |
| Think about monetization. | Create `docs/documents/programmer/indie/ai-tool-service-ideas.md` with a 10-item scored opportunity table; verify headings/table consistency by readback. |
| Keep working on skills. | In `skills/skills/cron/hourly-progress`, add one reference for <topic>, link it from `SKILL.md`, then run readback/path audit and `git diff --check`. |

## Handoff anti-patterns

Avoid these patterns because they make the next run waste time:

- Naming only a theme, not a file or first inspection path.
- Saying “continue” without a completion condition.
- Recommending a broad refactor without a focused test command.
- Ignoring known dirty repos and implying broad `git add .` is safe.
- Leaving multiple equal-priority options without a tie-breaker.
- Asking the next run to research news without saying what asset should be produced from it.

## Final self-check

Before committing the notebook, scan `下一段计划` and `后续接力`:

- Does it name at least one relative path?
- Can the next run start with one obvious command or file read?
- Is the task small enough for one hourly beat?
- Is there a verification command or review standard?
- Are dirty-worktree boundaries stated when relevant?

If not, rewrite the handoff before committing.
