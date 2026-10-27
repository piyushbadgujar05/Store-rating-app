import React, { useState, useEffect, useCallback } from 'react';
import StarRating from '../components/StarRating';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  Users, 
  Star, 
  Calendar, 
  MapPin, 
  Mail, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Building
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const { user } = useAuth();

  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [storeRatingsData, setStoreRatingsData] = useState(null);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Sorting and pagination for ratings table
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  // Fetch stores owned by this store owner
  const fetchOwnerStores = useCallback(async () => {
    setLoadingStores(true);
    try {
      const res = await apiRequest('/owner/stores');
      if (res.success && res.data) {
        setStores(res.data);
        if (res.data.length > 0 && !selectedStoreId) {
          setSelectedStoreId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching owner stores:', err);
    } finally {
      setLoadingStores(false);
    }
  }, [selectedStoreId]);

  // Fetch ratings for the currently selected store
  const fetchRatingsForStore = useCallback(async (storeId) => {
    if (!storeId) return;
    setLoadingRatings(true);
    try {
      const queryParams = new URLSearchParams({
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '10',
      });
      const res = await apiRequest(`/owner/stores/${storeId}/ratings?${queryParams.toString()}`);
      if (res.success) {
        setStoreRatingsData(res);
      }
    } catch (err) {
      console.error('Error fetching store ratings:', err);
    } finally {
      setLoadingRatings(false);
    }
  }, [sortBy, sortOrder, page]);

  useEffect(() => {
    fetchOwnerStores();
  }, [fetchOwnerStores]);

  useEffect(() => {
    if (selectedStoreId) {
      fetchRatingsForStore(selectedStoreId);
    }
  }, [selectedStoreId, fetchRatingsForStore]);

  const activeStore = stores.find((s) => s.id === selectedStoreId) || (storeRatingsData ? storeRatingsData.store : null);

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '2rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(6, 182, 212, 0.2)', color: '#67e8f9', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              <Store size={14} /> Store Owner Dashboard
            </div>
            <h1 style={{ fontSize: '2rem' }}>Welcome, {user ? user.name.split(' ')[0] : 'Store Owner'}</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.95rem' }}>
              View average ratings and review customer submissions for your stores.
            </p>
          </div>

          {stores.length > 1 && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#9ca3af', display: 'block', marginBottom: '0.3rem' }}>
                Select Store to View:
              </label>
              <select
                value={selectedStoreId || ''}
                onChange={(e) => {
                  setSelectedStoreId(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                style={{ minWidth: '220px', background: '#162035' }}
              >
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loadingStores ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
          Loading your store properties...
        </div>
      ) : stores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Building size={48} color="#6b7280" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Associated Stores</h3>
          <p style={{ color: '#9ca3af', maxWidth: '420px', margin: '0 auto' }}>
            You do not currently have any registered stores linked to your owner account. Please contact the platform administrator to link your stores.
          </p>
        </div>
      ) : (
        <div>
          {/* Active Store Overview Cards */}
          {activeStore && (
            <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
              {/* Store Details Card */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#9ca3af', letterSpacing: '0.04em' }}>
                  Current Active Store
                </span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '0.35rem', color: '#ffffff' }}>
                  {activeStore.name}
                </h3>
                <div style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={14} style={{ flexShrink: 0 }} />
                  <span>{activeStore.address}</span>
                </div>
              </div>

              {/* Average Rating Card */}
              <div className="stat-card" style={{ '--stat-glow': 'rgba(245, 158, 11, 0.3)', '--stat-color': '#f59e0b' }}>
                <div className="stat-header">
                  <span className="stat-title">Overall Store Rating</span>
                  <div className="stat-icon"><Star size={20} /></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.65rem' }}>
                  <div className="stat-number">
                    {Number(activeStore.average_rating || activeStore.averageRating || 0).toFixed(2)}
                  </div>
                  <StarRating
                    value={activeStore.average_rating || activeStore.averageRating || 0}
                    readOnly={true}
                    size={20}
                  />
                </div>
                <div className="stat-subtext">Average score across customer submissions</div>
              </div>

              {/* Total Submissions Card */}
              <div className="stat-card" style={{ '--stat-glow': 'rgba(6, 182, 212, 0.3)', '--stat-color': '#06b6d4' }}>
                <div className="stat-header">
                  <span className="stat-title">Total Ratings Received</span>
                  <div className="stat-icon"><Users size={20} /></div>
                </div>
                <div className="stat-number">
                  {activeStore.total_ratings || activeStore.totalRatings || 0}
                </div>
                <div className="stat-subtext">Verified customer ratings recorded</div>
              </div>
            </div>
          )}

          {/* Customer Ratings Table */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} color="#06b6d4" />
                  <span>Customer Ratings for {activeStore ? activeStore.name : 'Store'}</span>
                </h3>
                <p style={{ fontSize: '0.825rem', color: '#9ca3af', marginTop: '0.2rem' }}>
                  Detailed record of verified ratings submitted by registered users.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="updated_at">Sort: Recent Update</option>
                  <option value="rating">Sort: Rating Value</option>
                  <option value="user_name">Sort: Customer Name</option>
                  <option value="user_email">Sort: Customer Email</option>
                </select>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ArrowUpDown size={15} />
                  <span>{sortOrder.toUpperCase()}</span>
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Customer Email</th>
                    <th>Submitted Rating</th>
                    <th>Submission Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRatings ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                        Loading customer ratings...
                      </td>
                    </tr>
                  ) : !storeRatingsData || !storeRatingsData.data || storeRatingsData.data.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2.5rem', color: '#9ca3af' }}>
                        No customer ratings have been submitted for this store yet.
                      </td>
                    </tr>
                  ) : (
                    storeRatingsData.data.map((r) => (
                      <tr key={r.rating_id}>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{r.user_name}</td>
                        <td style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{r.user_email}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <StarRating value={r.rating} readOnly={true} size={15} />
                            <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                              {r.rating} / 5
                            </span>
                          </div>
                        </td>
                        <td style={{ color: '#d1d5db', fontSize: '0.85rem' }}>
                          {new Date(r.updated_at || r.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {storeRatingsData && storeRatingsData.pagination && storeRatingsData.pagination.totalPages > 1 && (
              <div className="pagination-wrap">
                <div className="pagination-info">
                  Page {storeRatingsData.pagination.page} of {storeRatingsData.pagination.totalPages} ({storeRatingsData.pagination.totalRecords} total evaluations)
                </div>
                <div className="pagination-buttons">
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={page >= storeRatingsData.pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(storeRatingsData.pagination.totalPages, p + 1))}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
