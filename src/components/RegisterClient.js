'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterClient() {
  const router = useRouter();
  const [role, setRole] = useState('candidate'); // 'candidate' | 'employer'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(data.message || 'Registration successful! Redirecting...');
        router.refresh();
        setTimeout(() => {
          if (role === 'candidate') {
            router.push('/dashboard/candidate');
          } else {
            router.push('/dashboard/employer');
          }
        }, 1500);
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--header-height) - 150px)', padding: '40px 24px' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.8px' }}>
            Create <span className="text-gradient">Account</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13.5px' }}>
            Join the Opelsoft hiring ecosystem today
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

        {success && (
          <div style={{ 
            background: 'rgba(16, 185, 129, 0.08)', 
            border: '1px solid rgba(16, 185, 129, 0.2)', 
            color: '#10b981', 
            padding: '12px 16px', 
            borderRadius: '6px', 
            fontSize: '13px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            ✓ {success}
          </div>
        )}

        {/* Role Selection Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div 
            onClick={() => !loading && setRole('candidate')}
            className="card" 
            style={{ 
              padding: '16px', 
              textAlign: 'center', 
              cursor: 'pointer', 
              transition: 'border-color 0.2s',
              borderColor: role === 'candidate' ? 'var(--primary-color)' : 'var(--border-color)',
              background: role === 'candidate' ? 'rgba(30, 80, 255, 0.02)' : 'transparent'
            }}
          >
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>👤</span>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>Candidate</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Upload CV & Apply</span>
          </div>
          
          <div 
            onClick={() => !loading && setRole('employer')}
            className="card" 
            style={{ 
              padding: '16px', 
              textAlign: 'center', 
              cursor: 'pointer', 
              transition: 'border-color 0.2s',
              borderColor: role === 'employer' ? 'var(--primary-color)' : 'var(--border-color)',
              background: role === 'employer' ? 'rgba(30, 80, 255, 0.02)' : 'transparent'
            }}
          >
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🏢</span>
            <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>Employer</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Post Jobs & Recruit</span>
          </div>
        </div>

        {/* Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">Email Address</label>
            <input 
              type="email" 
              id="register-email" 
              className="form-control" 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-username">Username</label>
            <input 
              type="text" 
              id="register-username" 
              className="form-control" 
              placeholder="choose_username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">Password</label>
            <input 
              type="password" 
              id="register-password" 
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
