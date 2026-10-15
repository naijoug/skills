# Bounded probes before workarounds

Use when an earlier note says a command may hang or needs a workaround, but the
failure has not been observed in the current environment. Run the original
command only within the task's permitted effects, with a time boundary suitable
for its normal duration. Capture cwd, environment differences, output and exit.

An exit-zero result dismisses this occurrence, not every possible intermittent
failure. A non-zero exit with a diagnostic is not necessarily a hang. An outer
timeout establishes only that the command exceeded the boundary, not a deadlock.

If needed, vary one factor such as watch mode, CI environment or resolved version.
Patch only the affected invocation when evidence supports the change. Do not test
live publication or destructive operations merely to reproduce a suspected hang.
