# Practice Catalog

> Loaded by `personal-coach` SKILL.md when recommending practices. Do **not** auto-trigger any matching skill from this catalog — describe the practice inline. Only load the matching skill if the user explicitly asks to start that practice session.

## P1: Code Craft (10 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P1-D1 | algorithm-kata-coach | Daily | 30min | Daily algorithm training with staged coaching: hints before answers. Rotate across data structures, dynamic programming, graph algorithms, etc. |
| P1-D2 | code-reading-15min | Daily | 15min | Read excellent open source code: React/Vue/Go/Rust/Swift/Dart/Kotlin rotation. Focus on one module, annotate design decisions. |
| P1-W1 | weekly-retro | Weekly | 1h | Weekly code quality review: identify patterns, recurring mistakes, run improvement experiments. Compare this week's code vs last week's. |
| P1-W2 | refactor | Weekly | 1h | Safe refactoring practice: pick one technique per week (extract method, replace conditional with polymorphism, etc.) with safety checklist. |
| P1-W3 | type-system-workout | Weekly | 45min | Type system challenges: TS type gymnastics / Go interfaces / Rust traits / Dart generics / Swift protocols / Kotlin sealed classes + generics. |
| P1-M1 | design-pattern-deep-dive | Monthly | 4h | Master one design pattern: theory → implement in 3+ languages from your stack → find real-world application in your codebase. |
| P1-M2 | language-feature-explorer | Monthly | 4h | Deep dive into one language feature internals: React Hooks source code, Go channel implementation, Rust async machinery, Flutter Widget tree rebuild, Kotlin coroutine dispatchers. |
| P1-M3 | cross-language-kata | Monthly | 3h | Implement the same problem in React/Vue/Python/Go/Rust/Swift/Dart/Kotlin. Compare idioms, design philosophies, and trade-offs. |
| P1-Q1 | code-quality-audit | Quarterly | 8h | Full project code quality audit: cyclomatic complexity, test coverage, code smells, naming consistency, dependency graph analysis. |
| P1-Y1 | new-paradigm-challenge | Yearly | 2d | Learn a fundamentally new programming paradigm (functional, logic, concatenative, etc.) and build a small but complete project with it. |

## P2: Architecture & System Design (9 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P2-D1 | architecture-decision-journal | Daily | 5min | Record one tech decision today: what was chosen, why, what alternatives were rejected, what trade-offs were accepted. |
| P2-W1 | api-design | Weekly | 1h | Review one API (yours or open source): semantics, naming, compatibility, error handling, versioning, evolution strategy. |
| P2-W2 | component-architecture-review | Weekly | 1h | Review component architecture in React/Vue/Flutter/SwiftUI/Jetpack Compose: responsibilities, props/params interface, state management, reusability. |
| P2-W3 | system-design-weekly | Weekly | 45min | Timed system design practice: requirements analysis → architecture diagram → data model → API design → scalability analysis. |
| P2-M1 | database-schema-review | Monthly | 4h | Data model design exercise: table structure, indexes, query patterns, migration strategy. Cover both SQL and NoSQL approaches. |
| P2-M2 | frontend-state-architecture | Monthly | 4h | Frontend state management architecture: Redux/Vuex/Pinia/Riverpod/SwiftUI State/Kotlin StateFlow — selection criteria, state tree design, data flow analysis. |
| P2-M3 | performance-profiling-session | Monthly | 4h | Performance profiling practice: React DevTools / Vue DevTools / Flutter DevTools / Go pprof / Rust flamegraph / Xcode Instruments / Android Profiler. Profile a real project, identify bottlenecks, optimize. |
| P2-Q1 | tech-debt-assessment | Quarterly | 8h | Tech debt quantification: identify all debt items, classify (deliberate/accidental, reckless/prudent), prioritize by impact, create payoff ROI analysis. |
| P2-Y1 | personal-tech-radar | Yearly | 1d | Build a personal ThoughtWorks-style tech radar: place every technology you've used into Adopt/Trial/Assess/Hold quadrants with rationale. |

## P3: AI-Era Skills (10 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P3-D1 | ai-code-review | Daily | 15min | Review one piece of AI-generated code: check correctness, security, edge cases, naming quality, over-engineering. Build AI output judgment. |
| P3-D2 | prompt-craft-daily | Daily | 15min | Refine one prompt technique: few-shot examples, chain-of-thought, role-setting, output constraints, structured output. Record: prompt → output → improvement. |
| P3-W1 | ai-tool-explorer | Weekly | 1h | Explore one AI tool, plugin, or API: hands-on trial → evaluate strengths/weaknesses → write a mini usage report. |
| P3-W2 | ai-workflow-optimizer | Weekly | 30min | Audit your AI-assisted workflow this week: which AI interactions saved time? Which wasted time? Optimize one workflow step. |
| P3-M1 | ai-mini-project | Monthly | 8h | Build one AI-powered project from scratch: chatbot, RAG application, code analyzer, AI agent, image tool, etc. Idea → build → deploy. |
| P3-M2 | mcp-agent-builder | Monthly | 8h | Build an MCP server or AI agent: design tool interfaces, implement tool logic, test conversation flows, document usage. |
| P3-M3 | ai-safety-review | Monthly | 3h | AI integration safety review: prompt injection protection, output filtering/validation, cost control mechanisms, privacy safeguards, hallucination detection strategies. |
| P3-Q1 | ai-capability-frontier | Quarterly | 4h | Map current AI capability boundaries: what tasks are AI-excellent at? What still needs humans? What's likely to change in 3 months? Adjust your learning priorities. |
| P3-Q2 | rag-finetuning-lab | Quarterly | 2d | Hands-on RAG or fine-tuning experiment: select dataset → build pipeline → evaluate results → optimize parameters → document findings. |
| P3-Y1 | ai-strategy-review | Yearly | 1d | Annual AI strategy: personal AI capability assessment, tool stack audit, career impact analysis, next-year AI learning roadmap. |

## P4: Engineering Practice (13 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P4-D1 | pr | Daily | 10min | PR self-review checklist: regressions, test gaps, readability, operational risk. Review your own diff as a skeptical reviewer. |
| P4-D2 | test-first-thinking | Daily | 10min | TDD micro-training: before implementing any feature today, spend 10 minutes writing test cases first. Practice test-first instinct. |
| P4-W1 | bug-investigation-coach | Weekly | 1h | Systematic debugging practice: collect evidence → form hypotheses → design experiments → verify → fix. Never patch without understanding. |
| P4-W2 | git-workflow-mastery | Weekly | 30min | Git advanced practice: interactive rebase, bisect to find bugs, cherry-pick strategies, monorepo management, commit message conventions. |
| P4-W3 | security-scan-runner | Weekly | 30min | Run security scans on current project: dependency vulnerabilities (npm audit, safety, cargo audit), OWASP Top 10 checks, secrets detection. |
| P4-W4 | ci-cd-health-check | Weekly | 30min | CI/CD pipeline health check: build time trends, flaky test identification, deployment frequency metrics, rollback capability verification. |
| P4-W5 | test-case | Weekly | 1h | Design high-signal test matrices: happy path, boundary conditions, error paths, regression coverage. Quality over quantity. |
| P4-M1 | devops-skill-builder | Monthly | 4h | Learn one DevOps skill: Docker multi-stage builds, Kubernetes deployment, Terraform IaC, monitoring/alerting, log aggregation. |
| P4-M2 | incident-response-drill | Monthly | 3h | Incident response simulation: given a failure scenario, practice investigate → locate root cause → fix → write post-mortem → define prevention. |
| P4-M3 | dependency-health-audit | Monthly | 2h | Dependency health audit: outdated packages, known vulnerabilities, license compliance, bundle size impact, evaluate alternatives. |
| P4-M4 | debugging-kata | Monthly | 2h | Create and solve debugging exercises: introduce intentional bugs into code, then practice systematic investigation to find them. |
| P4-Q1 | production-readiness-review | Quarterly | 8h | Production readiness checklist: observability (logs/metrics/traces), canary deployment, rollback plan, capacity planning, documentation completeness. |
| P4-Y1 | engineering-standards-review | Yearly | 1d | Annual engineering standards review: update coding conventions, test strategy, documentation standards, toolchain evaluation. |

## P5: Vision & Learning (11 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P5-D1 | daily-trending | Daily | 15min | AI/tech trends daily digest: collect signals from multiple sources, filter noise, summarize what matters and why. |
| P5-D2 | daily-til | Daily | 5min | Today I Learned journal: record one knowledge point in 3-5 sentences, tagged by technology. Build a searchable personal knowledge base. |
| P5-W1 | tech-blog-writer | Weekly | 2h | Write one tech blog post or detailed note: transform this week's most valuable learning into written output. Feynman technique in practice. |
| P5-W2 | open-source-deep-dive | Weekly | 1h | Deep read one excellent open source project's core module: architecture, design decisions, code style. Annotate what you learned. |
| P5-W3 | deep-read-digest | Weekly | 1h | Deep read one significant tech article or paper: extract core argument, key insights, personal implications, action items. |
| P5-M1 | teaching | Monthly | 4h | Generate detailed teaching materials: take a topic you've learned and create a lesson plan that could teach someone else. |
| P5-M2 | new-framework-lab | Monthly | 4h | Hands-on with a new framework or tool: quick start → build a demo → write evaluation report (learning curve, use cases, comparison with alternatives). |
| P5-M3 | rust-ownership-gym | Monthly | 3h | Rust ownership and borrow checker dedicated training: compiler error analysis, lifetime annotations, unsafe boundary understanding, common patterns. |
| P5-Q1 | learning-path-designer | Quarterly | 4h | Design next quarter's learning roadmap: review past quarter → identify ability gaps → set goals → allocate time → select resources. |
| P5-Q2 | side-project-sprint | Quarterly | 2d | Side project sprint: select idea → build MVP in 2 weeks → deploy → write retrospective. Practice end-to-end product thinking. |
| P5-Y1 | career-growth-review | Yearly | 1d | Annual career growth review: skill matrix assessment, growth trajectory analysis, market value positioning, next-year growth strategy. |

## P6: Soft Skills & Leadership (9 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| P6-D1 | daily-standup-craft | Daily | 5min | Standup communication training: articulate yesterday's progress, today's plan, and blockers in 30 seconds. Practice concise, impactful technical communication. |
| P6-W1 | code-review-mentor | Weekly | 1h | Coaching-style code review practice: write review comments that teach principles, not just point out errors. Practice being a mentor through reviews. |
| P6-W2 | technical-writing-coach | Weekly | 1h | Technical writing training: practice one writing format per week — RFC documents, design docs, bug reports, changelogs, API documentation. |
| P6-W3 | estimation-planning-coach | Weekly | 30min | Task estimation training: break down a task → estimate each piece → execute → compare actual vs estimated → calibrate future estimates. |
| P6-M1 | tech-decision-facilitator | Monthly | 2h | Tech decision facilitation practice: given a technical choice scenario, practice gathering context → listing options → analyzing trade-offs → building consensus. |
| P6-M2 | presentation-craft | Monthly | 3h | Technical presentation polish: take a technical topic and create a 5-10 minute talk with clear structure, demo, and storytelling narrative. |
| P6-M3 | one-on-one-prep | Monthly | 1h | 1-on-1 meeting preparation coach: evolve from status updates to career development conversations. Prepare talking points, questions, and goals. |
| P6-Q1 | cross-team-collaboration | Quarterly | 4h | Cross-team collaboration review: identify friction points from past quarter, summarize effective patterns, design improvement strategies. |
| P6-Q2 | tech-leadership-journal | Quarterly | 3h | Tech leadership journal: reflect on your technical decisions' influence, mentoring outcomes, and technology direction judgment calls. |
| P6-Y1 | personal-brand-audit | Yearly | 1d | Personal tech brand audit: evaluate GitHub profile, blog presence, conference talks, open source contributions, community impact. Plan next year's brand building. |

## Bonus: Cross-Cutting Skills (8 practices)

| ID | Practice | Freq | Time | Description |
|----|----------|------|------|-------------|
| BX-W1 | concurrency-patterns-coach | Weekly | 1h | Multi-language concurrency patterns: Go goroutines+channels / Rust tokio+async / Python asyncio / Dart isolates / Kotlin coroutines / Swift structured concurrency. One language, one pattern per week. |
| BX-M1 | accessibility-review | Monthly | 3h | Accessibility review practice: WCAG compliance, VoiceOver testing, Flutter Semantics, Android TalkBack. Most developers neglect this — don't be one of them. |
| BX-M2 | memory-resource-profiler | Monthly | 3h | Memory and resource profiling: React Profiler / Go pprof / Rust zero-cost abstraction verification / Xcode Instruments / Flutter Observatory / Android Profiler. |
| BX-M3 | technical-interview-coach | Monthly | 2h | Two-way interview training: practice as candidate (algorithms, system design, behavioral) AND as interviewer (evaluation framework, question design). |
| BX-M4 | documentation-craftsman | Monthly | 2h | Documentation craftsmanship: pick one document (API doc, README, architecture doc) and polish it to exemplary quality. Practice clear, complete, maintainable docs. |
| BX-Q1 | open-source-contributor | Quarterly | 2d | Open source contribution: choose a project → find a good first issue → submit a PR → respond to review → get merged. Real-world collaboration practice. |
| BX-Q2 | fullstack-integration-drill | Quarterly | 2d | Full-stack integration drill: build one complete feature across React/Vue frontend → Python/Go/Rust API → database → deployment. End-to-end thinking. |
| BX-Q3 | flutter-platform-channel-lab | Quarterly | 1d | Flutter platform channel experiment: build native bridges between Dart ↔ Swift (iOS) and Dart ↔ Kotlin (Android). Master cross-platform communication. |
