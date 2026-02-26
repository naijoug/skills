# Skills Collection

Personal collection of local skills, organized under a dedicated `skills/` directory.

## Project Structure

```text
.
├── README.md
└── skills/
    ├── teaching-plan/
    │   └── SKILL.md
    ├── example-skill/
    │   └── SKILL.md
    └── trending/
        └── SKILL.md
```

## Installation

### Recommended: Clone and symlink only skill folders

```bash
git clone https://github.com/naijoug/skills.git ~/.config/codex/skills-custom
ln -s ~/.config/codex/skills-custom/skills/* ~/.config/codex/skills/
```

This repo contains docs and metadata at the root, so symlinking `skills/*` is safer than linking the whole repository root.

## Skills

Each skill lives in `skills/<skill-name>/SKILL.md`.

Current skills:

- `teaching-plan`: Generate detailed Markdown teaching plans/lesson scripts from GitHub URLs or text materials
- `trending`: Collect and summarize daily AI trends/news/topics
- `example-skill`: Template for creating new skills

## Creating a New Skill

```sh
mkdir -p skills/my-skill
cat > skills/my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: Use when [specific trigger conditions for this skill]
---

# My Skill

## Overview
What this skill is for.

## When to Use
- Trigger 1
- Trigger 2

## Steps
1. Do X
2. Do Y

## Examples
~~~bash
codex command example
~~~
EOF
```

## Maintenance Notes

- Keep one skill per directory
- Prefer `name` + `description` only in frontmatter
- Write `description` as a trigger ("Use when ..."), not a workflow summary
