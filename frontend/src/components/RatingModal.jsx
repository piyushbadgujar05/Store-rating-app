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
        <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#a5b4fc',
            }}
          >
            <Store size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{store.name}</h4>
            <p style={{ fontSize: '0.825rem', color: '#9ca3af' }}>{store.address}</p>
          </div>
        </div>

        <div
          style={{
            padding: '1.25rem',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.75rem' }}>
            Select your rating (1 to 5 Stars):
          </div>

          <StarRating
            value={selectedRating}
            onChange={(val) => setSelectedRating(val)}
            size={34}
            showLabel={true}
          />

          {isModifying && (
            <div style={{ marginTop: '0.85rem', fontSize: '0.8rem', color: '#9ca3af' }}>
              Your current saved rating: <strong style={{ color: '#f59e0b' }}>{store.my_rating} Stars</strong>
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
