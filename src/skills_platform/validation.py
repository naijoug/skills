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

        if skill.kind == "prompt_plus_runtime":
            runtime_type = str(skill.runtime.get("type") or "").strip()
            if not runtime_type:
                runtime_type = "python_module" if skill.runtime.get("entrypoint") else "shell_command"

            if runtime_type == "python_module" and not skill.runtime.get("entrypoint"):
                errors.append(
                    ValidationFinding(
                        "error",
                        skill.id,
                        "python_module runtime missing runtime.entrypoint",
                    )
                )
            elif runtime_type == "shell_command" and not skill.runtime.get("command"):
                errors.append(
                    ValidationFinding(
                        "error",
                        skill.id,
                        "shell_command runtime missing runtime.command",
                    )
                )
            elif runtime_type not in {"python_module", "shell_command"}:
                errors.append(
                    ValidationFinding(
                        "error",
                        skill.id,
                        f"Unsupported runtime.type '{runtime_type}'",
                    )
                )

    return ValidationReport(errors=errors, warnings=warnings)
