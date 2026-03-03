#!/usr/bin/env python3
"""React static page assembly with graceful fallback."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path
from typing import Any, Dict


THIS_DIR = Path(__file__).resolve().parent
SKILL_ROOT = THIS_DIR.parent
REACT_TEMPLATE_DIR = SKILL_ROOT / "assets" / "web-react"


FALLBACK_HTML = """<!doctype html>
<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
  <title>Who Am I React Fallback</title>
  <style>
    body { margin: 0; font-family: Avenir Next, Segoe UI, sans-serif; background: #0b1724; color: #eaf4f8; }
    .wrap { width: min(960px, 92vw); margin: 24px auto; }
    .card { background: #12263a; border: 1px solid #2c4f66; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
    .muted { color: #92b9c8; }
  </style>
</head>
<body>
  <div class=\"wrap\">
    <div class=\"card\">
      <h1>Who Am I / 我是谁 (React Fallback)</h1>
      <p id=\"en\"></p>
      <p id=\"zh\" class=\"muted\"></p>
    </div>
    <div class=\"card\">
      <h2>Dimensions</h2>
      <div id=\"dims\"></div>
    </div>
  </div>
  <script>
    const profile = __PROFILE_JSON__;
    const id = profile.identity || {};
    document.getElementById('en').textContent = id.summary_en || '';
    document.getElementById('zh').textContent = id.summary_zh || '';
    const dims = document.getElementById('dims');
    (id.dimensions || []).forEach((d) => {
      const p = document.createElement('p');
      p.textContent = `${d.label_en} / ${d.label_zh}: ${d.score}/100`;
      dims.appendChild(p);
    });
  </script>
</body>
</html>
"""



def _run(cmd: list[str], cwd: Path, timeout: int = 120) -> subprocess.CompletedProcess:
    return subprocess.run(
        cmd,
        cwd=str(cwd),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=timeout,
        check=False,
    )



def render_react_web(profile: Dict[str, Any], out_root: Path) -> Dict[str, Any]:
    out_root.mkdir(parents=True, exist_ok=True)
    app_dir = out_root / "react-app"
    dist_dir = out_root / "react-dist"

    if app_dir.exists():
        shutil.rmtree(app_dir)
    shutil.copytree(REACT_TEMPLATE_DIR, app_dir)

    data_file = app_dir / "src" / "profile-data.json"
    data_file.write_text(json.dumps(profile, ensure_ascii=False, indent=2), encoding="utf-8")

    build_ok = False
    warnings = []

    npm = shutil.which("npm")
    if not npm:
        warnings.append("npm not found; generated fallback static react-dist.")
    else:
        try:
            install = _run([npm, "install", "--silent", "--no-audit", "--no-fund"], cwd=app_dir, timeout=120)
            if install.returncode != 0:
                warnings.append("npm install failed; using fallback dist.")
            else:
                build = _run([npm, "run", "build"], cwd=app_dir, timeout=120)
                if build.returncode == 0:
                    built = app_dir / "dist"
                    if dist_dir.exists():
                        shutil.rmtree(dist_dir)
                    shutil.copytree(built, dist_dir)
                    build_ok = True
                else:
                    warnings.append("npm run build failed; using fallback dist.")
        except Exception as exc:
            warnings.append(f"react build exception: {exc}")

    if not build_ok:
        dist_dir.mkdir(parents=True, exist_ok=True)
        fallback = FALLBACK_HTML.replace("__PROFILE_JSON__", json.dumps(profile, ensure_ascii=False))
        (dist_dir / "index.html").write_text(fallback, encoding="utf-8")

    return {
        "app_dir": str(app_dir),
        "dist_dir": str(dist_dir),
        "index_html": str(dist_dir / "index.html"),
        "build_ok": build_ok,
        "warnings": warnings,
    }


if __name__ == "__main__":
    demo = {"identity": {"summary_en": "demo", "summary_zh": "示例", "dimensions": []}}
    out = render_react_web(demo, Path("/tmp/who-am-i-react-demo"))
    print(json.dumps(out, indent=2, ensure_ascii=False))
