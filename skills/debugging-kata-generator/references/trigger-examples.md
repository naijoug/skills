# Trigger Examples

Use these prompts to test whether `debugging-kata-generator` triggers correctly.

## Positive (Chinese)

- 给我生成一个后端调试练习题：症状、日志线索、分层提示和答案（默认隐藏答案）。
- 我想练 flaky test 排查，做一个难度中等的 debugging kata。
- 帮我设计一个 incident drill，包含误导线索和真实根因。
- 生成一个前端状态同步 bug 的调试训练场景，带 tiered hints。

## Positive (English)

- Create a debugging kata about flaky tests with realistic symptoms, tiered hints, and an answer key.
- Generate a backend incident practice scenario with clues, noise, and a root-cause explanation.
- I want a debugging drill for a cache-related bug, medium difficulty, with hidden solution notes.
- Build a deliberate debugging exercise for a CI failure that trains diagnosis, not memorization.

## Negative / Near Miss

- Help me debug the real outage happening right now. (Real incident handling, not a practice generator)
- Explain how to use breakpoints in VS Code. (Tool tutorial, not scenario generation)
- Write a unit test suite for my service. (Implementation/testing task, not debugging exercise creation)
- Give me a solved debugging example with no hints. (Tutorial/answer request, not kata generation)
