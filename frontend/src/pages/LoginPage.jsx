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

      // Redirect to appropriate dashboard based on assigned role
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

  // Demo Quick-Fill Helpers
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
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1rem',
              boxShadow: '0 4px 16px var(--primary-glow)',
            }}
          >
            <LogIn size={26} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign in to access your dashboard and reviews
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
                placeholder="you@domain.com"
                required
                style={{ paddingLeft: '2.3rem' }}
              />
              <Mail
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
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
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          Don't have a customer account?{' '}
          <button
            onClick={() => setCurrentView('register')}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
          >
            Register here
          </button>
        </div>

        {/* Quick Demo Role Fill Section */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick fill for testing:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('admin@platform.com', 'AdminPassword123!')}
              title="Autofill System Administrator"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
            >
              <Shield size={14} color="#a78bfa" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('owner@applecentral.com', 'OwnerPassword123!')}
              title="Autofill Store Owner"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
            >
              <Store size={14} color="#38bdf8" />
              <span>Owner</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => fillCredentials('user1@example.com', 'UserPassword123!')}
              title="Autofill Normal User"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.2rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
            >
              <UserCheck size={14} color="#34d399" />
              <span>User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
