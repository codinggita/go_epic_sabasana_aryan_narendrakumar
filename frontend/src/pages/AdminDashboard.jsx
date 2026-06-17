import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import api from '../services/api';
import { showToast } from '../store/slices/uiSlice';
import { 
  fetchUsers, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../store/slices/userSlice';
import { TableSkeleton } from '../components/SkeletonLoader';
import { useFormik } from 'formik';
import * as Yup from 'yup';

// MUI imports for modal dialogs and form controls
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  DialogContentText
} from '@mui/material';

import { 
  FiDatabase, 
  FiCode, 
  FiCheckSquare, 
  FiEye, 
  FiUpload, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiLock,
  FiActivity,
  FiTerminal,
  FiLayers,
  FiUsers,
  FiEdit,
  FiTrash2,
  FiPlus
} from 'react-icons/fi';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Tab state: 'telemetry' | 'users'
  const [activeTab, setActiveTab] = useState('telemetry');

  // Stats states
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // Bulk Ingestion states
  const [jsonText, setJsonText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importing, setImporting] = useState(false);

  // User CRUD states
  const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.users);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null for create, user object for edit
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setStatsLoading(true);
      setStatsError('');
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setStats(res.data.data.stats);
        setRecentActivity(res.data.data.recentActivity);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setStatsError(err.response?.data?.message || "Failed to fetch admin metrics. Check connection.");
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchDashboardData();
      dispatch(fetchUsers());
    }
  }, [user, authLoading, navigate, dispatch]);

  // Bulk Import Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file) => {
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setImportStatus({
        success: false,
        message: 'Please upload a valid JSON file (.json)'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        setJsonText(JSON.stringify(parsed, null, 2));
        setImportStatus({
          success: true,
          message: `Loaded "${file.name}" successfully. Ready to import.`
        });
      } catch (err) {
        setImportStatus({
          success: false,
          message: `Failed to parse JSON: ${err.message}`
        });
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      readFile(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!jsonText.trim()) {
      dispatch(showToast({ message: 'Payload is empty.', severity: 'warning' }));
      return;
    }

    try {
      setImporting(true);
      setImportStatus(null);
      let payload;
      try {
        payload = JSON.parse(jsonText);
      } catch (err) {
        setImportStatus({
          success: false,
          message: `Invalid JSON syntax: ${err.message}`
        });
        setImporting(false);
        return;
      }

      const res = await api.post('/problems/import-json', payload);
      if (res.data && res.data.success) {
        setImportStatus({
          success: true,
          message: res.data.message,
          details: {
            count: res.data.count,
            failedCount: res.data.failedCount,
            errors: res.data.errors
          }
        });
        dispatch(showToast({ message: `Successfully imported ${res.data.count} problems!`, severity: 'success' }));
        setJsonText('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Import error:", err);
      const apiError = err.response?.data;
      setImportStatus({
        success: false,
        message: apiError?.message || 'Failed to import problems.',
        details: apiError?.errors ? { errors: apiError.errors } : (apiError?.data ? { errors: apiError.data } : null)
      });
      dispatch(showToast({ message: 'Ingestion task rejected.', severity: 'error' }));
    } finally {
      setImporting(false);
    }
  };

  // Formik for User Create/Edit Dialog
  const userFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      password: '',
      role: editingUser?.role || 'user'
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: editingUser 
        ? Yup.string().min(6, 'Password must be at least 6 characters') // optional on edit
        : Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      role: Yup.string().oneOf(['user', 'admin']).required('Role is required')
    }),
    onSubmit: async (values) => {
      const payload = { ...values };
      if (editingUser && !payload.password) {
        delete payload.password; // do not send empty password on update
      }

      if (editingUser) {
        const result = await dispatch(updateUser({ userId: editingUser._id, userData: payload }));
        if (updateUser.fulfilled.match(result)) {
          dispatch(showToast({ message: 'User details updated successfully!', severity: 'success' }));
          setUserModalOpen(false);
        } else {
          dispatch(showToast({ message: result.payload || 'Failed to update user', severity: 'error' }));
        }
      } else {
        const result = await dispatch(createUser(payload));
        if (createUser.fulfilled.match(result)) {
          dispatch(showToast({ message: 'New user created successfully!', severity: 'success' }));
          setUserModalOpen(false);
        } else {
          dispatch(showToast({ message: result.payload || 'Failed to create user', severity: 'error' }));
        }
      }
    }
  });

  const openCreateModal = () => {
    setEditingUser(null);
    userFormik.resetForm();
    setUserModalOpen(true);
  };

  const openEditModal = (userObj) => {
    setEditingUser(userObj);
    setUserModalOpen(true);
  };

  const openDeleteConfirm = (userObj) => {
    setUserToDelete(userObj);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    const result = await dispatch(deleteUser(userToDelete._id));
    if (deleteUser.fulfilled.match(result)) {
      dispatch(showToast({ message: 'User deleted successfully!', severity: 'success' }));
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    } else {
      dispatch(showToast({ message: result.payload || 'Could not delete user.', severity: 'error' }));
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Verifying access credentials...</p>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '4.5rem', color: 'var(--color-advanced)', marginBottom: '24px' }}>
            <FiLock />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', fontFamily: 'var(--font-title)' }}>Access Restricted</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', marginBottom: '32px', fontSize: '1rem', lineHeight: '1.6' }}>
            This workspace section is reserved for system administrators. Please return to the standard developer home page.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Back to Home Dashboard
          </button>
        </div>
      </Layout>
    );
  }

  const formatPercentage = (val, total) => {
    if (!total) return '0%';
    return `${Math.round((val / total) * 100)}%`;
  };

  const totalProblemsCount = stats?.totalProblems || 0;

  return (
    <Layout>
      <Helmet>
        <title>Operations Control | GoEpic Admin Panel</title>
        <meta name="description" content="Ingest collections, verify payloads, and perform user CRUD administration." />
      </Helmet>

      <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
        
        {/* Header */}
        <div className="admin-header">
          <div className="admin-badge">
            <FiActivity style={{ fontSize: '0.9rem' }} /> Operations Center
          </div>
          <h1 className="admin-title">System Panel</h1>
          <p className="dashboard-subtitle">
            Admin Dashboard to monitor dataset ingestion, manage question libraries, and ingestion payloads.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="admin-tabs">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`admin-tab ${activeTab === 'telemetry' ? 'active' : ''}`}
          >
            <FiActivity /> Telemetry & Ingestion
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          >
            <FiUsers /> User Directory
          </button>
        </div>

        {activeTab === 'telemetry' ? (
          <>
            {/* Loading Stats */}
            {statsLoading && !stats ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
                <div className="spinner" />
                <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Syncing platform telemetry...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="admin-stats-grid responsive-grid">
                  <div className="glass-card admin-stat-card">
                    <span className="admin-stat-icon"><FiCode /></span>
                    <div className="admin-stat-value">{stats?.totalProblems}</div>
                    <div className="admin-stat-label">Total Problems</div>
                  </div>
                  <div className="glass-card admin-stat-card">
                    <span className="admin-stat-icon"><FiLayers /></span>
                    <div className="admin-stat-value">{stats?.totalTopics}</div>
                    <div className="admin-stat-label">Total Topics</div>
                  </div>
                  <div className="glass-card admin-stat-card">
                    <span className="admin-stat-icon"><FiCheckSquare /></span>
                    <div className="admin-stat-value">{stats?.totalSolutions}</div>
                    <div className="admin-stat-label">Total Solutions</div>
                  </div>
                  <div className="glass-card admin-stat-card">
                    <span className="admin-stat-icon"><FiDatabase /></span>
                    <div className="admin-stat-value">{stats?.totalDatasets}</div>
                    <div className="admin-stat-label">Total Datasets</div>
                  </div>
                  <div className="glass-card admin-stat-card">
                    <span className="admin-stat-icon"><FiEye /></span>
                    <div className="admin-stat-value">{stats?.totalViews}</div>
                    <div className="admin-stat-label">Telemetry Views</div>
                  </div>
                </div>

                {/* Dashboard layout grids */}
                <div className="admin-layout responsive-grid">
                  {/* Left: Library stats */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
                    <div className="glass-card" style={{ minHeight: '320px' }}>
                      <h2 className="text-lg font-bold font-title text-light-text dark:text-dark-text mb-2">Library Profile</h2>
                      <p className="text-xs text-light-muted dark:text-dark-muted mb-6">
                        Distribution of code problems categorized by intellectual difficulty levels.
                      </p>

                      <div className="difficulty-bars">
                        <div className="difficulty-bar-row">
                          <span className="difficulty-bar-label text-xs text-light-text dark:text-dark-text font-bold">Easy</span>
                          <div className="difficulty-bar-track">
                            <div 
                              className="difficulty-bar-fill easy" 
                              style={{ width: formatPercentage(stats?.difficultyBreakdown?.easy || 0, totalProblemsCount) }}
                            />
                          </div>
                          <span className="difficulty-bar-count text-xs text-light-muted dark:text-dark-muted">{stats?.difficultyBreakdown?.easy || 0}</span>
                        </div>

                        <div className="difficulty-bar-row">
                          <span className="difficulty-bar-label text-xs text-light-text dark:text-dark-text font-bold">Medium</span>
                          <div className="difficulty-bar-track">
                            <div 
                              className="difficulty-bar-fill medium" 
                              style={{ width: formatPercentage(stats?.difficultyBreakdown?.medium || 0, totalProblemsCount) }}
                            />
                          </div>
                          <span className="difficulty-bar-count text-xs text-light-muted dark:text-dark-muted">{stats?.difficultyBreakdown?.medium || 0}</span>
                        </div>

                        <div className="difficulty-bar-row">
                          <span className="difficulty-bar-label text-xs text-light-text dark:text-dark-text font-bold">Advanced</span>
                          <div className="difficulty-bar-track">
                            <div 
                              className="difficulty-bar-fill advanced" 
                              style={{ width: formatPercentage(stats?.difficultyBreakdown?.advanced || 0, totalProblemsCount) }}
                            />
                          </div>
                          <span className="difficulty-bar-count text-xs text-light-muted dark:text-dark-muted">{stats?.difficultyBreakdown?.advanced || 0}</span>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card flex flex-col" style={{ minHeight: '320px' }}>
                      <h2 className="text-lg font-bold font-title text-light-text dark:text-dark-text mb-2">Recent Ingested Problems</h2>
                      <p className="text-xs text-light-muted dark:text-dark-muted mb-4">
                        Latest entries synced into the core MongoDB document collection.
                      </p>

                      <div style={{ overflowX: 'auto' }}>
                        <table className="recent-table">
                          <thead>
                            <tr>
                              <th>Title</th>
                              <th>Topic</th>
                              <th>Difficulty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentActivity?.problems && recentActivity.problems.length > 0 ? (
                              recentActivity.problems.map((problem) => {
                                const normDiff = (() => {
                                  const d = (problem.difficulty || '').toLowerCase();
                                  if (d === 'easy' || d === 'beginner') return 'easy';
                                  if (d === 'medium' || d === 'intermediate') return 'medium';
                                  if (d === 'advanced' || d === 'hard' || d === 'difficult') return 'advanced';
                                  return 'medium';
                                })();
                                const title = problem.instruction 
                                  ? (problem.instruction.length > 60 ? problem.instruction.substring(0, 60) + '...' : problem.instruction)
                                  : (problem.title || 'Untitled');
                                return (
                                  <tr key={problem._id}>
                                    <td>
                                      <Link to={`/problems/${problem._id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover-link">
                                        {title}
                                      </Link>
                                    </td>
                                    <td>{problem.topic}</td>
                                    <td>
                                      <span className={`tag-difficulty ${normDiff}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                        {normDiff}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                                  No problems found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right: Ingestion drag drop */}
                  <div style={{ minWidth: 0 }}>
                    <div className="glass-card import-section h-full flex flex-col" style={{ minHeight: '320px' }}>
                      <h2 className="import-section-title text-lg font-bold text-light-text dark:text-dark-text font-title">Bulk JSON Ingestion</h2>
                      <p className="import-section-desc text-xs text-light-muted dark:text-dark-muted mb-6">
                        Import multiple problems simultaneously using GoEpic format schema. Support dropping a <code>.json</code> file or pasting JSON array data directly below.
                      </p>

                      <div 
                        className={`dropzone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          accept=".json,application/json" 
                          style={{ display: 'none' }}
                        />
                        <FiUpload className="dropzone-icon" />
                        <div className="dropzone-text text-sm">
                          Drag & drop your <strong>go-epic.json</strong> file or <strong>click to browse</strong>.
                        </div>
                      </div>

                      <div className="import-divider">
                        <span>OR PASTE RAW DATA</span>
                      </div>

                      <form onSubmit={handleImportSubmit} className="flex flex-col gap-4 flex-1">
                        <textarea
                          className="form-control import-textarea"
                          placeholder={`[\n  {\n    "title": "Weighted Semaphore",\n    "instruction": "Implement weighted semaphores...",\n    "topic": "concurrency",\n    "difficulty": "advanced"\n  }\n]`}
                          value={jsonText}
                          onChange={(e) => setJsonText(e.target.value)}
                        />

                        <button 
                          type="submit" 
                          className="btn btn-primary w-full py-3 text-white font-bold flex items-center justify-center gap-2"
                          disabled={importing || !jsonText.trim()}
                        >
                          {importing ? (
                            <>
                              <div className="spinner w-4 h-4 border-2" />
                              Ingesting Payloads...
                            </>
                          ) : (
                            <>
                              <FiTerminal /> Run Ingestion Engine
                            </>
                          )}
                        </button>
                      </form>

                      {importStatus && (
                        <div className={`import-result mt-4 ${importStatus.success ? 'success' : 'error'}`}>
                          <div className="flex items-start gap-3">
                            <div className="text-lg">
                              {importStatus.success ? <FiCheckCircle /> : <FiAlertTriangle />}
                            </div>
                            <div className="flex-1 text-xs">
                              <div className="font-bold mb-1">
                                {importStatus.success ? 'Payload Loaded' : 'Ingestion Error'}
                              </div>
                              <div>{importStatus.message}</div>
                              {importStatus.details?.errors && (
                                <div className="mt-2 max-h-32 overflow-y-auto bg-black/10 p-2 rounded text-[10px] font-mono">
                                  {importStatus.details.errors.slice(0, 5).map((e, i) => (
                                    <div key={i} className="mb-1">
                                      Index {e.index !== undefined ? e.index : i}: {e.error || e.message}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* User CRUD panel */
          <div className="glass-card">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <div>
                <h2 className="text-xl font-bold font-title text-light-text dark:text-dark-text">User Directory</h2>
                <p className="text-xs text-light-muted dark:text-dark-muted mt-1">
                  Manage accounts, view activity logs, and edit credentials.
                </p>
              </div>
              <button 
                onClick={openCreateModal}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <FiPlus /> Register New Account
              </button>
            </div>

            {usersLoading && users.length === 0 ? (
              <TableSkeleton rows={5} />
            ) : usersError ? (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-sm">
                <span>⚠️</span> {usersError}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="recent-table w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Registered On</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'admin' 
                              ? 'bg-light-primary/10 text-light-primary dark:bg-dark-primary/10 dark:text-dark-primary' 
                              : 'bg-light-muted/10 text-light-muted dark:bg-dark-muted/10 dark:text-dark-muted'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => openEditModal(u)}
                              className="text-light-text dark:text-dark-text hover:text-brand-lightPrimary dark:hover:text-brand-darkPrimary text-sm p-1.5 rounded hover:bg-black/5"
                              title="Edit User"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => openDeleteConfirm(u)}
                              disabled={u._id === user._id}
                              className={`text-sm p-1.5 rounded hover:bg-black/5 ${
                                u._id === user._id 
                                  ? 'text-light-muted dark:text-dark-muted opacity-30 cursor-not-allowed' 
                                  : 'text-red-500 hover:text-red-600'
                              }`}
                              title={u._id === user._id ? 'You cannot delete yourself' : 'Delete User'}
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CREATE/EDIT USER DIALOG (MUI) */}
      <Dialog 
        open={userModalOpen} 
        onClose={() => setUserModalOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            backgroundImage: 'none',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>
          {editingUser ? 'Edit Developer Account' : 'Register New Account'}
        </DialogTitle>
        <form onSubmit={userFormik.handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              name="name"
              label="Full Name"
              variant="outlined"
              fullWidth
              size="small"
              value={userFormik.values.name}
              onChange={userFormik.handleChange}
              error={userFormik.touched.name && Boolean(userFormik.errors.name)}
              helperText={userFormik.touched.name && userFormik.errors.name}
              InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
              inputProps={{ style: { color: 'var(--text-primary)', fontFamily: 'Inter' } }}
            />
            
            <TextField
              name="email"
              label="Email Address"
              variant="outlined"
              fullWidth
              size="small"
              value={userFormik.values.email}
              onChange={userFormik.handleChange}
              error={userFormik.touched.email && Boolean(userFormik.errors.email)}
              helperText={userFormik.touched.email && userFormik.errors.email}
              InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
              inputProps={{ style: { color: 'var(--text-primary)', fontFamily: 'Inter' } }}
            />

            <TextField
              name="password"
              label={editingUser ? "New Password (Leave blank to keep same)" : "Password"}
              type="password"
              variant="outlined"
              fullWidth
              size="small"
              value={userFormik.values.password}
              onChange={userFormik.handleChange}
              error={userFormik.touched.password && Boolean(userFormik.errors.password)}
              helperText={userFormik.touched.password && userFormik.errors.password}
              InputLabelProps={{ style: { color: 'var(--text-secondary)' } }}
              inputProps={{ style: { color: 'var(--text-primary)', fontFamily: 'Inter' } }}
            />

            <FormControl fullWidth size="small">
              <InputLabel id="role-select-label" style={{ color: 'var(--text-secondary)' }}>System Role</InputLabel>
              <Select
                labelId="role-select-label"
                name="role"
                value={userFormik.values.role}
                label="System Role"
                onChange={userFormik.handleChange}
                sx={{ color: 'var(--text-primary)' }}
              >
                <MenuItem value="user">User (Standard solver access)</MenuItem>
                <MenuItem value="admin">Admin (System level control)</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          
          <DialogActions sx={{ padding: '16px 24px' }}>
            <Button 
              onClick={() => setUserModalOpen(false)} 
              sx={{ color: 'var(--text-secondary)' }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={usersLoading}
            >
              {editingUser ? 'Save Updates' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG (MUI) */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Outfit', fontWeight: 700 }}>
          Confirm Account Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Are you sure you want to permanently delete the developer account for{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{userToDelete?.name}</strong> ({userToDelete?.email})? 
            This action will disconnect the user and cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            sx={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error"
            disabled={usersLoading}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

    </Layout>
  );
};

export default AdminDashboard;
