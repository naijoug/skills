# Tech Cards Handbook: 7-Day Income Validation Sprint

## Asset Hypothesis

For self-directed programmers who collect tutorials but struggle to retain practical patterns, provide a compact "technical card handbook" that turns one concept into one reusable decision card per page, helping them review and apply patterns in under 10 minutes without rereading long tutorials; demand is proven only if target readers join a waitlist, request a sample pack, or pre-order a focused bundle.

## Score

| Dimension | Score | Notes |
| --- | ---: | --- |
| Pain intensity | 4 | Developers regularly forget details after tutorials and need quick recall during real work. The pain is frequent, though not always urgent enough to pay. |
| Buyer clarity | 3 | Clear user persona: working or learning programmers. Buyer is less clear unless narrowed to interview prep, team onboarding, or AI-era workflow learning. |
| Reach channel | 3 | Existing channels could include blog readers, GitHub, developer communities, newsletter posts, or short card previews, but the first 20-50 targets still need to be named. |
| Proof asset | 5 | `books/tech-cards-handbook/` already contains many card-like chapters across AI agent, Flutter, Swift, React, TypeScript, Rust, Go, and Python topics. |
| Delivery leverage | 4 | First version can be a PDF/sample pack or static site without building a product platform. |
| Trust fit | 4 | Existing workspace assets show breadth in docs, books, skills, and agent workflows, matching the promise of distilled learning cards. |

**Total: 23/30.** Decision: narrow before selling broadly. The strongest first angle is not "all programming cards" but a focused bundle tied to a painful job-to-be-done.

## Recommended Narrow Offer

Start with one paid-test offer:

> AI Agent Workflow Cards: 25 compact cards for programmers who want to use coding agents safely, with each card covering one failure mode, one rule of thumb, and one verification checklist.

Why this angle:

- It matches the user's AI-era programmer positioning.
- `books/tech-cards-handbook/chapters/ai-agent/` already has the seed material.
- It is easier to market than a broad multi-language reference.
- Buyers can be programmers adopting Codex, Claude Code, Cursor, or internal agents.

## Smallest Proof Vehicle

- **Vehicle:** Free sample pack plus paid pre-order test.
- **Artifact:** 5 polished AI-agent cards in one Markdown/PDF page, plus a landing section that promises the 25-card bundle.
- **Why this is enough:** It tests whether readers value the card format and the AI-agent topic before investing in a complete handbook, site, or course.

## 7-Day Sprint

### Day 1: Audience and problem

- Audience: programmers already using or evaluating coding agents.
- Pain: agent runs drift, unsafe edits, unclear handoffs, over-trust in generated code, and hard-to-repeat workflows.
- Existing workaround: scattered prompts, ad hoc notes, tool docs, and trial-and-error.
- Paid alternative: courses, team consulting, internal enablement docs, or productivity subscriptions.
- Rejection risk: readers may prefer free blog posts unless the cards are visibly more actionable.

### Day 2: Proof asset

- Create 5 sample cards from existing AI-agent chapters:
  - `books/tech-cards-handbook/chapters/ai-agent/heartbeat-workflow-prevents-drift.md`
  - `books/tech-cards-handbook/chapters/ai-agent/agent-iteration-limit-failure-exit.md`
  - `books/tech-cards-handbook/chapters/ai-agent/memory-is-context-not-source-of-truth.md`
  - `books/tech-cards-handbook/chapters/ai-agent/tool-descriptions-use-case-input.md`
  - `books/tech-cards-handbook/chapters/ai-agent/agent-model-tool-loop-boundaries.md`
- Demonstrate: one concept, one risk, one operational rule, one verification checklist per card.
- Do not promise: a complete AI course, universal agent framework, or guaranteed productivity gains.

### Day 3-4: Outreach

- Channel options:
  - Personal blog or docs site post.
  - GitHub README sample with a waitlist/pre-order CTA.
  - Developer communities discussing AI coding workflows.
  - Direct messages to 20 programmers who already use coding agents.
- Message:
  - "I am testing a 25-card AI Agent Workflow pack for programmers. Each card distills one agent failure mode and a verification checklist. Would you review 5 sample cards and tell me which one you would actually keep near your workflow?"
- Call to action:
  - Join waitlist for the full bundle.
  - Reply with the most painful agent failure mode.
  - Optional: pre-order at a small early price if the sample is useful.

### Day 5: Conversation and objection log

Track exact phrases for:

- Repeated pain: "agent lost context", "changed too much", "I cannot trust the output", "hard to hand off", "tests did not cover it".
- Objections: "I can get this from docs", "too basic", "not specific to my stack", "I need examples".
- Budget/timing clues: whether the reader would expense it, buy personally, or only use a free version.
- Missing trust signals: author experience, before/after examples, screenshots, or real workflow transcripts.

Keep a feedback evidence log before changing the bundle:

| Source | Observable fact | Inference | Confidence | Current grade | Next validation action |
| --- | --- | --- | --- | --- | --- |
| Direct reply from target programmer | Reader names a specific failed agent run and asks whether one card covers rollback/recovery | Recovery cards may be more valuable than generic “AI productivity” cards | Medium | Validate | Ask 3 more agent users whether recovery/rollback is a top-three pain |
| Social like or bookmark | Post receives likes but no comments, emails, or sample requests | The topic may be interesting but not yet painful enough to buy | Low | Record | Do not revise the offer; test a sharper CTA asking for a pain story |
| Sample-pack reviewer | Reviewer marks 2 cards as “useful” and says examples need real command transcripts | Trust depends on concrete workflow evidence, not just principles | High | Observe | Add one before/after transcript to the next sample before running a price test |

Grade definitions:

- `Record`: keep the signal, but do not change the offer.
- `Observe`: watch for repeats from matching users.
- `Validate`: ask a targeted follow-up or run a small CTA test.
- `Revise`: change the sample, landing message, or offer only after repeated or high-cost evidence.

### Day 6: Offer test

- Offer: 25-card AI Agent Workflow pack, delivered as Markdown + PDF + printable checklist.
- Early price test: low-friction pre-order or deposit; alternatively ask for a committed email plus one concrete pain story if payment infrastructure is not ready.
- Delivery scope: 25 cards, grouped into planning, tool use, verification, handoff, and recovery.
- Refund boundary: refund if fewer than 25 cards ship or if format differs from the sample.

### Day 7: Decision

- Continue if:
  - At least 10 qualified readers request the full pack, or
  - At least 3 readers offer detailed pain stories and ask for notification, or
  - At least 1-3 readers pre-order or ask for a paid team version.
- Narrow if:
  - Readers like the idea but only care about one subtopic such as safe code review, agent handoff, or test verification.
- Stop if:
  - Feedback is only polite praise, likes, or generic encouragement with no concrete workflow pain.

## Next Build Step If Validated

Create a dedicated sample artifact from the AI-agent chapter seeds, then add a short landing README with:

1. who it is for,
2. what failure modes it prevents,
3. the 5-card sample,
4. the 25-card bundle outline,
5. one demand signal CTA.

Do this before expanding more language chapters, because validation needs buyer evidence rather than more inventory.
