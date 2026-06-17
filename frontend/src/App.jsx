import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './store';
import { fetchUserProfile, syncAuthState } from './store/slices/authSlice';
import ThemeProvider from './components/ThemeProvider';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import { ProtectedRoute, AdminRoute } from './components/RouteGuards';

// Lazy loading pages for performance optimization
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Problems = lazy(() => import('./pages/Problems'));
const ProblemDetail = lazy(() => import('./pages/ProblemDetail'));
const Solutions = lazy(() => import('./pages/Solutions'));
const Datasets = lazy(() => import('./pages/Datasets'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading Indicator for Lazy Pages
const LoadingIndicator = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
    <div className="spinner" />
    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Workspace Screen...</p>
  </div>
);

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check local credentials and sync state on startup
    dispatch(syncAuthState());
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch]);

  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-deep)' }}>
      <Suspense fallback={<LoadingIndicator />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* User Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:problemId" element={<ProblemDetail />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin Protected Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={
            <div style={{ display: 'flex', flex1: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-deep)', color: 'var(--text-primary)' }}>
              <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)', fontWeight: 800 }}>404</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: '8px' }}>Page Not Found</p>
              <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => window.location.href = '/'}>
                Back to Dashboard
              </button>
            </div>
          } />
        </Routes>
      </Suspense>
      <Toast />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <Router>
              <AppContent />
            </Router>
          </ErrorBoundary>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default App;
