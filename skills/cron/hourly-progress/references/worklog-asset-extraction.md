# Worklog Asset Extraction

Use this reference when recent Hermes notebook entries repeat the same decision, stop rule, verification command, or handoff pattern. The goal is to convert repeated working memory into a reusable execution surface, not to write another summary about the summary.

## Decision gate

Before creating a new docs page, book card, skill reference, script, or template from the notebook, answer these in order:

1. **Repeated signal:** Has the same judgment appeared at least twice, or is it obviously likely to recur in the next few runs?
2. **Execution surface:** Which surface will reduce the next run's decision cost: `docs/...`, `books/...`, `skills/skills/...`, or a project script/test?
3. **Clean boundary:** Can the asset be created without editing startup-dirty or unclear handoff paths?
4. **Proof path:** Is there a cheap check that proves the asset exists, is linked when needed, and contains no obvious path/format damage?
5. **Next reuse point:** Can the notebook name the exact future condition where the asset should be used first?

If any answer is weak, do not create another derivative artifact. Record `Narrow` and make the next action a real information-gathering or validation step.

## Extraction table

| Repeated notebook signal | Better asset | Minimum useful content | Proof |
| --- | --- | --- | --- |
| Same dirty-worktree boundary decision | skill reference | decision gate, stop rule, final-report language | `git diff --check` plus reference link from `SKILL.md` |
| Same docs proof command | docs checker or runbook | command, scope, fallback, adoption note | focused script/checker run |
| Same income experiment blocker | offer/evidence template | channel, sample, CTA, stop condition | real post/request or explicit blocker |
| Same handoff ambiguity | checklist/template | required fields, examples, reject cases | notebook entry follows template |
| Same project validation sequence | script or README recipe | command order, expected green result, fallback | command exits 0 on current repo |

Prefer the narrowest surface that changes future behavior. A skill reference is useful when the decision should happen inside the cron run; a docs page is useful when a human/programmer should read the pattern; a script is useful when the repeated judgment can become an exit code.

## Minimal extraction workflow

1. Read the previous 1-3 notebook entries and the latest handoff.
2. Name one repeated signal in one sentence.
3. Choose one asset surface from the extraction table.
4. Edit only the new asset and the smallest required index/entrypoint.
5. Run a focused proof for the touched paths.
6. In the notebook, record:

```text
Extracted signal: <repeated judgment or command>
Asset created: <relative path>
Proof: <command and result>
Next reuse point: <when the next run should use it>
```

## Stop rule

Stop extracting and switch to real project work or evidence collection when:

- the candidate asset only rephrases a single notebook entry;
- the next useful step is external evidence, a real user sample, or an authorized channel;
- the required entrypoint is already dirty from unknown work and no clean adjacent path exists;
- the asset would be the fourth near-duplicate surface for the same lesson without a distinct execution use.

When stopping, write: `Decision: Stop extracting; next evidence needed: <specific command, sample, channel, or repo check>`.
