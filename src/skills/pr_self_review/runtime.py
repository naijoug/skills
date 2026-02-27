from __future__ import annotations

from typing import Any


def run(inputs: dict[str, Any] | None = None) -> dict[str, Any]:
    payload = inputs or {}
    change_goal = _normalize(payload.get("change_goal")) or "(describe the intended change)"
    non_goals = _normalize(payload.get("non_goals")) or "(list what is explicitly out of scope)"
    validation_steps = _normalize(payload.get("validation_steps")) or "(add commands or manual checks)"
    risk_areas = _normalize(payload.get("risk_areas")) or "(call out risky modules and edge cases)"
    rollback_plan = _normalize(payload.get("rollback_plan")) or "(state rollback or mitigation strategy)"

    checklist_markdown = "\n".join(
        [
            "## PR Self Review Checklist",
            "",
            "### Intent",
            f"- Change goal: {change_goal}",
            f"- Non-goals: {non_goals}",
            "",
            "### Findings (before external review)",
            "- [ ] Behavior risk: Confirm no unintended behavior changes in defaults, null handling, and compatibility paths",
            "- [ ] Test gap: Add/verify boundary and regression tests for changed behavior",
            "- [ ] Readability issue: Ensure naming, structure, and comments communicate intent clearly",
            "- [ ] Operability issue: Verify logs/metrics/errors make rollout and debugging possible",
            "",
            "### PR Description Notes",
            f"- Repro / validation steps: {validation_steps}",
            f"- Risk areas: {risk_areas}",
            f"- Rollback plan (if needed): {rollback_plan}",
        ]
    )

    return {
        "checklist_markdown": checklist_markdown,
        "summary": {
            "change_goal": change_goal,
            "risk_areas": risk_areas,
        },
    }


def _normalize(value: Any) -> str:
    if value is None:
        return ""
    return str(value).strip()
