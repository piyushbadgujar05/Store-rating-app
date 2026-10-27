import React, { useState } from 'react';
import Modal from './Modal';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';
import { UserPlus, Check, AlertCircle } from 'lucide-react';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const trimmedAddress = address.trim();
  const isNameValid = trimmedName.length >= 20 && trimmedName.length <= 60;
  const isAddressValid = trimmedAddress.length > 0 && trimmedAddress.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

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
      const res = await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          email: email.trim(),
          address: trimmedAddress,
          password,
          role,
        }),
      });

      showToast(res.message || 'User account created successfully!', 'success');
      onUserCreated(res.data);
      setName('');
      setEmail('');
      setAddress('');
      setPassword('');
      setRole('USER');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create user account.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Platform User" maxWidth="520px">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Assign Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="USER">Normal User (Customer)</option>
            <option value="STORE_OWNER">Store Owner</option>
            <option value="ADMIN">System Administrator</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Full Name</span>
            <span className={`form-counter ${trimmedName.length < 20 || trimmedName.length > 60 ? 'limit-warn' : ''}`}>
              {trimmedName.length} / 60 (min 20)
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Sudhakar Deshmukh"
            required
          />
          <div className="form-hint">Must be between 20 and 60 characters.</div>
        </div>

        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="priya.deshmukh@example.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Physical Address</span>
            <span className={`form-counter ${trimmedAddress.length > 400 ? 'limit-err' : ''}`}>
              {trimmedAddress.length} / 400
            </span>
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Shop 4, Baner Road, Baner, Pune, Maharashtra 411045"
            rows={2}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Password</span>
            <span className={`form-counter ${password.length > 16 ? 'limit-err' : ''}`}>
              {password.length} / 16 (min 8)
            </span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 to 16 characters"
            required
          />
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.78rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.3rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasValidLength ? 'var(--success)' : 'var(--text-dim)' }}>
            {hasValidLength ? <Check size={13} /> : <AlertCircle size={13} />}
            <span>8 to 16 characters</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasUppercase ? 'var(--success)' : 'var(--text-dim)' }}>
            {hasUppercase ? <Check size={13} /> : <AlertCircle size={13} />}
            <span>At least one uppercase letter (A-Z)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasSpecialChar ? 'var(--success)' : 'var(--text-dim)' }}>
            {hasSpecialChar ? <Check size={13} /> : <AlertCircle size={13} />}
            <span>At least one special character (!@#$%^&* etc.)</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isFormValid || loading}>
            <UserPlus size={16} />
            <span>{loading ? 'Creating...' : 'Create Account'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
