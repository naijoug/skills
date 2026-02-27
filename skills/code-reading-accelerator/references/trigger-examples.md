# Trigger Examples

Use these prompts to test whether `code-reading-accelerator` triggers correctly.

## Positive (Chinese)

- 我刚接手这个项目，帮我快速建立代码地图，并追踪一次请求从入口到数据库的流程。
- 这段功能我要改，但看不懂上下文。请给我一个高效读代码路径。
- 帮我定位“这个字段是在哪里被写入和消费的”，并整理关键调用链。
- 新人 onboarding：先帮我拆出模块边界和关键数据流。

## Positive (English)

- I need to understand this codebase fast. Build a module map and trace one end-to-end request flow.
- Help me read this legacy service efficiently before I modify it.
- Where does this value come from and where is it transformed? Map the call path.
- Create code reading notes for this feature path, including data flow and risk points.

## Negative / Near Miss

- Write a new endpoint for this service. (Implementation request, not code reading)
- Explain what dependency injection means. (General concept, no codebase reading target)
- Refactor this module for readability. (Change request; code reading may help but not primary task)
- Generate architecture diagrams for a system I have not provided. (Missing concrete codebase context)
