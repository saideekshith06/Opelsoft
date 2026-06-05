import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import GeoDecor from '@/components/ui/GeoDecor';

export const metadata = {
  title: 'Talent, Staffing & Executive Search, OpelSoft', description: 'OpelSoft connects organizations with vetted talent across technology, engineering, healthcare, and professional services, through contract, direct-hire, and executive search.',
};

function Icon({ tint, children }) {
  return (
    <div className="op-icon" style={{ background: `${tint}16` }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </div>
  );
}

const SOLUTIONS = [
  { tint: '#4F46E5', name: 'IT & Software Staffing', body: 'Engineers and specialists across machine learning, Java, Python, full-stack, cloud, and DevOps, ready to ship.', icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> }, { tint: '#7C3AED', name: 'Executive Search', body: 'Confidential senior-leadership and C-suite placement, matched to your culture and growth stage.', icon: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="22" /></> }, { tint: '#0EA5E9', name: 'Engineering Staffing', body: 'Hardware, embedded, manufacturing, aerospace, and energy specialists for complex technical programs.', icon: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /> }, { tint: '#10B981', name: 'Professional Services', body: 'Finance, accounting, HR, legal, and operations professionals to scale your back office.', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> }, { tint: '#F59E0B', name: 'Healthcare Staffing', body: 'Clinical and non-clinical roles, sourced and screened for compliance and fit.', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> }, { tint: '#EF4444', name: 'Creative & Marketing', body: 'Product designers, copywriters, brand, and growth-marketing talent for modern teams.', icon: <><circle cx="13.5" cy="6.5" r=".5" /><circle cx="17.5" cy="10.5" r=".5" /><circle cx="8.5" cy="7.5" r=".5" /><circle cx="6.5" cy="12.5" r=".5" /><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" /></> },
];

const MODELS = [
  { tint: '#4F46E5', name: 'Contract / Temporary', body: 'Flexible capacity for projects, peaks, and specialized skills, scale up or down on demand.', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> }, { tint: '#7C3AED', name: 'Direct Hire', body: 'Permanent placements where we source, screen, and shortlist so you only meet the best.', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></> }, { tint: '#0EA5E9', name: 'Contract-to-Hire', body: 'Try-before-you-hire engagements that de-risk permanent decisions.', icon: <><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></> }, { tint: '#10B981', name: 'Managed Capacity', body: 'A dedicated, outcome-based team that owns a function or workstream end to end.', icon: <><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></> },
];

const VALUES = [
  { tint: '#4F46E5', title: 'Access to qualified, engaged professionals', body: 'We have built a deep, global network of vetted specialists across technology, engineering, healthcare, and professional services. Our recruiters pair smart tooling with real human judgment to surface the right person fast, and we keep that network sharp through ongoing certification, upskilling, and retraining.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> }, { tint: '#7C3AED', title: 'An end-to-end recruiting process', body: 'We own every step for you, from defining the goal and screening candidates, through interviews and skills validation, to offers, onboarding, and performance management. You stay focused on running and growing your business while we handle the hiring.', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> }, { tint: '#10B981', title: 'Compliance you can rely on', body: 'Our compliance team handles precise contractual screening, background, financial, and substance checks, and makes sure every document is signed, every detail is handled correctly, and your data is protected to the highest security standards, for contractors and clients alike.', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
];

export default function TalentStaffingPage() {
  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>

      {/* HERO */}
      <section className="op-mesh" style={{ position: 'relative', borderBottom: '1px solid var(--border-color)', padding: '76px 0 64px', overflow: 'hidden' }}>
        <GeoDecor />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '52px', alignItems: 'center' }}>
            <Reveal>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '18px' }}>Talent &amp; Staffing</div>
              <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 3.7rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.06', marginBottom: '20px' }}>
                Build the team you need, <span className="op-grad-text">your way</span>
              </h1>
              <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '520px', marginBottom: '30px' }}>
                OpelSoft connects organizations with vetted professionals across technology, engineering, healthcare, and the wider professional landscape, through contract, direct-hire, and executive search.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/contact-us" className="op-btn op-grad-bg" style={{ padding: '13px 28px', borderRadius: '30px', fontWeight: '700', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Hire talent</Link>
                <Link href="/contact-us" className="op-btn" style={{ padding: '13px 28px', borderRadius: '30px', fontWeight: '700', border: '1px solid var(--border-color)', background: '#fff', color: '#09090b', textDecoration: 'none' }}>Talk to us</Link>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ position: 'absolute', inset: '-10% -6% -6% -10%', background: 'var(--op-grad)', filter: 'blur(60px)', opacity: 0.2, borderRadius: '40px' }} />
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/staffing.jpg" alt="A successful hire" style={{ width: '100%', display: 'block' }} />
                </div>
                <div className="op-glass op-float" style={{ position: 'absolute', top: '12%', left: '-6%', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Time to shortlist</div>
                  <div style={{ fontWeight: '800', fontSize: '1.3rem', lineHeight: 1 }} className="op-grad-text"><CountUp value={48} suffix="h" /></div>
                </div>
                <div className="op-glass op-float slow" style={{ position: 'absolute', bottom: '10%', right: '-5%', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="op-icon" style={{ width: '38px', height: '38px', background: 'rgba(16,185,129,0.14)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                  <div><div style={{ fontWeight: '800', fontSize: '0.95rem' }}>Vetted talent</div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Screened &amp; ready</div></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section style={{ background: '#0B0B0F', color: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ padding: '52px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', textAlign: 'center' }}>
            {[{ v: 6, s: '', l: 'Specialties' }, { v: 4, s: '', l: 'Engagement models' }, { v: 20, s: '+', l: 'Industries served' }, { v: 24, s: '/7', l: 'Sourcing coverage' }].map((m, i) => (
              <Reveal key={i} delay={(i % 4) + 1}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}><CountUp value={m.v} suffix={m.s} /></div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{m.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHY OPELSOFT */}
      <section className="section-light section-padding" style={{ background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Why OpelSoft</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Talent partners, not just a posting board</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            {VALUES.map((c, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ padding: '32px', height: '100%' }}>
                  <Icon tint={c.tint}>{c.icon}</Icon>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.65' }}>{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTIONS */}
      <section id="solutions" className="section-light section-padding" style={{ scrollMarginTop: '90px' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Our Solutions</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Our Talent Staffing &amp; Executive Search Solutions</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {SOLUTIONS.map((s, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ padding: '30px', height: '100%' }}>
                  <Icon tint={s.tint}>{s.icon}</Icon>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px' }}>{s.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.6' }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MODELS */}
      <section id="models" className="section-light section-padding" style={{ background: '#fff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', scrollMarginTop: '90px' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>How We Work</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Engagement models that fit your needs</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {MODELS.map((m, i) => (
              <Reveal key={i} delay={(i % 4) + 1}>
                <div className="card-light hover-lift" style={{ padding: '28px', height: '100%' }}>
                  <Icon tint={m.tint}>{m.icon}</Icon>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '18px 0 8px' }}>{m.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.55' }}>{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '72px 0 88px' }}>
        <div className="container">
          <Reveal>
            <div className="op-grad-bg" style={{ borderRadius: '28px', padding: 'clamp(40px, 6vw, 64px) 32px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(79,70,229,0.5)' }}>
              <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '360px', height: '360px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <h2 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '14px', position: 'relative' }}>Let&apos;s build your team</h2>
              <p style={{ fontSize: '1.15rem', opacity: 0.92, maxWidth: '520px', margin: '0 auto 34px', lineHeight: '1.6', position: 'relative' }}>Tell us the roles you need filled and how you like to engage, we&apos;ll take it from there.</p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link href="/contact-us" className="op-btn" style={{ padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: '#fff', color: 'var(--op-indigo)', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Start a conversation</Link>
                <Link href="/enterprise-solutions" className="op-btn" style={{ padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>Enterprise solutions</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
