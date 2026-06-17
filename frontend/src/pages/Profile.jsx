import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../hooks/useAuth';
import { showToast } from '../store/slices/uiSlice';
import Layout from '../components/Layout';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiCalendar, 
  FiShield, 
  FiSave, 
  FiCheckCircle 
} from 'react-icons/fi';
import '../styles/Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('details');
  const [updatingDetails, setUpdatingDetails] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Format initials for avatar display
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format created date
  const formatJoinedDate = (dateString) => {
    if (!dateString) return 'Joined Recently';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Formik for Details Tab
  const detailsFormik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
    }),
    onSubmit: async (values) => {
      try {
        setUpdatingDetails(true);
        await updateProfile(values);
        dispatch(
          showToast({
            message: 'Profile details updated successfully!',
            severity: 'success',
          })
        );
      } catch (err) {
        dispatch(
          showToast({
            message: err.message || 'Failed to update profile.',
            severity: 'error',
          })
        );
      } finally {
        setUpdatingDetails(false);
      }
    },
  });

  // Formik for Password Tab
  const passwordFormik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('New password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Confirming password is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setUpdatingPassword(true);
        await updateProfile({ password: values.password });
        dispatch(
          showToast({
            message: 'Password changed successfully!',
            severity: 'success',
          })
        );
        resetForm();
      } catch (err) {
        dispatch(
          showToast({
            message: err.message || 'Failed to change password.',
            severity: 'error',
          })
        );
      } finally {
        setUpdatingPassword(false);
      }
    },
  });

  return (
    <Layout>
      <Helmet>
        <title>Developer Profile | GoEpic Pattern Hub</title>
        <meta name="description" content="View and manage your developer profile, security clearances, and password settings." />
      </Helmet>

      <div className="profile-container animate-fade-in">
        <div className="dashboard-header mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-light-text dark:text-dark-text font-title">
            My Account
          </h1>
          <p className="text-sm mt-2 text-light-muted dark:text-dark-muted">
            Manage your developer workspace credentials, contact email, and security configurations.
          </p>
        </div>

        <div className="profile-layout">
          {/* Left Column: Summary Card */}
          <div className="profile-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-large">
                {getInitials(user?.name)}
              </div>
              <div className="profile-avatar-ring"></div>
            </div>

            <h2 className="profile-user-name">{user?.name || 'Developer'}</h2>
            <p className="profile-user-email">{user?.email || 'name@example.com'}</p>

            <span className={`profile-role-badge ${user?.role || 'user'}`}>
              {user?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'DEVELOPER'}
            </span>

            <div className="profile-stats-divider"></div>

            <div className="profile-stat-item">
              <span className="profile-stat-label">
                <FiCalendar style={{ display: 'inline', marginRight: '6px', transform: 'translateY(-1px)' }} />
                Member Since
              </span>
              <span className="profile-stat-value">
                {formatJoinedDate(user?.createdAt)}
              </span>
            </div>

            <div className="profile-stat-item">
              <span className="profile-stat-label">
                <FiShield style={{ display: 'inline', marginRight: '6px', transform: 'translateY(-1px)' }} />
                Clearance Level
              </span>
              <span className="profile-stat-value" style={{ textTransform: 'capitalize' }}>
                {user?.role || 'User'}
              </span>
            </div>
          </div>

          {/* Right Column: Tabbed Edit Pane */}
          <div className="profile-main-content">
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Personal Details
              </button>
              <button
                className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
                onClick={() => setActiveTab('password')}
              >
                Account Security
              </button>
            </div>

            {/* Tab Content: Edit Details */}
            {activeTab === 'details' && (
              <form onSubmit={detailsFormik.handleSubmit} className="profile-form-section">
                <div className="profile-form-group">
                  <label className="profile-form-label" htmlFor="name">Full Name</label>
                  <div className="profile-input-wrapper">
                    <FiUser className="profile-input-icon" />
                    <input
                      type="text"
                      id="name"
                      className={`profile-form-control ${
                        detailsFormik.touched.name && detailsFormik.errors.name ? 'error' : ''
                      }`}
                      placeholder="Alex Johnson"
                      {...detailsFormik.getFieldProps('name')}
                    />
                  </div>
                  {detailsFormik.touched.name && detailsFormik.errors.name ? (
                    <span className="profile-error-message">{detailsFormik.errors.name}</span>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label" htmlFor="email">Email Address</label>
                  <div className="profile-input-wrapper">
                    <FiMail className="profile-input-icon" />
                    <input
                      type="email"
                      id="email"
                      className={`profile-form-control ${
                        detailsFormik.touched.email && detailsFormik.errors.email ? 'error' : ''
                      }`}
                      placeholder="alex.johnson@example.com"
                      {...detailsFormik.getFieldProps('email')}
                    />
                  </div>
                  {detailsFormik.touched.email && detailsFormik.errors.email ? (
                    <span className="profile-error-message">{detailsFormik.errors.email}</span>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="profile-btn-submit"
                  disabled={updatingDetails || !detailsFormik.dirty}
                >
                  <FiSave /> {updatingDetails ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </form>
            )}

            {/* Tab Content: Change Password */}
            {activeTab === 'password' && (
              <form onSubmit={passwordFormik.handleSubmit} className="profile-form-section">
                <div className="profile-form-group">
                  <label className="profile-form-label" htmlFor="password">New Password</label>
                  <div className="profile-input-wrapper">
                    <FiLock className="profile-input-icon" />
                    <input
                      type="password"
                      id="password"
                      className={`profile-form-control ${
                        passwordFormik.touched.password && passwordFormik.errors.password ? 'error' : ''
                      }`}
                      placeholder="••••••••"
                      {...passwordFormik.getFieldProps('password')}
                    />
                  </div>
                  {passwordFormik.touched.password && passwordFormik.errors.password ? (
                    <span className="profile-error-message">{passwordFormik.errors.password}</span>
                  ) : null}
                </div>

                <div className="profile-form-group">
                  <label className="profile-form-label" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="profile-input-wrapper">
                    <FiLock className="profile-input-icon" />
                    <input
                      type="password"
                      id="confirmPassword"
                      className={`profile-form-control ${
                        passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? 'error' : ''
                      }`}
                      placeholder="••••••••"
                      {...passwordFormik.getFieldProps('confirmPassword')}
                    />
                  </div>
                  {passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? (
                    <span className="profile-error-message">{passwordFormik.errors.confirmPassword}</span>
                  ) : null}
                </div>

                <button
                  type="submit"
                  className="profile-btn-submit"
                  disabled={updatingPassword || !passwordFormik.dirty}
                >
                  <FiCheckCircle /> {updatingPassword ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
