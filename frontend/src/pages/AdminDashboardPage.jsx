import React, { useState, useEffect, useCallback } from 'react';
import StarRating from '../components/StarRating';
import CreateStoreModal from '../components/CreateStoreModal';
import CreateUserModal from '../components/CreateUserModal';
import UserDetailsModal from '../components/UserDetailsModal';
import { apiRequest } from '../api/client';
import { 
  Users, 
  Store, 
  Star, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Mail,
  MapPin,
  LayoutDashboard
} from 'lucide-react';

export default function AdminDashboardPage({ activeTab = 'overview', setActiveTab }) {
  // Statistics State
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Stores Table State
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);
  const [storeFilterName, setStoreFilterName] = useState('');
  const [storeFilterEmail, setStoreFilterEmail] = useState('');
  const [storeFilterAddress, setStoreFilterAddress] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('asc');
  const [storePage, setStorePage] = useState(1);
  const [storePagination, setStorePagination] = useState({ totalPages: 1, totalRecords: 0 });

  // Users Table State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userFilterName, setUserFilterName] = useState('');
  const [userFilterEmail, setUserFilterEmail] = useState('');
  const [userFilterAddress, setUserFilterAddress] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('asc');
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ totalPages: 1, totalRecords: 0 });

  // Modals State
  const [isCreateStoreOpen, setIsCreateStoreOpen] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedUserIdForDetails, setSelectedUserIdForDetails] = useState(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  // 1. Fetch Stats
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await apiRequest('/admin/dashboard');
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // 2. Fetch Stores
  const fetchStores = useCallback(async () => {
    setLoadingStores(true);
    try {
      const queryParams = new URLSearchParams({
        name: storeFilterName,
        email: storeFilterEmail,
        address: storeFilterAddress,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
        page: storePage.toString(),
        limit: '10',
      });
      const res = await apiRequest(`/admin/stores?${queryParams.toString()}`);
      if (res.success) {
        setStores(res.data);
        setStorePagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin stores:', err);
    } finally {
      setLoadingStores(false);
    }
  }, [storeFilterName, storeFilterEmail, storeFilterAddress, storeSortBy, storeSortOrder, storePage]);

  // 3. Fetch Users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const queryParams = new URLSearchParams({
        name: userFilterName,
        email: userFilterEmail,
        address: userFilterAddress,
        role: userFilterRole,
        sortBy: userSortBy,
        sortOrder: userSortOrder,
        page: userPage.toString(),
        limit: '10',
      });
      const res = await apiRequest(`/admin/users?${queryParams.toString()}`);
      if (res.success) {
        setUsers(res.data);
        setUserPagination(res.pagination);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, [userFilterName, userFilterEmail, userFilterAddress, userFilterRole, userSortBy, userSortOrder, userPage]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'stores' || activeTab === 'overview') {
      fetchStores();
    }
  }, [activeTab, fetchStores]);

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'overview') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  const handleOpenUserDetails = (id) => {
    setSelectedUserIdForDetails(id);
    setIsUserDetailsOpen(true);
  };

  return (
    <div>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: '999px', background: 'rgba(139, 92, 246, 0.2)', color: '#c4b5fd', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <ShieldCheck size={14} /> Administrator Portal
          </div>
          <h1 style={{ fontSize: '2rem' }}>Admin Dashboard</h1>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsCreateUserOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Add User
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsCreateStoreOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Plus size={16} /> Add Store
          </button>
        </div>
      </div>

      {/* Platform Statistics Cards */}
      <div className="grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Total Users Stat */}
        <div className="stat-card" style={{ '--stat-glow': 'rgba(139, 92, 246, 0.3)', '--stat-color': '#a78bfa' }}>
          <div className="stat-header">
            <span className="stat-title">Total Platform Users</span>
            <div className="stat-icon"><Users size={20} /></div>
          </div>
          <div className="stat-number">{stats ? stats.totalUsers : '...'}</div>
          {stats && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
              <span className="badge badge-admin">{stats.userBreakdown.admins} Admins</span>
              <span className="badge badge-owner">{stats.userBreakdown.storeOwners} Owners</span>
              <span className="badge badge-user">{stats.userBreakdown.normalUsers} Users</span>
            </div>
          )}
        </div>

        {/* Total Stores Stat */}
        <div className="stat-card" style={{ '--stat-glow': 'rgba(6, 182, 212, 0.3)', '--stat-color': '#38bdf8' }}>
          <div className="stat-header">
            <span className="stat-title">Registered Stores</span>
            <div className="stat-icon"><Store size={20} /></div>
          </div>
          <div className="stat-number">{stats ? stats.totalStores : '...'}</div>
          <div className="stat-subtext">Active retail storefronts on platform</div>
        </div>

        {/* Total Ratings Stat */}
        <div className="stat-card" style={{ '--stat-glow': 'rgba(245, 158, 11, 0.3)', '--stat-color': '#fbbf24' }}>
          <div className="stat-header">
            <span className="stat-title">Customer Ratings</span>
            <div className="stat-icon"><Star size={20} /></div>
          </div>
          <div className="stat-number">{stats ? stats.totalRatings : '...'}</div>
          <div className="stat-subtext">Total verified consumer evaluations</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
          style={{ background: 'transparent', padding: '0.65rem 1.15rem', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'overview' ? '2px solid var(--primary)' : 'none' }}
        >
          Overview & Tables
        </button>
        <button
          className={`nav-link ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
          style={{ background: 'transparent', padding: '0.65rem 1.15rem', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'stores' ? '2px solid var(--primary)' : 'none' }}
        >
          Stores Directory ({stats ? stats.totalStores : 0})
        </button>
        <button
          className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
          style={{ background: 'transparent', padding: '0.65rem 1.15rem', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'users' ? '2px solid var(--primary)' : 'none' }}
        >
          User Accounts ({stats ? stats.totalUsers : 0})
        </button>
      </div>

      {/* Stores Directory Section */}
      {(activeTab === 'stores' || activeTab === 'overview') && (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Store size={22} color="#06b6d4" /> Registered Stores Directory
            </h2>
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateStoreOpen(true)}>
              <Plus size={15} /> Add New Store
            </button>
          </div>

          {/* Filters for Stores */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <input
                  type="text"
                  placeholder="Filter by store name..."
                  value={storeFilterName}
                  onChange={(e) => {
                    setStoreFilterName(e.target.value);
                    setStorePage(1);
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Filter by email..."
                  value={storeFilterEmail}
                  onChange={(e) => {
                    setStoreFilterEmail(e.target.value);
                    setStorePage(1);
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Filter by address..."
                  value={storeFilterAddress}
                  onChange={(e) => {
                    setStoreFilterAddress(e.target.value);
                    setStorePage(1);
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={storeSortBy}
                  onChange={(e) => setStoreSortBy(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="name">Sort: Name</option>
                  <option value="email">Sort: Email</option>
                  <option value="address">Sort: Address</option>
                  <option value="rating">Sort: Overall Rating</option>
                </select>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setStoreSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  title={`Switch to ${storeSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ArrowUpDown size={15} />
                  <span>{storeSortOrder.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Stores Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => { setStoreSortBy('name'); setStoreSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Store Name {storeSortBy === 'name' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable" onClick={() => { setStoreSortBy('email'); setStoreSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Email {storeSortBy === 'email' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable" onClick={() => { setStoreSortBy('address'); setStoreSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Address {storeSortBy === 'address' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable" onClick={() => { setStoreSortBy('rating'); setStoreSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Overall Rating {storeSortBy === 'rating' && (storeSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th>Store Owner</th>
                </tr>
              </thead>
              <tbody>
                {loadingStores ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      Loading stores...
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No stores found matching your filters.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{s.name}</td>
                      <td style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{s.email}</td>
                      <td style={{ color: '#d1d5db', fontSize: '0.875rem', maxWidth: '300px' }}>{s.address}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <StarRating value={s.overall_rating} readOnly={true} size={15} />
                          <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                            {Number(s.overall_rating) > 0 ? Number(s.overall_rating).toFixed(2) : '0.00'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            ({s.rating_count})
                          </span>
                        </div>
                      </td>
                      <td>
                        {s.owner_name ? (
                          <span style={{ color: '#67e8f9', fontSize: '0.85rem' }}>
                            {s.owner_name}
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Stores Pagination */}
          {storePagination.totalPages > 1 && (
            <div className="pagination-wrap">
              <div className="pagination-info">
                Page {storePagination.page} of {storePagination.totalPages} ({storePagination.totalRecords} stores)
              </div>
              <div className="pagination-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={storePage <= 1}
                  onClick={() => setStorePage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={storePage >= storePagination.totalPages}
                  onClick={() => setStorePage((p) => Math.min(storePagination.totalPages, p + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Directory Section */}
      {(activeTab === 'users' || activeTab === 'overview') && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={22} color="#a78bfa" /> Platform Users Management
            </h2>
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateUserOpen(true)}>
              <Plus size={15} /> Add New User
            </button>
          </div>

          {/* Filters for Users */}
          <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
              <div>
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={userFilterName}
                  onChange={(e) => {
                    setUserFilterName(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Filter by email..."
                  value={userFilterEmail}
                  onChange={(e) => {
                    setUserFilterEmail(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Filter by address..."
                  value={userFilterAddress}
                  onChange={(e) => {
                    setUserFilterAddress(e.target.value);
                    setUserPage(1);
                  }}
                />
              </div>
              <div>
                <select
                  value={userFilterRole}
                  onChange={(e) => {
                    setUserFilterRole(e.target.value);
                    setUserPage(1);
                  }}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">System Administrator</option>
                  <option value="STORE_OWNER">Store Owner</option>
                  <option value="USER">Normal User</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={userSortBy}
                  onChange={(e) => setUserSortBy(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="name">Sort: Name</option>
                  <option value="email">Sort: Email</option>
                  <option value="role">Sort: Role</option>
                  <option value="created_at">Sort: Created Date</option>
                </select>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setUserSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                  title={`Switch to ${userSortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                >
                  <ArrowUpDown size={15} />
                  <span>{userSortOrder.toUpperCase()}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => { setUserSortBy('name'); setUserSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Name {userSortBy === 'name' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable" onClick={() => { setUserSortBy('email'); setUserSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Email {userSortBy === 'email' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable" onClick={() => { setUserSortBy('address'); setUserSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Address {userSortBy === 'address' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th className="sortable" onClick={() => { setUserSortBy('role'); setUserSortOrder(o => o === 'asc' ? 'desc' : 'asc'); }}>
                    Role {userSortBy === 'role' && (userSortOrder === 'asc' ? '▲' : '▼')}
                  </th>
                  <th style={{ textAlign: 'center' }}>Inspect</th>
                </tr>
              </thead>
              <tbody>
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                      No users found matching your filters.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr
                      key={u.id}
                      onClick={() => handleOpenUserDetails(u.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{u.name}</td>
                      <td style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{u.email}</td>
                      <td style={{ color: '#d1d5db', fontSize: '0.875rem', maxWidth: '300px' }}>{u.address}</td>
                      <td>
                        {u.role === 'ADMIN' && <span className="badge badge-admin">Admin</span>}
                        {u.role === 'STORE_OWNER' && <span className="badge badge-owner">Store Owner</span>}
                        {u.role === 'USER' && <span className="badge badge-user">User</span>}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUserDetails(u.id);
                          }}
                          title="View user details"
                          style={{ padding: '0.35rem 0.65rem' }}
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Users Pagination */}
          {userPagination.totalPages > 1 && (
            <div className="pagination-wrap">
              <div className="pagination-info">
                Page {userPagination.page} of {userPagination.totalPages} ({userPagination.totalRecords} users)
              </div>
              <div className="pagination-buttons">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={userPage >= userPagination.totalPages}
                  onClick={() => setUserPage((p) => Math.min(userPagination.totalPages, p + 1))}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin Modals */}
      <CreateStoreModal
        isOpen={isCreateStoreOpen}
        onClose={() => setIsCreateStoreOpen(false)}
        onStoreCreated={() => {
          fetchStores();
          fetchStats();
        }}
      />

      <CreateUserModal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        onUserCreated={() => {
          fetchUsers();
          fetchStats();
        }}
      />

      <UserDetailsModal
        isOpen={isUserDetailsOpen}
        onClose={() => {
          setIsUserDetailsOpen(false);
          setSelectedUserIdForDetails(null);
        }}
        userId={selectedUserIdForDetails}
      />
    </div>
  );
}
