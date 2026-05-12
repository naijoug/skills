# Reference Pack

- Topic: `Open-source skills libraries and marketplaces for Codex / Claude Code / cross-agent workflows`
- Generated: `2026-04-23`
- Scope: `GitHub discovery + local shallow clones completed under .ref/repos/`

## Search Queries

- `GitHub AI coding skills repository Claude Code skills Codex skills`
- `GitHub Claude Code skills collection open source`
- `GitHub Codex skills open source prompts skills collection`
- `GitHub agent skills collection prompts coding assistant`
- `OpenPackage GitHub agent skills repository`
- `GitHub AI agent skills marketplace repository open source`
- `GitHub anthropics skills SKILL.md`
- `GitHub openai skills SKILL.md`

## Official Docs

| Title | Link | Why It Matters |
| --- | --- | --- |
| OpenAI Agent Skills repo | https://github.com/openai/skills | Codex-side baseline for `.system`, `.curated`, `skill-installer`, and `skill-creator` layout. |
| Anthropic Skills repo | https://github.com/anthropics/skills | Canonical Claude-side examples plus `spec/` and `template/` folders for skill design. |
| Claude Code skills topic | https://github.com/topics/claude-code-skills | Useful discovery surface for active community skill ecosystems and naming conventions. |
| Codex skill topic | https://github.com/topics/codex-skill | Useful discovery surface for Codex-native packaging and compatibility patterns. |

## Open Source Projects

| Project | Link | Local Path | Why Selected |
| --- | --- | --- | --- |
| `openai/skills` | https://github.com/openai/skills | `.ref/repos/openai-skills` | Official Codex baseline: install/distribution patterns, curated/system split. |
| `anthropics/skills` | https://github.com/anthropics/skills | `.ref/repos/anthropics-skills` | Official Claude baseline: examples, spec, template, and skill-creator patterns. |
| `alirezarezvani/claude-skills` | https://github.com/alirezarezvani/claude-skills | `.ref/repos/alirezarezvani-claude-skills` | Large cross-platform library with explicit Codex/OpenClaw/Hermes support and conversion scripts. |
| `secondsky/claude-skills` | https://github.com/secondsky/claude-skills | `.ref/repos/secondsky-claude-skills` | High-volume plugin-style skill repo with clear install and validation scripts. |
| `mxyhi/ok-skills` | https://github.com/mxyhi/ok-skills | `.ref/repos/mxyhi-ok-skills` | Portable top-level skill layout with explicit upstream attribution and practical multi-agent workflows. |
| `akiojin/skills` | https://github.com/akiojin/skills | `.ref/repos/akiojin-skills` | Small but useful dual-target repo covering Claude plugins, Codex `.skill` packaging, and GitHub workflow skills. |
| `trailofbits/skills` | https://github.com/trailofbits/skills | `.ref/repos/trailofbits-skills` | Strong example of plugin-first repo with a Codex compatibility bridge and validation rules. |
| `ComposioHQ/awesome-codex-skills` | https://github.com/ComposioHQ/awesome-codex-skills | `.ref/repos/composio-awesome-codex-skills` | Codex-native skill catalog plus installer/creator helpers and many automation-oriented examples. |

## Repo Notes

### `openai/skills`

- Local path: `.ref/repos/openai-skills`
- Coverage: official Codex-oriented distribution repo rather than one giant community bundle.
- Key files/modules:
  - `README.md`
  - `skills/.system/skill-creator/SKILL.md`
  - `skills/.system/skill-installer/SKILL.md`
  - `skills/.curated/gh-address-comments/`
- Mechanisms worth borrowing:
  - Split responsibilities into `.system`, `.curated`, `.experimental`.
  - Treat install as first-class via a dedicated `skill-installer`.
  - Keep skill folders minimal and rely on frontmatter + progressive disclosure.
- Caveats:
  - More of a baseline/reference repo than a giant catalog.
  - Some skill content is curated/system-internal rather than community-style marketplace packaging.

### `anthropics/skills`

- Local path: `.ref/repos/anthropics-skills`
- Coverage: official Claude examples, spec, template, and skill-creation guidance.
- Key files/modules:
  - `README.md`
  - `skills/skill-creator/SKILL.md`
  - `spec/`
  - `template/`
  - `skills/docx`, `skills/pdf`, `skills/pptx`, `skills/xlsx`
- Mechanisms worth borrowing:
  - Keep a `spec/` and `template/` next to real example skills.
  - Use `skill-creator` as a meta-skill instead of burying authoring rules in repo docs.
  - Show both lightweight examples and production-grade document skills in one repo.
- Caveats:
  - Some document skills are source-available rather than fully open-source.
  - Claude-specific distribution assumptions are stronger than this repo's current tool-agnostic posture.

### `alirezarezvani/claude-skills`

- Local path: `.ref/repos/alirezarezvani-claude-skills`
- Coverage: very large cross-platform library spanning engineering, product, marketing, finance, personas, and commands.
- Key files/modules:
  - `README.md`
  - `scripts/codex-install.sh`
  - `scripts/convert.sh`
  - `scripts/install.sh`
  - `.codex/skills/`
- Mechanisms worth borrowing:
  - Maintain a dedicated `.codex/skills` sidecar tree instead of treating Codex as an afterthought.
  - Generate per-tool outputs with a conversion pipeline instead of hand-maintaining each format.
  - Keep install scripts per target platform.
- Caveats:
  - Very large monorepo; signal-to-noise ratio is lower when you only care about engineering skills.
  - Clone on macOS showed a case-collision warning under `.github/`, so this repo needs more filesystem hygiene than smaller libraries.

### `secondsky/claude-skills`

- Local path: `.ref/repos/secondsky-claude-skills`
- Coverage: 170+ plugin-style skills focused on frontend, Cloudflare, AI SDKs, API design, security, and testing.
- Key files/modules:
  - `README.md`
  - `CLAUDE.md`
  - `scripts/install-skill.sh`
  - `scripts/install-all.sh`
  - `plugins/<plugin>/skills/<skill-name>/SKILL.md`
- Mechanisms worth borrowing:
  - Explicit two-tier architecture: marketplace plugin vs actual skill directories.
  - Strong internal rules for where `SKILL.md` must live.
  - Validation scripts for frontmatter and marketplace JSON.
- Caveats:
  - Repository organization is optimized for Claude plugin discovery first.
  - For Codex and other tools, the README points users to an external compatibility layer rather than shipping one in-repo.

### `mxyhi/ok-skills`

- Local path: `.ref/repos/mxyhi-ok-skills`
- Coverage: smaller curated cross-agent pack with practical skills, vendored skill packs, and direct AGENTS.md usage.
- Key files/modules:
  - `README.md`
  - `planning-with-files/SKILL.md`
  - `gh-address-comments/SKILL.md`
  - `hyperframes/`
  - `gsap-skills/`
- Mechanisms worth borrowing:
  - Keep many skills as direct top-level folders so the repo can be cloned and used immediately.
  - Preserve upstream attribution and source URLs when vendoring third-party skills.
  - Document prerequisites and source provenance directly in the index.
- Caveats:
  - No heavy installer/distribution layer; assumes users know how to clone and wire AGENTS.md.
  - Quality varies by upstream source because part of the repo is a curated/vendor layer.

### `akiojin/skills`

- Local path: `.ref/repos/akiojin-skills`
- Coverage: compact repo centered on Claude plugins, Codex packaging, GitHub workflows, Spec Kit, Draw.io, and CLI UI design.
- Key files/modules:
  - `README.md`
  - `skills-repo-maintenance/SKILL.md`
  - `github/skills/gh-pr/SKILL.md`
  - `github/skills/gh-fix-pr/SKILL.md`
  - `codex-skills/dist/`
- Mechanisms worth borrowing:
  - Treat Codex `.skill` packaging as a first-class artifact.
  - Keep a dedicated maintenance skill for the repo itself.
  - Pair slash commands with reusable underlying skills.
- Caveats:
  - Narrower catalog than the larger libraries above.
  - Many patterns are optimized around GitHub-centric workflows rather than generic cross-domain skills.

### `trailofbits/skills`

- Local path: `.ref/repos/trailofbits-skills`
- Coverage: security-heavy marketplace with strong internal standards and a Codex bridge.
- Key files/modules:
  - `README.md`
  - `.codex/scripts/install-for-codex.sh`
  - `.codex/skills/`
  - `CLAUDE.md`
  - `plugins/*/skills/`
- Mechanisms worth borrowing:
  - Enforce a rule that any plugin skill must remain reachable through `.codex/skills/<name>`.
  - Add validation for the Codex bridge in CI.
  - Use wrapper skills when a plugin is command-only or hook-only.
- Caveats:
  - Domain coverage is mostly security/testing/infrastructure rather than general app development.
  - Top-level license is CC BY-SA 4.0, which is fine for reference but worth checking before copying text directly.

### `ComposioHQ/awesome-codex-skills`

- Local path: `.ref/repos/composio-awesome-codex-skills`
- Coverage: Codex-oriented catalog plus a very large automation-heavy subtree.
- Key files/modules:
  - `README.md`
  - `skill-installer/SKILL.md`
  - `skill-creator/SKILL.md`
  - `connect/`
  - `composio-skills/`
- Mechanisms worth borrowing:
  - Good Codex-native onboarding language in the root README.
  - Keeps installer and creator helpers alongside the actual skills.
  - Useful example of catalog + direct skill folders + app automation packs in one repo.
- Caveats:
  - The automation subtree is extremely large and noisy.
  - Top-level browsing is harder because many folders are generated/integration-oriented rather than human-curated skills.

## Cross-Project Patterns

- Official baselines are small and opinionated.
  - `openai/skills` and `anthropics/skills` focus on layout, triggering, templates, and creation guidance more than sheer catalog size.
- Community libraries split into three dominant shapes.
  - Direct top-level skill folders: `mxyhi/ok-skills`
  - Plugin/marketplace grouping with nested skills: `secondsky/claude-skills`, `trailofbits/skills`
  - Hybrid catalog plus install helpers: `ComposioHQ/awesome-codex-skills`, `akiojin/skills`
- Once a repo grows, validation and install tooling become mandatory.
  - `scripts/install-skill.sh`, `install-all.sh`, `codex-install.sh`, `install-for-codex.sh`, frontmatter validators, and marketplace JSON validators appear repeatedly.
- Cross-tool support usually needs an explicit bridge, not just "compatible markdown".
  - `.codex/skills/`, `.skill` packaging, or conversion/export scripts show up in the more serious repos.
- Provenance matters when reusing third-party skills.
  - `mxyhi/ok-skills` is the clearest example: vendored packs keep source URLs and attribution instead of pretending everything is first-party.

## Recommended Directions

- Keep this repo's current `skills/manual/<group>/<name>` structure.
  - It is already cleaner than the heavier marketplace/plugin trees and works well with `skills-linker`.
- Add provenance metadata when importing or adapting upstream skills.
  - At minimum: upstream URL, imported commit/date, and whether the local copy is forked or mirrored.
- Add a repo validation script once the skill count grows further.
  - Check for `SKILL.md`, `skill.yaml`, `references/trigger-examples.md`, and maybe enforce frontmatter/description length.
- Borrow the "meta-skill for maintaining the skill repo" idea.
  - `akiojin/skills` and `anthropics/skills` both show the value of a dedicated authoring/maintenance workflow.
- Only build a multi-tool export layer if distribution becomes a real goal.
  - `alirezarezvani/claude-skills` proves it is possible, but it also adds real complexity.
- Prefer curated imports over bulk vendoring.
  - `mxyhi/ok-skills` is a better fit for this repo's scale than the huge generated/marketplace catalogs.

## Open Questions

- Do you want this repo to remain a source-of-truth skill library, or evolve into a marketplace/distribution repo?
- Should third-party skills be vendored into this repo, or just referenced from `docs/ref.md` and installed on demand?
- Do you want per-skill provenance metadata in `skill.yaml` or a separate import manifest?
- Do you want a future `ref` update step that syncs selected upstream repos to pinned commits under `.ref/repos/`?
