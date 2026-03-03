#!/usr/bin/env python3
"""Markdown renderer aligned with promptfolio-summarize output structure."""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Dict, List



def _json_block(obj: Any) -> str:
    return "```json\n" + json.dumps(obj, ensure_ascii=False, indent=2) + "\n```"



def _bullets(items: List[str]) -> List[str]:
    if not items:
        return ["- (none)"]
    return [f"- {x}" for x in items]



def _render_tone_profile(title: str, data: Dict[str, Any]) -> List[str]:
    lines: List[str] = [title, ""]
    if not data:
        lines.append("- (none)")
        lines.append("")
        return lines

    lines.append(f"- Archetype: **{data.get('title', '')}**")
    lines.append(f"- Subtitle: {data.get('subtitle', '')}")
    lines.append(f"- Grade: `{data.get('grade', '')}`")
    lines.append(f"- One-liner: {data.get('oneLiner', '')}")
    lines.append("")

    for sec in data.get("sections", []):
        lines.append(f"### {sec.get('heading', 'Untitled Section')}")
        lines.append(sec.get("body", ""))
        quotes = sec.get("quotes", [])
        if quotes:
            lines.append("- Quotes:")
            for q in quotes:
                lines.append(f"  - \"{q}\"")
        lines.append("")

    stats = data.get("stats", [])
    if stats:
        lines.append("### Stats")
        for st in stats:
            lines.append(f"- {st.get('label', 'metric')}: `{st.get('score', 0)}`")
        lines.append("")
    return lines


def render_markdown(profile: Dict[str, Any]) -> str:
    meta = profile.get("meta", {})
    inv = profile.get("inventory", {})
    sess = profile.get("sessions", {})
    prof = profile.get("profile", {})
    identity = profile.get("identity", {})
    skills = profile.get("skills", [])
    evidence = profile.get("evidence", [])

    topology = sess.get("topology", {})
    sources = topology.get("sources", [])

    lines: List[str] = []
    lines.append("# Who Am I Report / 我是谁画像报告")
    lines.append("")
    lines.append(f"Generated: {meta.get('generated_at', datetime.utcnow().isoformat())}")
    lines.append(f"Mode: `{meta.get('mode', 'unknown')}`")
    lines.append("")

    lines.append("## 1. User Portrait / 用户画像")
    lines.append("")
    lines.append(prof.get("thinkingStyle", identity.get("user_portrait", "(portrait unavailable)")))
    lines.append("")

    lines.append("## 2. Portrait Dimensions (Structured) / 画像维度（结构化）")
    lines.append("")
    lines.append(_json_block(prof.get("portraitDimensions", identity.get("portrait_dimensions", {}))))
    lines.append("")

    lines.append("## 3. Agent Skills / 可复用 Agent 技能")
    lines.append("")
    if skills:
        for i, sk in enumerate(skills, start=1):
            lines.append(f"### {i}. {sk.get('title', 'Untitled Skill')}")
            lines.append(f"- Category: `{sk.get('category', 'unknown')}`")
            lines.append(f"- Trigger: `{sk.get('triggerType', '')}`")
            lines.append(f"- Detection Path: `{sk.get('detectionPath', '')}`")
            lines.append(f"- Proficiency: `{sk.get('proficiency', '')}`")
            lines.append(f"- Source Sessions: `{sk.get('sourceSessions', 0)}`")
            lines.append(f"- Evidence: {sk.get('evidence', '')}")
            lines.append("")
            lines.append("```markdown")
            lines.append(sk.get("skillContent", ""))
            lines.append("```")
            lines.append("")
    else:
        lines.append("- No qualified agent skills extracted in this run.")
        lines.append("")

    lines.append("## 4. Curiosity Map / 好奇心轨迹")
    lines.append("")
    lines.append(_json_block(prof.get("curiosityMap", identity.get("curiosity_map", {}))))
    lines.append("")

    lines.append("## 5. Catchphrases / 个人高频表达")
    lines.append("")
    lines.extend(_bullets(prof.get("catchphrases", identity.get("catchphrases", []))))
    lines.append("")

    lines.append("## 6. Skill Radar / 能力雷达")
    lines.append("")
    lines.append(_json_block(prof.get("skillRadar", identity.get("skill_radar", []))))
    lines.append("")

    lines.append("## 7. Highlights / 关键亮点")
    lines.append("")
    highlights = prof.get("highlights", identity.get("highlights", []))
    if highlights:
        for h in highlights:
            lines.append(f"### {h.get('title', 'Untitled')}" )
            for d in h.get("details", []):
                lines.append(f"- {d}")
            lines.append("")
    else:
        lines.append("- (none)")
        lines.append("")

    lines.append("## 8. Summary / 摘要")
    lines.append("")
    lines.append(f"- EN: {identity.get('summary_en', prof.get('summary', ''))}")
    lines.append(f"- 中文: {identity.get('summary_zh', '')}")
    lines.append("")

    roast = profile.get("roastProfile", prof.get("roastProfile", identity.get("roast_profile", {})))
    sweet = profile.get("sweetProfile", prof.get("sweetProfile", identity.get("sweet_profile", {})))
    lines.extend(_render_tone_profile("## 9. Roast Profile / 调侃画像", roast))
    lines.extend(_render_tone_profile("## 10. Sweet Profile / 赞美画像", sweet))

    lines.append("## Tool & Software Landscape / 工具生态")
    lines.append("")
    platform_info = inv.get("platform", {})
    lines.append(f"- Platform: `{platform_info.get('system', 'unknown')} {platform_info.get('release', '')}`")
    lines.append(f"- CLI Tools: `{inv.get('cli', {}).get('count', 0)}`")
    lines.append(f"- GUI Apps: `{inv.get('gui', {}).get('count', 0)}`")
    lines.append(f"- AI Tools Detected: `{inv.get('ai_tools', {}).get('count', 0)}`")
    lines.append("")

    lines.append("## AI Session Topology / 会话拓扑")
    lines.append("")
    lines.append(f"- Total sessions: `{topology.get('total_sessions', 0)}`")
    lines.append(f"- Total messages: `{topology.get('total_messages', 0)}`")
    lines.append(f"- Estimated tokens: `{topology.get('total_tokens', 0)}`")
    lines.append(f"- Parse success: `{sess.get('parse_success', 0.0)}`")
    lines.append(f"- Incremental included files: `{sess.get('incremental', {}).get('included_files', 0)}`")
    lines.append("")
    for src in sources:
        lines.append(
            f"- `{src['source']}`: sessions={src['sessions']}, messages={src['messages']}, tokens={src['tokens']}, range={src.get('date_min')}..{src.get('date_max')}"
        )
    lines.append("")

    lines.append("## Evidence Ledger (Redacted) / 脱敏证据表")
    lines.append("")
    lines.append("| Source | Path | Snippet |")
    lines.append("|---|---|---|")
    for row in evidence[:50]:
        src = str(row.get("source", "")).replace("|", "/")
        path = str(row.get("path", "")).replace("|", "/")
        snip = str(row.get("snippet", "")).replace("|", "/")
        lines.append(f"| {src} | {path} | {snip} |")

    return "\n".join(lines) + "\n"


if __name__ == "__main__":
    print(render_markdown({"meta": {}, "inventory": {}, "sessions": {}, "identity": {}, "profile": {}, "skills": [], "evidence": []}))
