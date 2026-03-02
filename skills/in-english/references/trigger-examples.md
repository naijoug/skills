# Trigger Examples — in-english

## Should Trigger (True Positives)

### Chinese Input

| Input | Reason |
|-------|--------|
| "帮我写一个排序函数" | Chinese input, needs English translation |
| "这个 bug 怎么修？代码跑不起来" | Chinese technical question |
| "用英文怎么说这个需求" | Explicit English translation request |
| "帮我改写成英文 prompt" | Explicit rewrite request |
| "优化一下我的 prompt 写法" | Prompt improvement request |
| "解释一下这段代码的逻辑" | Regular Chinese input (always-on) |
| "帮我 review 一下这个 PR" | Mixed Chinese-English input |
| "我想学习 Rust 的所有权机制" | Learning request in Chinese |

### English Input (with errors)

| Input | Reason |
|-------|--------|
| "I want make a function that check if number is prime" | Grammar errors: missing "to", subject-verb agreement |
| "Help me to fix the bug, it don't work" | Grammar: "don't" → "doesn't", unnecessary "to" |
| "Can you explain me how this code works?" | Grammar: "explain me" → "explain to me" |
| "I need create a component for show user data" | Missing prepositions and articles |
| "Make the code to run more faster" | Multiple grammar issues |
| "How to make this function works correctly?" | Subject-verb agreement |

### Already Correct English

| Input | Reason |
|-------|--------|
| "Implement a binary search algorithm that handles edge cases" | Good English, acknowledge and proceed |
| "Refactor this function to use async/await instead of callbacks" | Good English, minimal coaching needed |

## Should Not Trigger (True Negatives)

| Input | Reason |
|-------|--------|
| "yes" | Single-word command, no translation value |
| "ok" | Single-word acknowledgment |
| "continue" | Single-word command |
| "/help" | CLI command |
| "直接回答：帮我写一个函数" | User explicitly opted out with "直接回答" |
| "skip — explain this error message" | User explicitly opted out with "skip" |
