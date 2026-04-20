# Trigger Examples

Use these prompts to test whether `in-english` triggers correctly.

## Positive (Chinese)

- 帮我写一个排序函数。 (Chinese input; should be rewritten in concise English first)
- 这个 bug 怎么修？代码跑不起来。 (Chinese technical request)
- 用英文怎么说这个需求？ (Explicit translation request)
- 帮我改写成英文 prompt。 (Explicit rewrite request)
- 优化一下我的 prompt 写法。 (Prompt expression improvement)
- 解释一下这段代码的逻辑。 (General Chinese request should still get English rewrite)
- 帮我 review 一下这个 PR。 (Mixed Chinese/English input)
- 我想学习 Rust 的所有权机制。 (Learning request in Chinese)

## Positive (English)

- I want make a function that check if number is prime. (Grammar errors to fix)
- Help me to fix the bug, it don't work. (Grammar errors to fix)
- Can you explain me how this code works? (Natural phrasing correction needed)
- I need create a component for show user data. (Missing articles/prepositions)
- Make the code to run more faster. (Multiple expression issues)
- How to make this function works correctly? (Grammar correction needed)
- Implement a binary search algorithm that handles edge cases. (Already good English; minimal notes)
- Refactor this function to use async/await instead of callbacks. (Already good English; minimal notes)

## Negative / Near Miss

- yes (Single-word acknowledgment; no translation value)
- ok (Single-word acknowledgment; no translation value)
- continue (Single-word command)
- /help (CLI command)
- 直接回答：帮我写一个函数。 (Explicit opt-out with "直接回答")
- skip - explain this error message. (Explicit opt-out with "skip")
