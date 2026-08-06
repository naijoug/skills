# Trigger Examples

## Positive (Chinese)

- "我有三个 AI 工作流 / 产品想法，这周只能选一个验证，帮我做取舍。"
- "已经写了几篇 AI 编程审计文档，但还没有真实样本或反馈，下一周应该做哪个实验？"
- "把这个内容 / 工具想法变成一周内可完成的收入实验，并给出停止条件。"
- "我想本周做一个资产，但即使没人回复也必须能自用和复用。"
- "在写教程、做脚本、提小 PR、包装模板之间选一个最值得验证的方向。"
- "这个服务 offer 没有外部反馈了，帮我判断是继续、收窄、停止还是切换。"

## Positive (English)

- "I have three AI workflow/product ideas and need to pick one thing to validate this week."
- "We wrote several AI coding audit docs, but we still do not have real samples or feedback. What should the next experiment be?"
- "Turn this content/tool idea into a one-week income experiment with a clear stop condition."
- "I want to build an asset this week, but it must be useful even if nobody responds externally."
- "Choose between writing a tutorial, making a script, submitting a small PR, or packaging a template."
- "Help me decide whether to continue, narrow, stop, or switch this weekly income experiment from evidence."

## Negative / Near Miss

- "Implement this specific feature and run the existing tests."
  Use the project implementation workflow; experiment selection is not needed.

- "Brainstorm startup ideas for AI programmers."
  Ask for audience, available channels, current assets, and a one-week boundary before selecting an experiment.

- "Build a full SaaS for developer productivity."
  Shrink to a proof artifact: a checklist, local script, fixed-scope report, fixture, or manual service sample.

- "Write more posts about the same offer even though nobody has replied."
  Apply stop/switch logic unless the next post tests a different audience, pain, proof artifact, or CTA.

- "Validate demand by assuming users will like it."
  Replace assumptions with observable behavior: reply, sample request, PR review, waitlist, deposit, or repeated self-use.

## Narrow first

Use these prompts to make an overly broad request actionable before invoking the skill:

- "Who can actually see or review the artifact this week: self, readers, maintainers, a friend's team, or a paying customer?"
- "What real input already exists: a repeated pain, an old notebook entry, a failed workflow, a public issue, or a private sample you are allowed to use?"
- "What is the smallest artifact that remains useful without external feedback: doc, checklist, script, template, PR, fixture, or service sample?"
- "What observable signal will decide Continue / Narrow / Stop / Switch?"

## Example: switching from blocked outreach to local proof

```markdown
## Weekly Income Experiment Plan

### Selected experiment
Create a dry-run checklist for AI-assisted documentation changes.

### Why this over the alternatives
The service-offer path is blocked because there is no real buyer sample or publishing channel this week. A local checklist can be verified on an existing docs repo and later reused as a service proof asset.

### Artifact
- `skills/skills/manual/review/doc-change-dry-run/SKILL.md`
- One reference example with command ladder and failure response.

### Verification run
- Check metadata fields exist.
- Run the checklist against one recent doc change and record the command output.

### Distribution or handoff
- Link it from a docs article or use it as the next sample in an outreach message.

### Decision
Switch because the original outreach experiment lacks external evidence, but the verification discipline is reusable.

### Next evidence needed
One external maintainer, reader, or teammate using the checklist on their own change.
```

## Example: continuing with stronger evidence

```markdown
## Weekly Income Experiment Plan

### Selected experiment
Turn a repeated prompt workflow into a small template pack.

### Why this over the alternatives
Three recent runs used the same handoff/report pattern, so the input is real and recurring.

### Artifact
- `skills/skills/manual/growth/example-template-pack/SKILL.md`
- `references/sample-input.md`
- `references/sample-output.md`

### Verification run
Run the template on one old notebook entry and compare whether it produces the required fields without manual invention.

### Distribution or handoff
Publish the template pack in the docs catalog and ask for one concrete failure case.

### Decision
Continue if the template saves time on the next two runs; narrow if only the final-report section is reused.

### Next evidence needed
A second independent use of the template that finds a missing field or removes a repeated manual step.
```
