import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import Decor from '@/components/ui/Decor';
import StatsBand from '@/components/ui/StatsBand';

export const metadata = {
  title: 'Enterprise Solutions — OpelSoft',
  description: 'OpelSoft provides Software Development & IT Consulting Services to Fortune 500 clients across the US.',
};

const SERVICES = [
  { name: 'Business Consulting', tint: '#4F46E5', body: 'Strategy and operations consulting that aligns your people, processes, and technology with clear business goals.', icon: <><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></> },
  { name: 'IT Consulting', tint: '#7C3AED', body: 'Pragmatic technology guidance, from architecture to roadmap, that turns IT into a real competitive advantage.', icon: <><rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" /><line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" /><line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" /></> },
  { name: 'Digital Marketing', tint: '#DB2777', body: 'Data-led campaigns, SEO, and content that grow reach, generate pipeline, and prove return on every dollar.', icon: <><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></> },
  { name: 'Human Resources (HR)', tint: '#10B981', body: 'End-to-end HR support, from talent acquisition and onboarding to compliance and workforce management.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { name: 'Outsourcing', tint: '#0EA5E9', body: 'Reliable onshore and offshore teams that extend your capacity without the overhead of hiring.', icon: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></> },
  { name: 'Application Development', tint: '#F59E0B', body: 'Custom web and enterprise applications, built and modernized to scale with your business.', icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
  { name: 'Web Design', tint: '#6366F1', body: 'Modern, responsive, conversion-focused websites that represent your brand beautifully.', icon: <><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></> },
  { name: 'Mobile Application Development', tint: '#14B8A6', body: 'Native and cross-platform iOS and Android apps your customers love to use.', icon: <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></> },
  { name: 'Database Development', tint: '#EF4444', body: 'Robust, secure data architecture, design, optimization, and administration, done right.', icon: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /></> },
  { name: 'Cloud Application Development', tint: '#2563EB', body: 'Cloud-native builds and migrations on AWS, Azure, and GCP for resilience and elastic scale.', icon: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /> },
];

const STATS = [
  { v: 500, s: '+', label: 'Enterprise engagements', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> },
  { v: 15, s: '+', label: 'Years of experience', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
  { v: 50, s: '+', label: 'Specialist consultants', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { v: 98, s: '%', label: 'Client satisfaction', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
];

export default function EnterpriseSolutionsPage() {
  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* HERO */}
      <section className="op-mesh" style={{ position: 'relative', borderBottom: '1px solid var(--border-color)', padding: '84px 0 64px', overflow: 'hidden' }}>
        <Decor variant="a" />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '820px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '16px' }}>Enterprise Solutions</div>
          <h1 style={{ fontSize: 'clamp(2.3rem, 5vw, 3.8rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.05', marginBottom: '18px' }}>
            Software & IT solutions, <span className="op-grad-text">built for scale</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.18rem', lineHeight: '1.6', maxWidth: '640px', margin: '0 auto 18px' }}>
            From data and automation to cloud and custom applications, OpelSoft helps enterprises modernize, build, and run technology that moves the business forward.
          </p>
          <p style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', maxWidth: '660px', margin: '0 auto 30px', lineHeight: '1.55' }}>
            OpelSoft provides <span className="op-grad-text">Software Development &amp; IT Consulting Services to Fortune 500 clients across the US.</span>
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/contact-us" className="op-btn op-grad-bg" style={{ padding: '14px 30px', borderRadius: '12px', fontWeight: '700', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Talk to our team</Link>
            <Link href="/talent-staffing" className="op-btn" style={{ padding: '14px 30px', borderRadius: '12px', fontWeight: '700', border: '1px solid var(--border-color)', background: '#fff', color: '#09090b', textDecoration: 'none' }}>Talent &amp; Staffing</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <StatsBand items={STATS} tone="dark" decor={<Decor variant="c" tone="dark" />} />

      {/* SERVICES */}
      <section className="section-padding sec-grid" style={{ position: 'relative' }}>
        <Decor variant="b" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>What We Do</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>End-to-end technology services</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '620px', margin: '16px auto 0', lineHeight: '1.6' }}>A single partner for strategy, build, and run, across the technologies that matter most to your business.</p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {SERVICES.map((s, i) => (
              <Reveal key={s.name} delay={(i % 3) + 1}>
                <Link href="/contact-us" className="svc-card" style={{ '--svc': s.tint, height: '100%' }}>
                  <span className="svc-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="svc-ic">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s.tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                  </span>
                  <h3 className="svc-title">{s.name}</h3>
                  <p className="svc-body">{s.body}</p>
                  <span className="svc-link">Learn more <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          <Reveal>
            <div className="op-grad-bg" style={{ borderRadius: '28px', padding: 'clamp(40px, 6vw, 72px) 32px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(79,70,229,0.5)' }}>
              <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '380px', height: '380px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '14px', position: 'relative' }}>Let&apos;s build what&apos;s next</h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.92, maxWidth: '560px', margin: '0 auto 36px', lineHeight: '1.6', position: 'relative' }}>Tell us about your initiative and our team will scope the right solution with you.</p>
              <div style={{ position: 'relative' }}>
                <Link href="/contact-us" className="op-btn" style={{ padding: '14px 32px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: '#fff', color: 'var(--op-indigo)', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Get in touch</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
