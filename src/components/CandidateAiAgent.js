'use client';

import { useState, useEffect, useRef } from 'react';

export default function CandidateAiAgent() {
  const [config, setConfig] = useState({
    status: 'inactive', preferred_roles: [], target_locations: [], target_salary: '35000', min_match_score: 70, auto_discover: 1
  });
  
  const [sources, setSources] = useState([]);
  const [matches, setMatches] = useState([]);
  const [newUrl, setNewUrl] = useState('');
  const [roleInput, setRoleInput] = useState('');
  const [locInput, setLocInput] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [addingSource, setAddingSource] = useState(false);
  const [running, setRunning] = useState(false);
  
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState('');
  const [msgType, setMsgType] = useState('success'); // 'success' | 'error'
  
  const logsEndRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, sourcesRes, matchesRes] = await Promise.all([
        fetch('/api/ai-agent/config').then(r => r.json()), fetch('/api/ai-agent/sources').then(r => r.json()), fetch('/api/ai-agent/matches').then(r => r.json())
      ]);

      if (configRes.success) setConfig(configRes.config);
      if (sourcesRes.success) setSources(sourcesRes.sources);
      if (matchesRes.success) setMatches(matchesRes.matches);
    } catch (err) {
      console.error('Error fetching AI Agent data:', err);
      showToast('Failed to load agent configurations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setMessage(msg);
    setMsgType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/ai-agent/config', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Preferences updated successfully!');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddSource = async (e) => {
    e.preventDefault();
    if (!newUrl) return;
    setAddingSource(true);
    try {
      const res = await fetch('/api/ai-agent/sources', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: newUrl })
      });
      const data = await res.json();
      if (data.success) {
        setSources([data.source, ...sources]);
        setNewUrl('');
        showToast('Career page source added successfully!');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Failed to add career source.', 'error');
    } finally {
      setAddingSource(false);
    }
  };

  const handleDeleteSource = async (id) => {
    try {
      const res = await fetch(`/api/ai-agent/sources?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setSources(sources.filter(s => s.id !== id));
        showToast('Career source deleted.');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      showToast('Failed to delete source.', 'error');
    }
  };

  const handleRunAgent = async () => {
    setRunning(true);
    setLogs([{ time: new Date().toLocaleTimeString(), message: 'Finding matches...', type: 'info' }]);
    
    try {
      const res = await fetch('/api/ai-agent/run', {
        method: 'POST'
      });
      const data = await res.json();
      
      if (data.logs) {
        setLogs(data.logs);
      }
      
      if (data.success) {
        showToast('Match run completed!');
        // Refresh matches
        const matchesRes = await fetch('/api/ai-agent/matches').then(r => r.json());
        if (matchesRes.success) {
          setMatches(matchesRes.matches);
        }
      } else {
        showToast(data.message || 'Error occurred during execution.', 'error');
      }
    } catch (err) {
      showToast('Agent execution failed.', 'error');
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), message: 'Execution halted due to server error.', type: 'error' }]);
    } finally {
      setRunning(false);
    }
  };

  const addRoleTag = () => {
    if (!roleInput.trim()) return;
    if (!config.preferred_roles.includes(roleInput.trim())) {
      setConfig({
        ...config, preferred_roles: [...config.preferred_roles, roleInput.trim()]
      });
    }
    setRoleInput('');
  };

  const removeRoleTag = (role) => {
    setConfig({
      ...config, preferred_roles: config.preferred_roles.filter(r => r !== role)
    });
  };

  const addLocTag = () => {
    if (!locInput.trim()) return;
    if (!config.target_locations.includes(locInput.trim())) {
      setConfig({
        ...config, target_locations: [...config.target_locations, locInput.trim()]
      });
    }
    setLocInput('');
  };

  const removeLocTag = (loc) => {
    setConfig({
      ...config, target_locations: config.target_locations.filter(l => l !== loc)
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading your preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      {/* Toast Alert */}
      {message && (
        <div className={`status-alert ${msgType === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Main Grid */}
      <div className="agent-grid">
        {/* Left Side: Discovered Matches */}
        <div>
          <h2 style={{ marginBottom: '6px' }}>Recommended Jobs</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Roles matched to your profile, preferred titles, and locations
          </p>

          {matches.length === 0 ? (
            <div className="empty-dashboard-state" style={{ padding: '60px 20px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
              <div style={{ fontSize: '40px', marginBottom: '15px' }}>🤖</div>
              <h3>No Matches Yet</h3>
              <p>Set your preferences below and run a match to see recommended roles.</p>
              <button onClick={handleRunAgent} disabled={running} className="btn btn-primary" style={{ marginTop: '20px', background: 'var(--accent-gradient)', border: 'none' }}>
                {running ? 'Finding...' : 'Find Matches'}
              </button>
            </div>
          ) : (
            <div className="match-list">
              {matches.map((match) => (
                <div key={match.match_id} className="match-card">
                  <div className="match-card-header">
                    <div className="match-title-box">
                      <div className="match-job-title">{match.job_title}</div>
                      <div className="match-company">🏢 {match.company_name}</div>
                    </div>
                    <div className={`match-score-radial ${match.match_score >= 85 ? 'strong' : match.match_score >= 70 ? 'good' : 'low'}`}>
                      {match.match_score}% Fit
                    </div>
                  </div>
                  
                  <div className="match-meta-info">
                    <span>📍 {match.location || 'Remote'}</span>
                    <span>💼 {match.job_type || 'Full-time'}</span>
                    <span>💰 ${match.salary || 'Competitive'}</span>
                  </div>

                  <div className="match-reasoning">
                    <strong>AI Recommendation Heuristic:</strong> {match.reasoning_summary}
                  </div>

                  {match.evaluation && (
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{
                          fontWeight: 800, fontSize: '13px', padding: '2px 10px', borderRadius: '6px', color: '#fff', background: ['A', 'B'].includes(match.evaluation.grade) ? '#10b981' : match.evaluation.grade === 'C' ? '#f59e0b' : '#ef4444'
                        }}>Grade {match.evaluation.grade}</span>
                        {match.evaluation.legitimacy && match.evaluation.legitimacy.is_legit === false && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', padding: '2px 8px' }}>
                            ⚠ Legitimacy: {match.evaluation.legitimacy.confidence}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
                        {Object.entries(match.evaluation.dimensions || {}).map(([key, dim]) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }} title={dim.note || ''}>
                            <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                            <span style={{ letterSpacing: '1px', color: 'var(--accent-color)' }}>
                              {'●'.repeat(dim.score)}{'○'.repeat(Math.max(0, 5 - dim.score))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.missing_skills.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>Missing Skills / Technologies:</strong>
                      <div className="skills-tags-list">
                        {match.missing_skills.map((skill, i) => (
                          <span key={i} className="missing-skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {match.risk_factors.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>Risk Factors Detected:</strong>
                      <ul style={{ paddingLeft: '18px', fontSize: '12.5px', color: 'var(--error)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {match.risk_factors.map((risk, i) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="match-footer">
                    <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                      Scraped via {match.ats_type.toUpperCase()} • Matched {new Date(match.matched_at).toLocaleDateString('en-GB')}
                    </span>
                    <a href={match.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '12px' }}>
                      Apply Link ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Configuration & Sources */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Config Panel */}
          <div className="card">
            <h3>Match Preferences</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '20px' }}>
              Define roles, locations, and scoring parameters
            </p>

            <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Toggle Agent Status */}
              <div className="agent-status-panel" style={{ padding: '12px 16px', margin: '0' }}>
                <div className="status-indicator">
                  <div className={`indicator-dot ${config.status === 'active' ? 'active' : 'inactive'}`}></div>
                  <span>{config.status === 'active' ? 'Agent Active' : 'Agent Idle'}</span>
                </div>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={config.status === 'active'}
                    onChange={(e) => setConfig({ ...config, status: e.target.checked ? 'active' : 'inactive' })}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              {/* Match Score Slider */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Min Match Score Threshold</span>
                  <span style={{ color: 'var(--accent-color)', fontWeight: '800' }}>{config.min_match_score}%</span>
                </label>
                <input 
                  type="range" 
                  min="50" 
                  max="90" 
                  className="form-control" 
                  value={config.min_match_score}
                  onChange={(e) => setConfig({ ...config, min_match_score: parseInt(e.target.value, 10) })}
                  style={{ padding: '0', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                />
              </div>

              {/* Preferred Roles Tag Manager */}
              <div className="form-group">
                <label className="form-label">Preferred Job Titles</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. Next.js Developer" 
                    className="form-control"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRoleTag(); } }}
                  />
                  <button type="button" onClick={addRoleTag} className="btn btn-secondary" style={{ padding: '0 12px' }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {config.preferred_roles.map((role, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '3px 8px', fontSize: '12px', fontWeight: '600' }}>
                      {role}
                      <button type="button" onClick={() => removeRoleTag(role)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '10px', padding: '0 2px' }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Geographical parameters */}
              <div className="form-group">
                <label className="form-label">Target Geographies</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="e.g. London" 
                    className="form-control"
                    value={locInput}
                    onChange={(e) => setLocInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocTag(); } }}
                  />
                  <button type="button" onClick={addLocTag} className="btn btn-secondary" style={{ padding: '0 12px' }}>+</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {config.target_locations.map((loc, i) => (
                    <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '3px 8px', fontSize: '12px', fontWeight: '600' }}>
                      {loc}
                      <button type="button" onClick={() => removeLocTag(loc)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '10px', padding: '0 2px' }}>✕</button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Autonomous discovery toggle */}
              <div className="agent-status-panel" style={{ padding: '12px 16px', margin: '0' }}>
                <div className="status-indicator" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                  <span style={{ fontWeight: 700 }}>🔎 Find matching roles automatically</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                    Surface relevant roles based on your preferred titles and locations.
                  </span>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!config.auto_discover}
                    onChange={(e) => setConfig({ ...config, auto_discover: e.target.checked ? 1 : 0 })}
                  />
                  <span className="slider-switch"></span>
                </label>
              </div>

              <button type="submit" disabled={savingConfig} className="btn btn-primary" style={{ marginTop: '10px' }}>
                {savingConfig ? 'Saving Settings...' : 'Save Preferences'}
              </button>
            </form>
          </div>

          {/* Sources Panel */}
          <div className="card">
            <h3>Target Companies</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12.5px', marginBottom: '20px' }}>
              We find matching roles for you. You can also add specific company career page URLs to always include.
            </p>

            <form onSubmit={handleAddSource} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="e.g. boards.greenhouse.io/openai" 
                className="form-control"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                required
              />
              <button type="submit" disabled={addingSource} className="btn btn-secondary">
                {addingSource ? '...' : '+ Add'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {sources.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '12.5px', textAlign: 'center', padding: '15px 0' }}>
                  No target career URLs registered.
                </p>
              ) : (
                sources.map((src) => (
                  <div key={src.id} className="source-item">
                    <div className="source-details">
                      <div className="source-url" title={src.url}>{src.url}</div>
                      <div className="source-badge greenhouse">{src.source_type}</div>
                    </div>
                    <button type="button" onClick={() => handleDeleteSource(src.id)} className="trash-btn" aria-label="Delete source">
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Scraper / Pipeline Execution logs */}
          <div className="card" style={{ padding: '24px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Run a Match</h3>
              <button 
                onClick={handleRunAgent} 
                disabled={running}
                className="btn btn-primary" 
                style={{ padding: '8px 16px', background: 'var(--accent-gradient)', border: 'none', fontSize: '12px' }}
              >
                {running ? 'Running...' : 'Run'}
              </button>
            </div>
            
            {logs.length > 0 && (
              <div className="logs-window">
                {logs.map((log, i) => (
                  <div key={i} className={`log-entry ${log.type}`}>
                    [{log.time}] {log.message}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
