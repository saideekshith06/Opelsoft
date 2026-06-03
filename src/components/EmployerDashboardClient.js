'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function EmployerDashboardClient({ employer, jobs, applications, transactions }) {
  const [activeTab, setActiveTab] = useState('jobs');
  const [localJobs, setLocalJobs] = useState(jobs);
  const [localApps, setLocalApps] = useState(applications);
  
  // New job state
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [industry, setIndustry] = useState('Technology');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      const res = await fetch('/api/applications/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: appId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setLocalApps(localApps.map(app => app.id === appId ? { ...app, status: newStatus } : app));
        setMessage('Applicant status updated!');
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobTitle,
          description: jobDesc,
          requirements: jobReq,
          job_type: jobType,
          industry,
          salary_package: salary,
          experience,
          city,
          country
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Job position posted successfully!');
        setJobTitle('');
        setJobDesc('');
        setJobReq('');
        setSalary('');
        setExperience('');
        setCity('');
        setCountry('');
        
        // Refresh local listings
        const updatedJobs = [
          { title: jobTitle, job_type: jobType, city, country, salary_package: salary, created_at: new Date() },
          ...localJobs
        ];
        setLocalJobs(updatedJobs);
        setTimeout(() => setActiveTab('jobs'), 1500);
      } else {
        setMessage('Failed to post job: ' + data.message);
      }
    } catch (err) {
      setMessage('An error occurred while posting job.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="employer-dashboard-client">
      {/* Header Profile Card */}
      <div className="profile-header-card card">
        <div className="profile-header-main">
          <div className="avatar-placeholder company-avatar">
            🏢
          </div>
          <div>
            <h1>{employer.company_name}</h1>
            <p className="profile-subtitle">Employer Account</p>
            <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>
              📧 {employer.email} | 📍 {employer.company_address || 'Multiple Locations'}
            </p>
          </div>
        </div>
        <div className="profile-header-meta">
          <div className="skills-perc-badge company-badge">
            <div className="badge-title">Active Positions</div>
            <div className="badge-val">{localJobs.length}</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar card">
          <ul className="sidebar-tabs">
            <li>
              <button 
                onClick={() => { setActiveTab('jobs'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
                Manage Jobs ({localJobs.length})
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('applicants'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'applicants' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M17 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M9 21v-2a4 4 0 0 0-4-4H3a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Applicants ({localApps.length})
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('post-job'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'post-job' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Post a Job
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('transactions'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                Transactions ({transactions.length})
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Panel */}
        <section className="dashboard-content card">
          {message && (
            <div className="status-alert alert-success">
              {message}
            </div>
          )}

          {/* Tab 1: Manage Jobs */}
          {activeTab === 'jobs' && (
            <div className="tab-pane">
              <h2>Active Job Listings</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Monitor status and applicant volume for your posted positions
              </p>

              {localJobs.length === 0 ? (
                <div className="empty-dashboard-state">
                  <div className="empty-state-icon">📁</div>
                  <h3>No Jobs Posted</h3>
                  <p>You haven't posted any job listings yet.</p>
                  <button onClick={() => setActiveTab('post-job')} className="btn btn-primary" style={{ marginTop: '15px' }}>
                    Post a Job Now
                  </button>
                </div>
              ) : (
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Job Type</th>
                        <th>Location</th>
                        <th>Salary Pack</th>
                        <th>Posted Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localJobs.map((job, i) => (
                        <tr key={i}>
                          <td>
                            <div className="app-job-title">
                              {job.id ? <Link href={`/jobs/${job.id}`}>{job.title}</Link> : job.title}
                            </div>
                          </td>
                          <td>
                            <span className="job-tag full-time" style={{ fontSize: '10px' }}>
                              {job.job_type || 'Full-time'}
                            </span>
                          </td>
                          <td className="app-job-meta">{job.city || 'London'}, {job.country || 'UK'}</td>
                          <td className="app-job-meta">£{job.salary_package || 'Undisclosed'}</td>
                          <td className="app-job-meta">
                            {new Date(job.created_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Applicants */}
          {activeTab === 'applicants' && (
            <div className="tab-pane">
              <h2>Hiring Pipeline</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Review candidates, download CVs, and manage recruitment workflow status
              </p>

              {localApps.length === 0 ? (
                <div className="empty-dashboard-state">
                  <div className="empty-state-icon">👥</div>
                  <h3>No Applicants Yet</h3>
                  <p>No candidates have applied for your positions yet.</p>
                </div>
              ) : (
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Candidate Info</th>
                        <th>Applied Position</th>
                        <th>hiring Status</th>
                        <th>Recruitment Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {localApps.map((app, i) => (
                        <tr key={i}>
                          <td>
                            <div className="app-job-title">{app.username}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                              📧 {app.email}
                            </div>
                            <div style={{ marginTop: '5px' }}>
                              <a href={app.cv_url} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '10px', textTransform: 'none' }}>
                                📄 View CV
                              </a>
                            </div>
                          </td>
                          <td>
                            <div className="app-job-title">
                              <Link href={`/jobs/${app.job_id}`}>{app.job_title}</Link>
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge ${app.status}`}>
                              {app.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleUpdateStatus(app.id, 'shortlisted')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '10px' }}>
                                Shortlist
                              </button>
                              <button onClick={() => handleUpdateStatus(app.id, 'rejected')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '10px', backgroundColor: 'var(--error)' }}>
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Post a Job */}
          {activeTab === 'post-job' && (
            <div className="tab-pane">
              <h2>Post a New Job Opening</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Fill out the specifications below to recruit top talent immediately
              </p>

              <form onSubmit={handlePostJob} className="dashboard-form">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    required 
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Job Type</label>
                    <select className="form-control" value={jobType} onChange={(e) => setJobType(e.target.value)}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Industry Group</label>
                    <select className="form-control" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                      <option value="Technology">Technology</option>
                      <option value="Management">Management</option>
                      <option value="Sales & Marketing">Sales & Marketing</option>
                      <option value="Banking & Finance">Banking & Finance</option>
                    </select>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Salary Package Expected (£)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="e.g. 45000-55000"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Required Experience</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      placeholder="e.g. 3-years"
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United Kingdom"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea 
                    rows="6" 
                    className="form-control" 
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Describe duties, roles, and benefits..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Requirements</label>
                  <textarea 
                    rows="4" 
                    className="form-control" 
                    value={jobReq}
                    onChange={(e) => setJobReq(e.target.value)}
                    placeholder="List specific skill requirements, certificates, etc..."
                  />
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Publishing...' : 'Publish Job Listing'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Transactions */}
          {activeTab === 'transactions' && (
            <div className="tab-pane">
              <h2>Purchase & Payments History</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Log of CV Packages and Job Packages purchases
              </p>

              {transactions.length === 0 ? (
                <div className="empty-dashboard-state">
                  <div className="empty-state-icon">💳</div>
                  <h3>No Transactions</h3>
                  <p>You haven't made any purchases on this account.</p>
                </div>
              ) : (
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Package Purchased</th>
                        <th>Amount Paid</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Purchase Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((trans, i) => (
                        <tr key={i}>
                          <td>
                            <div className="app-job-title">{trans.package_name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                              Listings Granted: {trans.listings_granted}
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold' }}>${trans.amount}</td>
                          <td className="app-job-meta">{trans.payment_method}</td>
                          <td>
                            <span className="status-badge shortlisted" style={{ fontSize: '10px' }}>
                              {trans.status}
                            </span>
                          </td>
                          <td className="app-job-meta">
                            {new Date(trans.created_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
