# Multi-Agent Cross-Review Protocol

Running `ng-plan-review` once gives one opinion. Running it in N different coding agents gives N independent opinions you can triangulate.

## Why cross-review

- Different agents have different code-reading strengths and blind spots.
- An issue flagged by 2+ agents is very likely real.
- An issue flagged by only 1 agent still deserves a human look — it might be insight or noise.
- Agents agreeing on `good-as-is` is a stronger signal than any single agent saying so.

## Suggested agents

Install `ng-plan-review` globally and invoke it as `/ng-plan-review` in each:

- Claude Code — `~/.claude/commands/ng-plan-review.md`
- Codex / ChatGPT — `~/.codex/prompts/ng-plan-review.md`
- Amp — `~/.agents/skills/ng-plan-review/`
- Cursor / Trae — whatever prompt entry point that tool uses

See the repo root `README.md` → **Slash Commands** section for installation commands.

## Protocol

For each agent you want an opinion from:

1. Fresh chat, same prompt:
   ```
   /ng-plan-review
   review 最新代码，看看这个计划是否正确？是否需要优化？
   <absolute path to plan doc>
   ```
2. Save the review output to `docs/plans/reviews/<plan-filename>.<agent>.md`.
3. After all agents return, do a convergence pass (manual or in one more agent).

## Convergence Rules

When merging N reviews:

- **Intersection of blockers**: a finding is high-confidence if **2+ agents** flag the same item as `blocker` or `major`. Act on these first.
- **Union of majors**: a `major` finding from even one agent warrants human review.
- **Pattern-match minors**: if multiple agents independently hit the same minor concern, promote it.
- **Disagreement on verdict**: if one says `good-as-is` and another says `needs-rework`, default to the stricter verdict until the disagreement is investigated.
- **Novel findings**: a finding only one agent raised is often the most valuable — either real insight or a hallucination. Verify against code, don't dismiss.

## Output: Merged Report

```markdown
# Merged Plan Review — <plan filename>

- **Reviewed by**: claude-code, codex, amp
- **Verdict (merged)**: good-as-is | minor-tweaks | needs-rework
- **Agreement strength**: N/N agents agree | split <X/Y>

## Consensus Blockers (flagged by ≥2 agents)
- …

## Consensus Majors
- …

## Single-Agent Findings to Verify
| Agent | Finding | Verified? |
|-------|---------|-----------|
| claude | … | ☐ |
| codex  | … | ☐ |

## Disagreements
- <agent A said X, agent B said Y, resolution: ...>
```

## When not to bother

- Plan is small (single milestone, < 1 day of work) — one review is enough.
- Tight deadline — a single thorough review from the strongest available agent is better than a rushed N-way review.
- You already know the plan is wrong — fix it first, review after.
