#!/usr/bin/env python3
"""Render offline native static webpage for profile."""

from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any, Dict


THIS_DIR = Path(__file__).resolve().parent
SKILL_ROOT = THIS_DIR.parent
ASSETS_DIR = SKILL_ROOT / "assets" / "web-native"



def render_native_web(profile: Dict[str, Any], out_dir: Path) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)

    template_path = ASSETS_DIR / "template.html"
    style_src = ASSETS_DIR / "style.css"
    app_src = ASSETS_DIR / "app.js"

    template = template_path.read_text(encoding="utf-8")
    html = template.replace("__PROFILE_JSON__", json.dumps(profile, ensure_ascii=False))

    index_path = out_dir / "index.html"
    index_path.write_text(html, encoding="utf-8")

    shutil.copy2(style_src, out_dir / "style.css")
    shutil.copy2(app_src, out_dir / "app.js")

    return index_path


if __name__ == "__main__":
    demo = {"identity": {"summary_en": "demo", "summary_zh": "示例"}, "sessions": {"topology": {"sources": []}}}
    p = render_native_web(demo, Path("/tmp/who-am-i-native-demo"))
    print(str(p))
