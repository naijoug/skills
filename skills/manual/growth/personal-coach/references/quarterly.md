# Quarterly Assessment

**Trigger:** User asks for quarterly evaluation.

**Flow:**

1. Use current ratings if provided, otherwise ask for the ratings needed for the requested assessment.
2. Compare with previous quarter's ratings.
3. Present growth analysis:

```
🔄 Quarterly Assessment (YYYY QN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Growth Curve:
  P1 Code Craft:      3.0 → 3.5 ↑
  P2 Architecture:     3.0 → 3.5 ↑
  P3 AI-Era Skills:    2.5 → 3.0 ↑
  P4 Engineering:      3.5 → 3.5 →
  P5 Vision:           3.0 → 3.0 →
  P6 Soft Skills:      2.0 → 2.5 ↑

🏆 Milestones Achieved: [list]
❌ Milestones Missed: [list + analysis]
🔍 Root Cause: [why some goals were missed]

🎯 Next Quarter Focus:
  Priority 1: [pillar + specific goal]
  Priority 2: [pillar + specific goal]
  Priority 3: [pillar + specific goal]

📌 New Milestones:
  - [ ] Milestone 1
  - [ ] Milestone 2
  - [ ] Milestone 3
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. Update all sections of `~/.personal-growth/growth-roadmap.md`: matrix, focus, milestones, trajectory.

Persist only actual plan changes or confirmed progress when tracking is requested
or already established. Do not create or rewrite a roadmap for a one-off answer.
