import pool from '@/lib/db';
import Link from 'next/link';

// Fetch jobs based on filter parameters
async function getFilteredJobs(searchParams) {
  const { keyword, location, job_type, industry, experience, salary } = searchParams;

  let query = `
    SELECT j.id, j.title, j.job_type, j.salary_package, j.address, j.city, j.country, j.industry, j.experience, j.created_at,
           e.company_name, e.logo_url
    FROM new_jobs j
    LEFT JOIN new_employer_profiles e ON j.employer_id = e.user_id
    WHERE j.status = 'active'
  `;
  const params = [];

  if (keyword) {
    query += ` AND (j.title LIKE ? OR j.description LIKE ? OR e.company_name LIKE ?)`;
    params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
  }

  if (location) {
    query += ` AND (j.city LIKE ? OR j.country LIKE ? OR j.address LIKE ?)`;
    params.push(`%${location}%`, `%${location}%`, `%${location}%`);
  }

  if (job_type) {
    query += ` AND j.job_type = ?`;
    params.push(job_type);
  }

  if (industry) {
    query += ` AND j.industry = ?`;
    params.push(industry);
  }

  if (experience) {
    query += ` AND j.experience = ?`;
    params.push(experience);
  }

  if (salary) {
    query += ` AND j.salary_package LIKE ?`;
    params.push(`%${salary}%`);
  }

  query += ` ORDER BY j.created_at DESC`;

  try {
    const [jobs] = await pool.query(query, params);
    
    // Fetch unique categories for sidebar filters
    const [dbJobTypes] = await pool.query("SELECT DISTINCT job_type FROM new_jobs WHERE job_type != '' AND job_type IS NOT NULL");
    const [dbIndustries] = await pool.query("SELECT DISTINCT industry FROM new_jobs WHERE industry != '' AND industry IS NOT NULL LIMIT 15");
    const [dbLocations] = await pool.query("SELECT DISTINCT city FROM new_jobs WHERE city != '' AND city IS NOT NULL LIMIT 10");

    return {
      jobs,
      filterOptions: {
        jobTypes: dbJobTypes.map(r => r.job_type),
        industries: dbIndustries.map(r => r.industry),
        locations: dbLocations.map(r => r.city)
      }
    };
  } catch (err) {
    console.error('Failed to query filtered jobs, using mock fallback:', err);
    return {
      jobs: [
        { id: 1, title: 'Senior Rolling Stock Technician', job_type: 'Full-time', salary_package: '15000-20000', city: 'London', country: 'United Kingdom', company_name: 'Lawrence Hansen Ltd', industry: 'Management', created_at: new Date() },
        { id: 2, title: 'Graduate Inside Sales Executive', job_type: 'Internship', salary_package: '10000-12000', city: 'Birmingham', country: 'United Kingdom', company_name: 'Tammy Hicks Ltd', industry: 'Sales & Marketing', created_at: new Date() }
      ],
      filterOptions: {
        jobTypes: ['Full-time', 'Part-time', 'Internship', 'Temporary'],
        industries: ['Management', 'Technology', 'Sales & Marketing', 'Accounting & Finance'],
        locations: ['London', 'Birmingham', 'Manchester']
      }
    };
  }
}

export default async function JobsPage({ searchParams }) {
  // Resolve searchParams promise in Next.js 15+ if needed, but in standard App Router it is passed as plain object or can be awaited.
  const resolvedParams = await searchParams;
  const { jobs, filterOptions } = await getFilteredJobs(resolvedParams);

  return (
    <div className="jobs-catalog-page container">
      {/* Title area */}
      <div className="catalog-header">
        <h1>Available <span className="text-gradient">Job Positions</span></h1>
        <p>Showing {jobs.length} jobs based on your preferences</p>
      </div>

      <div className="catalog-layout">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar card">
          <h2 className="filters-title">Filter Search</h2>
          
          <form method="GET" action="/jobs" className="filters-form">
            {/* Preserve keyword and location search */}
            {resolvedParams.keyword && <input type="hidden" name="keyword" value={resolvedParams.keyword} />}
            {resolvedParams.location && <input type="hidden" name="location" value={resolvedParams.location} />}

            {/* Job Types */}
            <div className="filter-group">
              <label className="filter-label">Job Type</label>
              <div className="filter-options">
                <label className="checkbox-container">
                  <input 
                    type="radio" 
                    name="job_type" 
                    value="" 
                    defaultChecked={!resolvedParams.job_type} 
                  />
                  <span>All Types</span>
                </label>
                {filterOptions.jobTypes.map((type, i) => (
                  <label key={i} className="checkbox-container">
                    <input 
                      type="radio" 
                      name="job_type" 
                      value={type} 
                      defaultChecked={resolvedParams.job_type === type} 
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Industries */}
            <div className="filter-group">
              <label className="filter-label">Industry</label>
              <select name="industry" className="form-control select-filter" defaultValue={resolvedParams.industry || ''}>
                <option value="">All Industries</option>
                {filterOptions.industries.map((ind, i) => (
                  <option key={i} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Locations */}
            <div className="filter-group">
              <label className="filter-label">City</label>
              <select name="city" className="form-control select-filter" defaultValue={resolvedParams.city || ''}>
                <option value="">All Cities</option>
                {filterOptions.locations.map((loc, i) => (
                  <option key={i} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full-width">
              Apply Filters
            </button>
            <Link href="/jobs" className="btn btn-outline btn-full-width" style={{ marginTop: '10px', textAlign: 'center' }}>
              Reset Filters
            </Link>
          </form>
        </aside>

        {/* Jobs List Catalog */}
        <section className="catalog-jobs-list">
          {jobs.length === 0 ? (
            <div className="empty-state card">
              <div className="empty-icon">📁</div>
              <h3>No Jobs Found</h3>
              <p>We couldn't find any job matches. Try widening your filters or search keywords.</p>
              <Link href="/jobs" className="btn btn-primary" style={{ marginTop: '20px' }}>
                Clear Filters
              </Link>
            </div>
          ) : (
            <div className="catalog-jobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="catalog-job-card card">
                  <div className="catalog-job-main">
                    <div className="catalog-job-logo-placeholder">
                      {job.company_name ? job.company_name.charAt(0) : 'J'}
                    </div>
                    <div className="catalog-job-body">
                      <div className="catalog-job-category">{job.industry || 'IT & Software'}</div>
                      <h3 className="catalog-job-title">
                        <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <div className="catalog-job-company">
                        {job.company_name || 'Opelsoft Recruiter'}
                      </div>
                      
                      <div className="catalog-job-meta-row">
                        <div className="job-meta-tag">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {job.city || 'Multiple'}, {job.country || 'UK'}
                        </div>
                        <div className="job-meta-tag">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)' }}>
                            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            <circle cx="12" cy="12" r="2"></circle>
                            <path d="M6 12h.01M18 12h.01"></path>
                          </svg>
                          {job.salary_package ? `£${job.salary_package}` : 'Salary Undisclosed'}
                        </div>
                        <div className="job-meta-tag">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-light)' }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {job.experience || 'Entry-Level'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="catalog-job-side">
                    <span className={`job-tag ${job.job_type ? job.job_type.toLowerCase() : 'full-time'}`}>
                      {job.job_type || 'Full-time'}
                    </span>
                    <Link href={`/jobs/${job.id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '11px' }}>
                      View Job
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>


    </div>
  );
}
