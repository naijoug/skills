# Fixture failure diagnostics

Identify setup phases: temporary root, directories, file writes, subprocess spawn,
subprocess exit, repository/storage operations, behavior assertion and cleanup.
Give failures the phase and enough context to choose the next investigation.

For example, `expect("write package.json fixture")` explains more than bare
`unwrap()`. A successful subprocess spawn is not a successful command: check its
exit status and include relevant stderr/stdout without secrets.

Preserve assertion meaning, fixture data, lock lifetime and retry behavior in a
diagnostic-only change. Fix timing or concurrency bugs as behavior work, not by
renaming their failure messages. Avoid wording churn when diagnostics are already
adequate.

Make cleanup failure visible when it can poison later tests, while retaining the
original failure. Best-effort cleanup is reasonable when explicitly tolerated.
Run the affected tests and report which failure phase is now distinguishable.
