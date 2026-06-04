'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginClient({ candidate, employer }) {
  const router = useRouter();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const executeLogin = async (identifier, pwd) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: identifier, password: pwd })
      });
      const data = await res.json();
      if (data.success) {
        // Do NOT call router.refresh() here: refreshing /login around the push
        // races with the navigation and can strand the user on /login. The
        // target dashboards are force-dynamic, so they render fresh with the
        // new session on navigation.
        if (data.user.role === 'candidate') {
          router.push('/dashboard/candidate');
        } else if (data.user.role === 'employer') {
          router.push('/dashboard/employer');
        } else {
          router.push('/');
        }
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError('Please fill in both fields.');
      return;
    }
    executeLogin(usernameOrEmail, password);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--header-height) - 150px)', padding: '40px 24px' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.8px' }}>
            Account <span className="text-gradient">Sign In</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Access your Opelsoft candidate resume or recruiter dashboard
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            color: '#ef4444', 
            padding: '12px 16px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Email or Username</label>
            <input 
              type="text" 
              id="username" 
              className="form-control" 
              placeholder="name@company.com" 
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '25px' }}>
          <h2 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.8px', marginBottom: '16px', textAlign: 'center', fontWeight: 700 }}>
            Quick Sign In (Test Profiles)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {candidate && (
              <button 
                onClick={() => executeLogin(candidate.username, 'password123')}
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'center' }}
                disabled={loading}
              >
                👤 Enter as Candidate ({candidate.username})
              </button>
            )}
            {employer && (
              <button 
                onClick={() => executeLogin(employer.username, 'password123')}
                className="btn btn-outline" 
                style={{ width: '100%', textAlign: 'center' }}
                disabled={loading}
              >
                🏢 Enter as Employer ({employer.company_name})
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
