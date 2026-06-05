import CountUp from './CountUp';
import Reveal from './Reveal';

// A stats band rendered as elevated cards (icon + number + label).
// tone: 'dark' | 'grad' | 'light'. items: [{ v, s, label, icon, tint }]
const STROKE = { dark: '#c4b5fd', grad: '#ffffff', slate: '#c4b5fd' };

export default function StatsBand({ items, tone = 'dark', decor = null, padded = true }) {
  return (
    <section className={`sb sb-${tone}`} style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      {decor}
      <div className="container" style={{ position: 'relative', zIndex: 1, padding: padded ? '48px 0' : '36px 0' }}>
        <Reveal>
          <div className="sb-grid">
            {items.map((m, i) => (
              <div className="sb-card" key={i} style={{ '--tint': m.tint || '#4F46E5' }}>
                <span className="sb-ic" style={tone === 'light' ? { background: `${m.tint || '#4F46E5'}16` } : undefined}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tone === 'light' ? (m.tint || '#4F46E5') : STROKE[tone]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{m.icon}</svg>
                </span>
                <CountUp className="sb-num" value={m.v} suffix={m.s} />
                <span className="sb-lbl">{m.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
