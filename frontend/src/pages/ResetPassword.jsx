import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { showToast } from '../store/slices/uiSlice';
import { FiMail, FiLock, FiKey } from 'react-icons/fi';
import '../styles/Auth.css';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: location.state?.email || '',
      newPassword: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      newPassword: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        setSuccess('');
        setLoading(true);
        const res = await api.post('/auth/reset-password', {
          email: values.email,
          newPassword: values.newPassword
        });
        setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
        dispatch(showToast({ message: 'Password reset successfully!', severity: 'success' }));
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Failed to reset password';
        setError(errMsg);
        dispatch(showToast({ message: errMsg, severity: 'error' }));
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="auth-wrapper user-theme">
      <Helmet>
        <title>Reset Password | GoEpic Workspace</title>
        <meta name="description" content="Enter your OTP code and new password credentials." />
      </Helmet>

      {/* Floating ambient glows */}
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />

      <div className="auth-card user-theme">
        <h2 className="auth-logo font-title">GoEpic</h2>
        <p className="auth-subtitle">Set your new password</p>

        {error && (
          <div className="auth-alert auth-alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert-success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
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
                className={`form-control ${formik.touched.email && formik.errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                {...formik.getFieldProps('email')}
              />
            </div>
            {formik.touched.email && formik.errors.email ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.email}</span>
            ) : null}
          </div>



          <div className="form-group flex flex-col gap-1.5">
            <label className="form-label" htmlFor="newPassword">New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-light-muted dark:text-dark-muted">
                <FiLock />
              </span>
              <input
                type="password"
                id="newPassword"
                placeholder="••••••••"
                style={{ paddingLeft: '42px' }}
                className={`form-control ${formik.touched.newPassword && formik.errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                {...formik.getFieldProps('newPassword')}
              />
            </div>
            {formik.touched.newPassword && formik.errors.newPassword ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.newPassword}</span>
            ) : null}
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="form-label" htmlFor="confirmPassword">Confirm New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-light-muted dark:text-dark-muted">
                <FiLock />
              </span>
              <input
                type="password"
                id="confirmPassword"
                placeholder="••••••••"
                style={{ paddingLeft: '42px' }}
                className={`form-control ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                {...formik.getFieldProps('confirmPassword')}
              />
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.confirmPassword}</span>
            ) : null}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn text-white font-bold"
            disabled={loading}
          >
            {loading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>

        <div className="auth-footer">
          Back to <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
