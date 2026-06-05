'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CandidateAiAgent from './CandidateAiAgent';

export default function CandidateDashboardClient({ candidate, applications }) {
  const [activeTab, setActiveTab] = useState('applied-jobs');
  const safeParse = (val, fallback = []) => {
    if (!val) return fallback;
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return fallback; }
    }
    return val;
  };

  const [skills, setSkills] = useState(safeParse(candidate.skills));
  const [education, setEducation] = useState(safeParse(candidate.education));
  const [experience, setExperience] = useState(safeParse(candidate.experience));
  const [phone, setPhone] = useState(candidate.phone_number || '');
  const [salary, setSalary] = useState(candidate.minimum_salary || '');
  const [coverLetter, setCoverLetter] = useState(candidate.cover_letter || '');
  const [cvUrl, setCvUrl] = useState(candidate.cv_url || '');
  
  const [cvFile, setCvFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseMessage, setParseMessage] = useState('');

  const handleUploadAndParseCV = async (e) => {
    e.preventDefault();
    if (!cvFile) return;

    setParsing(true);
    setParseMessage('Parsing CV with AI, please wait...');

    try {
      const formData = new FormData();
      formData.append('file', cvFile);

      const res = await fetch('/api/resume/upload', {
        method: 'POST', body: formData
      });
      const data = await res.json();

      if (data.success && data.profile) {
        const p = data.profile;
        if (p.skills) setSkills(p.skills);
        if (p.education) setEducation(p.education);
        if (p.experience) setExperience(p.experience);
        setParseMessage('✓ Resume successfully scanned! Profile fields populated below. Review and click Save.');
      } else {
        setParseMessage('✕ CV parsing failed: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      setParseMessage('✕ A network error occurred while uploading.');
    } finally {
      setParsing(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }
  }, []);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/dashboard/candidate/save', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          phone_number: phone, minimum_salary: salary, cover_letter: coverLetter, cv_url: cvUrl, skills: JSON.stringify(skills), education: JSON.stringify(education), experience: JSON.stringify(experience)
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage('Failed to save profile: ' + data.message);
      }
    } catch (err) {
      setMessage('An error occurred during save.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    setSkills([...skills, { name: 'New Skill', percentage: 80 }]);
  };

  const updateSkill = (index, key, val) => {
    const updated = [...skills];
    updated[index][key] = val;
    setSkills(updated);
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addEdu = () => {
    setEducation([...education, { title: 'Degree', institute: 'University', from: '2020', to: '2023', description: '' }]);
  };

  const updateEdu = (index, key, val) => {
    const updated = [...education];
    updated[index][key] = val;
    setEducation(updated);
  };

  const removeEdu = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExp = () => {
    setExperience([...experience, { title: 'Role', company: 'Company', from: '2023', to: 'Present', description: '' }]);
  };

  const updateExp = (index, key, val) => {
    const updated = [...experience];
    updated[index][key] = val;
    setExperience(updated);
  };

  const removeExp = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  return (
    <div className="candidate-dashboard-client">
      {/* Upper Profile Card */}
      <div className="profile-header-card card">
        <div className="profile-header-main">
          <div className="avatar-placeholder" style={{ background: 'var(--op-grad)', color: '#fff' }}>
            {candidate.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1>{candidate.first_name || candidate.username} {candidate.last_name || ''}</h1>
            <p className="profile-subtitle">{candidate.job_title || 'IT Professional'}</p>
            <p style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>
              📧 {candidate.email} | 📍 London, UK
            </p>
          </div>
        </div>
        <div className="profile-header-meta">
          <div className="skills-perc-badge">
            <div className="badge-title">Skills Score</div>
            <div className="badge-val op-grad-text">{skills.length * 15}%</div>
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
                onClick={() => { setActiveTab('applied-jobs'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'applied-jobs' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
                Applied Jobs ({applications.length})
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('profile'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile Settings
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('resume'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'resume' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                Resume & CV Manager
              </button>
            </li>
            <li>
              <button 
                onClick={() => { setActiveTab('ai-agent'); setMessage(''); }}
                className={`tab-btn ${activeTab === 'ai-agent' ? 'active' : ''}`}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                Job Matches
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

          {/* Tab 1: Applied Jobs */}
          {activeTab === 'applied-jobs' && (
            <div className="tab-pane">
              <h2>My Applications</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Track the hiring process for jobs you applied to
              </p>

              {applications.length === 0 ? (
                <div className="empty-dashboard-state">
                  <div className="empty-state-icon">📁</div>
                  <h3>No Applications Yet</h3>
                  <p>You haven't applied to any job positions yet.</p>
                  <Link href="/jobs" className="btn btn-primary" style={{ marginTop: '15px' }}>
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="applications-table-container">
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Job Position</th>
                        <th>Location</th>
                        <th>Hiring Status</th>
                        <th>Date Applied</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app, i) => (
                        <tr key={i}>
                          <td>
                            <div className="app-job-title">
                              <Link href={`/jobs/${app.job_id}`}>{app.title}</Link>
                            </div>
                            <div className="app-job-company">{app.company_name}</div>
                          </td>
                          <td className="app-job-meta">{app.city}, {app.country}</td>
                          <td>
                            <span className={`status-badge ${app.status}`}>
                              {app.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="app-job-meta">
                            {new Date(app.applied_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Profile Settings */}
          {activeTab === 'profile' && (
            <div className="tab-pane">
              <h2>Profile Settings</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Update your basic contact details and preferences
              </p>

              <form onSubmit={handleSaveProfile} className="dashboard-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Minimum Salary Expected ($)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Short Cover Letter</label>
                  <textarea 
                    rows="6" 
                    className="form-control" 
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: '20px' }}>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Resume Submit */}
          {activeTab === 'resume' && (
            <div className="tab-pane">
              <h2>Resume & Experience Builder</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px' }}>
                Build your online profile for verification by employers
              </p>

              {/* CV AI Scanner Box */}
              <div style={{ 
                padding: '24px', marginBottom: '35px', background: 'rgba(30, 80, 255, 0.02)', border: '1px dashed var(--primary-color)', borderRadius: '8px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>🤖 AI Resume Auto-Fill</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '16px', lineHeight: '1.5' }}>
                  Upload your CV (PDF or Text). Opelsoft's AI parsing workflow will scan your resume parameters, mapping skills, experiences, and education directly to your profile.
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="file" 
                    accept=".pdf,.txt" 
                    onChange={(e) => setCvFile(e.target.files[0])}
                    style={{ fontSize: '13px' }}
                    disabled={parsing}
                  />
                  <button 
                    type="button" 
                    onClick={handleUploadAndParseCV} 
                    className="btn btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '12.5px' }}
                    disabled={parsing || !cvFile}
                  >
                    {parsing ? 'Scanning CV...' : 'Scan & Auto-Fill'}
                  </button>
                </div>
                {parseMessage && (
                  <div style={{ 
                    marginTop: '12px', fontSize: '12.5px', fontWeight: 500, color: parseMessage.startsWith('✓') ? '#10b981' : parseMessage.startsWith('✕') ? '#ef4444' : 'var(--text-secondary)'
                  }}>
                    {parseMessage}
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveProfile} className="dashboard-form">
                {/* CV Link */}
                <div className="form-group" style={{ marginBottom: '35px' }}>
                  <label className="form-label">Upload CV / Resume Link</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>

                {/* Skills Manager */}
                <div className="form-section-builder">
                  <div className="section-builder-header">
                    <h3>Skills & Expertise</h3>
                    <button type="button" onClick={addSkill} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      + Add Skill
                    </button>
                  </div>
                  {skills.map((skill, index) => (
                    <div key={index} className="builder-row">
                      <input 
                        type="text" 
                        placeholder="Skill (e.g. Node.js)" 
                        className="form-control" 
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                      />
                      <input 
                        type="number" 
                        placeholder="Percentage" 
                        className="form-control" 
                        value={skill.percentage}
                        onChange={(e) => updateSkill(index, 'percentage', e.target.value)}
                        style={{ width: '100px' }}
                      />
                      <button type="button" onClick={() => removeSkill(index)} className="builder-delete-btn">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Education Manager */}
                <div className="form-section-builder">
                  <div className="section-builder-header">
                    <h3>Educational Background</h3>
                    <button type="button" onClick={addEdu} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      + Add Education
                    </button>
                  </div>
                  {education.map((edu, index) => (
                    <div key={index} className="builder-card">
                      <button type="button" onClick={() => removeEdu(index)} className="card-delete-btn">✕</button>
                      <div className="form-row-2">
                        <input 
                          type="text" 
                          placeholder="Degree Title" 
                          className="form-control" 
                          value={edu.title}
                          onChange={(e) => updateEdu(index, 'title', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="University / Institute" 
                          className="form-control" 
                          value={edu.institute}
                          onChange={(e) => updateEdu(index, 'institute', e.target.value)}
                        />
                      </div>
                      <div className="form-row-2" style={{ marginTop: '10px' }}>
                        <input 
                          type="text" 
                          placeholder="From (e.g. 2020)" 
                          className="form-control" 
                          value={edu.from}
                          onChange={(e) => updateEdu(index, 'from', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="To (e.g. 2023)" 
                          className="form-control" 
                          value={edu.to}
                          onChange={(e) => updateEdu(index, 'to', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Experience Manager */}
                <div className="form-section-builder">
                  <div className="section-builder-header">
                    <h3>Work History</h3>
                    <button type="button" onClick={addExp} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '11px' }}>
                      + Add Experience
                    </button>
                  </div>
                  {experience.map((exp, index) => (
                    <div key={index} className="builder-card">
                      <button type="button" onClick={() => removeExp(index)} className="card-delete-btn">✕</button>
                      <div className="form-row-2">
                        <input 
                          type="text" 
                          placeholder="Role / Title" 
                          className="form-control" 
                          value={exp.title}
                          onChange={(e) => updateExp(index, 'title', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="Company" 
                          className="form-control" 
                          value={exp.company}
                          onChange={(e) => updateExp(index, 'company', e.target.value)}
                        />
                      </div>
                      <div className="form-row-2" style={{ marginTop: '10px' }}>
                        <input 
                          type="text" 
                          placeholder="From" 
                          className="form-control" 
                          value={exp.from}
                          onChange={(e) => updateExp(index, 'from', e.target.value)}
                        />
                        <input 
                          type="text" 
                          placeholder="To" 
                          className="form-control" 
                          value={exp.to}
                          onChange={(e) => updateExp(index, 'to', e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '30px' }}>
                  <button type="submit" disabled={saving} className="btn btn-primary">
                    {saving ? 'Saving Profile...' : 'Save Profile Build'}
                  </button>
                </div>
              </form>
            </div>
          )}


          {/* Tab 4: AI Agent & Automations */}
          {activeTab === 'ai-agent' && (
            <div className="tab-pane">
              <CandidateAiAgent />
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
