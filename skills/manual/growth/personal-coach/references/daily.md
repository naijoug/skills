# Daily Check-in

**Trigger:** User asks what to practice today.

**Flow:**

1. Use the current request and available roadmap/log. If no state file exists, provide a bounded practice recommendation from the supplied goal and time; offer setup only when useful.
2. Select 1-2 daily practices using the user's priorities; optional rotation defaults:
   - Weight toward highest-priority pillar (40%)
   - Avoid repeating yesterday's pillar
   - If a practice is frequently skipped, suggest an alternative
3. For each recommended practice, output:

```
☀️ Today's Practice (YYYY-MM-DD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Pillar Code] Practice Name (estimated time)

🎯 Goal: What specific skill to train today
📋 Steps:
  1. Concrete action step
  2. Concrete action step
  3. ...
✅ Done when: Clear completion criteria
💡 Tip: One practical tip for this practice
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. After user completes: update the Practice Log section in `~/.personal-growth/growth-roadmap.md`, marking the item as done with `[x]`.

Persist only actual plan changes or confirmed progress when tracking is requested
or already established. Do not create or rewrite a roadmap for a one-off answer.
