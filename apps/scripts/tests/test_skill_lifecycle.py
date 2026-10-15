"""Retired sources remain recoverable without re-entering the active catalog."""

import hashlib
import json
import re
import unittest
from pathlib import Path

from support import ROOT


class SkillLifecycleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifests = list((ROOT / "archive/skills").glob("*/manifest.json"))
        cls.active = {}
        for path in (ROOT / "skills").rglob("SKILL.md"):
            identity = re.search(r"^name: (.+)$", path.read_text(), re.M).group(1)
            cls.active[identity] = path

    def entries(self):
        for path in self.manifests:
            yield from json.loads(path.read_text())["entries"]

    def test_archived_sources_are_complete_and_unchanged(self):
        self.assertTrue(self.manifests)
        for entry in self.entries():
            with self.subTest(skill=entry["id"]):
                archive = ROOT / entry["archive"]
                self.assertTrue(entry["sha256"])
                for relative, expected in entry["sha256"].items():
                    content = (archive / relative).read_bytes()
                    self.assertEqual(hashlib.sha256(content).hexdigest(), expected, relative)
                self.assertTrue((archive / "SKILL.md.disabled").is_file())
                self.assertTrue((archive / "skill.yaml.disabled").is_file())

    def test_archives_are_not_discoverable_skill_packages(self):
        archive = ROOT / "archive/skills"
        self.assertEqual(list(archive.rglob("SKILL.md")), [])
        self.assertEqual(list(archive.rglob("skill.yaml")), [])
        for entry in self.entries():
            self.assertNotIn(entry["id"], self.active)
            self.assertFalse((ROOT / entry["original"]).exists())

    def test_replacements_and_reference_destinations_resolve(self):
        for entry in self.entries():
            with self.subTest(skill=entry["id"]):
                if entry["replacement"]:
                    self.assertIn(entry["replacement"], self.active)
                if entry["reference"]:
                    self.assertTrue((ROOT / entry["reference"]).is_file())
                if entry["status"] == "disabled":
                    self.assertIsNone(entry["replacement"])

    def test_active_instructions_do_not_route_to_retired_ids(self):
        retired = {entry["id"] for entry in self.entries()}
        for path in (ROOT / "skills").rglob("*"):
            if not path.is_file() or path.suffix not in {".md", ".yaml", ".json"}:
                continue
            ids = set(re.findall(r"\bng-[a-z0-9]+(?:-[a-z0-9]+)*\b", path.read_text()))
            self.assertFalse(ids & retired, f"{path}: {ids & retired}")


if __name__ == "__main__":
    unittest.main()
