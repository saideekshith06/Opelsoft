import pool from '@/lib/db';
import Link from 'next/link';
import HomeSlider from '@/components/HomeSlider';
import CompoundingNetwork from '@/components/CompoundingNetwork';

export const dynamic = 'force-dynamic';

async function getHomeData() {
  try {
    const [jobs] = await pool.query(`
      SELECT j.id, j.title, j.job_type, j.salary_package, j.city, j.country, j.created_at,
             e.company_name
      FROM new_jobs j
      LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
      WHERE j.status = 'active'
      ORDER BY j.created_at DESC
      LIMIT 6
    `);

    const [industries] = await pool.query(`
      SELECT industry, COUNT(*) AS count
      FROM new_jobs
      WHERE status = 'active'
      GROUP BY industry
      ORDER BY count DESC
      LIMIT 10
    `);

    const [[{ jobsCount }]] = await pool.query("SELECT COUNT(*) AS jobsCount FROM new_jobs WHERE status = 'active'");
    const [[{ usersCount }]] = await pool.query("SELECT COUNT(*) AS usersCount FROM new_users WHERE role = 'candidate'");
    const [[{ companiesCount }]] = await pool.query("SELECT COUNT(*) AS companiesCount FROM new_users WHERE role = 'employer'");

    return { jobs, industries, stats: { jobsCount: jobsCount || 37, usersCount: usersCount || 6, companiesCount: companiesCount || 25 } };
  } catch {
    return {
      jobs: [
        { id: 1, title: 'Senior AI/ML Engineer', job_type: 'Full-time', salary_package: '80000-120000', city: 'London', country: 'UK', company_name: 'DeepMind' },
        { id: 2, title: 'Full-Stack Developer', job_type: 'Full-time', salary_package: '60000-90000', city: 'Remote', country: 'UK', company_name: 'Monzo' },
        { id: 3, title: 'Data Scientist', job_type: 'Contract', salary_package: '70000-100000', city: 'Manchester', country: 'UK', company_name: 'AutoTrader' },
      ],
      industries: [
        { industry: 'Technology', count: 24 },
        { industry: 'AI & Machine Learning', count: 18 },
        { industry: 'Finance', count: 12 },
        { industry: 'Healthcare', count: 9 },
        { industry: 'Consulting', count: 8 },
        { industry: 'E-Commerce', count: 6 },
      ],
      stats: { jobsCount: 37, usersCount: 6, companiesCount: 25 }
    };
  }
}

export default async function Home() {
  const { jobs, industries, stats } = await getHomeData();

  return (
    <div className="home-page" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>

      {/* ── 1. HERO & PLAYGROUND ─────────────────────────── */}
      <HomeSlider stats={stats} />

      {/* ── 2. THE PIPELINE / STEPS ─────────────────────── */}
      <section id="features" className="section-light section-padding bg-grid-light" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-color)', background: '#ffffff', padding: '120px 0' }}>
        <div className="ambient-glow ambient-emerald animate-drift-1" style={{ top: '10%', left: '5%', width: '450px', height: '450px', opacity: 0.2 }} />
        <div className="ambient-glow ambient-purple animate-drift-2" style={{ bottom: '10%', right: '5%', width: '450px', height: '450px', opacity: 0.2 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '16px', fontFamily: 'var(--font-mono-stack)' }}>
              SYSTEM ARCHITECTURE
            </div>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: '800', letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: '1.1', marginBottom: '8px' }}>
              Automate the hunt.
            </h2>
            <h2 style={{ fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: '400', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: '1.1', marginBottom: '32px' }} className="font-serif-italic">
              Align the matches.
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(1.1rem, 2vw, 1.25rem)', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6', fontWeight: '400' }}>
              Opelsoft orchestrates complex data crawling, semantic search, and cognitive LLM reasoning pipelines to automate active job discovery.
            </p>
          </div>

          <div className="process-grid">
            
            {/* Step 1 */}
            <div className="process-card process-card-blue">
              <div>
                <div className="process-card-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <line x1="19" y1="8" x2="23" y2="8" />
                    <line x1="21" y1="6" x2="21" y2="10" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#1E50FF', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'var(--font-mono-stack)' }}>
                  01 &bull; INGESTION
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Candidate Blueprint
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '16px' }}>
                  Coordinate preferred titles, target locations, base compensation thresholds, and resume coordinates into a unified profile.
                </p>

                {/* Tech Specs Gist */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(30, 80, 255, 0.05)', border: '1px solid rgba(30, 80, 255, 0.1)', color: '#1E50FF', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    1536-dim vector
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(9, 9, 11, 0.04)', border: '1px solid rgba(9, 9, 11, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                    PDF/DOCX/TXT
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(9, 9, 11, 0.04)', border: '1px solid rgba(9, 9, 11, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                    &lt; 450ms Parse
                  </span>
                </div>
              </div>
              <div>
                <hr style={{ border: 0, borderTop: '1px solid rgba(9, 9, 11, 0.06)', margin: '0 0 24px 0' }} />
                <ul className="process-bullet-list">
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#1E50FF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Structured profile vector mapping</span>
                  </li>
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#1E50FF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Automatic background tokenization</span>
                  </li>
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#1E50FF' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Customizable filter criteria parameters</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="process-card process-card-emerald">
              <div>
                <div className="process-card-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                    <line x1="6" y1="6" x2="6.01" y2="6" />
                    <line x1="6" y1="18" x2="6.01" y2="18" />
                    <path d="M20 10v4" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'var(--font-mono-stack)' }}>
                  02 &bull; TELEMETRY
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Scraper Telemetry
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '16px' }}>
                  Deploy custom crawlers to scrape job descriptions directly from Greenhouse, Lever, Workday, and private corporate portals.
                </p>

                {/* Tech Specs Gist */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    12,000+ jobs/day
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(9, 9, 11, 0.04)', border: '1px solid rgba(9, 9, 11, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                    Greenhouse / Lever API
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(9, 9, 11, 0.04)', border: '1px solid rgba(9, 9, 11, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                    Proxy Rotation
                  </span>
                </div>
              </div>
              <div>
                <hr style={{ border: 0, borderTop: '1px solid rgba(9, 9, 11, 0.06)', margin: '0 0 24px 0' }} />
                <ul className="process-bullet-list">
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#10b981' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Direct endpoint ATS crawling</span>
                  </li>
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#10b981' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Structured metadata parser</span>
                  </li>
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#10b981' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>De-duplication pipeline indexing</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="process-card process-card-amber">
              <div>
                <div className="process-card-icon-wrapper">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="2" x2="12" y2="7" />
                    <line x1="12" y1="17" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="7" y2="12" />
                    <line x1="17" y1="12" x2="22" y2="12" />
                  </svg>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#F59E0B', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'var(--font-mono-stack)' }}>
                  03 &bull; COGNITIVE SCORE
                </div>
                <h3 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '12px', color: 'var(--text-primary)' }}>
                  Cognitive Relevance
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '16px' }}>
                  Run semantic LLM checks to extract fit percentage, isolate critical skill gaps, and flag qualification risk factors.
                </p>

                {/* Tech Specs Gist */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', color: '#F59E0B', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                    Claude 3.5 / Gemini
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(9, 9, 11, 0.04)', border: '1px solid rgba(9, 9, 11, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                    12-point matrix
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '700', fontFamily: 'var(--font-mono-stack)', background: 'rgba(9, 9, 11, 0.04)', border: '1px solid rgba(9, 9, 11, 0.06)', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '4px' }}>
                    Anonymized Mode
                  </span>
                </div>
              </div>
              <div>
                <hr style={{ border: 0, borderTop: '1px solid rgba(9, 9, 11, 0.06)', margin: '0 0 24px 0' }} />
                <ul className="process-bullet-list">
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#F59E0B' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>LLM semantic match calculations</span>
                  </li>
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#F59E0B' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Automated skill gap identification</span>
                  </li>
                  <li className="process-bullet-item">
                    <svg className="process-bullet-icon" style={{ color: '#F59E0B' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Integrated alerts & logs dispatch</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. WHY THIS MATTERS NOW / SILOED VS UNIFIED ───── */}
      <section id="why-now" className="section-light section-padding bg-grid-light" style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border-color)' }}>
        <div className="ambient-glow ambient-coral animate-drift-2" style={{ top: '10%', right: '5%', width: '450px', height: '450px', opacity: 0.4 }} />
        <div className="ambient-glow ambient-blue animate-drift-1" style={{ bottom: '10%', left: '5%', width: '450px', height: '450px', opacity: 0.4 }} />
        
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '60px', alignItems: 'center' }}>
            
            {/* Copy */}
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '16px' }}>
                THE CHALLENGE
              </div>
              <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: '800', letterSpacing: '-0.04em', color: 'var(--text-primary)', lineHeight: '1.1', marginBottom: '24px' }}>
                Job search is fragmented.<br />
                <span style={{ fontWeight: '400' }} className="text-light-muted">Discovery shouldn't be.</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '20px', fontWeight: '400' }}>
                Job discovery is currently broken. Opportunities are scattered across hundreds of proprietary career portals, ATS configurations, and outdated third-party job aggregators. Valuable listings vanish without notice, and candidate fit data is rarely considered.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', lineHeight: '1.7', marginBottom: '32px', fontWeight: '400' }}>
                Opelsoft solves this by creating a personal, autonomous pipeline. By continually indexing company pages and running LLM checks against your profile, the system structures the messy web of job listings into a unified dashboard.
              </p>
              <div style={{ borderLeft: '3px solid var(--accent-color)', paddingLeft: '20px', marginTop: '24px' }}>
                <p style={{ fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '500', lineHeight: '1.6' }} className="font-serif-italic">
                  "Opelsoft shifts the dynamic from manual searching to continuous, automated opportunity indexing."
                </p>
              </div>
            </div>

            {/* Bento Grid: 6 Siloed cards representing the issue */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
              
              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>Silo 01</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'var(--font-mono-stack)' }}>Scattered</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Career Portals</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Unindexed openings</p>
                </div>
              </div>

              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>Silo 02</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'var(--font-mono-stack)' }}>Stale</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Expired Listings</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Ghost openings</p>
                </div>
              </div>

              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>Silo 03</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'var(--font-mono-stack)' }}>Mismatched</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Aggregators</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Low relevancy scores</p>
                </div>
              </div>

              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>Silo 04</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'var(--font-mono-stack)' }}>Slow</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>ATS Systems</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Resume black holes</p>
                </div>
              </div>

              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>Silo 05</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'var(--font-mono-stack)' }}>Messy</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Profile Sync</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>Outdated credentials</p>
                </div>
              </div>

              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justify: 'space-between', minHeight: '140px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.8rem' }}>Silo 06</span>
                  <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#ef4444', fontWeight: '600', letterSpacing: '0.05em', fontFamily: 'var(--font-mono-stack)' }}>Untracked</span>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>Applications</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.3' }}>No status follow-up</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 4. COMPOUNDING JOB NETWORK (DARK SECTION) ─────── */}
      <CompoundingNetwork />

      {/* ── 5. FEATURED JOBS ─────────────────────────────── */}
      <section className="section-light section-padding" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '16px' }}>
              LIVE OPPORTUNITIES
            </div>
            <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.2rem)', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              Featured Job Openings
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: '8px' }}>
              Hand-scored live listings actively crawled by the system
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {jobs.map((job) => (
              <div key={job.id} className="card-light" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '200px', padding: '28px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#09090b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.2rem', flexShrink: 0 }}>
                    {(job.company_name || 'O').charAt(0)}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{job.company_name || 'Opelsoft Partner'}</div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.02em' }}>
                      <Link href={`/jobs/${job.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {job.title}
                      </Link>
                    </h3>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid rgba(9, 9, 11, 0.05)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono-stack)' }}>
                    {job.city && <span>{job.city}</span>}
                    {job.job_type && <span style={{ color: 'var(--accent-color)', fontWeight: '600' }}>{job.job_type}</span>}
                  </div>
                  {job.salary_package && (
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono-stack)' }}>
                      £{job.salary_package.split('-')[0]}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '400' }}>/yr</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/jobs" className="fs-btn-ghost" style={{ border: '1px solid var(--border-color)', background: '#ffffff', padding: '12px 28px', borderRadius: '30px', fontWeight: '600', fontSize: '0.95rem', color: '#09090b', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-sm)' }}>
              Browse All Openings
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. INDUSTRIES ────────────────────────────────── */}
      {industries.length > 0 && (
        <section className="section-light section-padding" style={{ borderBottom: '1px solid var(--border-color)', background: '#ffffff' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '12px' }}>
                BY SECTOR
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Browse by Industry
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '900px', margin: '0 auto' }}>
              {industries.map((ind, i) => (
                <Link
                  key={i}
                  href={`/jobs?industry=${encodeURIComponent(ind.industry || '')}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '30px',
                    background: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                  }}
                  className="industry-pill"
                >
                  {ind.industry || 'General'}
                  <span style={{ fontSize: '0.75rem', background: 'rgba(9, 9, 11, 0.05)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '20px', fontWeight: '500', fontFamily: 'var(--font-mono-stack)' }}>
                    {ind.count}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. CTA BANNER ────────────────────────────────── */}
      <section className="section-light" style={{ position: 'relative', overflow: 'hidden', padding: '100px 0', borderBottom: '1px solid var(--border-color)' }}>
        <div className="ambient-glow ambient-blue animate-drift-1" style={{ top: '50%', left: '50%', width: '700px', height: '400px', transform: 'translate(-50%, -50%)', opacity: 0.6 }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: '800', letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: '16px' }}>
            Ready to let AI automate your search?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', maxWidth: '540px', margin: '0 auto 40px', lineHeight: '1.6' }}>
            Join top-tier developers who rely on Opelsoft to crawl career portals and rank opportunities autonomously.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="fs-btn-pill" style={{ padding: '14px 28px', borderRadius: '30px', fontSize: '1rem', fontWeight: '600', boxShadow: 'var(--shadow-md)' }}>
              Get Started Free
            </Link>
            <Link href="/about-us" className="fs-btn-ghost" style={{ padding: '14px 28px', borderRadius: '30px', fontSize: '1rem', fontWeight: '600', border: '1px solid var(--border-color)', background: '#ffffff', color: '#09090b', boxShadow: 'var(--shadow-sm)' }}>
              Learn More
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
