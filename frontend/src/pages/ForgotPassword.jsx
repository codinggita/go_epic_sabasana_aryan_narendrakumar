import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../services/api';
import { showToast } from '../store/slices/uiSlice';
import { FiMail } from 'react-icons/fi';
import '../styles/Auth.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: ''
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required')
    }),
    onSubmit: async (values) => {
      try {
        setError('');
        setSuccess('');
        setLoading(true);
        const res = await api.post('/auth/forgot-password', { email: values.email });
        setSuccess(res.data.message || 'Account verified! Redirecting to password reset...');
        dispatch(showToast({ message: 'Account verified!', severity: 'success' }));
        setTimeout(() => {
          navigate('/reset-password', { state: { email: values.email } });
        }, 2000);
      } catch (err) {
        const errMsg = err.response?.data?.message || 'Could not send reset OTP';
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
        <title>Forgot Password | GoEpic Workspace</title>
        <meta name="description" content="Request a verification code to recover your developer account." />
      </Helmet>

      {/* Floating particles */}
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />

      <div className="auth-card user-theme">
        <h2 className="auth-logo font-title">GoEpic</h2>
        <p className="auth-subtitle">Verify Account for Password Reset</p>

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

        <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
          <div className="form-group flex flex-col gap-1.5" style={{ marginBottom: '10px' }}>
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

          <button
            type="submit"
            className="btn btn-primary auth-btn text-white font-bold"
            disabled={loading}
          >
            {loading ? 'Verifying account...' : 'Verify Account'}
          </button>
        </form>

        <div className="auth-footer">
          Remember your password? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
