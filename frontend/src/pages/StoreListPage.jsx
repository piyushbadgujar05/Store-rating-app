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
    if (user.role !== 'USER') {
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
      <div className="page-header-banner">
        <div style={{ maxWidth: '640px' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
            Browse & Rate Registered Stores
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>
            Search for registered store locations, see customer ratings, and submit or update your evaluations.
          </p>
        </div>
      </div>

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
            <ArrowUpDown size={15} />
            <span>{sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-dim)' }}>
          Loading registered stores...
        </div>
      ) : stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Building size={48} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>No Stores Found</h3>
          <p style={{ color: 'var(--text-dim)', maxWidth: '400px', margin: '0 auto' }}>
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
                  border: hasMyRating ? '1px solid var(--accent-border)' : '1px solid var(--border-color)',
                  backgroundColor: '#ffffff',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent)',
                        flexShrink: 0,
                      }}
                    >
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', lineHeight: 1.3, marginBottom: '0.2rem', color: 'var(--text-main)', fontWeight: 600 }}>
                        {store.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.8125rem' }}>
                        <MapPin size={13} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {store.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '0.75rem 0.85rem',
                      backgroundColor: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Overall Store Rating:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <StarRating value={store.overall_rating} readOnly={true} size={14} />
                        <span style={{ fontWeight: 700, color: '#b45309', fontSize: '0.875rem' }}>
                          {Number(store.overall_rating) > 0 ? Number(store.overall_rating).toFixed(2) : 'No ratings'}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'right' }}>
                      Based on {store.total_ratings} customer rating{store.total_ratings === 1 ? '' : 's'}
                    </div>

                    <div
                      style={{
                        paddingTop: '0.45rem',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)', fontWeight: 500 }}>
                        Your Rating:
                      </span>
                      {hasMyRating ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span className="badge badge-owner">
                            <Star size={11} style={{ fill: 'var(--accent)' }} /> {store.my_rating} / 5 Stars
                          </span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                          Not rated yet
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {user && user.role !== 'USER' ? (
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled
                    title="Rating is restricted to customer accounts"
                    style={{ width: '100%', opacity: 0.65, cursor: 'not-allowed' }}
                  >
                    Customer Rating Only
                  </button>
                ) : (
                  <button
                    className={`btn ${hasMyRating ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                    onClick={() => handleRateClick(store)}
                    style={{ width: '100%' }}
                  >
                    <Star size={14} style={{ fill: hasMyRating ? '#d97706' : 'transparent', color: hasMyRating ? '#d97706' : '#ffffff' }} />
                    <span>{hasMyRating ? 'Modify Your Rating' : 'Submit Rating'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

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
