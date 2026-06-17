import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import api from '../services/api';
import { 
  FiFileText, 
  FiHash, 
  FiCheckCircle, 
  FiDatabase, 
  FiEye, 
  FiArrowRight 
} from 'react-icons/fi';
import '../styles/Home.css';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    problems: 0,
    topics: 0,
    solutions: 0,
    datasets: 0
  });
  const [trendingProblems, setTrendingProblems] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchDashboardData = async () => {
        try {
          setLoading(true);
          setError('');
          
          const [
            probRes, 
            topicRes, 
            datasetRes, 
            solRes, 
            trendingRes, 
            popularRes
          ] = await Promise.all([
            api.get('/stats/problems'),
            api.get('/stats/topics'),
            api.get('/stats/datasets'),
            api.get('/stats/total-solutions'),
            api.get('/problems/trending?limit=5'),
            api.get('/topics/popular?limit=5')
          ]);

          setStats({
            problems: probRes.data?.totalProblems || 0,
            topics: topicRes.data?.totalTopics || 0,
            datasets: datasetRes.data?.totalDatasets || 0,
            solutions: solRes.data?.totalSolutions || 0
          });

          setTrendingProblems(trendingRes.data?.data || []);
          setPopularTopics(popularRes.data?.data || []);
        } catch (err) {
          console.error("Error fetching dashboard data:", err);
          setError("Failed to load dashboard metrics. Check server connection.");
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, authLoading, navigate]);

  if (authLoading || (loading && !stats.problems)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-primary-glow)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in">
        {/* Dashboard Welcome Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Developer Workspace</h1>
          <p className="dashboard-subtitle">
            Welcome back, <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{user?.name}</span>. Explore patterns, solve problems, and refine your Go development.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" style={{ marginBottom: '32px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon problems">
              <FiFileText />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.problems}</span>
              <span className="stat-label">Problems</span>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon topics">
              <FiHash />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.topics}</span>
              <span className="stat-label">Topics</span>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon solutions">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.solutions}</span>
              <span className="stat-label">Solutions</span>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon datasets">
              <FiDatabase />
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.datasets}</span>
              <span className="stat-label">Datasets</span>
            </div>
          </div>
        </div>

        {/* Home Sections split view */}
        <div className="dashboard-sections">
          {/* Trending Problems */}
          <div className="glass-card section-card">
            <div className="section-header">
              <h2 className="section-title">Trending Problems</h2>
              <Link to="/problems" className="section-link">
                View All <FiArrowRight style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
              </Link>
            </div>

            <div className="trending-list">
              {trendingProblems.length > 0 ? (
                trendingProblems.map((problem) => (
                  <div 
                    key={problem._id} 
                    className="trending-item"
                    onClick={() => navigate(`/problems/${problem._id}`)}
                  >
                    <div className="trending-item-details">
                      <span className="trending-item-title">{problem.title}</span>
                      <div className="trending-item-meta">
                        <span className={`tag-difficulty ${problem.difficulty}`}>
                          {problem.difficulty}
                        </span>
                        <span>{problem.topic}</span>
                      </div>
                    </div>
                    <div className="trending-item-views">
                      <FiEye />
                      <span>{problem.views || 0}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No trending problems found.</p>
              )}
            </div>
          </div>

          {/* Popular Topics */}
          <div className="glass-card section-card">
            <div className="section-header">
              <h2 className="section-title">Popular Topics</h2>
            </div>

            <div className="topics-list">
              {popularTopics.length > 0 ? (
                popularTopics.map((topic) => (
                  <div 
                    key={topic._id} 
                    className="topic-item-card"
                    onClick={() => navigate(`/problems?topic=${encodeURIComponent(topic.name)}`)}
                  >
                    <span className="topic-item-name">{topic.name}</span>
                    <span className="topic-item-views">
                      {topic.views || 0} views
                    </span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No popular topics found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
