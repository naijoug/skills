import importlib.util
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
TUI = ROOT / "apps/skills-manager-tui"
sys.path.insert(0, str(TUI))


def load_checker():
    spec = importlib.util.spec_from_file_location("skill_metadata_check", ROOT / "apps/scripts/check-skill-metadata.py")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def make_skill(root: Path, relative="manual/plan/demo", identity="ng-plan-demo") -> Path:
    directory = root / relative
    directory.mkdir(parents=True)
    (directory / "SKILL.md").write_text(f"---\nname: {identity}\ndescription: Draft a release plan on request.\n---\n\n# Demo\n", encoding="utf-8")
    (directory / "skill.yaml").write_text(
        f"id: {identity}\nversion: 1.0.0\ntitle: Demo\nsummary: Draft a plan.\nkind: prompt_only\n"
        "tags:\n  - planning\ntriggers:\n  keywords:\n    - release plan\ncompatibility:\n  tools:\n    - codex\n",
        encoding="utf-8",
    )
    (directory / "agents").mkdir()
    (directory / "agents/openai.yaml").write_text("policy:\n  allow_implicit_invocation: false\n", encoding="utf-8")
    return directory
