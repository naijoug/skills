(function () {
  const profile = window.__WHO_AM_I_PROFILE__ || {};
  const identity = profile.identity || {};
  const sessions = (profile.sessions || {}).topology || {};

  const setText = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v || "";
  };

  setText("summary-en", identity.summary_en || "");
  setText("summary-zh", identity.summary_zh || "");

  const metaGrid = document.getElementById("meta-grid");
  const chips = [
    `Sessions: ${sessions.total_sessions || 0}`,
    `Messages: ${sessions.total_messages || 0}`,
    `Tokens(est): ${sessions.total_tokens || 0}`,
    `Sources: ${(sessions.sources || []).length}`,
  ];
  chips.forEach((txt) => {
    const d = document.createElement("div");
    d.className = "meta-chip";
    d.textContent = txt;
    metaGrid.appendChild(d);
  });

  function drawRadar() {
    const dims = identity.dimensions || [];
    const cvs = document.getElementById("radar");
    if (!cvs || !dims.length) return;

    const ctx = cvs.getContext("2d");
    const w = cvs.width;
    const h = cvs.height;
    const cx = w / 2;
    const cy = h / 2 + 8;
    const radius = Math.min(w, h) * 0.33;

    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    for (let r = 1; r <= 4; r += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy, (radius * r) / 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    const n = dims.length;
    const points = [];
    for (let i = 0; i < n; i += 1) {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const score = Math.max(0, Math.min(100, Number(dims[i].score || 0)));
      const r = (radius * score) / 100;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      points.push([x, y, angle]);

      const lx = cx + Math.cos(angle) * (radius + 18);
      const ly = cy + Math.sin(angle) * (radius + 18);
      ctx.fillStyle = "#d5edf3";
      ctx.font = "12px sans-serif";
      ctx.textAlign = lx > cx ? "left" : "right";
      ctx.fillText((dims[i].label_en || "").slice(0, 16), lx, ly);
    }

    ctx.fillStyle = "rgba(255,183,3,0.24)";
    ctx.strokeStyle = "rgba(255,183,3,0.95)";
    ctx.beginPath();
    points.forEach((p, idx) => {
      if (idx === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function renderRiver() {
    const river = document.getElementById("river");
    const rows = sessions.sources || [];
    const max = Math.max(1, ...rows.map((r) => Number(r.sessions || 0)));
    rows.forEach((r) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const label = document.createElement("div");
      label.className = "bar-label";
      label.textContent = `${r.source} • ${r.sessions}`;
      const bar = document.createElement("div");
      bar.className = "bar";
      bar.style.width = `${Math.max(8, (r.sessions / max) * 100)}%`;
      row.appendChild(label);
      row.appendChild(bar);
      river.appendChild(row);
    });
  }

  function renderHeatmap() {
    const el = document.getElementById("heatmap");
    const rows = sessions.sources || [];
    const values = [];
    rows.forEach((r) => {
      values.push(Number(r.sessions || 0));
      values.push(Number(r.messages || 0) / 5);
      values.push(Number(r.tokens || 0) / 5000);
    });
    while (values.length < 70) values.push(0);
    const max = Math.max(1, ...values);
    values.slice(0, 70).forEach((v) => {
      const cell = document.createElement("div");
      cell.className = "heat-cell";
      const alpha = 0.08 + (v / max) * 0.85;
      cell.style.background = `rgba(255, 183, 3, ${alpha.toFixed(3)})`;
      el.appendChild(cell);
    });
  }

  function renderStrengthRisk() {
    const s = document.getElementById("strengths");
    const r = document.getElementById("risks");
    (identity.strengths || []).forEach((it) => {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<b>Strength</b>: ${it.en || ""}<br/><span class="zh">${it.zh || ""}</span>`;
      s.appendChild(d);
    });
    (identity.risks || []).forEach((it) => {
      const d = document.createElement("div");
      d.className = "kv";
      d.innerHTML = `<b>Risk</b>: ${it.en || ""}<br/><span class="zh">${it.zh || ""}</span>`;
      r.appendChild(d);
    });
  }

  function renderEvidence() {
    const wrap = document.getElementById("evidence");
    (profile.evidence || []).slice(0, 24).forEach((ev, idx) => {
      const d = document.createElement("details");
      const s = document.createElement("summary");
      s.textContent = `${idx + 1}. ${ev.source || "unknown"}`;
      const p1 = document.createElement("p");
      p1.textContent = ev.path || "";
      const p2 = document.createElement("p");
      p2.textContent = ev.snippet || "";
      d.appendChild(s);
      d.appendChild(p1);
      d.appendChild(p2);
      wrap.appendChild(d);
    });
  }

  drawRadar();
  renderRiver();
  renderHeatmap();
  renderStrengthRisk();
  renderEvidence();
})();
