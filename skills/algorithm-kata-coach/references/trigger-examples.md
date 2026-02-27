# Trigger Examples

Use these prompts to test whether `algorithm-kata-coach` triggers correctly.

## Positive (Chinese)

- 我在刷题，别直接给答案。用分层提示带我做这道题，并检查复杂度分析。
- 帮我做算法题训练，先让我说思路，你再逐步提示。
- 这题我卡住了，请用 coaching 模式（不是完整代码）帮我推进。
- 模拟面试：给我 checkpoint 问题、复杂度追问和最后复盘。

## Positive (English)

- Coach me through this algorithm problem with hints only, not the full solution.
- I want interview-style practice: ask for my approach first, then give progressive hints.
- Help me solve this LeetCode problem in a guided way and make me explain complexity.
- Use a kata coaching mode so I learn the pattern instead of copying code.

## Negative / Near Miss

- Give me the optimal solution code immediately. (Direct solution request)
- Debug this production API timeout. (Real debugging, not algorithm practice)
- Explain dynamic programming in general. (Concept teaching, not active kata coaching)
- Generate 20 interview questions and answers. (Question bank generation, not guided problem-solving)
