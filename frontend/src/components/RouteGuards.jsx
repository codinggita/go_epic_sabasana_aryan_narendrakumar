import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Authenticating session...</p>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export const AdminRoute = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Verifying administrative clearances...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default {
  ProtectedRoute,
  AdminRoute
};
