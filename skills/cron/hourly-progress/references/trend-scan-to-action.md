# Trend Scan to Action Gate

Use this reference when an hourly progress run considers searching current AI, developer-tool, product, or market trends. The goal is to prevent news clipping and turn any scan into one concrete workspace asset or a deliberate decision to skip.

## Default stance

Do a trend scan only when at least one of these is true:

- The previous notebook names a specific research question.
- A target asset needs current facts before writing or planning.
- A product/skill/book decision would materially change based on recent tool movement.
- The workspace has no clean local slice, but a scan can produce a concrete, commit-worthy plan or backlog note.

If none are true, skip the scan and choose a local verifiable task.

## Five-step gate

1. **Name the question before searching.**
   - Good: "Which current agent orchestration patterns should shape the next `loom` roadmap slice?"
   - Weak: "Search AI news."
2. **Limit the search.**
   - Use 1-3 targeted queries, not open-ended browsing.
   - Prefer primary docs, release notes, standards discussions, or credible engineering writeups.
3. **Extract decisions, not headlines.**
   - For each useful source, write the implication: adopt, test, defer, ignore, or watch.
4. **Create exactly one artifact.**
   - Examples: a plan note, a docs section, a skill reference, an experiment checklist, or a scored opportunity table.
5. **Verify the artifact.**
   - Read it back for source links, relative paths, decision clarity, and a next action.

## Action mapping

| Finding type | Best artifact | Minimum useful output |
| --- | --- | --- |
| New coding-agent capability | `skills/skills/...` reference or `loom/docs/plans/...` note | What changed, what to test locally, success metric |
| Toolchain/API change | `docs/...` tutorial update or repo issue/plan | Version/date, migration impact, verification command |
| Market/product signal | `docs/...` opportunity note | Target user, pain, monetization hypothesis, first validation step |
| Book-worthy concept | `books/<book>/.drafts/...` draft | Thesis, outline, examples to gather, why timely |
| No actionable result | Notebook only | Queries tried, why skipped, next local fallback |

## Source note pattern

Use compact source notes inside the produced artifact when current facts matter:

```markdown
- Source: <title>, <publisher>, <date or accessed date>, <URL>
- Signal: <one-sentence factual finding>
- Decision: <adopt/test/defer/ignore/watch>
- Next check: <smallest command, file read, or experiment>
```

Do not paste long article summaries into the notebook. The notebook should record the decision and link the artifact path.

## When to stop early

Stop scanning and switch to local work if:

- Search results are mostly duplicate announcements with no implementation detail.
- The decision would require credentials, purchases, legal advice, or user preference.
- The only output would be a list of links.
- A clean, higher-confidence local task is available and the scan was optional.

## Good handoff after a scan

```text
下一次优先从 `docs/documents/programmer/indie/<note>.md` 继续：先检查该 note 的 validation table；若仍只有假设，补一个 30-minute landing-page/interview validation script；验证用 readback 检查每个机会都有 target user、pain、price test 和 next action；不要把 web search findings 追加成新闻列表。
```

## Commit boundary reminders

- If the scan produces an artifact in a dirty repo, stage only the new or edited artifact path.
- Keep `summaries/hermes/YYYY-MM-DD.md` in a separate `summaries` commit.
- In the notebook, record search queries and decisions briefly, using only relative workspace paths.
