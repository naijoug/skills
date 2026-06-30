# AI Coding Audit Example

Use this example when the task is not to run every test, but to tell a developer what the next safest verification sequence should be for an AI-generated PR.

## Scenario

```text
Change type: AI-generated React state/refactor PR
Known context: reducer and selector files changed; UI components were also touched
Main risk: the agent changed state shape or selector assumptions without proving the board still renders the same task flow
Current evidence: diff review found no obvious syntax error, but the PR description only says "tests passed" without naming commands
```

## Next Safe Command Ladder

| Step | Command / check | Why this first | Pass means | Fail means |
| --- | --- | --- | --- | --- |
| 1 | `git diff --check -- src/state/reducer.ts src/state/selectors.ts tests/unit/reducer.test.cjs tests/unit/selectors.test.cjs` | cheapest check that the state-layer patch is structurally clean before running code | touched state/test files have no whitespace, conflict-marker, or patch-format damage | fix the patch itself before asking for runtime evidence |
| 2 | `npm test -- tests/unit/reducer.test.cjs tests/unit/selectors.test.cjs` | state shape and selectors are the highest-risk contract in this PR | focused tests still cover the changed reducer/selector contract | Narrow to the failing state branch; do not hide it behind a full build |
| 3 | `npm run typecheck` | after focused behavior passes, check whether the changed contract is type-compatible across callers | TypeScript callers still compile against the state contract | Narrow to the first type error cluster and update either the contract or affected caller |
| 4 | run one manual or scripted board smoke that opens the changed task flow | unit/type evidence does not prove the user path renders correctly | the changed flow is usable at the UI boundary | capture the exact broken interaction before expanding scope |

## Escalation

- If step 1 fails, stop and repair only the touched state/test patch.
- If step 2 fails, keep the investigation inside reducer/selector behavior until the failing branch is named.
- If steps 2 and 3 pass, escalate to the UI smoke because the remaining risk is integration, not the state contract alone.
- Only after the smoke passes should the reviewer ask for broader CI evidence.

## Stop Conditions

- The workspace has unowned dirty files outside the PR or task scope.
- The first focused failure already identifies a changed reducer branch.
- Running the UI smoke requires production credentials, destructive data, or a service the reviewer cannot safely access.

## Unverified After This Ladder

- Cross-browser rendering and visual regression remain unverified.
- Remote CI runner differences remain unverified until CI runs.
- Production data edge cases remain unverified unless covered by fixtures.

## Continue / Narrow / Stop

- Continue: focused state tests, typecheck, and one UI smoke all pass; request CI as confirmation rather than discovery.
- Narrow: a reducer/selector test or typecheck cluster fails; report the smallest failing contract and ask for a targeted patch.
- Stop: verification would require unrelated dirty files, credentials, or production-side effects.

## Review Note Shape

```markdown
I would not start by asking for "all tests". The current highest risk is that the AI-generated PR changed the state contract without proving the board flow still works.

Run the reducer/selector focused tests first, then typecheck, then one board smoke. If the focused tests fail, Narrow to the failing state branch and do not spend time on full CI yet. If they pass, CI becomes confirmation rather than the first source of evidence.
```
