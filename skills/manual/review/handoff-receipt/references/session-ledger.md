# Coordination between existing sessions

Use a ledger only when concurrent or interrupted sessions can affect the same
outcome. Inspect the relevant repository state and available session context.
Do not spawn, interrupt or message sessions without the authority required by the host.

| Session | Outcome | Owned paths/hunks | Excluded work | Authorized actions | Evidence | Next action |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

Resolve overlapping writes before proceeding on the overlap. Separate review
from implementation when that clarifies responsibility. Read-only reviews may
inspect shared files without claiming edit ownership.

Record permissions as an action set, not an ordered ladder: test access does not
imply publication, and network access does not imply customer contact. Reuse
existing scoped authorization; a successful test cannot expand it.

A handoff transfers a concrete state and next action. Unknown ownership blocks
only the affected mutation; independent work can continue.
