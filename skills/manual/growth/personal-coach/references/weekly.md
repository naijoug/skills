# Weekly Review

**Trigger:** User asks for weekly review or next week's plan.

**Flow:**

1. Use the supplied evidence or this week's log from `~/.personal-growth/growth-roadmap.md`. With no log, ask only for the relevant work summary; do not invent completion rates.
2. Calculate and present:
   - Completion rate (completed / planned)
   - Pillar distribution (which pillars were practiced, which were neglected)
   - Trend vs last week (improving / stable / declining)
   - Most skipped practice and possible reason
3. Output format:

```
📅 Week Review (Week N, YYYY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Completion: X/Y (Z%)
  P1 ██████░░ 75%  P2 ████████ 100%
  P3 ████░░░░ 50%  P4 ██████░░ 75%
  P5 ░░░░░░░░ 0%   P6 ██░░░░░░ 25%

🏆 Wins: [notable completions]
⚠️ Gaps: [pillars that need attention]
📈 Trend: [vs last week]

📋 Next Week Plan:
  Mon: [practice]  Tue: [practice]
  Wed: [practice]  Thu: [practice]
  Fri: [practice]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

4. Update `~/.personal-growth/growth-roadmap.md` Current Focus section with next week's plan.

Persist only actual plan changes or confirmed progress when tracking is requested
or already established. Do not create or rewrite a roadmap for a one-off answer.
