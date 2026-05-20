# Validation Chain Stop Rules

Use this reference when several recent hourly runs have expanded the same validation chain: sample pack, outreach kit, send queue, send log, feedback tracker, README, or similar supporting files. The goal is to know when the chain is executable enough and should stop growing until real evidence arrives.

## Stop expanding when the chain already answers five questions

A validation chain is "ready enough" when a human can answer these without opening a blank page:

1. **Who to contact first?** There is a target type or anonymized object-code rule.
2. **What to send?** There is a sample, proof asset, or concise artifact.
3. **What to ask?** The outreach message asks for concrete pain, strongest/weakest part, delivery preference, and buying or referral signal.
4. **Where to record evidence?** There is a feedback/evidence log that separates observable facts from inference.
5. **How to decide?** There is a continue / narrow / stop or revise gate based on evidence quality, not vibes.

If all five are present, the next hourly run should not add another supporting document unless it removes a specific execution blocker.

## Allowed next edits before real feedback

Only make another validation-chain edit when at least one of these is true:

| Blocker | Allowed edit | Verification |
| --- | --- | --- |
| The next human action is ambiguous | Add one ordered checklist or clarify one missing field | Readback proves the first action and done condition are explicit |
| A required field is named differently across files | Align terminology in the smallest set of files | Search confirms the old ambiguous term no longer appears in the touched scope |
| Evidence cannot be classified | Add a narrow grade rubric or example row with placeholders, not fake data | Readback confirms no invented contacts, feedback, or metrics |
| A decision gate is missing | Add continue / narrow / stop thresholds | Readback confirms the thresholds depend on observable behavior |

## Stop conditions

Do not keep expanding validation materials when:

- the next step is to contact real people, but the agent lacks the identities or permission to send messages;
- the only possible change is cosmetic wording or another index over already indexed files;
- the proof asset would need real feedback before it can be honestly revised;
- the target repo is dirty in overlapping files and the slice is not isolated;
- the proposed edit makes the validation chain longer without reducing execution risk.

In those cases, record a handoff that says the validation chain is blocked on human execution or real evidence, then switch to another clean, valuable asset.

## Notebook handoff pattern

```text
下一次优先检查 `books/<project>/.drafts/<validation-readme>.md`：如果它已经说明目标对象、样品包、5 个问题、反馈证据日志和 Day 7 决策门槛，就停止继续扩写外联材料，转向 <clean repo/path> 的小任务；只有在发现真实执行 blocker 时，才补一个字段或一行清单。验证用 readback + `git diff --check`，并确认没有虚构联系人或反馈。
```

## Example: external validation chain is ready enough

**Observed state**

- The sample pack asks for concrete failure cases and weak/strong card feedback.
- The outreach kit and Day 1 queue use the same questions.
- The send log tracks whether the questions were asked and whether evidence was copied.
- The feedback tracker stores observable fact, inference, confidence, grade, and next validation action.
- The validation README lists the order and Day 7 decision gate.

**Decision**

Stop adding more validation documents. The next useful work is either human outreach with real target codes, or a different asset such as a skill, tutorial, test-backed project improvement, or book card.

**Why**

More templates would create planning comfort but not stronger evidence. The bottleneck has moved from documentation to real market contact.
