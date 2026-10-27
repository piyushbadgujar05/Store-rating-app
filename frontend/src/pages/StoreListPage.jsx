import React, { useState, useEffect, useCallback } from 'react';
import StarRating from '../components/StarRating';
import RatingModal from '../components/RatingModal';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Store, 
  MapPin, 
  Star, 
  Sparkles, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  Building
} from 'lucide-react';

export default function StoreListPage({ setCurrentView }) {
  const { user } = useAuth();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, totalRecords: 0 });

  // Rating Modal state
  const [selectedStoreForRating, setSelectedStoreForRating] = useState(null);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        search,
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '9',
      });

      const res = await apiRequest(`/stores?${queryParams.toString()}`);
      if (res.success) {
        setStores(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleRateClick = (store) => {
    if (!user) {
      setCurrentView('login');
      return;
    }
    setSelectedStoreForRating(store);
    setIsRatingModalOpen(true);
  };

  const handleRatingUpdated = (updatedSummary) => {
    if (!updatedSummary) {
      fetchStores();
      return;
    }
    setStores((prevStores) =>
      prevStores.map((s) => {
        if (s.id === updatedSummary.store_id) {
          return {
            ...s,
            overall_rating: updatedSummary.overall_rating,
            total_ratings: updatedSummary.total_ratings,
            my_rating: updatedSummary.my_rating,
          };
        }
        return s;
      })
    );
  };

  return (
    <div>
      {/* Hero Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(236, 72, 153, 0.05) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2.25rem 2rem',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.5rem', lineHeight: 1.25 }}>
            Browse & Rate Registered Stores
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Search for local registered stores, see average customer ratings, and submit your personal ratings.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search size={18} className="search-icon-abs" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search stores by store name or address..."
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="name">Sort: Store Name</option>
            <option value="rating">Sort: Overall Rating</option>
            <option value="address">Sort: Address</option>
          </select>

          <button
            className="btn btn-secondary"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowUpDown size={16} />
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#9ca3af' }}>
          Loading registered stores...
        </div>
      ) : stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Building size={48} color="#6b7280" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Stores Found</h3>
          <p style={{ color: '#9ca3af', maxWidth: '400px', margin: '0 auto' }}>
            {search ? `No stores matching "${search}". Try searching with a different term.` : 'No stores registered yet.'}
          </p>
        </div>
      ) : (
        <div className="grid-cols-3">
          {stores.map((store) => {
            const hasMyRating = store.my_rating !== null && store.my_rating !== undefined;

            return (
              <div
                key={store.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  border: hasMyRating ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid var(--border-color)',
                  background: hasMyRating ? 'linear-gradient(160deg, #131c31 0%, #101625 100%)' : 'var(--bg-card)',
                }}
              >
                <div>
                  {/* Card Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#818cf8',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', lineHeight: 1.3, marginBottom: '0.2rem' }}>
                        {store.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#9ca3af', fontSize: '0.825rem' }}>
                        <MapPin size={14} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {store.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rating Breakdown Section */}
                  <div
                    style={{
                      padding: '0.85rem',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                    }}
                  >
                    {/* Overall Rating Display */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.825rem', color: '#9ca3af' }}>Overall Store Rating:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <StarRating value={store.overall_rating} readOnly={true} size={15} />
                        <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>
                          {Number(store.overall_rating) > 0 ? Number(store.overall_rating).toFixed(2) : 'No ratings'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'right' }}>
                      Based on {store.total_ratings} customer rating{store.total_ratings === 1 ? '' : 's'}
                    </div>

                    {/* Current User Rating Display (Distinct from Overall Rating) */}
                    <div
                      style={{
                        paddingTop: '0.5rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.825rem', color: '#c7d2fe', fontWeight: 600 }}>
                        Your Rating:
                      </span>
                      {hasMyRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.25)', color: '#c7d2fe', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                            <Star size={12} style={{ fill: '#c7d2fe' }} /> {store.my_rating} / 5 Stars
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#6b7280', fontStyle: 'italic' }}>
                          Not rated yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className={`btn ${hasMyRating ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                  onClick={() => handleRateClick(store)}
                  style={{ width: '100%' }}
                >
                  <Star size={15} style={{ fill: hasMyRating ? '#f59e0b' : '#ffffff' }} />
                  <span>{hasMyRating ? 'Modify Your Rating' : 'Submit Rating'}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="pagination-wrap">
          <div className="pagination-info">
            Showing page {pagination.page} of {pagination.totalPages} ({pagination.totalRecords} total stores)
          </div>
          <div className="pagination-buttons">
            <button
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} /> Previous
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false);
          setSelectedStoreForRating(null);
        }}
        store={selectedStoreForRating}
        onRatingUpdated={handleRatingUpdated}
      />
    </div>
  );
}
