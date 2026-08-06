# Trigger Examples

Use these examples to decide when `ng-review-audit-evidence-boundary` should run.

## Positive (Chinese)

- "检查这篇脱敏案例有没有编造证据、泄露路径或夸大结果。"
- "我想把一次 AI 编程审查写成公开案例，帮我区分事实、推断和不能公开的证据。"
- "这份 PR 自审里写了 tests passed 和 safe to merge，请按证据边界标出哪些说法能成立。"
- "把这份 agent final report 改成可发布版本，但不要暴露客户名、私有路径和主机信息。"
- "这篇匿名案例里有命令输出、失败原因和结果声明，帮我判断哪些必须降级为 Unverified。"
- "请给这份 AI coding audit 做公开前 redaction checklist，并保留可复核的证据形状。"
- "我只有私有日志和 issue 讨论，想写成方法样板，哪些内容应该停止发布？"
- "把这段审查结论整理成 evidence ledger：Claim、Class、Required proof、Public-safe summary。"

## Positive (English)

- "Turn this AI coding audit into an anonymous case without leaking customer details."
- "Can I publish this review note? Which claims are actually supported by evidence?"
- "Rewrite this PR audit report so it separates facts, assumptions, and next evidence needed."
- "I have command output and a private repo path; make a public-safe case study skeleton."
- "Classify every claim in this audit as Fact, Inference, Unverified, Private, or Stop before I publish it."
- "Redact this agent handoff for a portfolio post while preserving command shape and exit-status evidence."
- "This report says no regression and production risk; check whether those claims have proof or need downgrades."
- "Build an evidence ledger for this anonymous AI coding audit sample and tell me whether to Continue, Narrow, or Stop."

## Negative / Near Miss

- "What command should I run next after this failed build?" Use `ng-review-next-safe-command-ladder`.
- "Summarize this private debugging session for myself." No public or handoff boundary is present.
- "Invent a realistic customer case for my landing page." Refuse to present fiction as evidence; offer a hypothetical template instead.
- "Generate marketing copy from these general benefits." Use an offer or validation skill unless claims need evidence classification.
- "Review this code diff and suggest tests." Use PR review / next-safe-command skills first unless a publishable audit report is being prepared.

## Narrow first

- If the user says "case study" but provides no source artifact, ask for the source or produce only a method skeleton.
- If the user says "anonymous" but not what must be hidden, first identify sensitive fields: names, paths, hosts, screenshots, user data, and private URLs.
- If the user asks for a strong result claim but provides only command plans, keep the result claim as `Unverified` and request command output.
- If the task includes legal, compliance, employer, or customer approval uncertainty, mark publication as `Stop` and keep only an internal checklist.
