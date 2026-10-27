import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Store, Plus } from 'lucide-react';

export default function CreateStoreModal({ isOpen, onClose, onStoreCreated }) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [ownersList, setOwnersList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      apiRequest('/admin/store-owners')
        .then((res) => {
          if (res.success) {
            setOwnersList(res.data);
          }
        })
        .catch(() => {});
    } else {
      setName('');
      setEmail('');
      setAddress('');
      setOwnerId('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmedName = name.trim();
  const trimmedAddress = address.trim();
  const isNameValid = trimmedName.length >= 20 && trimmedName.length <= 60;
  const isAddressValid = trimmedAddress.length > 0 && trimmedAddress.length <= 400;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isFormValid = isNameValid && isAddressValid && isEmailValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const res = await apiRequest('/admin/stores', {
        method: 'POST',
        body: JSON.stringify({
          name: trimmedName,
          email: email.trim(),
          address: trimmedAddress,
          ownerId: ownerId ? parseInt(ownerId, 10) : null,
        }),
      });

      showToast(res.message || 'Store created successfully!', 'success');
      onStoreCreated(res.data);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to create store.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Store" maxWidth="520px">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">
            <span>Store Name</span>
            <span className={`form-counter ${trimmedName.length < 20 || trimmedName.length > 60 ? 'limit-warn' : ''}`}>
              {trimmedName.length} / 60 (min 20)
            </span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Downtown Electronics Flagship Store"
            required
          />
          <div className="form-hint">Must be between 20 and 60 characters.</div>
        </div>

        <div className="form-group">
          <label className="form-label">Store Official Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="store.contact@domain.com"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <span>Store Physical Address</span>
            <span className={`form-counter ${trimmedAddress.length > 400 ? 'limit-err' : ''}`}>
              {trimmedAddress.length} / 400
            </span>
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Street address, city, state, zip code..."
            rows={3}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Associated Store Owner</label>
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
          >
            <option value="">-- No Owner Assigned (Assign Later) --</option>
            {ownersList.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
          <div className="form-hint">
            Assign to a registered Store Owner user or link after account creation.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isFormValid || loading}>
            <Plus size={16} />
            <span>{loading ? 'Creating...' : 'Create Store'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
