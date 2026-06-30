# Trigger Examples

Use these examples to decide when `ng-review-audit-evidence-boundary` should run.

## Trigger

- "Turn this AI coding audit into an anonymous case without leaking customer details."
- "Can I publish this review note? Which claims are actually supported by evidence?"
- "Rewrite this PR audit report so it separates facts, assumptions, and next evidence needed."
- "I have command output and a private repo path; make a public-safe case study skeleton."
- "检查这篇脱敏案例有没有编造证据、泄露路径或夸大结果。"

## Do not trigger

- "What command should I run next after this failed build?" Use `ng-review-next-safe-command-ladder`.
- "Summarize this private debugging session for myself." No public or handoff boundary is present.
- "Invent a realistic customer case for my landing page." Refuse to present fiction as evidence; offer a hypothetical template instead.
- "Generate marketing copy from these general benefits." Use an offer or validation skill unless claims need evidence classification.

## Narrow first

- If the user says "case study" but provides no source artifact, ask for the source or produce only a method skeleton.
- If the user says "anonymous" but not what must be hidden, first identify sensitive fields: names, paths, hosts, screenshots, user data, and private URLs.
- If the user asks for a strong result claim but provides only command plans, keep the result claim as `Unverified` and request command output.
