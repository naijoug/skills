# No-Link Validation Before Launch

Use this reference when a cron run is tempted to keep writing launch assets for a product, newsletter, course, service, or paid content package, but the workspace still lacks a real payment link, signup form, sample page, channel authorization, or human reply path.

The goal is to stop two bad defaults:

- pretending a product can launch when there is no real link or authorized channel;
- producing another adjacent template instead of collecting real demand evidence.

## Decision gate

Before creating more launch material, answer these in order:

1. **Is there a real external entry point?** Name the payment link, signup form, sample page, or contact path. If it is still a placeholder such as `[试读链接]` or `[留资链接]`, treat the run as no-link validation.
2. **Is the channel authorized and replyable?** The agent needs a channel, account identity, contact path, and observation window before it can recommend external posting. Without them, do not publish or imply publishing.
3. **Is the validation chain already executable?** If there is already a question post, DM script, sample-reply script, metrics table, and decision template, stop adding near-duplicate launch docs.
4. **Can this run collect or prepare evidence instead?** Prefer one action that produces evidence shape: placeholder inventory, readiness check, single-channel manual checklist, metrics update, or a narrower offer.

## Continue / stop table

| State | Decision | Next action |
| --- | --- | --- |
| Real link and channel authorization are available | Continue launch prep | Replace placeholders, run link/readiness checks, then publish only within the authorized scope |
| No real link, but no executable validation path exists | Create one smallest runbook | Prepare one question post, DM script, metrics table, and Continue / Narrow / Stop rule |
| No real link, and validation path already exists | Stop writing launch docs | Execute the runbook manually or wait for user-provided link/channel data |
| Placeholder count is unknown | Prepare evidence | Add or run a readiness check that lists placeholder files and counts |
| Only likes/views are available | Narrow evidence | Ask for concrete problems, sample requests, price questions, or replyable contacts before continuing |

## Minimal notebook language

```text
当前仍缺真实 <payment/signup/sample/contact> 链接或渠道授权；本轮不外发、不伪造购买入口。由于 <validation path/readiness check> 已存在/缺失，本轮选择 <execute/readiness/template>，下一段第一步是 <manual validation or link replacement>。
```

## Verification recipe

For a no-link validation asset, verify three things:

```bash
git diff --check -- <touched-paths>
# structural proof: the runbook/check mentions no fake payment, no unauthorized posting, metrics, and Continue/Narrow/Stop
# repo-specific check when available, e.g. ./scripts/check.sh or markdown/link proof
```

If a readiness script exists, it should print at least:

```text
mode: no-link validation mode
placeholder links: <count>
placeholder files:
- <relative-path>: <count>
```

## Stop rule

After a no-link runbook, metrics table, Day 7 decision template, and readiness check exist, do not create Day 8, Vol.011, or another adjacent launch document. The next useful work is either real link replacement, authorized single-channel validation, or switching to a different local, verifiable asset.
