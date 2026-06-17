import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser, logoutUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { FiMail, FiLock, FiShield, FiUser } from 'react-icons/fi';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error: authError, isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Selected Role: 'user' | 'admin'
  const [selectedRole, setSelectedRole] = useState('user');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required')
    }),
    onSubmit: async (values) => {
      setLocalError('');
      const result = await dispatch(loginUser({ email: values.email, password: values.password }));
      
      if (loginUser.fulfilled.match(result)) {
        const loggedInUser = result.payload.user;
        if (selectedRole === 'admin' && loggedInUser.role !== 'admin') {
          // Mismatch: user is NOT admin but selected Admin Mode
          await dispatch(logoutUser());
          setLocalError('Access Denied: You do not have administrator privileges.');
          dispatch(showToast({ 
            message: 'Access Denied: Admin role required.', 
            severity: 'error' 
          }));
        } else {
          dispatch(showToast({ 
            message: `Welcome back, ${loggedInUser.name}!`, 
            severity: 'success' 
          }));
          if (loggedInUser.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
      } else if (loginUser.rejected.match(result)) {
        dispatch(showToast({ 
          message: result.payload || 'Invalid credentials.', 
          severity: 'error' 
        }));
      }
    }
  });

  const displayError = localError || authError;

  return (
    <div className={`auth-wrapper ${selectedRole === 'admin' ? 'admin-theme' : 'user-theme'}`}>
      <Helmet>
        <title>{selectedRole === 'admin' ? 'Admin Portal' : 'User Portal'} | GoEpic Workspace</title>
        <meta name="description" content="Sign in to your GoEpic developer account." />
      </Helmet>

      {/* Floating ambient light particles */}
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />
      <div className="auth-bg-glow-admin" />

      <div className={`auth-card ${selectedRole === 'admin' ? 'admin-theme' : 'user-theme'}`}>
        <h2 className="auth-logo font-title">GoEpic</h2>
        <p className="auth-subtitle">
          {selectedRole === 'admin' ? 'Secure Administrator Terminal' : 'Developer Playground Terminal'}
        </p>

        {/* Sliding Role Switcher Pill */}
        <div className="role-switcher-container">
          <div className="role-slider" />
          <button
            type="button"
            className={`role-switcher-btn ${selectedRole === 'user' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole('user');
              setLocalError('');
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <FiUser style={{ fontSize: '0.95rem' }} /> Developer
            </span>
          </button>
          <button
            type="button"
            className={`role-switcher-btn ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setSelectedRole('admin');
              setLocalError('');
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              <FiShield style={{ fontSize: '0.95rem' }} /> Administrator
            </span>
          </button>
        </div>

        {displayError && (
          <div className="auth-alert auth-alert-error">
            <span>⚠️</span>
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <div className="form-group flex flex-col gap-1.5">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-light-muted dark:text-dark-muted">
                <FiMail />
              </span>
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                style={{ paddingLeft: '42px' }}
                className={`form-control ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : ''}`}
                {...formik.getFieldProps('email')}
              />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.email}</span>
            ) : null}
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="auth-forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-light-muted dark:text-dark-muted">
                <FiLock />
              </span>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                style={{ paddingLeft: '42px' }}
                className={`form-control ${formik.touched.password && formik.errors.password ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500' : ''}`}
                {...formik.getFieldProps('password')}
              />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.password}</span>
            ) : null}
          </div>

          <button
            type="submit"
            className={`btn auth-btn text-white font-bold ${selectedRole === 'admin' ? 'btn-admin' : 'btn-primary'}`}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : selectedRole === 'admin' ? 'Admin Access' : 'Developer Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
