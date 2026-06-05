'use client';

import { useState } from 'react';

const WORK_AUTH = ['OPT', 'CPT', 'H1B', 'Need H1B', 'Green Card', 'US Citizen'];

export default function JobIntakeForm() {
  const [form, setForm] = useState({ name: '', contact: '', email: '', workAuth: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [msg, setMsg] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setMsg('');
    try {
      const r = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (d.success) setStatus('done');
      else { setStatus('error'); setMsg(d.message || 'Something went wrong. Please try again.'); }
    } catch {
      setStatus('error');
      setMsg('Network error. Please try again.');
    }
  };

  if (status === 'done') {
    return (
      <div className="card-light" style={{ padding: '44px 36px', textAlign: 'center' }}>
        <div className="op-icon" style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(16,185,129,0.14)', margin: '0 auto 20px' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px' }}>Thank you!</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.02rem', lineHeight: '1.6', maxWidth: '420px', margin: '0 auto' }}>
          Our executives will review your details and one of our team members will contact you <strong>within 1 working day</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card-light" style={{ padding: '36px' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '6px' }}>Submit your details</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', marginBottom: '26px' }}>Share a few details and our team will get in touch within 1 working day.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="intake-name">Name</label>
          <input id="intake-name" className="form-control op-focus" required value={form.name} onChange={set('name')} placeholder="Your full name" autoComplete="name" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="intake-contact">Contact</label>
          <input id="intake-contact" className="form-control op-focus" required value={form.contact} onChange={set('contact')} placeholder="Phone number" autoComplete="tel" inputMode="tel" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="intake-email">Email</label>
          <input id="intake-email" type="email" className="form-control op-focus" required value={form.email} onChange={set('email')} placeholder="name@email.com" autoComplete="email" />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="intake-auth">Work Authorization</label>
          <select id="intake-auth" className="form-control op-focus" required value={form.workAuth} onChange={set('workAuth')}>
            <option value="" disabled>Select your work authorization</option>
            {WORK_AUTH.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        {status === 'error' && (
          <div className="status-alert alert-error" style={{ borderRadius: '12px' }}>{msg}</div>
        )}

        <button type="submit" disabled={status === 'sending'} className="op-btn op-grad-bg" style={{ marginTop: '4px', padding: '14px 28px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {status === 'sending' ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
