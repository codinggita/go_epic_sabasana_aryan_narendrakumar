import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FiDatabase, 
  FiCode, 
  FiCheckSquare, 
  FiEye, 
  FiUpload, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiFileText, 
  FiLock,
  FiActivity,
  FiTerminal,
  FiLayers
} from 'react-icons/fi';
import '../styles/Admin.css';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Import states
  const [jsonText, setJsonText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [importing, setImporting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admin/dashboard');
      if (res.data && res.data.success) {
        setStats(res.data.data.stats);
        setRecentActivity(res.data.data.recentActivity);
      }
    } catch (err) {
      console.error("Error fetching admin dashboard data:", err);
      setError(err.response?.data?.message || "Failed to fetch admin metrics. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, authLoading, navigate]);

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
          message: `Loaded "${file.name}" successfully (${Array.isArray(parsed) ? parsed.length : (parsed.problems ? parsed.problems.length : 'nested')} objects found). Click Import to publish.`
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
      setImportStatus({
        success: false,
        message: 'Please paste JSON data or drop a file first.'
      });
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
        setJsonText('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error("Import error:", err);
      const apiError = err.response?.data;
      setImportStatus({
        success: false,
        message: apiError?.message || 'Failed to import problems. Please verify schema structure.',
        details: apiError?.errors ? { errors: apiError.errors } : (apiError?.data ? { errors: apiError.data } : null)
      });
    } finally {
      setImporting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-glow)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Verifying access credentials...</p>
      </div>
    );
  }

  if (user && user.role !== 'admin') {
    return (
      <Layout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '4.5rem', color: 'var(--color-advanced)', marginBottom: '24px', filter: 'drop-shadow(0 0 15px rgba(244, 63, 94, 0.2))' }}>
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
      <div className="animate-fade-in" style={{ paddingBottom: '60px' }}>
        
        {/* Header */}
        <div className="admin-header">
          <div className="admin-badge">
            <FiActivity style={{ fontSize: '0.9rem' }} /> Control Center
          </div>
          <h1 className="admin-title">System Operations</h1>
          <p className="dashboard-subtitle">
            Admin Dashboard to monitor dataset ingestion, manage question libraries, and ingestion payloads.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" style={{ marginBottom: '32px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Loading State */}
        {loading && !stats ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-glow)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Syncing platform telemetry...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="admin-stats-grid">
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

            {/* Layout Column breakdown */}
            <div className="admin-layout">
              
              {/* Left Column: Difficulty & Recent Activity */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Difficulty breakdown */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Library Profile</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Distribution of code problems categorized by intellectual difficulty levels.
                  </p>

                  <div className="difficulty-bars">
                    <div className="difficulty-bar-row">
                      <span className="difficulty-bar-label">Easy</span>
                      <div className="difficulty-bar-track">
                        <div 
                          className="difficulty-bar-fill easy" 
                          style={{ width: formatPercentage(stats?.difficultyBreakdown?.easy || 0, totalProblemsCount) }}
                        />
                      </div>
                      <span className="difficulty-bar-count">{stats?.difficultyBreakdown?.easy || 0}</span>
                    </div>

                    <div className="difficulty-bar-row">
                      <span className="difficulty-bar-label">Medium</span>
                      <div className="difficulty-bar-track">
                        <div 
                          className="difficulty-bar-fill medium" 
                          style={{ width: formatPercentage(stats?.difficultyBreakdown?.medium || 0, totalProblemsCount) }}
                        />
                      </div>
                      <span className="difficulty-bar-count">{stats?.difficultyBreakdown?.medium || 0}</span>
                    </div>

                    <div className="difficulty-bar-row">
                      <span className="difficulty-bar-label">Advanced</span>
                      <div className="difficulty-bar-track">
                        <div 
                          className="difficulty-bar-fill advanced" 
                          style={{ width: formatPercentage(stats?.difficultyBreakdown?.advanced || 0, totalProblemsCount) }}
                        />
                      </div>
                      <span className="difficulty-bar-count">{stats?.difficultyBreakdown?.advanced || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Items Table */}
                <div className="glass-card" style={{ padding: '28px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '6px' }}>Recent Ingested Problems</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    Latest entries synced into the core MongoDB document collection.
                  </p>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="recent-table">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Topic</th>
                          <th>Difficulty</th>
                          <th>Ingestion Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentActivity?.problems && recentActivity.problems.length > 0 ? (
                          recentActivity.problems.map((problem) => (
                            <tr key={problem._id}>
                              <td>
                                <Link to={`/problems/${problem._id}`} style={{ color: 'inherit', textDecoration: 'none' }} className="hover-link">
                                  {problem.title}
                                </Link>
                              </td>
                              <td>{problem.topic}</td>
                              <td>
                                <span className={`tag-difficulty ${problem.difficulty}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                                  {problem.difficulty}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {new Date(problem.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                              No problems found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Bulk JSON Ingestion */}
              <div>
                <div className="glass-card import-section" style={{ padding: '28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h2 className="import-section-title">Bulk JSON Ingestion</h2>
                  <p className="import-section-desc">
                    Import multiple problems simultaneously using GoEpic format schema. Support dropping a <code>.json</code> file or pasting JSON array data directly below.
                  </p>

                  {/* Drag and Drop Zone */}
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
                    <div className="dropzone-text">
                      Drag & drop your <strong>go-epic.json</strong> file or <strong>click to browse</strong>.
                    </div>
                  </div>

                  <div className="import-divider">
                    <span>OR PASTE RAW DATA</span>
                  </div>

                  {/* Pasting Field */}
                  <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <textarea
                      className="form-control import-textarea"
                      placeholder={`[\n  {\n    "title": "Weighted Semaphore",\n    "instruction": "Implement weighted semaphores...",\n    "topic": "concurrency",\n    "difficulty": "advanced"\n  }\n]`}
                      value={jsonText}
                      onChange={(e) => setJsonText(e.target.value)}
                    />

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={importing || !jsonText.trim()}
                      style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      {importing ? (
                        <>
                          <div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
                          Ingesting Payloads...
                        </>
                      ) : (
                        <>
                          <FiTerminal /> Run Ingestion Engine
                        </>
                      )}
                    </button>
                  </form>

                  {/* Feedback Status */}
                  {importStatus && (
                    <div className={`import-result ${importStatus.success ? 'success' : 'error'}`}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ fontSize: '1.15rem', marginTop: '2px' }}>
                          {importStatus.success ? <FiCheckCircle /> : <FiAlertTriangle />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                            {importStatus.success ? 'Payload Loaded Successfully' : 'Ingestion Refused'}
                          </div>
                          <div>{importStatus.message}</div>
                          
                          {/* Errors details breakdown */}
                          {importStatus.details && importStatus.details.errors && importStatus.details.errors.length > 0 && (
                            <div style={{ marginTop: '10px', maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px', fontSize: '0.8rem', fontFamily: 'var(--font-code)' }}>
                              <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                                Validation Errors ({importStatus.details.errors.length}):
                              </strong>
                              <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                {importStatus.details.errors.slice(0, 10).map((err, idx) => (
                                  <li key={idx} style={{ marginBottom: '4px' }}>
                                    Index {err.index !== undefined ? err.index : idx}: {err.error || err.message || JSON.stringify(err)}
                                  </li>
                                ))}
                                {importStatus.details.errors.length > 10 && (
                                  <li style={{ color: 'var(--text-muted)', listStyle: 'none', marginLeft: '-16px', marginTop: '6px' }}>
                                    ...and {importStatus.details.errors.length - 10} more.
                                  </li>
                                )}
                              </ul>
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
      </div>
    </Layout>
  );
};

export default AdminDashboard;
