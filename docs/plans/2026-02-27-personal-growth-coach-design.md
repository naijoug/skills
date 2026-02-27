# Personal Growth Coach Skill Design

> A single, self-contained skill that acts as an AI-powered growth coach for full-stack programmers in the AI era.

**Date:** 2026-02-27
**Status:** Approved
**Skill ID:** `personal-growth-coach`
**Kind:** `prompt_only`

---

## 1. Problem Statement

As a full-stack programmer navigating the AI era, growth is multi-dimensional: code craft, architecture, AI capabilities, engineering practices, tech vision, and soft skills. There is no unified system to:

- Assess current abilities across all dimensions
- Recommend the right practice at the right frequency
- Track progress over time with continuous iteration
- Adapt recommendations based on growth trajectory

## 2. Solution

A single `personal-growth-coach` skill that embeds the **Six-Pillar Five-Frequency Growth Matrix** as its knowledge base. It acts as a persistent AI growth coach that:

1. Evaluates current skill levels across 6 competency pillars
2. Recommends practices at 5 different frequencies (daily → yearly)
3. Maintains a `growth-roadmap.md` state file for continuous iteration
4. Adapts recommendations based on progress and completion patterns

## 3. Tech Stack Context

| Direction | Technologies |
|-----------|-------------|
| Frontend Web | React, Vue |
| Cross-platform / Mobile | Flutter (Dart), Kotlin (Android) |
| Backend | Python, Go, Rust |
| Apple Native | Swift (iOS/macOS) |

## 4. Growth Matrix Framework

### 4.1 Six Pillars

| Pillar | Code | Core Objective |
|--------|------|----------------|
| Code Craft | P1 | Write elegant, efficient, secure code |
| Architecture & System Design | P2 | Design thinking from components to systems |
| AI-Era Skills | P3 | Master AI tools, build AI applications |
| Engineering Practice | P4 | Professional engineering habits and processes |
| Vision & Learning | P5 | Continuous learning, stay technically sharp |
| Soft Skills & Leadership | P6 | Communication, influence, tech leadership |

### 4.2 Five Frequencies

| Frequency | Time Investment | Purpose |
|-----------|----------------|---------|
| Daily | 15-30 min | Micro-practice, build muscle memory |
| Weekly | 1-2 hours | Focused training, establish rhythm |
| Monthly | Half-day | Deep learning, break through plateaus |
| Quarterly | 1-2 days | Phase assessment, direction adjustment |
| Yearly | 1-2 days | Strategic planning, big picture review |

## 5. Skill File Structure

```
skills/personal-growth-coach/
├── SKILL.md                          # Main prompt: role + flows + practice catalog
├── skill.yaml                        # Metadata
└── references/
    └── trigger-examples.md           # Trigger evaluation examples
```

All 70+ practices are embedded directly in SKILL.md for maximum cross-tool compatibility (works identically in Claude Code, Codex, Cursor, etc.).

## 6. Five Interaction Modes

### 6.1 Mode Detection

The coach automatically matches interaction mode based on user input:

| Mode | Trigger Keywords | Flow |
|------|-----------------|------|
| First-time Setup | "初始化/setup/开始" | Full onboarding → initial roadmap generation |
| Daily Check-in | "今天/daily/练习" | Read roadmap → recommend 1-2 micro-practices → log |
| Weekly Review | "本周/weekly/回顾/计划" | Review week → analyze patterns → adjust next week |
| Monthly Deep Dive | "本月/monthly/深潜/主题" | Deep assessment → learning plan → project assignment |
| Quarterly Assessment | "季度/quarterly/评估" | Full re-assessment → growth curve → roadmap pivot |
| Yearly Strategy | "年度/yearly/规划/战略" | Annual review → tech radar → strategic goals |

### 6.2 First-time Setup Flow

1. Check for existing `growth-roadmap.md`
2. If not found:
   a. Ask user to self-assess each pillar (1-5 scale)
   b. Ask for short-term and long-term growth goals
   c. Ask for available daily/weekly learning time
   d. Generate initial `growth-roadmap.md`
   e. Recommend first week's practice plan
3. If found: enter the appropriate interaction mode

### 6.3 Daily Check-in Flow

1. Read `growth-roadmap.md` → get current focus + today's agenda
2. Recommend 1-2 micro-practices based on:
   - Highest priority pillar
   - Rotation rule (avoid same pillar for consecutive days)
   - Recent completion rate
3. Output format:
   ```
   ☀️ Today's Recommendation (2026-02-27)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   [P3] Prompt Craft Daily (15min)
   Goal: Practice chain-of-thought prompting
   Steps: ...
   Completion criteria: ...
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```
4. After completion → update practice log in `growth-roadmap.md`

### 6.4 Weekly Review Flow

1. Read this week's practice log → calculate completion rate
2. Analyze:
   - Pillar distribution balance
   - Completion rate trend (vs last week)
   - Most skipped practices → identify why
3. Output weekly report with next week's adjusted plan
4. Update `growth-roadmap.md`

### 6.5 Monthly Deep Dive Flow

1. Select monthly theme (based on largest gap in assessment matrix)
2. Generate deep learning plan:
   - 1 monthly-level practice
   - Supporting reading materials / projects / tutorials
   - Clear deliverable requirement
3. End of month: evaluate output quality → update ability scores

### 6.6 Quarterly Assessment Flow

1. Full ability re-assessment (6 pillars)
2. Compare with previous quarter → growth curve
3. Analyze: which goals met? which missed? why?
4. Adjust next quarter's roadmap: priorities, focus areas
5. Set 3 quarterly milestones

### 6.7 Yearly Strategy Flow

1. Annual growth comprehensive review
2. Build/update personal tech radar
3. Market trend analysis → impact on tech stack
4. Set annual theme and 3-5 annual goals
5. Generate full-year learning roadmap

## 7. State File Design (growth-roadmap.md)

This file is the core of continuous iteration. The AI reads and updates it on every interaction.

```markdown
# Personal Growth Roadmap

## Profile
- Tech Stack: React, Vue | Flutter (Dart), Kotlin | Python, Go, Rust | Swift (iOS/macOS)
- Growth Stage: Intermediate → Full-stack Expert
- Created: 2026-02-27
- Last Updated: 2026-02-27

## Ability Assessment Matrix
| Pillar | Self-Rating (1-5) | Previous | Trend | Priority |
|--------|-------------------|----------|-------|----------|
| P1 Code Craft | 3.5 | - | - | Medium |
| P2 Architecture | 3.0 | - | - | High |
| P3 AI-Era Skills | 2.5 | - | - | Highest |
| P4 Engineering | 3.5 | - | - | Medium |
| P5 Vision & Learning | 3.0 | - | - | High |
| P6 Soft Skills | 2.0 | - | - | High |

## Current Focus
- This Week: [P3] prompt-craft-daily + ai-code-review
- This Month: [P2] Frontend state management deep dive
- This Quarter: Complete 3 AI mini-projects, system design → 4.0

## Practice Log
### 2026-03 March
- [ ] 03-01 (Daily) P3: prompt-craft-daily
- [ ] 03-01 (Weekly) P2: system-design-weekly
...

## Milestones
- [ ] Q1 2026: Master AI tool chain, build MCP Agent
- [ ] Q2 2026: Rust async proficiency, first OSS PR
- [ ] 2026 Annual: Build personal tech brand, publish 12 tech blogs

## Growth Trajectory
### Q1 2026 Review
(Auto-populated during quarterly assessment)
```

## 8. Complete Practice Catalog (70 Practices)

### 8.1 P1: Code Craft (10 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P1-D1 | algorithm-kata | Daily | 30min | Daily algorithm training with staged coaching: hints before answers |
| P1-D2 | code-reading-15min | Daily | 15min | Read excellent open source code: React/Vue/Go/Rust/Swift/Dart/Kotlin rotation |
| P1-W1 | weekly-coding-retro | Weekly | 1h | Weekly code quality review: patterns, recurring mistakes, improvement experiments |
| P1-W2 | refactor-safely | Weekly | 1h | Safe refactoring practice: one technique per week with checklist |
| P1-W3 | type-system-workout | Weekly | 45min | Type system challenges: TS type gymnastics / Go interfaces / Rust traits / Dart generics / Swift protocols / Kotlin sealed classes |
| P1-M1 | design-pattern-deep-dive | Monthly | 4h | Master one design pattern: theory → multi-language implementation → real-world application |
| P1-M2 | language-feature-explorer | Monthly | 4h | Deep dive into one language feature internals (React Hooks source / Go channels / Rust async / Flutter Widget tree / Kotlin coroutines) |
| P1-M3 | cross-language-kata | Monthly | 3h | Implement same problem in React/Vue/Python/Go/Rust/Swift/Dart/Kotlin, compare design philosophies |
| P1-Q1 | code-quality-audit | Quarterly | 8h | Full project code quality audit: complexity, coverage, code smells, naming consistency |
| P1-Y1 | new-paradigm-challenge | Yearly | 2d | Learn a fundamentally new programming paradigm, build a small project with it |

### 8.2 P2: Architecture & System Design (9 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P2-D1 | architecture-decision-journal | Daily | 5min | Record today's tech decisions: what was chosen, why, what was rejected |
| P2-W1 | api-design-review | Weekly | 1h | API design review: semantics, compatibility, error handling, evolution strategy |
| P2-W2 | component-architecture-review | Weekly | 1h | Component architecture review: React/Vue/Flutter/SwiftUI/Jetpack Compose component responsibilities, props interface, state management |
| P2-W3 | system-design-weekly | Weekly | 45min | Timed system design problem: requirements → architecture → data model → API → scalability |
| P2-M1 | database-schema-review | Monthly | 4h | Data model design: table structure, indexes, query patterns, migration strategy |
| P2-M2 | frontend-state-architecture | Monthly | 4h | Frontend state management architecture: Redux/Vuex/Pinia/Riverpod/SwiftUI State/Kotlin StateFlow selection and design |
| P2-M3 | performance-profiling-session | Monthly | 4h | Performance analysis: React DevTools / Flutter DevTools / Go pprof / Rust flamegraph / Xcode Instruments / Android Profiler |
| P2-Q1 | tech-debt-assessment | Quarterly | 8h | Tech debt quantification: identify, classify, prioritize, payoff ROI analysis |
| P2-Y1 | personal-tech-radar | Yearly | 1d | Build personal tech radar: Adopt/Trial/Assess/Hold classification |

### 8.3 P3: AI-Era Skills (10 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P3-D1 | ai-code-review | Daily | 15min | Review AI-generated code: correctness, security, edge cases, naming, over-engineering |
| P3-D2 | prompt-craft-daily | Daily | 15min | Refine one prompt technique daily: few-shot, CoT, role-setting, constraints |
| P3-W1 | ai-tool-explorer | Weekly | 1h | Explore one AI tool/plugin/API: try → evaluate → write usage report |
| P3-W2 | ai-workflow-optimizer | Weekly | 30min | Optimize AI-assisted workflow: efficiency analysis → bottleneck identification → improvement |
| P3-M1 | ai-mini-project | Monthly | 8h | Build one AI-powered project: chatbot, RAG app, code analyzer, Agent |
| P3-M2 | mcp-agent-builder | Monthly | 8h | Build MCP server or AI Agent: design → implement → test conversation flow |
| P3-M3 | ai-safety-review | Monthly | 3h | AI integration safety review: injection protection, output filtering, cost control, privacy, hallucination |
| P3-Q1 | ai-capability-frontier | Quarterly | 4h | Map current AI capability boundaries: strengths, weaknesses, upcoming breakthroughs |
| P3-Q2 | rag-finetuning-lab | Quarterly | 2d | Hands-on RAG or fine-tuning experiment: data → pipeline → evaluate → optimize |
| P3-Y1 | ai-strategy-review | Yearly | 1d | Annual AI strategy: capability assessment, tool audit, career impact, roadmap |

### 8.4 P4: Engineering Practice (13 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P4-D1 | pr-self-review | Daily | 10min | PR self-review checklist: regressions, tests, readability, operational risk |
| P4-D2 | test-first-thinking | Daily | 10min | TDD micro-training: write test cases before implementation |
| P4-W1 | bug-investigation-coach | Weekly | 1h | Systematic debugging: evidence → hypotheses → verify → fix |
| P4-W2 | git-workflow-mastery | Weekly | 30min | Git advanced: interactive rebase, bisect, cherry-pick, monorepo management |
| P4-W3 | security-scan-runner | Weekly | 30min | Security scanning: dependency vulnerabilities, OWASP Top 10, secrets detection |
| P4-W4 | ci-cd-health-check | Weekly | 30min | CI/CD health check: build time trends, flaky tests, deployment frequency |
| P4-W5 | test-case-designer | Weekly | 1h | Test matrix design: happy path, boundaries, regressions |
| P4-M1 | devops-skill-builder | Monthly | 4h | Learn one DevOps skill: Docker multi-stage builds, K8s, Terraform, monitoring |
| P4-M2 | incident-response-drill | Monthly | 3h | Incident response drill: investigate → locate → fix → retro → prevent |
| P4-M3 | dependency-health-audit | Monthly | 2h | Dependency audit: outdated, vulnerabilities, licenses, bundle size, alternatives |
| P4-M4 | debugging-kata-generator | Monthly | 2h | Generate and practice debugging exercises |
| P4-Q1 | production-readiness-review | Quarterly | 8h | Production readiness checklist: observability, canary, rollback, capacity |
| P4-Y1 | engineering-standards-review | Yearly | 1d | Annual engineering standards review: coding standards, test strategy, docs, toolchain |

### 8.5 P5: Vision & Learning (11 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P5-D1 | trending | Daily | 15min | AI/tech trends daily digest: collect, filter, summarize |
| P5-D2 | til-journal | Daily | 5min | Today I Learned journal: record one knowledge point daily, tagged by tech |
| P5-W1 | tech-blog-writer | Weekly | 2h | Write one tech blog post: Feynman technique in practice |
| P5-W2 | open-source-deep-dive | Weekly | 1h | Deep read one excellent OSS project's core module |
| P5-W3 | deep-read-digest | Weekly | 1h | Deep read one tech article/paper: core argument, insights, implications, action items |
| P5-M1 | teaching-plan | Monthly | 4h | Generate teaching materials from code, URLs, or text |
| P5-M2 | new-framework-lab | Monthly | 4h | Try a new framework/tool: get started → build demo → write evaluation report |
| P5-M3 | rust-ownership-gym | Monthly | 3h | Rust ownership and borrow checker training: compiler error analysis, lifetime annotations, unsafe boundaries |
| P5-Q1 | learning-path-designer | Quarterly | 4h | Design next quarter's learning roadmap: review → gaps → goals → resources |
| P5-Q2 | side-project-sprint | Quarterly | 2d | Side project sprint: idea → MVP → deploy → retrospective |
| P5-Y1 | career-growth-review | Yearly | 1d | Annual career growth review: skill matrix, trajectory, market value, strategy |

### 8.6 P6: Soft Skills & Leadership (9 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P6-D1 | daily-standup-craft | Daily | 5min | Standup communication training: articulate progress/plan/blockers in 30 seconds |
| P6-W1 | code-review-mentor | Weekly | 1h | Coaching-style code review: write review comments that teach and mentor |
| P6-W2 | technical-writing-coach | Weekly | 1h | Technical writing training: RFC, design docs, bug reports, changelogs |
| P6-W3 | estimation-planning-coach | Weekly | 30min | Task estimation training: break down → estimate → execute → calibrate |
| P6-M1 | tech-decision-facilitator | Monthly | 2h | Tech decision facilitation: gather info → options → tradeoffs → consensus |
| P6-M2 | presentation-craft | Monthly | 3h | Technical presentation polish: structure, demo preparation, storytelling |
| P6-M3 | one-on-one-prep | Monthly | 1h | 1-on-1 meeting prep: from status updates to career development conversations |
| P6-Q1 | cross-team-collaboration | Quarterly | 4h | Cross-team collaboration review: friction points, effective patterns, improvements |
| P6-Q2 | tech-leadership-journal | Quarterly | 3h | Tech leadership journal: decision influence, mentoring outcomes, direction judgment |
| P6-Y1 | personal-brand-audit | Yearly | 1d | Personal brand audit: GitHub, blog, talks, community impact assessment |

### 8.7 Bonus: Cross-Cutting Skills (8 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| BX-W1 | concurrency-patterns-coach | Weekly | 1h | Multi-language concurrency patterns: Go goroutines / Rust tokio / Python asyncio / Dart isolates / Kotlin coroutines / Swift structured concurrency |
| BX-M1 | accessibility-review | Monthly | 3h | Accessibility review: WCAG, VoiceOver, Flutter Semantics, Android accessibility |
| BX-M2 | memory-resource-profiler | Monthly | 3h | Memory analysis: React Profiler / Go pprof / Rust / Xcode Instruments / Flutter / Android Profiler |
| BX-M3 | technical-interview-coach | Monthly | 2h | Two-way interview training: problem solving + system design + interviewer skills |
| BX-M4 | documentation-craftsman | Monthly | 2h | Documentation craftsmanship: polish API docs, README, architecture docs to exemplary level |
| BX-Q1 | open-source-contributor | Quarterly | 2d | Open source contribution: choose project → find issue → submit PR → get merged |
| BX-Q2 | fullstack-integration-drill | Quarterly | 2d | Full-stack integration drill: frontend → API → database → deployment, end-to-end |
| BX-Q3 | flutter-platform-channel-lab | Quarterly | 1d | Flutter platform channel experiment: Dart ↔ Swift/Kotlin native bridging |

## 9. Practice Rotation & Recommendation Logic

### 9.1 Daily Rotation Algorithm

```
1. Read current pillar priorities from roadmap
2. Select from daily practices, weighted by priority:
   - Highest priority pillar: 40% chance
   - High priority: 25% each
   - Medium/Low: 10% combined
3. Avoid same pillar as yesterday (unless only one priority is "Highest")
4. Consider completion rate: if a practice is frequently skipped, suggest alternatives
```

### 9.2 Weekly Balance Check

```
Target distribution (adjustable):
- Primary focus pillar: 3 sessions
- Secondary pillars: 1-2 sessions each
- Never let any pillar go 2+ weeks without practice
```

### 9.3 Monthly Theme Selection

```
1. Pick the pillar with largest gap (target - current rating)
2. If multiple ties, prefer: P3 > P2 > P1 > P4 > P5 > P6
   (AI skills have highest strategic value in current era)
3. Select a monthly practice from that pillar
4. Generate supporting weekly practices that reinforce the theme
```

## 10. Existing Skills Integration

13 existing skills in the repository map directly into this framework:

| Existing Skill | Maps To | Status |
|---------------|---------|--------|
| algorithm-kata-coach | P1-D1 | Enhance with broader scope |
| code-reading-accelerator | P1-D2 | Keep as-is |
| weekly-coding-retro | P1-W1 | Keep as-is |
| refactor-safely | P1-W2 | Keep as-is |
| design-pattern-application-coach | P1-M1 | Keep as-is |
| api-design-review | P2-W1 | Keep as-is |
| performance-thinking-coach | P2-M3 | Keep as-is |
| pr-self-review | P4-D1 | Keep as-is |
| bug-investigation-coach | P4-W1 | Keep as-is |
| test-case-designer | P4-W5 | Keep as-is |
| debugging-kata-generator | P4-M4 | Keep as-is |
| trending | P5-D1 | Keep as-is |
| teaching-plan | P5-M1 | Keep as-is |

The growth coach can reference these existing skills when recommending practices, creating a unified experience.

## 11. Summary Statistics

| Category | Count |
|----------|-------|
| Total Practices | 70 |
| Existing (mapped) | 13 |
| New | 57 |
| Daily practices | 7 |
| Weekly practices | 17 |
| Monthly practices | 19 |
| Quarterly practices | 12 |
| Yearly practices | 7 |
| Bonus cross-cutting | 8 |

## 12. Implementation Priority

**Phase 1: Core Skill**
- Create `SKILL.md` with full framework, all 5 interaction modes, and complete practice catalog
- Create `skill.yaml` metadata
- Create `references/trigger-examples.md`

**Phase 2: State File Bootstrap**
- Implement first-time setup flow that generates `growth-roadmap.md`
- Implement daily check-in and weekly review modes

**Phase 3: Advanced Modes**
- Implement monthly deep dive, quarterly assessment, yearly strategy modes
- Add growth trajectory visualization in roadmap file

**Phase 4: Cross-tool Testing**
- Test in Claude Code, Codex, Cursor
- Validate skill discovery and rendering via platform CLI
- Create tool-specific overrides in `agents/` if needed
