# Hypothesis Validation Card Template

Use this template when a task is small enough to verify in one session but uncertain enough that the human should make a falsifiable claim before the agent edits anything.

## Blank card

```markdown
## AI Coding Hypothesis Validation Note

### Observation
-

### Human hypothesis before agent
-

### What would change my mind
-

### Agent proposal summary
-

### Ownership boundary
- Touch:
- Do not touch:
- Existing dirty paths excluded:

### Verification output
- Command/check:
- Result:
- Did the output change the plan? yes/no, because ...

### What I learned that the agent did not own
-

### Decision: Continue / Narrow / Stop / Switch
-

### Next drill
-
```

## Filled mini example

```markdown
## AI Coding Hypothesis Validation Note

### Observation
- A wrapper command prints a success footer before the child verifier output, making the final report hard to read.

### Human hypothesis before agent
- Python stdout buffering is delaying the wrapper headings; adding `flush=True` to wrapper prints should make headings appear before each child process output.

### What would change my mind
- A regression test showing the wrapper already flushes before `subprocess.run`, or a full verifier run where headings still appear after child output.

### Agent proposal summary
- Add `flush=True` to wrapper headings, failure lines, and final success line; add a test that mocks `print` and `subprocess.run` order.

### Ownership boundary
- Touch: `books/scripts/verify_tech_cards.py`, `books/scripts/test_verify_tech_cards.py`
- Do not touch: unrelated book samples or docs catalog entries
- Existing dirty paths excluded: `books/tech-cards-handbook/samples/README.md`

### Verification output
- Command/check: `python3 scripts/test_verify_tech_cards.py && python3 scripts/verify_tech_cards.py --full-only`
- Result: wrapper regression tests and full verifier pass; headings appear before child output.
- Did the output change the plan? no, because it supported the buffering hypothesis without requiring a larger wrapper redesign.

### What I learned that the agent did not own
- The useful human decision was not the exact `flush=True` edit; it was noticing that the failure was observability/order, not verifier correctness.

### Decision: Continue
- Keep the small wrapper fix and turn the pattern into a reusable practice note.

### Next drill
- Use a real failing test or checker output, not a synthetic example, to decide whether to fix code, tests, docs, or stop.
```
