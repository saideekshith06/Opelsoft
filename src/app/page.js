import pool from '@/lib/db';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import CountUp from '@/components/ui/CountUp';
import RotatingWord from '@/components/ui/RotatingWord';
import SaveButton from '@/components/ui/SaveButton';

// Cache the homepage and revalidate periodically instead of querying the
// remote DB on every navigation (much faster nav; counts refresh every 30s).
export const revalidate = 30;

async function getHomeData() {
  try {
    const [[jobs], [industries], [[{ jobsCount }]], [[{ usersCount }]], [[{ companiesCount }]]] = await Promise.all([
      pool.query(`
        SELECT j.id, j.title, j.job_type, j.salary_package, j.city, j.country, j.created_at, e.company_name
        FROM new_jobs j
        LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
        WHERE j.status = 'active'
        ORDER BY j.created_at DESC
        LIMIT 6
      `),
      pool.query(`
        SELECT industry, COUNT(*) AS count FROM new_jobs WHERE status = 'active'
        GROUP BY industry ORDER BY count DESC LIMIT 10
      `),
      pool.query("SELECT COUNT(*) AS jobsCount FROM new_jobs WHERE status = 'active'"),
      pool.query("SELECT COUNT(*) AS usersCount FROM new_users WHERE role = 'candidate'"),
      pool.query("SELECT COUNT(*) AS companiesCount FROM new_users WHERE role = 'employer'"),
    ]);
    return { jobs, industries, stats: { jobsCount: jobsCount || 37, usersCount: usersCount || 6, companiesCount: companiesCount || 25 } };
  } catch {
    return {
      jobs: [
        { id: 1, title: 'Senior AI/ML Engineer', job_type: 'Full-time', salary_package: '90000-140000', city: 'London', country: 'UK', company_name: 'DeepMind' }, { id: 2, title: 'Robotics Engineer', job_type: 'Full-time', salary_package: '75000-110000', city: 'Cambridge', country: 'UK', company_name: 'Wayve' }, { id: 3, title: 'Computer Vision Engineer', job_type: 'Contract', salary_package: '80000-120000', city: 'Remote', country: 'UK', company_name: 'Tractable' }, ], industries: [{ industry: 'Artificial Intelligence', count: 24 }, { industry: 'Robotics', count: 18 }, { industry: 'Machine Learning', count: 14 }, { industry: 'Automation', count: 9 }], stats: { jobsCount: 37, usersCount: 6, companiesCount: 25 }, };
  }
}

function IconBadge({ tint, children }) {
  return (
    <div className="op-icon" style={{ background: `${tint}16` }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
    </div>
  );
}

const VALUES = [
  { tint: '#4F46E5', title: 'Quality Opportunities', body: 'Live roles from real, verified employers, startups to enterprises, across every major industry.', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> }, { tint: '#7C3AED', title: 'Apply in Seconds', body: 'Build your profile once, add your CV, and apply to any role in a few clicks, no repetitive forms.', icon: <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /> }, { tint: '#0EA5E9', title: 'Stay in Control', body: 'Track every application, submitted, shortlisted, hired, in one clean, real-time dashboard.', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
];

const STEPS = [
  { tint: '#4F46E5', n: '01', title: 'Create your profile', body: 'Add your skills, experience, and CV, or upload a CV to fill it in for you.', icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> }, { tint: '#7C3AED', n: '02', title: 'Search & apply', body: 'Filter thousands of live roles and apply in clicks with your saved profile.', icon: <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></> }, { tint: '#10B981', n: '03', title: 'Track & get hired', body: 'Follow every application from submitted to offer, all in one place.', icon: <path d="M20 6 9 17l-5-5" /> },
];

const SERVICES = [
  { tint: '#4F46E5', name: 'Job Board', body: 'Thousands of live roles to search, filter, and apply to in minutes.', href: '/jobs', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> }, { tint: '#7C3AED', name: 'Talent & Staffing', body: 'Contract, direct-hire, and executive search for AI, robotics, and deep-tech teams.', href: '/talent-staffing', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></> }, { tint: '#0EA5E9', name: 'Candidate Profiles', body: 'A complete profile and CV you build once and reuse everywhere.', href: '/register', icon: <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> }, { tint: '#10B981', name: 'Application Tracking', body: 'A single dashboard to follow every application from submitted to offer.', href: '/dashboard/candidate', icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> }, { tint: '#F59E0B', name: 'Executive Search', body: 'Confidential senior-leadership and C-suite placement, matched to fit.', href: '/talent-staffing#solutions', icon: <><circle cx="12" cy="8" r="6" /><path d="M15.5 13.5 17 22l-5-3-5 3 1.5-8.5" /></> }, { tint: '#EF4444', name: 'Career Resources', body: 'Guidance and a growing library to help you take the next step.', href: '/about-us', icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></> },
];

const FAQS = [
  { q: 'Is OpelSoft free for candidates?', a: 'Yes. Creating a profile, browsing jobs, and applying to roles is completely free for job seekers.' }, { q: 'How do I apply for a job?', a: 'Create a candidate account, complete your profile and upload your CV, then click Apply on any listing and add a short cover note.' }, { q: 'How do employers post a job?', a: 'Register an employer account and use your dashboard to post a listing with the title, description, requirements, location, and salary.' }, { q: 'Can I track my applications?', a: 'Yes. Your candidate dashboard shows every job you have applied to along with its current hiring status.' },
];

const TICKER = ['AI Engineer', 'Robotics Engineer', 'Machine Learning Engineer', 'Computer Vision Engineer', 'Data Scientist', 'MLOps Engineer', 'Automation Engineer', 'Research Scientist', 'Embedded Systems Engineer', 'Software Engineer', 'Product Manager', 'UX Designer', 'DevOps Engineer', 'Project Manager'];

export default async function Home() {
  const { jobs, industries, stats } = await getHomeData();

  return (
    <div className="home-page" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="op-mesh" style={{ borderBottom: '1px solid var(--border-color)', padding: '116px 0 104px', overflow: 'hidden' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '56px', alignItems: 'center' }}>
            {/* Left */}
            <Reveal>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1px solid var(--border-color)', borderRadius: '30px', padding: '6px 14px', fontSize: '0.78rem', fontWeight: '700', color: 'var(--op-indigo)', boxShadow: 'var(--shadow-sm)', marginBottom: '22px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--op-indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg> The platform for ambitious tech careers
              </div>
              <h1 style={{ fontSize: 'clamp(2.7rem, 5.6vw, 4.5rem)', fontWeight: '800', letterSpacing: '-0.045em', lineHeight: '1.05', marginBottom: '22px' }}>
                Find your next role as{' '}
                <RotatingWord className="op-grad-text" words={['an AI Engineer', 'a Robotics Engineer', 'an ML Engineer', 'a Data Scientist', 'a Software Engineer', 'a Product Designer']} />
              </h1>
              <p style={{ fontSize: 'clamp(1.05rem, 2vw, 1.25rem)', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '520px', marginBottom: '30px' }}>
                OpelSoft connects talented people with great companies. Discover roles, build your profile, and apply in clicks, all in one place.
              </p>

              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link href="/jobs" className="op-btn op-grad-bg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '15px 32px', borderRadius: '14px', fontWeight: '700', fontSize: '1.02rem', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>
                  Explore open roles
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </Link>
                <Link href="/register" className="op-btn" style={{ padding: '15px 32px', borderRadius: '14px', fontWeight: '700', fontSize: '1.02rem', border: '1px solid var(--border-color)', background: '#fff', color: '#09090b', textDecoration: 'none' }}>
                  Create your profile
                </Link>
              </div>
            </Reveal>

            {/* Right, hero image with floating glass cards */}
            <Reveal delay={2}>
              <div style={{ position: 'relative', maxWidth: '560px', margin: '0 auto' }}>
                <div style={{ position: 'absolute', inset: '-12% -8% -8% -12%', background: 'var(--op-grad)', filter: 'blur(60px)', opacity: 0.22, borderRadius: '40px' }} />
                <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px -24px rgba(17,24,39,0.4)', border: '1px solid rgba(255,255,255,0.6)' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/hero.jpg" alt="A candidate celebrating a successful hire" style={{ width: '100%', display: 'block' }} />
                </div>
                {/* floating cards */}
                <div className="op-glass op-float" style={{ position: 'absolute', top: '14%', left: '-6%', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="op-icon" style={{ width: '38px', height: '38px', background: 'rgba(16,185,129,0.14)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                  </div>
                  <div><div style={{ fontWeight: '800', fontSize: '0.95rem' }}>You&apos;re hired!</div><div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Offer accepted</div></div>
                </div>
                <div className="op-glass op-float slow" style={{ position: 'absolute', bottom: '10%', right: '-5%', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', padding: '12px 16px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' }}>New roles today</div>
                  <div style={{ fontWeight: '800', fontSize: '1.3rem', lineHeight: 1 }} className="op-grad-text"><CountUp value={120} suffix="+" /></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ROLE TICKER ──────────────────────────────────── */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--border-color)', padding: '20px 0' }}>
        <div className="op-ticker-wrap">
          <div className="op-ticker">
            {[...TICKER, ...TICKER].map((r, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--op-violet)' }} /> {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────── */}
      <section style={{ background: '#0B0B0F', color: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ padding: '52px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '24px', textAlign: 'center' }}>
            {[
              { v: stats.jobsCount, s: '+', label: 'Open roles' }, { v: stats.companiesCount, s: '+', label: 'Hiring companies' }, { v: stats.usersCount, s: '+', label: 'Candidates' }, { v: industries.length || 6, s: '+', label: 'Industries' }, ].map((m, i) => (
              <Reveal key={i} delay={(i % 4) + 1}>
                <div style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>
                  <CountUp value={m.v} suffix={m.s} />
                </div>
                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>{m.label}</div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY OPELSOFT ─────────────────────────────────── */}
      <section className="section-light section-padding" style={{ background: '#fff', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Why OpelSoft</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>A simpler way to find your next role</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '24px' }}>
            {VALUES.map((c, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ padding: '32px', height: '100%' }}>
                  <IconBadge tint={c.tint}>{c.icon}</IconBadge>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px' }}>{c.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>{c.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="section-light section-padding">
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>How It Works</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Land your next role in three steps</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ padding: '34px', height: '100%', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '22px', right: '26px', fontSize: '2.4rem', fontWeight: '800', color: `${s.tint}1f`, fontFamily: 'var(--font-mono-stack)' }}>{s.n}</div>
                  <IconBadge tint={s.tint}>{s.icon}</IconBadge>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px' }}>{s.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6' }}>{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal style={{ textAlign: 'center', marginTop: '44px' }}>
            <Link href="/register" className="op-btn op-grad-bg" style={{ display: 'inline-block', padding: '14px 30px', borderRadius: '30px', fontWeight: '700', color: '#fff', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Get started, it&apos;s free</Link>
          </Reveal>
        </div>
      </section>

      {/* ── WHAT WE OFFER ────────────────────────────────── */}
      <section className="section-light section-padding" style={{ background: '#fff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>What We Offer</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>One platform for talent and hiring</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {SERVICES.map((s, i) => (
              <Reveal key={i} delay={(i % 3) + 1}>
                <Link href={s.href} className="card-light hover-lift" style={{ padding: '30px', display: 'block', textDecoration: 'none', height: '100%' }}>
                  <IconBadge tint={s.tint}>{s.icon}</IconBadge>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '-0.02em', margin: '20px 0 10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                    {s.name}
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={s.tint} strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.6' }}>{s.body}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED JOBS ────────────────────────────────── */}
      <section className="section-light section-padding">
        <div className="container">
          <Reveal style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Latest Openings</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.9rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Featured jobs</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {jobs.map((job, i) => (
              <Reveal key={job.id} delay={(i % 3) + 1}>
                <div className="card-light hover-lift" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px', padding: '26px', height: '100%' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div className="op-grad-bg" style={{ width: '48px', height: '48px', borderRadius: '12px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem', flexShrink: 0 }}>
                      {(job.company_name || 'O').charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{job.company_name || 'OpelSoft Partner'}</div>
                      <h3 style={{ fontSize: '1.22rem', fontWeight: '700', marginTop: '4px', letterSpacing: '-0.02em' }}>
                        <Link href={`/jobs/${job.id}`} className="op-underline" style={{ color: 'inherit', textDecoration: 'none' }}>{job.title}</Link>
                      </h3>
                    </div>
                    <SaveButton />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
                    {job.city && <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 10px' }}>📍 {job.city}</span>}
                    {job.job_type && <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--op-indigo)', background: 'rgba(79,70,229,0.08)', borderRadius: '20px', padding: '4px 10px' }}>{job.job_type}</span>}
                    {job.salary_package && <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 10px' }}>£{job.salary_package.split('-')[0]}/yr</span>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/jobs" className="op-btn" style={{ border: '1px solid var(--border-color)', background: '#fff', padding: '12px 28px', borderRadius: '30px', fontWeight: '600', fontSize: '0.95rem', color: '#09090b', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)', textDecoration: 'none' }}>
              Browse all jobs
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-light section-padding" style={{ background: '#fff', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ maxWidth: '760px' }}>
          <Reveal style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '14px' }}>Questions</div>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 2.7rem)', fontWeight: '800', letterSpacing: '-0.03em' }}>Frequently asked</h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {FAQS.map((f, i) => (
              <Reveal key={i}>
                <details className="op-faq card-light" style={{ padding: '20px 24px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: '700', fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                    {f.q}
                    <svg className="op-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--op-indigo)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
                  </summary>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: '1.6', marginTop: '12px' }}>{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ padding: '20px 0 80px' }}>
        <div className="container">
          <Reveal>
            <div className="op-grad-bg" style={{ borderRadius: '28px', padding: 'clamp(40px, 6vw, 72px) 32px', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 30px 60px -20px rgba(79,70,229,0.5)' }}>
              <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '380px', height: '380px', background: 'rgba(255,255,255,0.12)', borderRadius: '50%', filter: 'blur(40px)' }} />
              <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '14px', position: 'relative' }}>Ready to take the next step?</h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.92, maxWidth: '540px', margin: '0 auto 36px', lineHeight: '1.6', position: 'relative' }}>Join OpelSoft today and find your next role.</p>
              <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', position: 'relative' }}>
                <Link href="/register" className="op-btn" style={{ padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: '#fff', color: 'var(--op-indigo)', textDecoration: 'none', boxShadow: 'var(--shadow-md)' }}>Get Started Free</Link>
                <Link href="/jobs" className="op-btn" style={{ padding: '14px 30px', borderRadius: '30px', fontSize: '1rem', fontWeight: '700', background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none' }}>Browse Jobs</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
