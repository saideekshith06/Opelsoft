'use client';

import { useState } from 'react';

export default function ContactUsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setTimeout(() => setSubmitted(false), 3000);
    }, 1000);
  };

  return (
    <div className="contact-page container" style={{ padding: '60px 24px 100px 24px' }}>
      <section style={{ marginBottom: '50px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-1px' }}>
          Get in <span className="text-gradient">Touch</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          Have questions about our recruiting services or packages? Fill out the form below.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '50px', alignItems: 'flex-start' }}>
        {/* Contact Info Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 700 }}>
              Office Location
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.6' }}>
              394 Edgware Road,<br />
              London, W2 1ED,<br />
              United Kingdom
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '12px', fontWeight: 700 }}>
              Direct Contacts
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.8' }}>
              📧 info@opelsoft.com<br />
              📞 +44 20 7946 0958<br />
              🕒 Mon - Fri, 9am - 6pm
            </p>
          </div>
        </aside>

        {/* Contact Form */}
        <section className="card" style={{ padding: '40px' }}>
          {submitted && (
            <div className="status-alert alert-success">
              Your inquiry has been successfully sent! Our team will contact you shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Your Name</label>
                <input 
                  type="text" 
                  id="contact-name" 
                  className="form-control" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input 
                  type="email" 
                  id="contact-email" 
                  className="form-control" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-subject">Subject</label>
              <input 
                type="text" 
                id="contact-subject" 
                className="form-control" 
                required 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry about recruiter premium plans"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message Details</label>
              <textarea 
                id="contact-message" 
                rows="6" 
                className="form-control" 
                required 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your staffing requirements or question in detail..."
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ marginTop: '10px' }}>
              <button type="submit" disabled={sending} className="btn btn-primary">
                {sending ? 'Sending Message...' : 'Send Message'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
