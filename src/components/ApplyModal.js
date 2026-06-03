'use client';

import { useState } from 'react';

export default function ApplyModal({ jobId, jobTitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, coverLetter, cvUrl }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage(data.message);
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
          setMessage('');
          setCoverLetter('');
          setCvUrl('');
        }, 2000);
      } else {
        setSuccess(false);
        setMessage(data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setSuccess(false);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary apply-now-btn">
        Apply Now
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <button className="modal-close-btn" onClick={() => setIsOpen(false)}>✕</button>
            
            <h2 className="modal-title">Apply for Job</h2>
            <p className="modal-subtitle">{jobTitle}</p>

            {message && (
              <div className={`status-alert ${success ? 'alert-success' : 'alert-danger'}`}>
                {message}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="apply-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="cvUrl">Resume/CV URL</label>
                  <input 
                    type="url" 
                    id="cvUrl" 
                    placeholder="https://example.com/my-resume.pdf"
                    className="form-control"
                    value={cvUrl}
                    onChange={(e) => setCvUrl(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-light)', fontSize: '11px', marginTop: '4px' }}>
                    Provide a public link to your resume (e.g., Google Drive, Dropbox, or portfolio PDF).
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="coverLetter">Cover Letter</label>
                  <textarea 
                    id="coverLetter" 
                    rows="5"
                    placeholder="Explain why you are a great fit for this position..."
                    className="form-control"
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    style={{ resize: 'vertical' }}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setIsOpen(false)} className="btn btn-outline">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="btn btn-primary">
                    {loading ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
