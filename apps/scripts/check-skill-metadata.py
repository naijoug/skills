#!/usr/bin/env python3
"""Temporary compatibility entrypoint; implementation moved to scripts/quality."""
import runpy
import sys
from pathlib import Path
quality = Path(__file__).resolve().parents[2] / "scripts/quality"
sys.path.insert(0, str(quality))
if __name__ == "__main__":
    runpy.run_path(str(quality / "check-skill-metadata.py"), run_name="__main__")
