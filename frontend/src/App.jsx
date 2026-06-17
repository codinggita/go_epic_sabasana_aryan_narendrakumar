import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyOtp from './pages/VerifyOtp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Problems from './pages/Problems';
import ProblemDetail from './pages/ProblemDetail';
import Solutions from './pages/Solutions';
import Datasets from './pages/Datasets';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/problems/:problemId" element={<ProblemDetail />} />
          <Route path="/solutions" element={<Solutions />} />
          <Route path="/datasets" element={<Datasets />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={
            <div style={{ display: 'flex', flex1: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>404</h1>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Page Not Found</p>
            </div>
          } />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
