import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LogIn, Shield, Store, UserCheck, KeyRound, Mail } from 'lucide-react';

export default function LoginPage({ setCurrentView }) {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      showToast(res.message || 'Logged in successfully!', 'success');

      if (res.user.role === 'ADMIN') {
        setCurrentView('admin-dashboard');
      } else if (res.user.role === 'STORE_OWNER') {
        setCurrentView('owner-dashboard');
      } else {
        setCurrentView('stores');
      }
    } catch (err) {
      showToast(err.message || 'Invalid email or password credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{ maxWidth: '440px', margin: '2.5rem auto', width: '100%' }}>
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem',
            }}
          >
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>Sign In</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            Access the store rating management platform
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                style={{ paddingLeft: '2.3rem' }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter account password"
                required
                style={{ paddingLeft: '2.3rem' }}
              />
              <KeyRound
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.65rem' }}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have a customer account?{' '}
          <button
            onClick={() => setCurrentView('register')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}
          >
            Register here
          </button>
        </div>

        <div
          style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.75rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Test Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('rahul.verma@example.com', 'AdminPassword123!')}
              title="Fill Admin Credentials"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center' }}
            >
              <Shield size={14} color="#334155" />
              <span style={{ fontWeight: 600 }}>Rahul (Admin)</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('rohan.patil@example.com', 'OwnerPassword123!')}
              title="Fill Owner Credentials"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center' }}
            >
              <Store size={14} color="#2563eb" />
              <span style={{ fontWeight: 600 }}>Rohan (Owner)</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('aarav.sharma@example.com', 'UserPassword123!')}
              title="Fill User Credentials"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center' }}
            >
              <UserCheck size={14} color="#15803d" />
              <span style={{ fontWeight: 600 }}>Aarav (User)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
