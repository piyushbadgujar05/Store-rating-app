import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, Check, AlertCircle, Mail, MapPin, User, KeyRound } from 'lucide-react';

export default function RegisterPage({ setCurrentView }) {
  const { register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const trimmedName = name.trim();
  const trimmedAddress = address.trim();
  const trimmedEmail = email.trim();

  // Validation rules
  const isNameValid = trimmedName.length >= 20 && trimmedName.length <= 60;
  const isAddressValid = trimmedAddress.length > 0 && trimmedAddress.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

  const hasValidLength = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]/.test(password);
  const isPasswordValid = hasValidLength && hasUppercase && hasSpecialChar;

  const isFormValid = isNameValid && isAddressValid && isEmailValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const res = await register({
        name: trimmedName,
        email: trimmedEmail,
        address: trimmedAddress,
        password,
      });

      showToast(res.message || 'Account created successfully! Welcome.', 'success');
      setCurrentView('stores');
    } catch (err) {
      showToast(err.message || 'Failed to register account.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '2rem auto', width: '100%' }}>
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
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>Create User Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Sign up to rate stores and share your feedback
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <span>Full Name</span>
              <span className={`form-counter ${trimmedName.length < 20 || trimmedName.length > 60 ? 'limit-warn' : ''}`}>
                {trimmedName.length} / 60 (min 20)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jonathan Alexander Sterling"
                required
                style={{ paddingLeft: '2.3rem' }}
              />
              <User
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
            </div>
            <div className="form-hint">Length must be between 20 and 60 characters.</div>
          </div>

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
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Full Address</span>
              <span className={`form-counter ${trimmedAddress.length > 400 ? 'limit-err' : ''}`}>
                {trimmedAddress.length} / 400
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your street address, city, state, postal code..."
                rows={2}
                required
                style={{ paddingLeft: '2.3rem' }}
              />
              <MapPin
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '14px', color: '#6b7280' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password</span>
              <span className={`form-counter ${password.length > 16 ? 'limit-err' : ''}`}>
                {password.length} / 16 (min 8)
              </span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 to 16 characters"
                required
                style={{ paddingLeft: '2.3rem' }}
              />
              <KeyRound
                size={16}
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
              />
            </div>
          </div>

          {/* Real-time Password Rules Checklist */}
          <div
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              fontSize: '0.8rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
            }}
          >
            <div style={{ fontWeight: 600, color: '#9ca3af', marginBottom: '0.2rem' }}>
              Required Password Rules:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasValidLength ? '#10b981' : '#9ca3af' }}>
              {hasValidLength ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>8 to 16 characters</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasUppercase ? '#10b981' : '#9ca3af' }}>
              {hasUppercase ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>At least one uppercase letter (A-Z)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasSpecialChar ? '#10b981' : '#9ca3af' }}>
              {hasSpecialChar ? <Check size={14} /> : <AlertCircle size={14} />}
              <span>At least one special character (!@#$%^&* etc.)</span>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isFormValid || loading}
            style={{ width: '100%', padding: '0.75rem' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#9ca3af' }}>
          Already have an account?{' '}
          <button
            onClick={() => setCurrentView('login')}
            style={{ background: 'none', border: 'none', color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
