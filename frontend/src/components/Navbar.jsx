import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  Store, 
  Users, 
  ShieldCheck, 
  KeyRound, 
  LogOut, 
  LogIn, 
  UserPlus,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({ currentView, setCurrentView, onOpenChangePassword }) {
  const { user, logout, isAdmin, isStoreOwner, isNormalUser } = useAuth();

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-inner">
        <div 
          className="brand-logo" 
          onClick={() => setCurrentView(isAdmin ? 'admin-dashboard' : isStoreOwner ? 'owner-dashboard' : 'stores')}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-logo-icon">
            <Store size={20} />
          </div>
          <span>Store Ratings</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <button
                className={`nav-link ${currentView === 'admin-dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin-dashboard')}
                style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>
              <button
                className={`nav-link ${currentView === 'admin-stores' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin-stores')}
                style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Store size={16} />
                <span>Stores</span>
              </button>
              <button
                className={`nav-link ${currentView === 'admin-users' ? 'active' : ''}`}
                onClick={() => setCurrentView('admin-users')}
                style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Users size={16} />
                <span>Users</span>
              </button>
            </>
          )}

          {isStoreOwner && (
            <button
              className={`nav-link ${currentView === 'owner-dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('owner-dashboard')}
              style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Store size={16} />
              <span>Owner Dashboard</span>
            </button>
          )}

          {(!user || isNormalUser) && (
            <button
              className={`nav-link ${currentView === 'stores' ? 'active' : ''}`}
              onClick={() => setCurrentView('stores')}
              style={{ background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Building2 size={16} />
              <span>Explore Stores</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="user-profile-badge">
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name.split(' ')[0]}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="badge badge-admin">
                    <ShieldCheck size={12} /> Admin
                  </span>
                )}
                {user.role === 'STORE_OWNER' && (
                  <span className="badge badge-owner">
                    <Store size={12} /> Owner
                  </span>
                )}
                {user.role === 'USER' && (
                  <span className="badge badge-user">
                    User
                  </span>
                )}
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={onOpenChangePassword}
                title="Change Password"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <KeyRound size={15} />
                <span style={{ display: 'none', md: 'inline' }}>Password</span>
              </button>

              <button
                className="btn btn-danger btn-sm"
                onClick={logout}
                title="Sign Out"
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                className={`btn btn-secondary btn-sm ${currentView === 'login' ? 'active' : ''}`}
                onClick={() => setCurrentView('login')}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                className={`btn btn-primary btn-sm ${currentView === 'register' ? 'active' : ''}`}
                onClick={() => setCurrentView('register')}
              >
                <UserPlus size={15} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
