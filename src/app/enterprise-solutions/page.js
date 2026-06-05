import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import Decor from '@/components/ui/Decor';

export const metadata = {
  title: 'Enterprise Solutions — OpelSoft',
  description: 'OpelSoft provides Software Development & IT Consulting Services to Fortune 500 clients across the US.',
};

function Icon({ tint, children }) {
  return (
    <span className="op-icon" style={{ background: `${tint}16`, width: '52px', height: '52px', borderRadius: '14px' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </span>
  );
}

const SERVICES = [
  { name: 'Data Analytics', tint: '#4F46E5', body: 'Turn raw data into decisions with custom pipelines, dashboards, and ML-ready models, sized to your needs, never over- or under-engineered.', icon: <><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></> },
  { name: 'Automation', tint: '#7C3AED', body: 'Streamline repetitive workflows with a human-first approach that frees your teams, builds an optimization culture, and tracks real ROI.', icon: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9 1.65 1.65 0 0 0 4.27 7.18l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></> },
  { name: 'Digital & Customer Design', tint: '#0EA5E9', body: 'Blend creativity with technology to craft intuitive, user-centric digital products that look great and perform at scale.', icon: <><circle cx="12" cy="12" r="10" /><path d="m8 12 3 3 5-6" /></> },
  { name: 'Project Management Solutions', tint: '#10B981', body: 'A process-driven PMO: clear objectives and success metrics, the right tooling, and data-monitored execution that keeps initiatives on track.', icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
  { name: 'Application Development', tint: '#F59E0B', body: 'Build and modernize web, mobile, and enterprise applications, from SaaS products to mission-critical internal systems.', icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
  { name: 'Customer Relationship Management', tint: '#EF4444', body: 'Implement and tailor CRM platforms that unify sales, service, and marketing around a single view of the customer.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { name: 'IT Consulting', tint: '#6366F1', body: 'Strategic technology guidance that aligns IT investments with business outcomes and identifies obstacles early.', icon: <><path d="M9.66 5.66 8 4l-.66 1.66L5 6l1.66.66L8 8l.66-1.66L11 6z" /><path d="M19 9l-1-2-2-1 2-1 1-2 1 2 2 1-2 1z" /><path d="M14 14l-1.5-3-3-1.5 3-1.5L14 4l1.5 3 3 1.5-3 1.5z" /></> },
  { name: 'Business Consultancy', tint: '#0D9488', body: 'Operational and process consulting that bridges the gap between your talent, your technology, and your goals.', icon: <><path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" /></> },
  { name: 'Digital Marketing', tint: '#DB2777', body: 'Data-led campaigns, SEO, and content that grow reach, generate pipeline, and prove return on every dollar.', icon: <><path d="m3 11 18-5v12L3 14v-3z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></> },
  { name: 'Cloud Application Development', tint: '#2563EB', body: 'Cloud-native builds and migrations on AWS, Azure, and GCP, engineered for resilience, security, and elastic scale.', icon: <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></> },
];

const STATS = [
  { v: 500, s: '+', label: 'Enterprise engagements' },
  { v: 15, s: '+', label: 'Years of experience' },
  { v: 50, s: '+', label: 'Specialist consultants' },
  { v: 98, s: '%', label: 'Client satisfaction' },
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
      <section className="sec-dark-grid" style={{ background: '#0B0B0F', color: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <Decor variant="c" tone="dark" />
        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '52px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', textAlign: 'center' }}>
            {STATS.map((m, i) => (
              <Reveal key={i} delay={(i % 4) + 1}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}><CountUp value={m.v} suffix={m.s} /></div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{m.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
                <div className="card-light hover-lift" style={{ padding: '30px', height: '100%' }}>
                  <Icon tint={s.tint}>{s.icon}</Icon>
                  <h3 style={{ fontSize: '1.22rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '18px 0 10px' }}>{s.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.6' }}>{s.body}</p>
                </div>
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
