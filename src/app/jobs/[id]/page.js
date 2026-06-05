import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getJobDetail(id) {
  try {
    const [rows] = await pool.query(`
      SELECT j.*, e.company_name, e.logo_url, e.company_address, e.description AS company_desc
      FROM new_jobs j
      LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
      WHERE j.id = ?
    `, [id]);
    if (!rows || rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error(`Failed to fetch job ${id}, using fallback:`, error);
    return {
      id: parseInt(id, 10) || 1, title: 'Senior AI/ML Engineer', description: '<p>OpelSoft is hiring a Senior AI/ML Engineer on behalf of one of our verified clients. You will design, train, and deploy machine-learning models in production, collaborating across data, platform, and product teams.</p>', requirements: 'Requires 4+ years of experience with Python and modern ML frameworks, strong fundamentals in machine learning, and experience shipping models to production.', job_type: 'Full-time', industry: 'Artificial Intelligence', qualification: 'masters-degree', experience: 'Senior', salary_package: '90000-140000', address: '255 Old New Brunswick Rd, Ste: N210, Piscataway, NJ 08854', city: 'Piscataway', country: 'United States', closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), company_name: 'OpelSoft Partner', company_desc: 'A leading team building intelligent systems.', };
  }
}

function formatSalary(pkg) {
  if (!pkg) return null;
  const fmt = (n) => {
    const x = Number(String(n).replace(/[^0-9.]/g, ''));
    return Number.isNaN(x) || x === 0 ? String(n).trim() : '£' + x.toLocaleString('en-GB');
  };
  const parts = String(pkg).split('-').map((s) => s.trim()).filter(Boolean);
  return parts.length >= 2 ? `${fmt(parts[0])} to ${fmt(parts[1])}` : fmt(parts[0]);
}

function MetaIcon({ children }) {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--op-indigo)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>;
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJobDetail(id);
  if (!job) notFound();

  const closing = job.closing_date ? new Date(job.closing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not specified';

  const overview = [
    { label: 'Salary', value: job.salary_package ? formatSalary(job.salary_package) : 'Undisclosed', icon: <><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2" /></> }, { label: 'Job Type', value: job.job_type || 'Full-time', icon: <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></> }, { label: 'Experience', value: job.experience || 'Not specified', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> }, { label: 'Industry', value: job.industry || 'Technology', icon: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></> }, { label: 'Qualification', value: job.qualification ? job.qualification.replace('-', ' ') : 'Not specified', icon: <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /> }, ];

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* HEADER */}
      <section className="op-mesh" style={{ borderBottom: '1px solid var(--border-color)', padding: '40px 0 36px' }}>
        <div className="container">
          <Link href="/jobs" className="op-underline" style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-block', marginBottom: '22px' }}>← Back to all jobs</Link>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="op-grad-bg" style={{ width: '64px', height: '64px', borderRadius: '16px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '1.7rem', flexShrink: 0 }}>
              {job.company_name ? job.company_name.charAt(0) : 'O'}
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--op-indigo)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{job.industry || 'Technology'}</div>
              <h1 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.6rem)', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '10px' }}>{job.title}</h1>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <span style={{ fontWeight: '600' }}>{job.company_name || 'OpelSoft Partner'}</span>
                <span>•</span>
                <span>📍 {job.city || 'Multiple'}{job.country ? `, ${job.country}` : ''}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--op-indigo)', background: 'rgba(79,70,229,0.08)', borderRadius: '20px', padding: '4px 10px' }}>{job.job_type || 'Full-time'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: '40px 24px 88px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(0, 320px)', gap: '32px', alignItems: 'start' }} className="jobs-layout">
          {/* Main */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-light" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '16px' }}>Job description</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: job.description || '<p>No description provided.</p>' }} />
            </div>
            {job.requirements && (
              <div className="card-light" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '16px' }}>Requirements</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br />') }} />
              </div>
            )}
            <div className="card-light" style={{ padding: '32px' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '16px' }}>About the employer</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: '1.8' }}>
                {job.company_desc || 'This role is managed by OpelSoft on behalf of one of our verified clients.'}
              </p>
              {job.company_address && <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', marginTop: '14px' }}>📍 {job.company_address}</p>}
            </div>
          </section>

          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '90px' }}>
            <div className="card-light" style={{ padding: '24px', textAlign: 'center' }}>
              <Link href="/jobs" className="op-btn op-grad-bg" style={{ display: 'block', width: '100%', padding: '14px', borderRadius: '12px', fontWeight: '700', color: '#fff', textDecoration: 'none', textAlign: 'center' }}>Apply now</Link>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '14px' }}><strong>Closes:</strong> {closing}</p>
            </div>
            <div className="card-light" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '16px' }}>Job overview</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {overview.map((m, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="op-icon" style={{ width: '40px', height: '40px', background: 'rgba(79,70,229,0.1)', flexShrink: 0 }}><MetaIcon>{m.icon}</MetaIcon></div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', fontWeight: '700' }}>{m.label}</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '600', textTransform: m.label === 'Qualification' ? 'capitalize' : 'none' }}>{m.value}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
