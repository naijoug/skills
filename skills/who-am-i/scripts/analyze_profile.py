#!/usr/bin/env python3
"""Profile analysis aligned with promptfolio-summarize style outputs."""

from __future__ import annotations

import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from statistics import mean
from typing import Any, Dict, List, Tuple


DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "AI Workflow Optimization": ["prompt", "agent", "context", "model", "llm", "token", "skill", "automation"],
    "Software Engineering": ["refactor", "architecture", "design", "module", "class", "function", "code"],
    "Debugging & Reliability": ["debug", "bug", "trace", "error", "fail", "root cause", "repro", "fix"],
    "Testing & Quality": ["test", "assert", "coverage", "regression", "verify", "validation", "qa"],
    "Frontend & UX": ["ui", "ux", "layout", "css", "react", "component", "animation"],
    "Backend & Data": ["api", "database", "sql", "service", "backend", "cache", "queue"],
    "Tooling & DevOps": ["docker", "kubernetes", "ci", "cd", "deploy", "script", "cli"],
}

STOPWORDS = {
    "the", "and", "for", "with", "this", "that", "from", "your", "have", "will", "please", "need",
    "help", "can", "you", "are", "what", "how", "why", "when", "where", "then", "just", "make",
}



def _bounded(v: float) -> int:
    return int(max(0, min(100, round(v))))



def _avg(nums: List[float]) -> float:
    return mean(nums) if nums else 0.0



def _text_flags(text: str) -> Dict[str, int]:
    low = text.lower()
    return {
        "is_question": int("?" in low or low.startswith("why") or low.startswith("how")),
        "has_why": int("why" in low),
        "has_structured": int(any(tok in low for tok in ["context:", "goal:", "constraint", "acceptance", "1.", "2.", "- "])),
        "has_correction": int(any(tok in low for tok in ["wrong", "not correct", "should", "must", "don't", "do not", "instead"])),
        "has_debug": int(any(tok in low for tok in ["debug", "trace", "repro", "root cause", "isolate", "failure"])),
        "has_test": int(any(tok in low for tok in ["test", "assert", "verify", "validation", "check", "regression"])),
        "has_plan": int(any(tok in low for tok in ["plan", "step", "roadmap", "phase", "milestone"])),
    }



def _source_topology(by_source: Dict[str, Dict[str, Any]]) -> Dict[str, Any]:
    rows = []
    for source, info in sorted(by_source.items()):
        rows.append(
            {
                "source": source,
                "sessions": int(info.get("sessions", 0)),
                "messages": int(info.get("messages", 0)),
                "tokens": int(info.get("tokens", 0)),
                "date_min": info.get("date_min"),
                "date_max": info.get("date_max"),
            }
        )
    return {
        "sources": rows,
        "total_sessions": sum(r["sessions"] for r in rows),
        "total_messages": sum(r["messages"] for r in rows),
        "total_tokens": sum(r["tokens"] for r in rows),
    }



def _build_metrics(messages: List[Dict[str, Any]], session_rows: List[Dict[str, Any]]) -> Dict[str, Any]:
    texts = [m.get("text", "") for m in messages if m.get("text")]
    lengths = [len(t) for t in texts]

    agg = Counter()
    for t in texts:
        agg.update(_text_flags(t))

    count = max(1, len(texts))
    source_diversity = len(set(s.get("source", "unknown") for s in session_rows))
    changed = sum(1 for s in session_rows if s.get("status") in {"new", "changed"})
    total_sess = max(1, len(session_rows))

    return {
        "message_count": len(texts),
        "avg_len": _avg(lengths),
        "question_ratio": agg["is_question"] / count,
        "why_ratio": agg["has_why"] / count,
        "structured_ratio": agg["has_structured"] / count,
        "correction_ratio": agg["has_correction"] / count,
        "debug_ratio": agg["has_debug"] / count,
        "test_ratio": agg["has_test"] / count,
        "plan_ratio": agg["has_plan"] / count,
        "source_diversity": source_diversity,
        "changed_ratio": changed / total_sess,
    }



def _detect_domains(messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    domain_rows: Dict[str, Dict[str, Any]] = {}

    for domain in DOMAIN_KEYWORDS:
        domain_rows[domain] = {
            "domain": domain,
            "message_count": 0,
            "session_paths": set(),
            "samples": [],
            "flags": Counter(),
            "recent_hits": 0,
            "older_hits": 0,
        }

    now_ts = datetime.now(timezone.utc).timestamp()
    recent_threshold = now_ts - 30 * 86400

    for msg in messages:
        text = msg.get("text", "")
        if not text:
            continue
        low = text.lower()
        path = msg.get("path", "")
        ts = float(msg.get("mtime") or 0)
        flags = _text_flags(text)

        for domain, kws in DOMAIN_KEYWORDS.items():
            if any(kw in low for kw in kws):
                row = domain_rows[domain]
                row["message_count"] += 1
                if path:
                    row["session_paths"].add(path)
                if len(row["samples"]) < 4:
                    row["samples"].append(text.replace("\n", " ")[:180])
                row["flags"].update(flags)
                if ts and ts >= recent_threshold:
                    row["recent_hits"] += 1
                else:
                    row["older_hits"] += 1

    out: List[Dict[str, Any]] = []
    for row in domain_rows.values():
        sess = len(row["session_paths"])
        if sess == 0:
            continue
        count = row["message_count"]
        why_ratio = row["flags"]["has_why"] / max(1, count)
        corr_ratio = row["flags"]["has_correction"] / max(1, count)
        struct_ratio = row["flags"]["has_structured"] / max(1, count)

        if corr_ratio >= 0.12 or struct_ratio >= 0.28:
            relationship = "expert"
            depth = "advanced" if sess >= 3 else "intermediate"
            depth_score = _bounded(62 + sess * 6 + struct_ratio * 20)
        elif why_ratio >= 0.10:
            relationship = "learning"
            depth = "intermediate"
            depth_score = _bounded(45 + sess * 5)
        else:
            relationship = "tool-user"
            depth = "surface"
            depth_score = _bounded(28 + sess * 4)

        evidence_basis = (
            f"{sess} sessions, {count} matched prompts; "
            f"structured={struct_ratio:.2f}, correction={corr_ratio:.2f}, why={why_ratio:.2f}."
        )

        out.append(
            {
                "domain": row["domain"],
                "relationship": relationship,
                "depth": depth,
                "depthScore": depth_score,
                "offers": "domain judgment" if relationship == "expert" else "active exploration",
                "evidenceBasis": evidence_basis,
                "sourceSessions": sess,
                "samples": row["samples"],
                "recent_hits": row["recent_hits"],
                "older_hits": row["older_hits"],
            }
        )

    out.sort(key=lambda x: (x["sourceSessions"], x["depthScore"]), reverse=True)
    return out



def _portrait_dimensions(metrics: Dict[str, Any]) -> Dict[str, Any]:
    verbosity = _bounded(min(100, 30 + metrics["avg_len"] / 6))
    direction = _bounded(35 + (1 - metrics["question_ratio"]) * 50)
    structure = _bounded(20 + metrics["structured_ratio"] * 75)

    perfection = _bounded(30 + metrics["test_ratio"] * 65)
    logic_focus = _bounded(45 + metrics["debug_ratio"] * 45)
    user_focus = _bounded(40 + metrics["question_ratio"] * 35)

    sprint = _bounded(35 + metrics["changed_ratio"] * 60)
    tracking = _bounded(25 + metrics["source_diversity"] * 10)
    patience = _bounded(40 + metrics["why_ratio"] * 45)

    return {
        "spectrums": [
            {"group": "thinking_style", "label": "planning", "left": "planned", "right": "exploratory", "position": _bounded(55 + metrics["plan_ratio"] * 30)},
            {"group": "communication", "label": "verbosity", "left": "terse", "right": "verbose", "position": verbosity},
            {"group": "communication", "label": "direction", "left": "directive", "right": "collaborative", "position": direction},
            {"group": "communication", "label": "structure", "left": "structured", "right": "freeform", "position": structure},
            {"group": "quality", "label": "perfectionism", "left": "perfectionist", "right": "pragmatist", "position": _bounded(100 - perfection)},
            {"group": "quality", "label": "focus", "left": "logic-first", "right": "visual-first", "position": _bounded(100 - logic_focus)},
            {"group": "quality", "label": "orientation", "left": "tech-focused", "right": "user-focused", "position": user_focus},
            {"group": "work_rhythm", "label": "pace", "left": "sprint", "right": "marathon", "position": _bounded(100 - sprint)},
            {"group": "work_rhythm", "label": "tracking", "left": "single-track", "right": "multi-track", "position": tracking},
            {"group": "work_rhythm", "label": "patience", "left": "impatient", "right": "patient", "position": patience},
        ],
        "taste": {
            "rejects": ["ambiguous requirements", "ungrounded claims"],
            "rejectsEvidence": "Frequently asks for constraints, concrete evidence, and verifiable outcomes.",
            "insists": ["structured execution", "observable validation"],
            "insistsEvidence": "Repeatedly uses step-wise framing and verification-oriented wording.",
            "focus": "structural",
        },
        "decisions": {
            "optimizesFor": "clarity",
            "reasoning": "evidence-driven",
            "riskTolerance": "moderate",
            "buildVsBuy": "balanced",
        },
        "failureResponse": {
            "diagnosticStyle": "methodical-isolation" if metrics["debug_ratio"] >= 0.08 else "iterative-redirect",
            "emotionalSignal": "analytical",
            "recoverySpeed": "2-4 turns",
            "strategy": "persistent",
        },
        "collaboration": {
            "primary": "architect" if metrics["structured_ratio"] >= 0.25 else "pair-programmer",
            "secondary": "pair-programmer" if metrics["structured_ratio"] >= 0.25 else "delegator",
            "contextDepth": "thorough" if metrics["avg_len"] >= 220 else "moderate",
            "feedbackStyle": "direct",
        },
        "crossDomain": [],
    }



def _user_portrait(topology: Dict[str, Any], metrics: Dict[str, Any], capabilities: List[Dict[str, Any]]) -> str:
    top_domains = [c["domain"] for c in capabilities[:3]]
    style = "architect-like" if metrics["structured_ratio"] >= 0.25 else "iterative"

    p1 = (
        f"This user operates with a {style} collaboration style and consistently treats AI systems as execution partners rather than black boxes. "
        f"Across {topology.get('total_sessions', 0)} sessions, they show sustained engagement with practical engineering work and task orchestration."
    )
    p2 = (
        "Communication is generally constraint-oriented: prompts often include explicit goals, boundaries, and expected outcomes. "
        "That pattern reduces ambiguity and increases delivery precision in multi-step tasks."
    )
    p3 = (
        "Decision behavior appears evidence-driven. When requests involve uncertainty, they favor measurable checks, verifiable artifacts, and iterative tightening over broad speculative changes."
    )
    p4 = (
        f"Domain signals are strongest in {', '.join(top_domains) if top_domains else 'general technical execution'}, "
        "with clear signs of both domain transfer and operational depth."
    )
    p5 = (
        "Overall, this profile suggests a builder who values clear control surfaces, fast feedback loops, and reusable workflows. "
        "Collaboration fit is highest with peers who can contribute specialized depth while respecting structured execution."
    )
    return "\n\n".join([p1, p2, p3, p4, p5])



def _extract_agent_skills(metrics: Dict[str, Any], capabilities: List[Dict[str, Any]], topology: Dict[str, Any]) -> List[Dict[str, Any]]:
    skills: List[Dict[str, Any]] = []

    if metrics["structured_ratio"] >= 0.2:
        skills.append(
            {
                "title": "Structured Requirement Framing",
                "category": "workflow-pattern",
                "triggerType": "ambiguous multi-step requests",
                "coreTechnique": "Front-load context, goal, constraints, and acceptance criteria before execution.",
                "detectionPath": "proactive-pattern",
                "failureArc": "N/A",
                "proactivePattern": "Repeated structured prompts across sessions reduce rework.",
                "evidence": "Detected high structured-prompt ratio and consistent planning language.",
                "proficiency": "advanced" if topology.get("total_sessions", 0) >= 20 else "intermediate",
                "sourceSessions": max(2, min(9, topology.get("total_sessions", 0) // 8)),
                "skillContent": (
                    "# Structured Requirement Framing\n\n"
                    "## Trigger\n"
                    "Use when a task spans multiple steps, depends on constraints, or could drift due to ambiguity.\n\n"
                    "## Technique\n"
                    "1. State context in 1-2 lines.\n"
                    "2. State goal as a measurable outcome.\n"
                    "3. List non-negotiable constraints.\n"
                    "4. Define acceptance criteria.\n"
                    "5. Ask the agent to confirm assumptions before coding.\n\n"
                    "## Demonstrations\n"
                    "- Ambiguous feature request -> structure first -> reduced revisions.\n"
                    "- Multi-source migration -> clear constraints -> fewer regressions.\n"
                    "- UI redesign -> explicit success checks -> stable implementation.\n\n"
                    "## Principle\n"
                    "Most agent failures come from missing boundaries, not missing intelligence."
                ),
            }
        )

    if metrics["test_ratio"] >= 0.08:
        skills.append(
            {
                "title": "Verification-First Delivery",
                "category": "constraint-recognition",
                "triggerType": "before claiming completion",
                "coreTechnique": "Require observable checks and test evidence before success claims.",
                "detectionPath": "proactive-pattern",
                "failureArc": "N/A",
                "proactivePattern": "Frequent use of verify/check/test wording in execution loops.",
                "evidence": "Validation language appears repeatedly in user prompts.",
                "proficiency": "advanced",
                "sourceSessions": max(2, min(8, topology.get("total_sessions", 0) // 10)),
                "skillContent": (
                    "# Verification-First Delivery\n\n"
                    "## Trigger\n"
                    "Use when an agent is about to report a fix, completion, or pass status.\n\n"
                    "## Technique\n"
                    "1. Ask for explicit verification commands.\n"
                    "2. Capture key outputs, not just exit codes.\n"
                    "3. Compare against acceptance criteria.\n"
                    "4. Report residual risks and untested paths.\n\n"
                    "## Demonstrations\n"
                    "- Bugfix claimed -> test output required -> hidden failure found.\n"
                    "- Refactor complete -> regression checks required -> behavior preserved.\n"
                    "- Data script done -> dry-run evidence captured -> safe rollout.\n\n"
                    "## Principle\n"
                    "Evidence before assertion prevents confidence inflation in autonomous workflows."
                ),
            }
        )

    if metrics["debug_ratio"] >= 0.06:
        skills.append(
            {
                "title": "Failure Isolation Before Fix",
                "category": "debugging-strategy",
                "triggerType": "unexpected failures in iterative tasks",
                "coreTechnique": "Isolate failing scope and root cause hypothesis before patching.",
                "detectionPath": "failure-arc",
                "failureArc": "Incorrect broad fixes -> isolate failing component -> targeted fix succeeds.",
                "proactivePattern": "N/A",
                "evidence": "Debug/trace/root-cause language indicates repeatable isolation behavior.",
                "proficiency": "intermediate",
                "sourceSessions": max(2, min(7, topology.get("total_sessions", 0) // 12)),
                "skillContent": (
                    "# Failure Isolation Before Fix\n\n"
                    "## Trigger\n"
                    "Use when a symptom appears but root cause is unclear.\n\n"
                    "## Technique\n"
                    "1. Reproduce failure with minimum scope.\n"
                    "2. Freeze unrelated changes.\n"
                    "3. Add one probe per hypothesis.\n"
                    "4. Confirm root cause, then patch once.\n"
                    "5. Re-run targeted and neighboring tests.\n\n"
                    "## Demonstrations\n"
                    "- Intermittent test failure -> narrowed fixture -> deterministic fix.\n"
                    "- Runtime crash -> isolated path -> defensive guard patch.\n"
                    "- Build break -> dependency diff probe -> minimal revert+fix.\n\n"
                    "## Principle\n"
                    "Narrowing uncertainty first reduces accidental regressions and wasted edits."
                ),
            }
        )

    # Consolidation: keep strongest 3
    skills.sort(key=lambda x: (x["sourceSessions"], x["proficiency"]), reverse=True)
    return skills[:3]



def _build_curiosity_map(capabilities: List[Dict[str, Any]]) -> Dict[str, Any]:
    exploring = []
    deepening = []
    cooling = []

    for c in capabilities:
        topic = c["domain"]
        recent = c.get("recent_hits", 0)
        older = c.get("older_hits", 0)

        if recent >= 2 and older == 0:
            exploring.append(
                {
                    "topic": topic,
                    "detail": "newly active trajectory",
                    "sessions": c.get("sourceSessions", 0),
                    "trails": ["recent prompt activity", "new context constraints"],
                }
            )
        elif recent >= 2 and older >= 2:
            deepening.append(
                {
                    "topic": topic,
                    "detail": "continued depth over time",
                    "sessions": c.get("sourceSessions", 0),
                    "weeks": max(2, min(12, c.get("sourceSessions", 0) * 2)),
                    "velocity": "fast" if recent >= older else "steady",
                    "trails": ["iterative refinement", "constraint hardening", "quality checks"],
                }
            )
        elif older >= 2 and recent == 0:
            cooling.append(
                {
                    "topic": topic,
                    "lastSeen": "more than 30 days",
                    "previousLevel": "active",
                }
            )

    sparks = []
    if len(capabilities) >= 2:
        a, b = capabilities[0], capabilities[1]
        sparks.append(
            {
                "from": a["domain"],
                "to": b["domain"],
                "description": "shared structured execution patterns across domains",
            }
        )

    return {
        "exploring": exploring,
        "deepening": deepening,
        "coolingOff": cooling,
        "sparks": sparks,
    }



def _extract_catchphrases(messages: List[Dict[str, Any]]) -> List[str]:
    phrase_to_paths: Dict[str, set] = defaultdict(set)

    for msg in messages:
        text = msg.get("text", "")
        path = msg.get("path", "")
        if not text:
            continue

        for seg in re.split(r"[\n。！？!?;；]+", text):
            phrase = seg.strip()
            if len(phrase) < 6 or len(phrase) > 60:
                continue
            norm = re.sub(r"\s+", " ", phrase.lower())
            if all(token in STOPWORDS for token in re.findall(r"[a-z]+", norm)[:6] if token):
                continue
            if re.search(r"[a-z]", norm) and len(norm.split()) < 3:
                continue
            phrase_to_paths[phrase].add(path)

    ranked = [
        (phrase, len(paths))
        for phrase, paths in phrase_to_paths.items()
        if len(paths) >= 2
    ]
    ranked.sort(key=lambda x: (x[1], len(x[0])), reverse=True)

    out = []
    seen_norm = set()
    for phrase, _ in ranked:
        n = phrase.lower()
        if n in seen_norm:
            continue
        seen_norm.add(n)
        out.append(phrase)
        if len(out) >= 5:
            break
    return out



def _build_skill_radar(metrics: Dict[str, Any], topology: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [
        {"label": "AI Tool Mastery", "score": _bounded(30 + topology.get("total_sessions", 0) / 4)},
        {"label": "Execution Intensity", "score": _bounded(35 + metrics["changed_ratio"] * 60)},
        {"label": "Architecture Design", "score": _bounded(35 + metrics["structured_ratio"] * 55)},
        {"label": "Debugging Discipline", "score": _bounded(30 + metrics["debug_ratio"] * 65)},
        {"label": "Quality Assurance", "score": _bounded(35 + metrics["test_ratio"] * 60)},
        {"label": "Systems Thinking", "score": _bounded(32 + metrics["source_diversity"] * 11)},
    ]



def _build_highlights(topology: Dict[str, Any], capabilities: List[Dict[str, Any]], radar: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    top_radar = sorted(radar, key=lambda x: x["score"], reverse=True)
    top_cap = capabilities[:3]

    highlights = []
    if top_radar:
        highlights.append(
            {
                "title": f"{top_radar[0]['label']} is operating at an elite band",
                "details": [
                    f"Observed {topology.get('total_sessions', 0)} sessions across {len(topology.get('sources', []))} sources.",
                    f"Estimated token footprint: {topology.get('total_tokens', 0):,}.",
                    f"Top radar score: {top_radar[0]['label']}={top_radar[0]['score']}/100.",
                ],
            }
        )

    if top_cap:
        highlights.append(
            {
                "title": f"Cross-domain leverage is clearly visible in {top_cap[0]['domain']}",
                "details": [
                    f"Top capability relationship: {top_cap[0]['relationship']} ({top_cap[0]['depthScore']}/100).",
                    f"Detected in {top_cap[0]['sourceSessions']} sessions with repeatable signal.",
                    f"Evidence basis: {top_cap[0]['evidenceBasis']}",
                ],
            }
        )

    if len(top_radar) >= 3:
        highlights.append(
            {
                "title": "Execution quality is reinforced by structured prompt behavior",
                "details": [
                    f"Architecture Design={top_radar[2]['score']}/100 and Execution Intensity={next((x['score'] for x in radar if x['label']=='Execution Intensity'), 0)}/100.",
                    "Frequent use of constraints and verification wording suggests low ambiguity tolerance.",
                    "Profile indicates readiness for high-context, high-ownership collaboration.",
                ],
            }
        )

    return highlights[:5]



def _extract_quotes(messages: List[Dict[str, Any]], max_items: int = 4) -> List[str]:
    candidates: List[str] = []
    seen = set()
    for msg in messages:
        text = msg.get("text", "")
        if not text:
            continue
        for seg in re.split(r"[\n。！？!?;；]+", text):
            quote = seg.strip()
            if len(quote) < 8 or len(quote) > 90:
                continue
            norm = quote.lower()
            if norm in seen:
                continue
            seen.add(norm)
            candidates.append(quote)
            if len(candidates) >= max_items * 3:
                break
        if len(candidates) >= max_items * 3:
            break
    return candidates[:max_items]


def _letter_grade(score: int) -> str:
    if score >= 92:
        return "S"
    if score >= 85:
        return "A+"
    if score >= 78:
        return "A"
    if score >= 70:
        return "B+"
    if score >= 62:
        return "B"
    if score >= 54:
        return "C+"
    return "C"


def _build_roast_profile(
    topology: Dict[str, Any],
    metrics: Dict[str, Any],
    radar: List[Dict[str, Any]],
    catchphrases: List[str],
    messages: List[Dict[str, Any]],
) -> Dict[str, Any]:
    avg_score = _bounded(_avg([x["score"] for x in radar])) if radar else 60
    quotes = _extract_quotes(messages, max_items=4) or catchphrases[:4]
    ambiguity_tolerance = _bounded(100 - (35 + metrics["why_ratio"] * 45))

    return {
        "title": "The Prompt Orchestrator",
        "subtitle": "Runs a multi-agent control tower with very little patience for ambiguity",
        "grade": _letter_grade(max(60, avg_score - 2)),
        "oneLiner": "Builds faster than most teams, then roasts the process for being slow.",
        "sections": [
            {
                "heading": "Personality Profile",
                "body": (
                    "This profile treats AI tools as an operations stack, not a chatbot. "
                    "Requests are direct, constraint-heavy, and optimized for throughput."
                ),
                "quotes": quotes[:2],
            },
            {
                "heading": "The Productive Chaos",
                "body": (
                    f"Across {topology.get('total_sessions', 0)} sessions, pace stays high. "
                    "When loops slow down, constraints become tighter and demands get sharper."
                ),
                "quotes": quotes[2:4],
            },
            {
                "heading": "Fine, Here Is the Compliment",
                "body": (
                    "Execution discipline is genuinely strong: structured instructions, verification pressure, "
                    "and repeatable patterns are obvious."
                ),
                "quotes": [],
            },
            {
                "heading": "Verdict",
                "body": (
                    "If speed and ownership are the metric, this profile is hard to beat. "
                    "If someone expects vague requests and gentle iteration, they should bring a helmet."
                ),
                "quotes": [],
            },
        ],
        "stats": [
            {"label": "Execution Speed", "score": _bounded(35 + metrics["changed_ratio"] * 60)},
            {"label": "Ambiguity Tolerance", "score": ambiguity_tolerance},
            {"label": "Prompt Discipline", "score": _bounded(20 + metrics["structured_ratio"] * 75)},
            {"label": "Quality Gate Pressure", "score": _bounded(35 + metrics["test_ratio"] * 60)},
        ],
    }


def _build_sweet_profile(
    topology: Dict[str, Any],
    metrics: Dict[str, Any],
    radar: List[Dict[str, Any]],
    catchphrases: List[str],
    messages: List[Dict[str, Any]],
) -> Dict[str, Any]:
    avg_score = _bounded(_avg([x["score"] for x in radar])) if radar else 75
    quotes = _extract_quotes(messages, max_items=4) or catchphrases[:4]

    return {
        "title": "The Vision-to-Execution Builder",
        "subtitle": "Turns intent into delivery with unusually consistent structure",
        "grade": _letter_grade(max(avg_score, 80)),
        "oneLiner": "Combines product clarity and technical momentum in a way that compounds quickly.",
        "sections": [
            {
                "heading": "What Makes This Profile Special",
                "body": (
                    "The strongest pattern is intentional structure: goals, constraints, and verification are "
                    "repeated so consistently that execution quality becomes predictable."
                ),
                "quotes": quotes[:2],
            },
            {
                "heading": "Operational Strengths",
                "body": (
                    f"Cross-source engagement over {topology.get('total_sessions', 0)} sessions shows depth, not noise. "
                    "The workflow suggests someone who can scale decisions without dropping quality checks."
                ),
                "quotes": quotes[2:4],
            },
            {
                "heading": "Growth Trajectory",
                "body": (
                    "The profile shows active iteration loops and strong adaptability. "
                    "With continued domain diversification, this trajectory can reach principal-level leverage."
                ),
                "quotes": [],
            },
            {
                "heading": "Verdict",
                "body": (
                    "This is the kind of collaborator who can drive ambiguous projects to concrete outcomes "
                    "while preserving rigor."
                ),
                "quotes": [],
            },
        ],
        "stats": [
            {"label": "Vision", "score": _bounded(40 + metrics["plan_ratio"] * 55)},
            {"label": "Drive", "score": _bounded(35 + metrics["changed_ratio"] * 60)},
            {"label": "AI Mastery", "score": _bounded(30 + topology.get("total_sessions", 0) / 4)},
            {"label": "Reliability Mindset", "score": _bounded(35 + metrics["test_ratio"] * 60)},
        ],
    }


def _legacy_dimensions_from_radar(radar: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    out = []
    for row in radar[:4]:
        out.append(
            {
                "id": row["label"].lower().replace(" ", "_"),
                "label_en": row["label"],
                "label_zh": row["label"],
                "score": row["score"],
                "reason_en": "Derived from multi-session behavior signals.",
                "reason_zh": "根据多会话行为信号推断。",
            }
        )
    return out



def analyze_profile(
    inventory: Dict[str, Any],
    discovery: Dict[str, Any],
    parsed: Dict[str, Any],
    mode: str,
) -> Dict[str, Any]:
    session_rows = parsed.get("sessions", [])
    messages = parsed.get("messages", [])

    topology = _source_topology(parsed.get("by_source", {}))
    metrics = _build_metrics(messages, session_rows)
    capabilities = _detect_domains(messages)
    portrait_dimensions = _portrait_dimensions(metrics)
    user_portrait = _user_portrait(topology, metrics, capabilities)
    agent_skills = _extract_agent_skills(metrics, capabilities, topology)
    curiosity_map = _build_curiosity_map(capabilities)
    catchphrases = _extract_catchphrases(messages)
    skill_radar = _build_skill_radar(metrics, topology)
    highlights = _build_highlights(topology, capabilities, skill_radar)
    roast_profile = _build_roast_profile(topology, metrics, skill_radar, catchphrases, messages)
    sweet_profile = _build_sweet_profile(topology, metrics, skill_radar, catchphrases, messages)

    summary = (
        f"Local-only profile generated from {topology['total_sessions']} sessions across {len(topology['sources'])} sources. "
        "Behavioral signals indicate structured execution, verification preference, and cross-tool adaptability."
    )

    active_tools = [x["name"] for x in inventory.get("ai_tools", {}).get("detected", [])]
    summary_zh = (
        f"本地画像基于 {topology['total_sessions']} 个会话与 {len(topology['sources'])} 个来源生成，"
        "行为信号显示出结构化执行、验证优先和跨工具适应能力。"
    )

    evidence_counts: Dict[str, int] = {}
    for row in discovery.get("included_files", []):
        level = row.get("evidence_level", "unknown")
        evidence_counts[level] = evidence_counts.get(level, 0) + 1

    profile_block = {
        "summary": summary,
        "thinkingStyle": user_portrait,
        "portraitDimensions": portrait_dimensions,
        "curiosityMap": curiosity_map,
        "capabilities": [
            {
                "domain": c["domain"],
                "relationship": c["relationship"],
                "depth": c["depth"],
                "depthScore": c["depthScore"],
                "offers": c["offers"],
                "evidenceBasis": c["evidenceBasis"],
            }
            for c in capabilities
        ],
        "catchphrases": catchphrases,
        "skillRadar": skill_radar,
        "highlights": highlights,
        "topDomains": [c["domain"] for c in capabilities[:5]],
        "roastProfile": roast_profile,
        "sweetProfile": sweet_profile,
    }

    return {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "mode": mode,
            "sources": sorted(list(parsed.get("by_source", {}).keys())),
            "evidence_levels": evidence_counts,
            "active_tools": active_tools,
        },
        "inventory": inventory,
        "sessions": {
            "topology": topology,
            "parse_success": parsed.get("parse_success", 0.0),
            "discovery_errors": discovery.get("errors", []),
            "parse_failures": parsed.get("failures", []),
            "incremental": {
                "included_files": len(discovery.get("included_files", [])),
                "all_discovered": len(discovery.get("files", [])),
                "removed": len(discovery.get("state_patch", {}).get("removed", {})),
            },
        },
        "profile": profile_block,
        "identity": {
            "summary_en": summary,
            "summary_zh": summary_zh,
            "dimensions": _legacy_dimensions_from_radar(skill_radar),
            "strengths": [
                {"en": h["title"], "zh": h["title"]}
                for h in highlights[:2]
            ],
            "risks": [
                {
                    "en": "Signals are inference-based and depend on transcript coverage quality.",
                    "zh": "该结果基于推断，受转录覆盖质量影响。",
                }
            ],
            "growth_suggestions": [
                {
                    "en": "Keep using structured context-goal-constraint framing and add explicit acceptance tests per task.",
                    "zh": "继续使用“背景-目标-约束”结构，并为每个任务补充显式验收测试。",
                },
                {
                    "en": "Periodically review domain distribution to prevent blind spots in underused areas.",
                    "zh": "定期复盘领域分布，避免低活跃领域形成能力盲区。",
                },
            ],
            "work_style": {"en": "Structured and evidence-oriented", "zh": "结构化且证据导向"},
            "trajectory": {"en": "Active multi-source trajectory", "zh": "多来源活跃演进"},
            "user_portrait": user_portrait,
            "portrait_dimensions": portrait_dimensions,
            "capabilities": capabilities,
            "agent_skills": agent_skills,
            "curiosity_map": curiosity_map,
            "catchphrases": catchphrases,
            "skill_radar": skill_radar,
            "highlights": highlights,
            "roast_profile": roast_profile,
            "sweet_profile": sweet_profile,
        },
        "skills": agent_skills,
        "roastProfile": roast_profile,
        "sweetProfile": sweet_profile,
        "sessionsAnalyzed": topology["total_sessions"],
        "totalTokens": topology["total_tokens"],
        "evidence": parsed.get("evidence", [])[:80],
        "outputs": {},
    }


if __name__ == "__main__":
    import json

    demo = analyze_profile(
        {"ai_tools": {"detected": []}},
        {"included_files": [], "files": [], "state_patch": {}},
        {"sessions": [], "messages": [], "by_source": {}},
        "full",
    )
    print(json.dumps(demo, ensure_ascii=False, indent=2))
