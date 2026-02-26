---
name: teaching-plan
description: Use when a user provides a GitHub URL, README, code snippet, document, or raw text and wants a detailed teaching plan or lesson script in Markdown for explanation, mentoring, or technical training
---

# Teaching Plan

## Overview

Generate a detailed, teachable Markdown lesson plan from source material such as a GitHub repository URL, pasted text, docs, or code snippets.

Core principle: teach for understanding, not just summarization. The output should explain concepts, sequence learning, and include examples, exercises, and common pitfalls.

## When to Use

- User gives a GitHub URL and asks for a detailed explanation/teaching notes
- User pastes text, README, docs, or code and wants a "教案" / lesson plan /讲解稿
- User needs mentoring material for onboarding, sharing, workshop, or 1:1 teaching
- User wants a Markdown document that can be directly used for teaching

## When Not to Use

- User only wants a short summary (use normal summarization)
- User asks for code changes, debugging, or implementation instead of teaching materials
- Source material is unavailable and cannot be inferred (ask for the content or scope first)

## Input Types

### 1. GitHub URL

Possible inputs:
- Repo URL (`https://github.com/org/repo`)
- Folder/file URL
- PR/issue URL (teach the change/problem context)

Recommended analysis order:
1. `README` / docs
2. Examples / demos
3. Entry points and core modules
4. Config files (`package.json`, `pyproject.toml`, etc.)
5. Tests (to infer expected behavior)

### 2. Other Text Content

Possible inputs:
- Article, notes, API docs
- Code snippets
- Product requirements / design docs
- User-written explanation draft that needs restructuring for teaching

## Default Assumptions (Override If User Specifies)

- Audience: beginner-to-intermediate engineers
- Goal: understand concepts + practical usage
- Format: Markdown `.md`
- Style: structured, detailed, example-driven
- Language: match user language (Chinese if user writes Chinese)

## Workflow

1. Identify source type and topic scope
2. Extract core concepts, dependencies, and learning order
3. Infer audience level and teaching objective (or ask one clarifying question if needed)
4. Build a teaching outline from simple to complex
5. Expand each section into explanations, examples, and exercises
6. Add misconceptions, pitfalls, and Q&A prompts
7. Produce a Markdown lesson plan with clear headings and reusable structure

## Output Requirements (Detailed Lesson Plan)

The generated Markdown should usually include:

- `标题 / Topic`
- `适用对象 / Audience`
- `先修知识 / Prerequisites`
- `学习目标 / Learning Objectives`
- `课程时长建议 / Suggested Duration`
- `教学材料来源 / Source Material`
- `整体结构 / Session Outline`
- `分节详解 / Detailed Teaching Script`
- `示例与演示 / Demos & Examples`
- `练习题 / Exercises`
- `常见误区 / Common Pitfalls`
- `提问引导 / Discussion Prompts`
- `课后作业 / Homework or Follow-up`
- `速查总结 / Recap`

## Teaching Plan Template (Markdown)

```markdown
# [主题名称] 教案

## 1. 基本信息
- 主题：
- 面向对象：
- 建议时长：
- 授课形式：（1:1 / 小组分享 / Workshop / Onboarding）
- 材料来源：

## 2. 学习目标
- 学员完成后能够：
  - ...
  - ...
  - ...

## 3. 先修知识
- ...
- ...

## 4. 课程结构（时间分配）
- 0-10 分钟：背景与问题定义
- 10-25 分钟：核心概念讲解
- 25-45 分钟：代码/案例拆解
- 45-60 分钟：练习与答疑

## 5. 分节详解（讲解稿）

### 5.1 背景与动机
- 讲什么：
- 为什么重要：
- 如何引入（举例/类比）：
- 学员可能会问：

### 5.2 核心概念
- 概念 A：
  - 定义：
  - 作用：
  - 与其它概念关系：
  - 示例：
- 概念 B：
  - 定义：
  - 示例：

### 5.3 实战拆解（基于提供材料）
- 先看整体结构
- 再看关键流程
- 最后看边界情况/错误处理

## 6. 示例与演示
- 示例 1：...
- 示例 2：...
- 演示步骤：...

## 7. 练习设计
- 练习 1（基础）：
  - 目标：
  - 输入：
  - 预期输出：
- 练习 2（进阶）：
  - 目标：
  - 提示：

## 8. 常见误区与纠正
- 误区 1：
  - 为什么错：
  - 正确理解：
- 误区 2：
  - 为什么错：
  - 正确做法：

## 9. 提问引导（用于互动）
- 如果把 X 替换成 Y，会发生什么？
- 为什么这里不直接用 ...？
- 这个设计的 trade-off 是什么？

## 10. 总结与课后建议
- 本节核心结论：
- 推荐延伸阅读：
- 课后练习：
```

## Source-Specific Guidance

### If the source is a GitHub repo

- Explain the repo at three levels:
  - What problem it solves (product view)
  - How it works (architecture/process view)
  - How to use or extend it (practical view)
- Prefer concrete file paths and execution flow over vague summaries
- If the repo is large, focus on one path first (main feature or critical workflow)
- Explicitly call out assumptions when files cannot be inspected

### If the source is pasted text or docs

- Convert prose into teachable units (concepts, relationships, examples)
- Separate facts from interpretations
- Rewrite dense sections into progressive explanations
- Add mini-checkpoints to verify learner understanding

### If the source is code snippets

- Explain:
  - purpose
  - inputs/outputs
  - control flow
  - edge cases
  - common mistakes
- Include a simpler version first when the code is advanced

## Quality Checklist

- Output is a teaching plan, not only a summary
- Learning objectives are measurable
- Sections follow a learnable sequence (easy -> hard)
- Includes examples and exercises
- Includes misconceptions/pitfalls
- Language matches the user's input language
- Markdown headings are clean and reusable

## Example Triggers

- "给你一个 GitHub 仓库链接，帮我出一份详细讲解教案"
- "把这段 README 整理成一份可授课的 md 教案"
- "根据这段代码生成带讲解步骤的培训材料"
- "帮我做 onboarding 教学文档，内容基于这份设计说明"
