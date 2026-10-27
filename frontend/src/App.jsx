import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import ChangePasswordModal from './components/ChangePasswordModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StoreListPage from './pages/StoreListPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OwnerDashboardPage from './pages/OwnerDashboardPage';

function AppContent() {
  const { user, loading, isAdmin, isStoreOwner } = useAuth();
  const [currentView, setCurrentView] = useState('stores');
  const [adminTab, setAdminTab] = useState('overview');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (isAdmin && (currentView === 'login' || currentView === 'register')) {
        setCurrentView('admin-dashboard');
      } else if (isStoreOwner && (currentView === 'login' || currentView === 'register')) {
        setCurrentView('owner-dashboard');
      } else if (!user && (currentView === 'admin-dashboard' || currentView === 'admin-stores' || currentView === 'admin-users' || currentView === 'owner-dashboard')) {
        setCurrentView('login');
      }
    }
  }, [user, loading, isAdmin, isStoreOwner, currentView]);

  const handleNavViewChange = (view) => {
    if (view === 'admin-stores') {
      setCurrentView('admin-dashboard');
      setAdminTab('stores');
    } else if (view === 'admin-users') {
      setCurrentView('admin-dashboard');
      setAdminTab('users');
    } else {
      setCurrentView(view);
      if (view === 'admin-dashboard') {
        setAdminTab('overview');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent)', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          Loading application...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar
        currentView={currentView}
        setCurrentView={handleNavViewChange}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      <main className="main-content">
        {currentView === 'login' && <LoginPage setCurrentView={setCurrentView} />}
        {currentView === 'register' && <RegisterPage setCurrentView={setCurrentView} />}
        {currentView === 'stores' && <StoreListPage setCurrentView={setCurrentView} />}
        {currentView === 'admin-dashboard' && (
          <AdminDashboardPage
            activeTab={adminTab}
            setActiveTab={setAdminTab}
          />
        )}
        {currentView === 'owner-dashboard' && <OwnerDashboardPage />}
      </main>

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
