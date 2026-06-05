import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import GeoDecor from '@/components/ui/GeoDecor';

export const metadata = {
  title: 'About OpelSoft, Talent for AI, Robotics & Deep Tech', description: 'OpelSoft is a specialist talent and staffing platform connecting people with leaders in artificial intelligence, robotics, and emerging technology.',
};

function Icon({ tint, children }) {
  return (
    <div className="op-icon" style={{ background: `${tint}16` }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </div>
  );
}

const DO = [
  { tint: '#4F46E5', title: 'Specialist Job Board', body: 'Curated roles in AI, robotics, machine learning, and automation from teams building the future.', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> }, { tint: '#7C3AED', title: 'Talent & Staffing', body: 'Contract, direct-hire, and executive search for technical teams that need rare, vetted skills.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> }, { tint: '#0EA5E9', title: 'Career Support', body: 'A profile you build once, application tracking, and guidance to help you land the right role.', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
];

const VALUES = [
  { tint: '#4F46E5', emoji: '🛡️', title: 'Absolute Integrity', body: 'Transparent partnerships, clear communication, and honest expectations, for candidates and companies alike.' }, { tint: '#7C3AED', emoji: '🎯', title: 'Specialist Expertise', body: 'We focus on AI, robotics, and deep tech, so we understand the roles, the skills, and the people behind them.' }, { tint: '#10B981', emoji: '🌍', title: 'Global Reach', body: 'A worldwide network of talent and employers, connecting remote-ready professionals with ambitious teams.' },
];

const FOCUS_AREAS = [
  { name: 'Artificial Intelligence', tint: '#4F46E5', icon: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></> }, { name: 'Robotics', tint: '#7C3AED', icon: <><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><line x1="8" y1="16" x2="8" y2="16" /><line x1="16" y1="16" x2="16" y2="16" /></> }, { name: 'Machine Learning', tint: '#0EA5E9', icon: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></> }, { name: 'Computer Vision', tint: '#10B981', icon: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></> }, { name: 'Automation', tint: '#F59E0B', icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /> }, { name: 'Data Science', tint: '#EF4444', icon: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></> }, { name: 'Embedded Systems', tint: '#6366F1', icon: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="2" x2="9" y2="4" /><line x1="15" y1="2" x2="15" y2="4" /><line x1="2" y1="9" x2="4" y2="9" /><line x1="2" y1="15" x2="4" y2="15" /></> }, { name: 'MLOps', tint: '#14B8A6', icon: <><line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></> },
];

export default function AboutUsPage() {
  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>

      {/* HERO */}
      <section className="op-mesh" style={{ position: 'relative', borderBottom: '1px solid var(--border-color)', padding: '76px 0 64px', overflow: 'hidden' }}>
        <GeoDecor />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '52px', alignItems: 'center' }}>
            <Reveal>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '18px' }}>About OpelSoft</div>
              <h1 style={{ fontSize: 'clamp(2.4rem, 5.2vw, 3.8rem)', fontWeight: '800', letterSpacing: '-0.045em', lineHeight: '1.06', marginBottom: '20px' }}>
                Software, consulting &amp; <span className="op-grad-text">specialist talent</span>
              </h1>
              <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '540px', marginBottom: '28px' }}>
                OpelSoft is an IT consulting and staffing firm that <strong style={{ color: 'var(--text-primary)' }}>provides <span className="op-grad-text">Software Development &amp; IT Consulting Services to Fortune 500 clients across the US</span></strong>, and connects exceptional people with the teams building what&apos;s next.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/jobs" className="op-btn op-grad-bg" style={{ padding: '13px 28px', borderRadius: '30px', fontWeight: '700', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Explore roles</Link>
                <Link href="/contact-us" className="op-btn" style={{ padding: '13px 28px', borderRadius: '30px', fontWeight: '700', border: '1px solid var(--border-color)', background: '#fff', color: '#09090b', textDecoration: 'none' }}>Get in touch</Link>
              </div>
            </Reveal>
            <Reveal delay={2}>
              <div style={{ position: 'relative', maxWidth: '520px', margin: '0 auto' }}>
                <div style={{ position: 'absolute', inset: '-10% -6% -6% -10%', background: 'var(--op-grad)', filter: 'blur(60px)', opacity: 0.2, borderRadius: '40px' }} />
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/team.jpg" alt="The OpelSoft team" style={{ width: '100%', display: 'block' }} />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#0B0B0F', color: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ padding: '52px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', textAlign: 'center' }}>
            {[{ v: 15, s: '+', l: 'Years of experience' }, { v: 20, s: '+', l: 'Industries served' }, { v: 500, s: '+', l: 'Projects delivered' }, { v: 100, s: '%', l: 'Client commitment' }].map((m, i) => (
              <Reveal key={i} delay={(i % 4) + 1}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}><CountUp value={m.v} suffix={m.s} /></div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{m.l}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="section-light section-padding" style={{ background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Our Mission</div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '20px' }}>Your partner for software, consulting, and talent</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.8', marginBottom: '18px' }}>
              OpelSoft pairs deep engineering capability with specialist recruiting. We build and modernize software, advise on technology strategy, and place the rare skills ambitious teams need, all under one roof.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.8' }}>
              From Fortune 500 enterprises to fast-scaling teams, we focus on outcomes: dependable software, pragmatic IT consulting, and people who fit, delivered with senior expertise and a genuine commitment to your success.
            </p>
          </Reveal>
        </div>
      </section>

      {/* FOCUS AREAS */}
      <section className="section-light section-padding">
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Areas We Specialise In</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>The fields we know best</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
            {FOCUS_AREAS.map((f, i) => (
              <Reveal key={f.name} delay={(i % 4) + 1}>
                <div className="card-light hover-lift" style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: '14px', height: '100%' }}>
                  <Icon tint={f.tint}>{f.icon}</Icon>
                  <span style={{ fontSize: '1rem', fontWeight: '700', letterSpacing: '-0.01em' }}>{f.name}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="section-light section-padding">
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>What We Do</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Built for both sides of the hire</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            {DO.map((c, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ padding: '32px', height: '100%' }}>
                  <Icon tint={c.tint}>{c.icon}</Icon>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section-light section-padding" style={{ background: '#fff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Our Values</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>The principles behind every match</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            {VALUES.map((v, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ padding: '32px', height: '100%' }}>
                  <div className="op-icon" style={{ background: `${v.tint}16`, fontSize: '1.4rem' }}>{v.emoji}</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px' }}>{v.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>{v.body}</p>
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
              <h2 style={{ fontSize: 'clamp(1.9rem, 4.5vw, 3rem)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '14px', position: 'relative' }}>Ready to take the next step?</h2>
              <p style={{ fontSize: '1.15rem', opacity: 0.92, maxWidth: '520px', margin: '0 auto 34px', lineHeight: '1.6', position: 'relative' }}>Browse roles in AI and robotics, or talk to our team about hiring.</p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link href="/jobs" className="op-btn" style={{ padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: '#fff', color: 'var(--op-indigo)', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Browse Opportunities</Link>
                <Link href="/contact-us" className="op-btn" style={{ padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>Talk to us</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
