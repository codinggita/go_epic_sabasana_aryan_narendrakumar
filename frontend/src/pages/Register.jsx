import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/uiSlice';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [success, setSuccess] = useState('');
  
  const { loading, error } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password')
    }),
    onSubmit: async (values) => {
      const result = await dispatch(registerUser({ name: values.name, email: values.email, password: values.password }));
      if (registerUser.fulfilled.match(result)) {
        setSuccess('Account created successfully! Redirecting to login...');
        dispatch(showToast({ message: 'Account registered successfully!', severity: 'success' }));
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        dispatch(showToast({ message: result.payload || 'Registration failed.', severity: 'error' }));
      }
    }
  });

  return (
    <div className="auth-wrapper user-theme">
      <Helmet>
        <title>Create Account | GoEpic Workspace</title>
        <meta name="description" content="Create your GoEpic developer account." />
      </Helmet>

      {/* Floating particles */}
      <div className="auth-bg-glow-1" />
      <div className="auth-bg-glow-2" />

      <div className="auth-card user-theme">
        <h2 className="auth-logo font-title">GoEpic</h2>
        <p className="auth-subtitle">Create your developer platform account</p>

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
            <label className="form-label" htmlFor="name">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-light-muted dark:text-dark-muted">
                <FiUser />
              </span>
              <input
                type="text"
                id="name"
                placeholder="Alex Johnson"
                style={{ paddingLeft: '42px' }}
                className={`form-control ${formik.touched.name && formik.errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                {...formik.getFieldProps('name')}
              />
            </div>
            {formik.touched.name && formik.errors.name ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.name}</span>
            ) : null}
          </div>

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
            <label className="form-label" htmlFor="password">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-light-muted dark:text-dark-muted">
                <FiLock />
              </span>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                style={{ paddingLeft: '42px' }}
                className={`form-control ${formik.touched.password && formik.errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
                {...formik.getFieldProps('password')}
              />
            </div>
            {formik.touched.password && formik.errors.password ? (
              <span className="text-xs text-red-500 font-semibold">{formik.errors.password}</span>
            ) : null}
          </div>

          <div className="form-group flex flex-col gap-1.5">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
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
            {loading ? 'Creating space...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
