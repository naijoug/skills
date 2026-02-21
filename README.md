# Alma Skills Collection

Personal collection of Alma skills.

## Installation

### Option 1: Clone and symlink
```bash
git clone https://github.com/naijoug/alma-skills.git ~/.config/alma/skills-custom
ln -s ~/.config/alma/skills-custom/* ~/.config/alma/skills/
```

### Option 2: Direct clone
```bash
git clone https://github.com/naijoug/alma-skills.git ~/.config/alma/skills
```

## Skills

Each skill is a directory with a `SKILL.md` file containing instructions for Alma.

## Creating a new skill

```bash
mkdir -p my-skill
cat > my-skill/SKILL.md << 'EOF'
---
name: my-skill
description: What this skill does
allowed-tools:
  - Bash
  - Read
  - Write
---

# My Skill

Instructions for Alma on how to use this skill...
EOF
```
