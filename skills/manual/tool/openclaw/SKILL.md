---
name: ng-tool-openclaw
description: Use when managing the local OpenClaw gateway service — starting, stopping, checking status, viewing logs, running diagnostics, or configuring channels and agents
---

# OpenClaw Service Manager

Manage the local OpenClaw gateway — a self-hosted bridge connecting chat apps (WhatsApp, Telegram, Discord, iMessage) to AI coding agents.

## Quick Reference

| Action | Command |
|--------|---------|
| Overall status | `openclaw status` |
| Gateway status | `openclaw gateway status` |
| Start (foreground) | `openclaw gateway --port 18789` |
| Start (daemon) | `openclaw onboard --install-daemon` |
| Tail logs | `openclaw logs --follow` |
| Diagnose | `openclaw doctor` |
| Auto-fix | `openclaw doctor --fix` |
| Channel status | `openclaw channels status --probe` |
| Channel login | `openclaw channels login` |
| Config get/set/unset | `openclaw config get|set|unset <path> [<value>]` |
| Interactive config | `openclaw configure` |
| Dashboard | `openclaw dashboard` (→ `http://127.0.0.1:18789/`) |
| Reinstall daemon | `openclaw gateway install --force` |

Config file: `~/.openclaw/openclaw.json` (JSON5, hot-reloads for most settings).
Env overrides: `OPENCLAW_HOME`, `OPENCLAW_STATE_DIR`, `OPENCLAW_CONFIG_PATH`.

## Intent Mapping

Parse the user's request (Chinese or English) and run the matching command from Quick Reference. If no specific intent is detected, default to **status** (run all three status commands and summarize).

| Intent | Keywords | Action |
|--------|----------|--------|
| start | `start` `启动` `开启` `运行` `run` | Start gateway (daemon if user wants persistence, otherwise foreground) |
| stop | `stop` `停止` `关闭` `kill` | Stop gateway process |
| restart | `restart` `重启` | Stop → start, verify with status |
| status | `status` `状态` `check` `检查` | Run all three status commands, present unified summary |
| logs | `logs` `日志` `log` | `openclaw logs --follow`, last ~50 lines, grep on request |
| doctor | `doctor` `诊断` `diagnose` `fix` `修复` | `openclaw doctor [--fix]` |
| config | `config` `配置` `设置` `settings` | `openclaw config get/set/unset` or `openclaw configure` |
| dashboard | `dashboard` `面板` `控制台` `ui` `web` | `openclaw dashboard` |
| channels | `channels` `频道` `通道` `渠道` | `openclaw channels login/status` |
| info | `info` `信息` `version` `版本` | `openclaw --version` + config summary |

## Troubleshooting Ladder

`status` → `gateway status` → `logs --follow` → `doctor` → `doctor --fix` → `gateway install --force`.

Common issues:

- **EADDRINUSE on 18789** — another process holds the port; change port or kill conflict.
- **HTTP 429** — rate limiting; check `openclaw models status`.
- **No replies** — check `openclaw pairing list --channel <channel>` and allowlist config.
- **Dashboard auth errors** — rotate credentials, verify `gateway.mode="local"`.

## Quality Checklist

- Always verify after start/stop/restart with `openclaw gateway status`
- For diagnostic complaints, run `doctor` before `--fix` so the user sees what changed
- Never modify `openclaw.json` directly — go through `config set` so hot-reload triggers

## Example Triggers

- "启动 openclaw"
- "openclaw 状态怎么样？"
- "tail openclaw logs"
- "openclaw doctor --fix"
- "set openclaw gateway port to 18790"
