#!/usr/bin/env python3
"""
Generate an HTML report from trigger evaluation CSV exports.

Expected inputs are the files produced by:
  trigger_examples_tool.py score --csv-out <dir>
"""

from __future__ import annotations

import argparse
import csv
import html
from pathlib import Path


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def load_csv_bundle(csv_dir: Path) -> dict[str, list[dict[str, str]]]:
    return {
        "overall": read_csv_rows(csv_dir / "overall.csv"),
        "per_skill": read_csv_rows(csv_dir / "per_skill.csv"),
        "details": read_csv_rows(csv_dir / "details.csv"),
        "pos_miss": read_csv_rows(csv_dir / "positive_miss_confusions.csv"),
        "pos_extra": read_csv_rows(csv_dir / "positive_cotriggers.csv"),
        "neg_false": read_csv_rows(csv_dir / "negative_false_trigger_confusions.csv"),
    }


def metric_map(rows: list[dict[str, str]]) -> dict[str, str]:
    return {r.get("metric", ""): r.get("value", "") for r in rows}


def as_int(v: str, default: int = 0) -> int:
    try:
        return int(v)
    except Exception:
        return default


def as_float(v: str, default: float = 0.0) -> float:
    try:
        return float(v)
    except Exception:
        return default


def esc(v: object) -> str:
    return html.escape("" if v is None else str(v))


def table_html(title: str, rows: list[dict[str, str]], columns: list[str], max_rows: int | None = None) -> str:
    shown = rows if max_rows is None else rows[:max_rows]
    count_note = ""
    if max_rows is not None and len(rows) > max_rows:
        count_note = f' <span class="muted">(showing {len(shown)} / {len(rows)})</span>'

    header = "".join(f"<th>{esc(col)}</th>" for col in columns)
    body_rows = []
    for row in shown:
        tds = "".join(f"<td>{esc(row.get(col,''))}</td>" for col in columns)
        body_rows.append(f"<tr>{tds}</tr>")
    if not body_rows:
        body_rows.append(f'<tr><td colspan="{len(columns)}" class="muted">No data</td></tr>')
    body = "\n".join(body_rows)
    return f"""
    <section class="panel">
      <h2>{esc(title)}{count_note}</h2>
      <div class="table-wrap">
        <table>
          <thead><tr>{header}</tr></thead>
          <tbody>
          {body}
          </tbody>
        </table>
      </div>
    </section>
    """


def confusion_table_html(
    title: str,
    rows: list[dict[str, str]],
    columns: list[str],
    table_id: str,
    link_kind: str,
    skill_key: str,
    predicted_key: str,
    max_rows: int | None = None,
) -> str:
    shown = rows if max_rows is None else rows[:max_rows]
    count_note = ""
    if max_rows is not None and len(rows) > max_rows:
        count_note = f' <span class="muted">(showing {len(shown)} / {len(rows)})</span>'

    header = "".join(f"<th>{esc(col)}</th>" for col in columns)
    body_rows = []
    for row in shown:
        skill_value = row.get(skill_key, "")
        predicted_value = row.get(predicted_key, "")
        tds = "".join(f"<td>{esc(row.get(col,''))}</td>" for col in columns)
        body_rows.append(
            f"""
            <tr class="confusion-row"
                data-link-kind="{esc(link_kind)}"
                data-link-skill="{esc(skill_value)}"
                data-link-search="{esc(str(predicted_value).lower())}">
              {tds}
            </tr>
            """
        )
    if not body_rows:
        body_rows.append(f'<tr><td colspan="{len(columns)}" class="muted">No data</td></tr>')
    body = "\n".join(body_rows)
    return f"""
    <section class="panel">
      <h2>{esc(title)}{count_note} <span class="muted">(click row to filter details)</span></h2>
      <div class="table-wrap">
        <table id="{esc(table_id)}" class="confusion-table">
          <thead><tr>{header}</tr></thead>
          <tbody>
          {body}
          </tbody>
        </table>
      </div>
    </section>
    """


def details_table_html(rows: list[dict[str, str]], max_rows: int | None = None) -> str:
    shown = rows if max_rows is None else rows[:max_rows]
    skills = sorted({r.get("skill", "") for r in shown if r.get("skill", "")})
    kinds = ["MISS", "EXTRA", "FALSE_TRIGGER"]
    count_note = ""
    if max_rows is not None and len(rows) > max_rows:
        count_note = f' <span class="muted">(showing {len(shown)} / {len(rows)})</span>'

    options_skill = ['<option value="">All skills</option>'] + [
        f'<option value="{esc(s)}">{esc(s)}</option>' for s in skills
    ]
    options_kind = ['<option value="">All error types</option>'] + [
        f'<option value="{k}">{k}</option>' for k in kinds
    ]

    body_rows = []
    for row in shown:
        kind = row.get("kind", "")
        skill = row.get("skill", "")
        polarity = row.get("polarity", "")
        predicted = row.get("predicted_skills", "")
        prompt = row.get("prompt", "")
        source = row.get("source", "")
        case_id = row.get("id", "")
        body_rows.append(
            f"""
            <tr class="detail-row"
                data-kind="{esc(kind)}"
                data-skill="{esc(skill)}"
                data-search="{esc((prompt + ' ' + predicted + ' ' + case_id).lower())}">
              <td><span class="pill pill-{esc(kind.lower())}">{esc(kind)}</span></td>
              <td>{esc(skill)}</td>
              <td>{esc(polarity)}</td>
              <td><code>{esc(case_id)}</code></td>
              <td>{esc(predicted)}</td>
              <td>{esc(prompt)}</td>
              <td><code>{esc(source)}</code></td>
            </tr>
            """
        )
    if not body_rows:
        body_rows.append('<tr><td colspan="7" class="muted">No data</td></tr>')

    return f"""
    <section class="panel">
      <h2>Error Details (Filterable){count_note}</h2>
      <div class="filters" id="details-filters">
        <label>
          <span>Skill</span>
          <select id="filter-skill">
            {''.join(options_skill)}
          </select>
        </label>
        <label>
          <span>Error Type</span>
          <select id="filter-kind">
            {''.join(options_kind)}
          </select>
        </label>
        <label class="grow">
          <span>Search</span>
          <input id="filter-search" type="search" placeholder="prompt / predicted / case id" />
        </label>
        <button id="filter-reset" type="button">Reset</button>
      </div>
      <div class="filter-summary muted" id="filter-summary"></div>
      <div class="table-wrap">
        <table id="details-table">
          <thead>
            <tr>
              <th>kind</th>
              <th>skill</th>
              <th>polarity</th>
              <th>id</th>
              <th>predicted_skills</th>
              <th>prompt</th>
              <th>source</th>
            </tr>
          </thead>
          <tbody>
            {''.join(body_rows)}
          </tbody>
        </table>
      </div>
    </section>
    """


def bar_cell(numerator: int, denominator: int, label: str) -> str:
    pct = 0 if denominator <= 0 else (100.0 * numerator / denominator)
    pct_str = f"{pct:.1f}%"
    return f"""
    <div class="bar-cell" title="{esc(label)}">
      <div class="bar-track">
        <div class="bar-fill" style="width: {pct:.2f}%"></div>
      </div>
      <div class="bar-text">{esc(label)} ({pct_str})</div>
    </div>
    """


def per_skill_table(rows: list[dict[str, str]]) -> str:
    if not rows:
        return table_html("Per Skill", [], ["skill"], None)

    trs = []
    for r in rows:
        skill = r.get("skill", "")
        p_total = as_int(r.get("positive_total", "0"))
        p_hit = as_int(r.get("positive_hit", "0"))
        n_total = as_int(r.get("negative_total", "0"))
        n_false = as_int(r.get("negative_false_trigger", "0"))
        n_false_self = as_int(r.get("negative_false_trigger_self", "0"))
        miss = as_int(r.get("missing_predictions", "0"))
        pos_bar = bar_cell(p_hit, p_total, f"{p_hit}/{p_total}")
        neg_reject = max(0, n_total - n_false)
        neg_bar = bar_cell(neg_reject, n_total, f"{neg_reject}/{n_total}")
        trs.append(
            f"""
            <tr>
              <td>{esc(skill)}</td>
              <td>{pos_bar}</td>
              <td>{neg_bar}</td>
              <td>{esc(n_false)}</td>
              <td>{esc(n_false_self)}</td>
              <td>{esc(miss)}</td>
            </tr>
            """
        )
    body = "\n".join(trs)
    return f"""
    <section class="panel">
      <h2>Per Skill</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>skill</th>
              <th>positive recall</th>
              <th>negative reject rate</th>
              <th>neg false any</th>
              <th>neg false self</th>
              <th>missing preds</th>
            </tr>
          </thead>
          <tbody>
            {body}
          </tbody>
        </table>
      </div>
    </section>
    """


def summary_cards(overall_rows: list[dict[str, str]]) -> str:
    m = metric_map(overall_rows)
    cards = [
        ("Positive Recall", f"{as_float(m.get('positive_recall', '0')):.3f}"),
        ("Negative Reject Rate", f"{as_float(m.get('negative_reject_rate', '0')):.3f}"),
        ("Positive Cases", m.get("positive_total", "0")),
        ("Negative Cases", m.get("negative_total", "0")),
        ("False Triggers", m.get("negative_false_trigger", "0")),
        ("Extra Skill Predictions", m.get("positive_extra_skill_predictions", "0")),
    ]
    html_cards = []
    for label, value in cards:
        html_cards.append(
            f"""
            <div class="card">
              <div class="card-label">{esc(label)}</div>
              <div class="card-value">{esc(value)}</div>
            </div>
            """
        )
    return f"""
    <section class="cards">
      {''.join(html_cards)}
    </section>
    """


def build_html(title: str, csv_dir: Path, data: dict[str, list[dict[str, str]]], details_limit: int) -> str:
    sections = [
        summary_cards(data["overall"]),
        per_skill_table(data["per_skill"]),
        confusion_table_html(
            "Positive Miss Confusions",
            data["pos_miss"],
            ["expected", "predicted", "count"],
            "confusion-pos-miss",
            "MISS",
            "expected",
            "predicted",
            50,
        ),
        confusion_table_html(
            "Positive Co-Triggers",
            data["pos_extra"],
            ["expected", "extra", "count"],
            "confusion-pos-extra",
            "EXTRA",
            "expected",
            "extra",
            50,
        ),
        confusion_table_html(
            "Negative False Trigger Confusions",
            data["neg_false"],
            ["near_miss_for", "predicted", "count"],
            "confusion-neg-false",
            "FALSE_TRIGGER",
            "near_miss_for",
            "predicted",
            50,
        ),
        details_table_html(data["details"], details_limit),
    ]
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{esc(title)}</title>
  <style>
    :root {{
      --bg: #f6f4ef;
      --panel: #fffdf8;
      --ink: #1f2937;
      --muted: #6b7280;
      --line: #ddd5c7;
      --accent: #0f766e;
      --accent-soft: #c7f0e9;
      --danger: #b42318;
    }}
    * {{ box-sizing: border-box; }}
    body {{
      margin: 0;
      background: radial-gradient(circle at 20% 0%, #fef3c7 0%, transparent 45%), var(--bg);
      color: var(--ink);
      font: 14px/1.45 ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    }}
    .wrap {{ max-width: 1200px; margin: 0 auto; padding: 24px; }}
    header {{
      padding: 16px 0 20px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 18px;
    }}
    h1 {{ margin: 0; font-size: 28px; line-height: 1.1; }}
    .subtitle {{ margin-top: 8px; color: var(--muted); }}
    .cards {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 18px;
    }}
    .card {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      box-shadow: 0 1px 0 rgba(0,0,0,0.02);
    }}
    .card-label {{ color: var(--muted); font-size: 12px; }}
    .card-value {{ font-size: 24px; font-weight: 700; margin-top: 6px; }}
    .panel {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px;
      margin-bottom: 14px;
    }}
    .panel h2 {{ margin: 0 0 10px; font-size: 16px; }}
    .muted {{ color: var(--muted); }}
    code {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
    }}
    .table-wrap {{ overflow: auto; }}
    table {{
      width: 100%;
      border-collapse: collapse;
      min-width: 680px;
    }}
    th, td {{
      text-align: left;
      padding: 8px 10px;
      border-top: 1px solid var(--line);
      vertical-align: top;
    }}
    thead th {{
      border-top: none;
      color: var(--muted);
      font-size: 12px;
      text-transform: none;
      position: sticky;
      top: 0;
      background: var(--panel);
      z-index: 1;
    }}
    tbody tr:hover td {{ background: rgba(15, 118, 110, 0.04); }}
    .confusion-row {{ cursor: pointer; }}
    .confusion-row td:first-child {{ font-weight: 600; }}
    .pill {{
      display: inline-block;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.02em;
      border: 1px solid var(--line);
      background: #f7f3ea;
    }}
    .pill-miss {{ background: #fee2e2; border-color: #fecaca; color: #991b1b; }}
    .pill-extra {{ background: #fef3c7; border-color: #fde68a; color: #92400e; }}
    .pill-false_trigger {{ background: #ffe4e6; border-color: #fecdd3; color: #9f1239; }}
    .filters {{
      display: grid;
      grid-template-columns: repeat(2, minmax(160px, 220px)) minmax(220px, 1fr) auto;
      gap: 8px;
      margin-bottom: 10px;
      align-items: end;
    }}
    .filters label {{ display: grid; gap: 4px; }}
    .filters label span {{ font-size: 12px; color: var(--muted); }}
    .filters select, .filters input, .filters button {{
      height: 34px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      padding: 0 10px;
      color: var(--ink);
      font: inherit;
    }}
    .filters button {{
      background: #f7f3ea;
      cursor: pointer;
      font-weight: 600;
    }}
    .filters .grow {{ min-width: 220px; }}
    .filter-summary {{ margin: 4px 0 10px; font-size: 12px; }}
    .bar-cell {{ min-width: 220px; }}
    .bar-track {{
      width: 100%;
      height: 8px;
      background: #ece7dc;
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 4px;
    }}
    .bar-fill {{
      height: 100%;
      background: linear-gradient(90deg, var(--accent), #14b8a6);
    }}
    .bar-text {{ font-size: 12px; color: var(--muted); white-space: nowrap; }}
    footer {{
      margin-top: 18px;
      color: var(--muted);
      font-size: 12px;
      padding-bottom: 12px;
    }}
    @media (max-width: 700px) {{
      .wrap {{ padding: 14px; }}
      h1 {{ font-size: 22px; }}
      .card-value {{ font-size: 20px; }}
      .filters {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <div class="wrap">
    <header>
      <h1>{esc(title)}</h1>
      <div class="subtitle">Source CSV directory: <code>{esc(csv_dir)}</code></div>
    </header>
    {''.join(sections)}
    <footer>
      Generated by <code>scripts/trigger_eval_report.py</code>.
    </footer>
  </div>
  <script>
    (function () {{
      const table = document.getElementById('details-table');
      if (!table) return;
      const rows = Array.from(table.querySelectorAll('tbody .detail-row'));
      const skillEl = document.getElementById('filter-skill');
      const kindEl = document.getElementById('filter-kind');
      const searchEl = document.getElementById('filter-search');
      const resetEl = document.getElementById('filter-reset');
      const summaryEl = document.getElementById('filter-summary');
      const confusionRows = Array.from(document.querySelectorAll('.confusion-row'));

      function applyFilters() {{
        const skill = (skillEl?.value || '').trim();
        const kind = (kindEl?.value || '').trim();
        const search = (searchEl?.value || '').trim().toLowerCase();
        let visible = 0;

        rows.forEach((row) => {{
          const rowSkill = row.getAttribute('data-skill') || '';
          const rowKind = row.getAttribute('data-kind') || '';
          const rowSearch = row.getAttribute('data-search') || '';
          const okSkill = !skill || rowSkill === skill;
          const okKind = !kind || rowKind === kind;
          const okSearch = !search || rowSearch.includes(search);
          const show = okSkill && okKind && okSearch;
          row.style.display = show ? '' : 'none';
          if (show) visible += 1;
        }});

        if (summaryEl) {{
          const active = [];
          if (skill) active.push('skill=' + skill);
          if (kind) active.push('kind=' + kind);
          if (search) active.push('search="' + search + '"');
          summaryEl.textContent =
            'Visible rows: ' + visible + ' / ' + rows.length +
            (active.length ? ' | Filters: ' + active.join(', ') : '');
        }}
      }}

      [skillEl, kindEl, searchEl].forEach((el) => {{
        if (!el) return;
        el.addEventListener('input', applyFilters);
        el.addEventListener('change', applyFilters);
      }});

      if (resetEl) {{
        resetEl.addEventListener('click', () => {{
          if (skillEl) skillEl.value = '';
          if (kindEl) kindEl.value = '';
          if (searchEl) searchEl.value = '';
          applyFilters();
        }});
      }}

      confusionRows.forEach((row) => {{
        row.addEventListener('click', () => {{
          const linkKind = row.getAttribute('data-link-kind') || '';
          const linkSkill = row.getAttribute('data-link-skill') || '';
          const linkSearch = row.getAttribute('data-link-search') || '';
          if (kindEl && linkKind) kindEl.value = linkKind;
          if (skillEl && linkSkill) skillEl.value = linkSkill;
          if (searchEl) searchEl.value = linkSearch;
          applyFilters();
          const detailsPanel = document.getElementById('details-filters');
          if (detailsPanel) {{
            detailsPanel.scrollIntoView({{ behavior: 'smooth', block: 'start' }});
          }}
        }});
      }});

      applyFilters();
    }})();
  </script>
</body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate HTML report from trigger evaluation CSV outputs.")
    parser.add_argument("--csv-dir", required=True, help="Directory created by score --csv-out")
    parser.add_argument("--out", required=True, help="Output HTML file path")
    parser.add_argument("--title", default="Skill Trigger Evaluation Report", help="Report title")
    parser.add_argument(
        "--details-limit",
        type=int,
        default=200,
        help="Maximum rows shown in the details table (default: 200)",
    )
    args = parser.parse_args()

    csv_dir = Path(args.csv_dir).resolve()
    out_path = Path(args.out).resolve()
    if not csv_dir.exists():
        raise SystemExit(f"CSV directory not found: {csv_dir}")

    data = load_csv_bundle(csv_dir)
    if not data["overall"] or not data["per_skill"]:
        raise SystemExit(
            "Missing required CSV inputs (expected at least overall.csv and per_skill.csv)."
        )

    html_doc = build_html(args.title, csv_dir, data, max(1, args.details_limit))
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(html_doc, encoding="utf-8")
    print(f"Wrote HTML report to {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
