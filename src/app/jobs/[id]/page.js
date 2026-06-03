import pool from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ApplyModal from '@/components/ApplyModal';

// Fetch job detail
async function getJobDetail(id) {
  try {
    const [rows] = await pool.query(`
      SELECT j.*, e.company_name, e.logo_url, e.company_address, e.description AS company_desc
      FROM new_jobs j
      LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
      WHERE j.id = ?
    `, [id]);

    if (!rows || rows.length === 0) {
      return null;
    }
    return rows[0];
  } catch (error) {
    console.error(`Failed to fetch job ${id} from database, using fallback:`, error);
    // Fallback data for specific demo IDs or general
    return {
      id: parseInt(id, 10) || 1,
      title: 'Senior Rolling Stock Technician',
      description: '<p>Opelsoft is looking for a Senior Rolling Stock Technician for our client. The candidate will perform diagnostic repairs, routine maintenance, and system testing on electric trains and diesel locomotive engines.</p>',
      requirements: 'Requires 2+ years experience in electrical troubleshooting and a bachelor degree in mechanical/electrical engineering.',
      job_type: 'Full-time',
      industry: 'Management',
      qualification: 'bachelor-degree',
      experience: '2-years',
      salary_package: '15000-20000',
      gender: 'female',
      address: '394 Edgware Road, London, W2 1ED',
      city: 'London',
      country: 'United Kingdom',
      closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      company_name: 'Lawrence Hansen Ltd',
      company_desc: 'Lawrence Hansen Ltd is a premier locomotive consulting agency based in London.'
    };
  }
}

export default async function JobDetailPage({ params }) {
  const { id } = await params;
  const job = await getJobDetail(id);

  if (!job) {
    notFound();
  }

  const formattedClosingDate = job.closing_date 
    ? new Date(job.closing_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not Specified';

  return (
    <div className="job-detail-page container">
      {/* Back button */}
      <div style={{ marginBottom: '25px' }}>
        <Link href="/jobs" className="back-link">
          ← Back to all job positions
        </Link>
      </div>

      {/* Header card */}
      <div className="job-header-card card">
        <div className="job-header-main">
          <div className="job-header-logo">
            {job.company_name ? job.company_name.charAt(0) : 'J'}
          </div>
          <div>
            <span className="job-header-category">{job.industry || 'IT & Staffing'}</span>
            <h1>{job.title}</h1>
            <div className="job-header-company-row">
              <span className="company-name">{job.company_name || 'Opelsoft Recruiter'}</span>
              <span className="meta-separator">•</span>
              <span className="job-location" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)' }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {job.city || 'Multiple Locations'}, {job.country || 'UK'}
              </span>
            </div>
          </div>
        </div>
        <div className="job-header-actions">
          <span className={`job-tag ${job.job_type ? job.job_type.toLowerCase() : 'full-time'}`}>
            {job.job_type || 'Full-time'}
          </span>
        </div>
      </div>

      {/* Layout grid */}
      <div className="job-detail-layout">
        {/* Main Content */}
        <section className="job-detail-main">
          {/* Description */}
          <div className="job-detail-section card">
            <h2>Job Description</h2>
            <div 
              className="job-html-content"
              dangerouslySetInnerHTML={{ __html: job.description || '<p>No description provided.</p>' }}
            />
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="job-detail-section card">
              <h2>Job Requirements</h2>
              <div 
                className="job-html-content"
                dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br />') }}
              />
            </div>
          )}

          {/* About Company */}
          <div className="job-detail-section card">
            <h2>About the Employer</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: '1.8' }}>
              {job.company_desc || 'This job is managed by Opelsoft\'s recruitment agency on behalf of one of our verified clients.'}
            </p>
            {job.company_address && (
              <p style={{ color: 'var(--text-light)', fontSize: '12.5px', marginTop: '15px' }}>
                📍 Head office address: {job.company_address}
              </p>
            )}
          </div>
        </section>

        {/* Sidebar details */}
        <aside className="job-detail-sidebar">
          {/* Apply widget */}
          <div className="sidebar-widget card apply-widget">
            <ApplyModal jobId={job.id} jobTitle={job.title} />
            <p className="closing-date-alert">
              <strong>Closing Date:</strong> {formattedClosingDate}
            </p>
          </div>

          {/* Metadata widget */}
          <div className="sidebar-widget card metadata-widget">
            <h3>Job Overview</h3>
            <ul className="meta-list">
              <li>
                <div className="meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="2"></circle>
                    <path d="M6 12h.01M18 12h.01"></path>
                  </svg>
                  Salary Package
                </div>
                <div className="meta-val">{job.salary_package ? `£${job.salary_package}` : 'Salary Undisclosed'}</div>
              </li>
              <li>
                <div className="meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                  Job Type
                </div>
                <div className="meta-val">{job.job_type || 'Full-time'}</div>
              </li>
              <li>
                <div className="meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Required Experience
                </div>
                <div className="meta-val">{job.experience || 'Not Specified'}</div>
              </li>
              <li>
                <div className="meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  Industry
                </div>
                <div className="meta-val">{job.industry || 'Technology'}</div>
              </li>
              <li>
                <div className="meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  Required Qualification
                </div>
                <div className="meta-val" style={{ textTransform: 'capitalize' }}>
                  {job.qualification ? job.qualification.replace('-', ' ') : 'Not Specified'}
                </div>
              </li>
              <li>
                <div className="meta-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Gender Preference
                </div>
                <div className="meta-val" style={{ textTransform: 'capitalize' }}>
                  {job.gender || 'No Preference'}
                </div>
              </li>
            </ul>
          </div>

          {/* Map Location widget */}
          {job.address && (
            <div className="sidebar-widget card map-widget">
              <h3>Job Location</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '15px' }}>
                {job.address}
              </p>
              {/* Fallback to simple stylized SVG box map or details */}
              <div className="map-placeholder">
                <span style={{ fontSize: '32px' }}>🗺️</span>
                <span style={{ fontSize: '12px', fontWeight: 'bold', marginTop: '10px' }}>Location Map Enabled</span>
                <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '2px' }}>
                  Lat: {job.latitude || '51.5'}, Long: {job.longitude || '-0.17'}
                </span>
              </div>
            </div>
          )}
        </aside>
      </div>


    </div>
  );
}
