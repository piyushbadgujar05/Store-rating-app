import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import { apiRequest } from '../api/client';
import { User, Store, Shield, Calendar, MapPin, Mail } from 'lucide-react';

export default function UserDetailsModal({ isOpen, onClose, userId }) {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      setError(null);
      apiRequest(`/admin/users/${userId}`)
        .then((res) => {
          if (res.success) {
            setUserDetails(res.data);
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load user details.');
        })
        .finally(() => setLoading(false));
    } else {
      setUserDetails(null);
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="User Account Details" maxWidth="620px">
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
          Loading user record...
        </div>
      ) : error ? (
        <div style={{ padding: '1rem', color: '#fda4af', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px' }}>
          {error}
        </div>
      ) : userDetails ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1.25rem',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <User size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>{userDetails.name}</h3>
                {userDetails.role === 'ADMIN' && <span className="badge badge-admin">Admin</span>}
                {userDetails.role === 'STORE_OWNER' && <span className="badge badge-owner">Store Owner</span>}
                {userDetails.role === 'USER' && <span className="badge badge-user">User</span>}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={14} /> {userDetails.email}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.85rem',
              backgroundColor: '#ffffff',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
              <MapPin size={18} style={{ color: 'var(--text-dim)', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Address
                </strong>
                <span style={{ color: 'var(--text-main)' }}>{userDetails.address}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              <Calendar size={18} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
              <div>
                <strong style={{ color: 'var(--text-dim)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Account Created
                </strong>
                <span style={{ color: 'var(--text-main)' }}>
                  {new Date(userDetails.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          {userDetails.role === 'STORE_OWNER' && (
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <Store size={18} color="var(--accent)" />
                <span>Associated Stores & Performance</span>
              </h4>

              {userDetails.associatedStores && userDetails.associatedStores.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {userDetails.associatedStores.map((store) => (
                    <div
                      key={store.id}
                      style={{
                        padding: '1rem 1.25rem',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{store.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{store.address}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <StarRating value={store.overall_rating} readOnly={true} size={16} />
                          <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.95rem' }}>
                            {Number(store.overall_rating).toFixed(2)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {store.rating_count} total rating{store.rating_count === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  No stores currently linked to this owner.
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
