import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';
import { Store, Star } from 'lucide-react';

export default function RatingModal({ isOpen, onClose, store, onRatingUpdated }) {
  const [selectedRating, setSelectedRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (store && store.my_rating) {
      setSelectedRating(Number(store.my_rating));
    } else {
      setSelectedRating(5);
    }
  }, [store]);

  if (!store) return null;

  const isModifying = Boolean(store.my_rating);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let res;
      if (isModifying) {
        res = await apiRequest(`/ratings/${store.id}`, {
          method: 'PUT',
          body: JSON.stringify({ rating: selectedRating }),
        });
      } else {
        res = await apiRequest('/ratings', {
          method: 'POST',
          body: JSON.stringify({ storeId: store.id, rating: selectedRating }),
        });
      }

      showToast(res.message || 'Rating submitted successfully!', 'success');
      onRatingUpdated(res.storeSummary);
      onClose();
    } catch (err) {
      showToast(err.message || 'Failed to submit rating.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isModifying ? 'Modify Your Store Rating' : 'Submit Store Rating'}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent)',
            }}
          >
            <Store size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 600 }}>{store.name}</h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)' }}>{store.address}</p>
          </div>
        </div>

        <div
          style={{
            padding: '1.25rem',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 500 }}>
            Select your rating (1 to 5 Stars):
          </div>

          <StarRating
            value={selectedRating}
            onChange={(val) => setSelectedRating(val)}
            size={32}
            showLabel={true}
          />

          {isModifying && (
            <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Current submitted rating: <strong style={{ color: '#b45309' }}>{store.my_rating} Stars</strong>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Star size={16} style={{ fill: '#ffffff' }} />
            <span>{loading ? 'Saving...' : isModifying ? 'Update Rating' : 'Submit Rating'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
