import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import GeoDecor from '@/components/ui/GeoDecor';
import Decor from '@/components/ui/Decor';
import StatsBand from '@/components/ui/StatsBand';

export const metadata = {
  title: 'About OpelSoft - Software Development & IT Consulting', description: 'OpelSoft provides Software Development & IT Consulting Services to Fortune 500 clients across the US, with staffing and consulting across Banking, Healthcare, Telecom, Insurance, Retail and more.',
};

function Icon({ tint, children }) {
  return (
    <div className="op-icon" style={{ background: `${tint}16` }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </div>
  );
}

const DO = [
  { tint: '#4F46E5', title: 'Contract Staffing', body: 'Flexible, vetted professionals embedded with your teams for exactly as long as you need them.', icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></> }, { tint: '#7C3AED', title: 'Direct Placements', body: 'Permanent hiring end to end, sourced and matched to your core business and culture.', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> }, { tint: '#0EA5E9', title: 'Bench Sales', body: 'Connecting our skilled consultants with the right client requirements, fast.', icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></> }, { tint: '#10B981', title: 'Application Development', body: 'Custom web, mobile, and enterprise applications, built and modernized end to end.', icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> }, { tint: '#F59E0B', title: 'CRM Solutions', body: 'Customer relationship platforms implemented and tailored to unify sales, service, and marketing.', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> },
];

const VALUES = [
  { tint: '#4F46E5', emoji: '🛡️', title: 'Absolute Integrity', body: 'Transparent partnerships, clear communication, and honest expectations, for candidates and companies alike.' }, { tint: '#7C3AED', emoji: '🎯', title: 'Deep Expertise', body: 'From full-stack, Java, and .NET to Salesforce, cloud, and machine learning, we know the technologies and the people who deliver them.' }, { tint: '#10B981', emoji: '🌍', title: 'Global Delivery', body: 'Headquartered in Edison, NJ with an offshore center in Hyderabad, India, we serve multinational customers around the clock.' },
];

const FOCUS_AREAS = [
  { name: 'Full-Stack Development', tint: '#4F46E5', icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> }, { name: 'Java', tint: '#7C3AED', icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" /></> }, { name: '.NET', tint: '#0EA5E9', icon: <><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5a2 2 0 0 0 2 2h1" /><path d="M16 3h1a2 2 0 0 1 2 2v5a2 2 0 0 0 2 2 2 2 0 0 0-2 2v5a2 2 0 0 1-2 2h-1" /></> }, { name: 'Salesforce', tint: '#10B981', icon: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /> }, { name: 'QA & Testing', tint: '#F59E0B', icon: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></> }, { name: 'Business Analysis', tint: '#EF4444', icon: <><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></> }, { name: 'Android', tint: '#6366F1', icon: <><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></> }, { name: 'iOS', tint: '#14B8A6', icon: <><rect x="7" y="2" width="10" height="20" rx="2" /><line x1="11" y1="18" x2="13" y2="18" /></> }, { name: 'Machine Learning', tint: '#DB2777', icon: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></> }, { name: 'Python', tint: '#2563EB', icon: <><polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" /></> },
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
                OpelSoft is a private equity consortium firm that <strong style={{ color: 'var(--text-primary)' }}>provides <span className="op-grad-text">Software Development &amp; IT Consulting Services to Fortune 500 clients across the US</span></strong>, partnering with employers and delivering exceptional service across every engagement.
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
      <StatsBand tone="dark" decor={<Decor variant="c" tone="dark" />} items={[
        { v: 15, s: '+', label: 'Years of experience', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
        { v: 20, s: '+', label: 'Industries served', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></> },
        { v: 500, s: '+', label: 'Projects delivered', icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></> },
        { v: 100, s: '%', label: 'Client commitment', icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /> },
      ]} />

      {/* MISSION */}
      <section className="section-light section-padding" style={{ background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '820px', textAlign: 'center' }}>
          <Reveal>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Our Mission</div>
            <h2 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '20px' }}>What drives us</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.8', marginBottom: '18px' }}>
              We believe OpelSoft is an exceptional company, a company of people proud of the work they do and the solutions they provide.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', lineHeight: '1.8', marginBottom: '18px' }}>
              By understanding our specialty industries, following a disciplined process to identify quality candidates, and partnering with employers to understand their core business and hiring needs, we deliver exceptional service and great results for everyone involved.
            </p>
            <p style={{ color: 'var(--text-light)', fontSize: '0.96rem', lineHeight: '1.7' }}>
              Headquartered in Edison, NJ, with an offshore delivery center in Hyderabad, India, serving multinational customers.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginTop: '28px' }}>
              {['Banking', 'Financial Services', 'Healthcare', 'Human Resources', 'Telecom', 'Insurance', 'Hospitality', 'Retail & Distribution', 'Manufacturing'].map((v) => (
                <span key={v} style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--op-indigo)', background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.16)', borderRadius: '20px', padding: '6px 14px' }}>{v}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* FOCUS AREAS */}
      <section className="section-light section-padding">
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Specialties</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>The skills we deliver</h2>
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
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Professional Services</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>What we do</h2>
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
              <p style={{ fontSize: '1.15rem', opacity: 0.92, maxWidth: '520px', margin: '0 auto 34px', lineHeight: '1.6', position: 'relative' }}>Explore opportunities, or talk to our team about your next project or hire.</p>
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
