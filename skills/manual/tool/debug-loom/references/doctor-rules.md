# Doctor Rules

## Output

`doctor` should produce a concise Markdown summary:

```text
.var/debug-loom/current/summary.md
```

Recommended sections:

- Run profile / matrix
- Service status
- Fatal findings
- Errors
- Warnings
- Noise
- Suggested next checks

## Finding Levels

### Fatal

Use for conditions that prevent the debug loop from working:

- process exited unexpectedly
- health check failed
- crash report after run start
- Electron native crash
- missing required native addon
- port conflict that prevents service startup
- server boot failure

Patterns:

```text
App threw an error during load
Cannot find module
EXC_BAD_ACCESS
napi_is_detached_arraybuffer
listen EADDRINUSE
panic:
fatal error
```

### Error

Use for broken features while the app may still run:

```text
RTM connect failed
UNHANDLED REJECTION
joinChannel failed
startLocalVideoTranscoder failed
fetch failed
HTTP 500
```

### Warning

Use for risky but non-blocking issues:

```text
stuck in 'live' — cleaning stale session
Agora duplicate framework symbols
Dev server selected alternate port
dependency install warning
```

### Noise

Use for common development noise:

```text
Use of eval in dependency bundle
Autofill.enable failed
Autofill.setAddresses failed
objc duplicate class warning, if already classified as known noise for the profile
```

## Profile Awareness

Do not report skipped services as missing.

Examples:

- `web-dev`: local backend is intentionally skipped.
- `web-local`: backend health is required.
- `desktop-local`: desktop process and main log are required.

## Crash Reports

For Electron on macOS, inspect:

```text
~/Library/Logs/DiagnosticReports/Electron-*.ips
~/Library/Logs/DiagnosticReports/<AppName>-*.ips
```

Compare crash report timestamp against current run start.

## AI Agent Loop

The intended AI workflow:

1. Run or read `debug-loom doctor`.
2. Open only relevant logs.
3. Patch code or scripts.
4. Restart affected services.
5. Re-run doctor.
6. Report final status and remaining risks.

Avoid unattended infinite fix loops.
