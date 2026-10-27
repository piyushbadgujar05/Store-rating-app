import React, { useState } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { KeyRound, Check, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const hasValidLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-\\\/\[\]~`+=]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;
  const isFormValid = hasValidLength && hasUppercase && hasSpecialChar && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      showToast(res.message || 'Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to update password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Account Password" maxWidth="480px">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>New Password</span>
            <span className={`form-counter ${newPassword.length > 16 ? 'limit-err' : ''}`}>
              {newPassword.length} / 16
            </span>
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="8 to 16 characters"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
          />
        </div>

        <div
          style={{
            padding: '0.85rem 1rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
            Password Security Requirements:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasValidLength ? 'var(--success)' : 'var(--text-dim)' }}>
            {hasValidLength ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>Length: 8 to 16 characters</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasUppercase ? 'var(--success)' : 'var(--text-dim)' }}>
            {hasUppercase ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>At least one uppercase letter (A-Z)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: hasSpecialChar ? 'var(--success)' : 'var(--text-dim)' }}>
            {hasSpecialChar ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>At least one special character (!@#$%^&* etc.)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: passwordsMatch ? 'var(--success)' : 'var(--text-dim)' }}>
            {passwordsMatch ? <Check size={14} /> : <AlertCircle size={14} />}
            <span>Passwords match</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isFormValid || loading}>
            <KeyRound size={16} />
            <span>{loading ? 'Updating...' : 'Update Password'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
