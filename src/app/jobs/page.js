import pool from '@/lib/db';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import SaveButton from '@/components/ui/SaveButton';

// Format "90000-140000" as "£90,000 to £140,000"
export function formatSalary(pkg) {
  if (!pkg) return null;
  const fmt = (n) => {
    const x = Number(String(n).replace(/[^0-9.]/g, ''));
    return Number.isNaN(x) || x === 0 ? String(n).trim() : '£' + x.toLocaleString('en-GB');
  };
  const parts = String(pkg).split('-').map((s) => s.trim()).filter(Boolean);
  return parts.length >= 2 ? `${fmt(parts[0])} to ${fmt(parts[1])}` : fmt(parts[0]);
}

async function getFilteredJobs(searchParams) {
  const { keyword, location, job_type, industry, city } = searchParams;
  let query = `
    SELECT j.id, j.title, j.job_type, j.salary_package, j.address, j.city, j.country, j.industry, j.experience, j.created_at, e.company_name, e.logo_url
    FROM new_jobs j
    LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
    WHERE j.status = 'active'
  `;
  const params = [];
  if (keyword) { query += ` AND (j.title LIKE ? OR j.description LIKE ? OR e.company_name LIKE ?)`; params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`); }
  if (location) { query += ` AND (j.city LIKE ? OR j.country LIKE ? OR j.address LIKE ?)`; params.push(`%${location}%`, `%${location}%`, `%${location}%`); }
  if (job_type) { query += ` AND j.job_type = ?`; params.push(job_type); }
  if (industry) { query += ` AND j.industry = ?`; params.push(industry); }
  if (city) { query += ` AND j.city = ?`; params.push(city); }
  query += ` ORDER BY j.created_at DESC`;

  try {
    // Run all queries in parallel — one round-trip of latency to the remote DB
    // instead of four sequential ones (cuts /jobs render time ~4x).
    const [[jobs], [dbJobTypes], [dbIndustries], [dbLocations]] = await Promise.all([
      pool.query(query, params),
      pool.query("SELECT DISTINCT job_type FROM new_jobs WHERE job_type != '' AND job_type IS NOT NULL"),
      pool.query("SELECT DISTINCT industry FROM new_jobs WHERE industry != '' AND industry IS NOT NULL LIMIT 15"),
      pool.query("SELECT DISTINCT city FROM new_jobs WHERE city != '' AND city IS NOT NULL LIMIT 10"),
    ]);
    return { jobs, filterOptions: { jobTypes: dbJobTypes.map((r) => r.job_type), industries: dbIndustries.map((r) => r.industry), locations: dbLocations.map((r) => r.city) } };
  } catch (err) {
    console.error('Failed to query filtered jobs, using fallback:', err);
    return {
      jobs: [
        { id: 1, title: 'Senior AI/ML Engineer', job_type: 'Full-time', salary_package: '90000-140000', city: 'London', country: 'United Kingdom', company_name: 'DeepMind', industry: 'Artificial Intelligence', experience: 'Senior' }, { id: 2, title: 'Robotics Engineer', job_type: 'Full-time', salary_package: '75000-110000', city: 'Cambridge', country: 'United Kingdom', company_name: 'Wayve', industry: 'Robotics', experience: 'Mid' }, ], filterOptions: { jobTypes: ['Full-time', 'Part-time', 'Contract', 'Internship'], industries: ['Artificial Intelligence', 'Robotics', 'Machine Learning', 'Automation'], locations: ['London', 'Cambridge', 'Manchester'] }, };
  }
}

export default async function JobsPage({ searchParams }) {
  const sp = await searchParams;
  const { jobs, filterOptions } = await getFilteredJobs(sp);

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* HERO + SEARCH */}
      <section className="op-mesh" style={{ borderBottom: '1px solid var(--border-color)', padding: '64px 0 52px' }}>
        <div className="container" style={{ maxWidth: '860px', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.1rem, 5vw, 3.3rem)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: '14px' }}>
            Find your <span className="op-grad-text">next role</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', marginBottom: '28px' }}>{jobs.length} open role{jobs.length === 1 ? '' : 's'} from teams building the future.</p>
          <form action="/jobs" method="get" className="op-glass" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '8px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-md)', maxWidth: '620px', margin: '0 auto' }}>
            <input name="keyword" defaultValue={sp.keyword || ''} placeholder="Job title or keyword" className="form-control op-focus" style={{ flex: '1 1 200px', height: '48px', border: 'none', background: 'transparent' }} />
            <input name="location" defaultValue={sp.location || ''} placeholder="Location" className="form-control op-focus" style={{ flex: '1 1 130px', height: '48px', border: 'none', background: 'transparent', borderLeft: '1px solid var(--border-color)' }} />
            <button type="submit" className="op-btn op-grad-bg" style={{ height: '48px', padding: '0 26px', borderRadius: '12px', fontWeight: '700', color: '#fff', border: 'none', cursor: 'pointer' }}>Search</button>
          </form>
        </div>
      </section>

      <div className="container" style={{ padding: '48px 24px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 260px) 1fr', gap: '32px', alignItems: 'start' }} className="jobs-layout">

          {/* Filters */}
          <aside className="card-light" style={{ padding: '24px', position: 'sticky', top: '90px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '18px' }}>Filters</h2>
            <form method="GET" action="/jobs" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {sp.keyword && <input type="hidden" name="keyword" value={sp.keyword} />}
              {sp.location && <input type="hidden" name="location" value={sp.location} />}
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Job Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}><input type="radio" name="job_type" value="" defaultChecked={!sp.job_type} style={{ accentColor: 'var(--op-indigo)' }} /> All types</label>
                  {filterOptions.jobTypes.map((t, i) => (
                    <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', cursor: 'pointer' }}><input type="radio" name="job_type" value={t} defaultChecked={sp.job_type === t} style={{ accentColor: 'var(--op-indigo)' }} /> {t}</label>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>Industry</label>
                <select name="industry" className="form-control op-focus" defaultValue={sp.industry || ''}>
                  <option value="">All industries</option>
                  {filterOptions.industries.map((ind, i) => <option key={i} value={ind}>{ind}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>City</label>
                <select name="city" className="form-control op-focus" defaultValue={sp.city || ''}>
                  <option value="">All cities</option>
                  {filterOptions.locations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
                </select>
              </div>
              <button type="submit" className="op-btn op-grad-bg" style={{ padding: '11px', borderRadius: '12px', fontWeight: '700', color: '#fff', border: 'none', cursor: 'pointer', width: '100%' }}>Apply Filters</button>
              <Link href="/jobs" className="op-btn" style={{ padding: '10px', borderRadius: '12px', fontWeight: '600', textAlign: 'center', border: '1px solid var(--border-color)', textDecoration: 'none', color: 'var(--text-primary)' }}>Reset</Link>
            </form>
          </aside>

          {/* Listings */}
          <section>
            {jobs.length === 0 ? (
              <div className="card-light" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: '14px' }}>🔍</div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '8px' }}>No jobs found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Try widening your filters or search keywords.</p>
                <Link href="/jobs" className="op-btn op-grad-bg" style={{ display: 'inline-block', padding: '12px 26px', borderRadius: '30px', fontWeight: '700', color: '#fff', textDecoration: 'none' }}>Clear filters</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {jobs.map((job, i) => (
                  <Reveal key={job.id} delay={(i % 3) + 1}>
                    <div className="card-light hover-lift" style={{ padding: '24px', display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                      <div className="op-grad-bg" style={{ width: '52px', height: '52px', borderRadius: '13px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.3rem', flexShrink: 0 }}>
                        {job.company_name ? job.company_name.charAt(0) : 'O'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--op-indigo)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>{job.industry || 'Technology'}</div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                          <Link href={`/jobs/${job.id}`} className="op-underline" style={{ color: 'inherit', textDecoration: 'none' }}>{job.title}</Link>
                        </h3>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{job.company_name || 'OpelSoft Partner'}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 10px' }}>📍 {job.city || 'Multiple'}{job.country ? `, ${job.country}` : ''}</span>
                          <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--op-indigo)', background: 'rgba(79,70,229,0.08)', borderRadius: '20px', padding: '4px 10px' }}>{job.job_type || 'Full-time'}</span>
                          {job.salary_package && <span style={{ fontSize: '0.76rem', fontWeight: '600', color: 'var(--text-secondary)', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 10px' }}>💷 {formatSalary(job.salary_package)}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', flexShrink: 0 }}>
                        <SaveButton />
                        <Link href={`/jobs/${job.id}`} className="op-btn op-grad-bg" style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.84rem', fontWeight: '700', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap' }}>View role</Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
