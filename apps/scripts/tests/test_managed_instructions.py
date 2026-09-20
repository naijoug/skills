import json
import subprocess
import tempfile
import unittest
from pathlib import Path

from support import TUI, make_skill
import managed_instructions as managed


class ManagedInstructionsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / "inject.md"
        self.source.write_text("New rule\n")
        self.target = self.root / "AGENTS.md"

    def test_sync_update_remove_preserve_user_bytes_and_other_blocks(self):
        original = "User rule\n<!-- skills-linker:other:begin -->\nOther rule\n<!-- skills-linker:other:end -->\n"
        self.target.write_text(original)
        self.assertEqual(managed.synchronize("sync", self.target, "demo", self.source), "added")
        first = self.target.read_bytes()
        self.assertEqual(managed.synchronize("sync", self.target, "demo", self.source), "current")
        self.assertEqual(self.target.read_bytes(), first)
        self.source.write_text("Updated rule\n")
        self.assertEqual(managed.synchronize("status", self.target, "demo", self.source), "stale")
        self.assertEqual(managed.synchronize("sync", self.target, "demo", self.source), "updated")
        managed.synchronize("remove", self.target, "demo")
        self.assertEqual(self.target.read_text(), original)

    def test_malformed_block_leaves_file_unchanged(self):
        self.target.write_text("User\n<!-- skills-linker:demo:begin -->\nNo end\n")
        original = self.target.read_bytes()
        for action in ("sync", "remove"):
            with self.assertRaises(ValueError):
                managed.synchronize(action, self.target, "demo", self.source)
            self.assertEqual(self.target.read_bytes(), original)

    def test_crlf_and_symlink_are_preserved(self):
        real = self.root / "rules.md"
        real.write_bytes(b"User\r\n")
        self.target.symlink_to(real)
        managed.synchronize("sync", self.target, "demo", self.source)
        self.assertTrue(self.target.is_symlink())
        self.assertEqual(managed.synchronize("sync", self.target, "demo", self.source), "current")
        self.assertNotIn(b"\n", real.read_bytes().replace(b"\r\n", b""))

    def test_status_does_not_create_files(self):
        target = self.root / "absent/rules.md"
        self.assertEqual(managed.synchronize("status", target, "demo", self.source), "missing")
        self.assertFalse(target.parent.exists())


class LinkerIntegrationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.skills = self.root / "sources"
        self.source = make_skill(self.skills, "auto/demo", "demo")
        (self.source / "inject.md").write_text("Original instruction\n")
        self.project = self.root / "project"
        self.project.mkdir()
        (self.project / "AGENTS.md").write_text("User instruction\n")
        self.destination = self.project / ".codex/skills/demo"

    def run_linker(self, action, *options, success=True):
        result = subprocess.run([str(TUI / "skills-linker"), action, "--skills-root", str(self.skills), "--tool", "codex", "--scope", "project", "--project-root", str(self.project), "--json", *options, "demo"], capture_output=True, text=True)
        if success:
            self.assertEqual(result.returncode, 0, result.stderr)
        return result

    def test_copy_refresh_requires_force_and_preserves_local_edits(self):
        self.run_linker("install", "--mode", "copy")
        (self.destination / "local-notes.md").write_text("User's edits\n")
        (self.source / "inject.md").write_text("New source instruction\n")
        result = self.run_linker("install", "--mode", "copy")
        self.assertEqual(json.loads(result.stdout)["results"][0]["status"], "skip")
        self.assertEqual((self.destination / "local-notes.md").read_text(), "User's edits\n")
        self.assertNotEqual(self.run_linker("doctor", success=False).returncode, 0)
        self.run_linker("install", "--mode", "copy", "--force")
        self.run_linker("doctor")
        self.assertIn("New source instruction", (self.project / "AGENTS.md").read_text())

    def test_symlink_reinstall_syncs_injection_and_uninstall_retains_user_rules(self):
        self.run_linker("install", "--mode", "symlink")
        (self.source / "inject.md").write_text("Updated instruction\n")
        self.run_linker("install", "--mode", "symlink")
        self.run_linker("doctor")
        self.run_linker("uninstall")
        self.assertEqual((self.project / "AGENTS.md").read_text(), "User instruction\n")
        self.assertFalse(self.destination.exists())

    def test_unmanaged_conflict_does_not_gain_instructions(self):
        self.destination.mkdir(parents=True)
        (self.destination / "SKILL.md").write_text("User's skill")
        result = self.run_linker("install")
        self.assertEqual(json.loads(result.stdout)["results"][0]["status"], "skip")
        self.assertEqual((self.project / "AGENTS.md").read_text(), "User instruction\n")
