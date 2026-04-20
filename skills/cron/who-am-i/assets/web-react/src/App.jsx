import profile from './profile-data.json';

function scoreClass(score) {
  if (score >= 80) return 'high';
  if (score >= 55) return 'mid';
  return 'low';
}

export default function App() {
  const identity = profile.identity || {};
  const topology = (profile.sessions || {}).topology || { sources: [] };

  return (
    <main className="shell">
      <section className="panel hero">
        <h1>Who Am I / 我是谁</h1>
        <p>{identity.summary_en}</p>
        <p className="zh">{identity.summary_zh}</p>
      </section>

      <section className="panel">
        <h2>Identity Dimensions</h2>
        <div className="dims">
          {(identity.dimensions || []).map((d) => (
            <article key={d.id} className={`dim ${scoreClass(d.score)}`}>
              <h3>{d.label_en}</h3>
              <p className="zh">{d.label_zh}</p>
              <strong>{d.score}/100</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Session Sources</h2>
        <ul>
          {(topology.sources || []).map((src) => (
            <li key={src.source}>
              <b>{src.source}</b> sessions={src.sessions}, messages={src.messages}, tokens={src.tokens}
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Growth Suggestions / 成长建议</h2>
        <ul>
          {(identity.growth_suggestions || []).map((s, idx) => (
            <li key={idx}>
              {s.en}
              <br />
              <span className="zh">{s.zh}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
