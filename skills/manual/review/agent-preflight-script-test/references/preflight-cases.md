# Isolated preflight cases

Identify the command's documented working directory, inputs, pass conditions,
rejections and permitted side effects. Test those contracts rather than exact
headings or incidental wording.

Use a temporary workspace with only direct helpers and minimal fixtures. Initialize
Git there only if the command needs it. Stub external executables and control the
environment so a positive fixture cannot deploy, upload or mutate production.
Clean up only the fixture's own directory.

| Contract, when present | Useful cases |
| --- | --- |
| Explicit target | Minimal valid artifact; rejected invalid artifact |
| Default target selection | Explicit vs inferred target; no target; ambiguous target |
| Path restrictions | Intended repository/cwd; wrong path or escape attempt |
| Required data | Valid fields; missing or malformed required field |
| Side-effect guard | Authorized simulation; rejection before forbidden effect |

Assert exit status, a stable diagnostic category, and relevant state or call logs.
A rejection assertion must prove the fixture setup succeeded and the forbidden
operation did not occur. Avoid wall-clock dates, machine paths and process IDs in
assertions. Prevent recursion if the main preflight invokes its own tests.
