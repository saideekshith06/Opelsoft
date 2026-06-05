'use client';

import { useState } from 'react';

const INFO = [
  { tint: '#4F46E5', label: 'Office', value: '394 Edgware Road, London W2 1ED, United Kingdom', icon: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></> }, { tint: '#7C3AED', label: 'Email', value: 'info@opelsoft.com', icon: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 7L2 7" /></> }, { tint: '#0EA5E9', label: 'Phone', value: '+44 20 7946 0958', icon: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.57a16 16 0 0 0 5.86 5.86l.91-.91a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /> }, { tint: '#10B981', label: 'Hours', value: 'Mon to Fri, 9am to 6pm GMT', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
];

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
      setName(''); setEmail(''); setSubject(''); setMessage('');
      setTimeout(() => setSubmitted(false), 3500);
    }, 900);
  };

  return (
    <div style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
      {/* HERO */}
      <section className="op-mesh" style={{ borderBottom: '1px solid var(--border-color)', padding: '76px 0 60px' }}>
        <div className="container" style={{ maxWidth: '760px', textAlign: 'center' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--op-indigo)', fontWeight: '700', marginBottom: '16px' }}>Contact</div>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: '1.06', marginBottom: '16px' }}>
            Let&apos;s <span className="op-grad-text">talk</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', maxWidth: '560px', margin: '0 auto' }}>
            Questions about roles, hiring, or how OpelSoft works? Send us a message and our team will get back to you.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '64px 24px 96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'flex-start' }}>

          {/* Info */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {INFO.map((it, i) => (
              <div key={i} className="card-light hover-lift" style={{ padding: '22px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div className="op-icon" style={{ background: `${it.tint}16`, flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={it.tint} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{it.icon}</svg>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: '700', marginBottom: '3px' }}>{it.label}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '600', lineHeight: '1.4' }}>{it.value}</div>
                </div>
              </div>
            ))}
          </aside>

          {/* Form */}
          <section className="card-light" style={{ padding: '40px' }}>
            {submitted && (
              <div className="status-alert alert-success" style={{ marginBottom: '20px' }}>
                Your message has been sent! Our team will be in touch shortly.
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-name">Your Name</label>
                  <input type="text" id="contact-name" className="form-control op-focus" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alex Morgan" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">Email Address</label>
                  <input type="email" id="contact-email" className="form-control op-focus" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-subject">Subject</label>
                <input type="text" id="contact-subject" className="form-control op-focus" required value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea id="contact-message" rows="6" className="form-control op-focus" required value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us a little about what you need..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <button type="submit" disabled={sending} className="op-btn op-grad-bg" style={{ padding: '13px 30px', borderRadius: '12px', fontWeight: '700', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.98rem' }}>
                  {sending ? 'Sending…' : 'Send Message'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
