from __future__ import annotations

from .models import SkillRecord, ValidationFinding, ValidationReport

VALID_KINDS = {"prompt_only", "prompt_plus_runtime"}


def validate_skills(skills: list[SkillRecord]) -> ValidationReport:
    errors: list[ValidationFinding] = []
    warnings: list[ValidationFinding] = []

    seen_ids: set[str] = set()
    for skill in skills:
        if skill.id in seen_ids:
            errors.append(
                ValidationFinding("error", skill.id, f"Duplicate skill id: {skill.id}")
            )
        seen_ids.add(skill.id)

        if not skill.metadata_path:
            warnings.append(
                ValidationFinding(
                    "warning",
                    skill.id,
                    f"{skill.id}: missing skill.yaml (using SKILL.md frontmatter fallback)",
                )
            )

        if not skill.title.strip():
            errors.append(ValidationFinding("error", skill.id, "Missing title"))

        if skill.kind not in VALID_KINDS:
            errors.append(
                ValidationFinding(
                    "error",
                    skill.id,
                    f"Invalid kind '{skill.kind}', expected one of {sorted(VALID_KINDS)}",
                )
            )

        if skill.kind == "prompt_plus_runtime" and not skill.runtime.get("entrypoint"):
            errors.append(
                ValidationFinding(
                    "error",
                    skill.id,
                    "prompt_plus_runtime skill missing runtime.entrypoint",
                )
            )

    return ValidationReport(errors=errors, warnings=warnings)

