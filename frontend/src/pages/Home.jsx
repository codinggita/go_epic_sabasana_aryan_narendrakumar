import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import api from '../services/api';
import { CardSkeleton } from '../components/SkeletonLoader';
import { 
  FiFileText, 
  FiHash, 
  FiCheckCircle, 
  FiDatabase, 
  FiEye, 
  FiArrowRight, 
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
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
  const [difficultyData, setDifficultyData] = useState([]);
  const [trendingProblems, setTrendingProblems] = useState([]);
  const [popularTopics, setPopularTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      const fetchHomeData = async () => {
        try {
          setLoading(true);
          setError('');
          
          const [
            probRes, 
            topicRes, 
            datasetRes, 
            solRes, 
            diffRes,
            trendingRes, 
            popularRes
          ] = await Promise.all([
            api.get('/stats/problems'),
            api.get('/stats/topics'),
            api.get('/stats/datasets'),
            api.get('/stats/total-solutions'),
            api.get('/stats/difficulties'),
            api.get('/problems/trending?limit=5'),
            api.get('/topics/popular?limit=5')
          ]);

          setStats({
            problems: probRes.data?.totalProblems || 0,
            topics: topicRes.data?.totalTopics || 0,
            datasets: datasetRes.data?.totalDatasets || 0,
            solutions: solRes.data?.totalSolutions || 0
          });

          if (diffRes.data?.success && Array.isArray(diffRes.data.data)) {
            const rawDiffs = diffRes.data.data;
            const mapped = ['easy', 'medium', 'advanced'].map((lvl) => {
              const match = rawDiffs.find(d => d._id === lvl);
              return {
                name: lvl.charAt(0).toUpperCase() + lvl.slice(1),
                count: match ? match.count : 0
              };
            });
            setDifficultyData(mapped);
          }

          setTrendingProblems(trendingRes.data?.data || []);
          setPopularTopics(popularRes.data?.data || []);
        } catch (err) {
          console.error("Error fetching homepage dashboard data:", err);
          setError("Failed to load dashboard statistics. Confirm local MongoDB server status.");
        } finally {
          setLoading(false);
        }
      };

      fetchHomeData();
    }
  }, [user, authLoading, navigate]);

  // Chart colors matching Easy/Medium/Advanced tokens
  const CHART_COLORS = ['#10B981', '#F59E0B', '#EF4444'];
  const PIE_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#A855F7', '#64748B'];

  if (authLoading || (loading && !stats.problems)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div className="spinner" />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading Workspace Analytics...</p>
      </div>
    );
  }

  const pieData = popularTopics.map((t) => ({
    name: t.name,
    value: t.views || 10
  }));

  return (
    <Layout>
      <Helmet>
        <title>Developer Dashboard | GoEpic Pattern Hub</title>
        <meta name="description" content="Manage and view design patterns, data ingestion, solutions, and concurrency modules for Go applications." />
      </Helmet>

      <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
        
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-title">Developer Workspace</h1>
          <p className="dashboard-subtitle">
            Logged in as <strong style={{ color: 'var(--color-primary)' }}>{user?.name}</strong> ({user?.role}). Explore concurrency structures, memory layouts, and templates.
          </p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" style={{ marginBottom: '32px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Stats Grid Counters */}
        <div className="stats-grid responsive-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon problems">
              <FiFileText />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.problems}</div>
              <div className="stat-label">Problems</div>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon topics">
              <FiHash />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.topics}</div>
              <div className="stat-label">Topics</div>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon solutions">
              <FiCheckCircle />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.solutions}</div>
              <div className="stat-label">Solutions</div>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon datasets">
              <FiDatabase />
            </div>
            <div className="stat-info">
              <div className="stat-value">{stats.datasets}</div>
              <div className="stat-label">Datasets</div>
            </div>
          </div>
        </div>

        {/* Analytics Section with Recharts */}
        <div className="responsive-grid mb-8">
          {/* Difficulty breakdown chart */}
          <div className="glass-card flex flex-col" style={{ minHeight: '320px' }}>
            <div className="section-header">
              <h2 className="section-title flex items-center gap-2">
                <FiActivity /> Task Difficulty Metrics
              </h2>
            </div>
            <div style={{ width: '100%', height: '260px', flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.06)" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                    tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                  />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-dark)', 
                      borderColor: 'var(--border-color)', 
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'Inter, sans-serif'
                    }} 
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {difficultyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Topics Views Pie */}
          <div className="glass-card flex flex-col" style={{ minHeight: '320px' }}>
            <div className="section-header">
              <h2 className="section-title flex items-center gap-2">
                <FiTrendingUp /> Topic Share (Views)
              </h2>
            </div>
            <div style={{ width: '100%', flex: 1, minHeight: '260px' }} className="flex flex-col sm:flex-row items-center justify-center">
              <div style={{ width: '100%', flex: 1, height: '220px', maxWidth: '250px' }}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-dark)', 
                          borderColor: 'var(--border-color)', 
                          borderRadius: '12px'
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-light-muted dark:text-dark-muted">
                    No view data available.
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:ml-6 text-xs font-semibold">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span className="text-light-text dark:text-dark-text">{item.name}</span>
                    <span className="text-light-muted dark:text-dark-muted">({item.value} views)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Home Sections Grid */}
        <div className="dashboard-sections responsive-grid">
          {/* Trending list */}
          <div className="glass-card section-card">
            <div className="section-header">
              <h2 className="section-title">Trending Problems</h2>
              <Link to="/problems" className="section-link flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>

            <div className="trending-list">
              {trendingProblems.length > 0 ? (
                trendingProblems.map((prob) => (
                  <div 
                    key={prob._id} 
                    className="trending-item"
                    onClick={() => navigate(`/problems/${prob._id}`)}
                  >
                    <div className="trending-item-details">
                      <h3 className="trending-item-title">
                        {prob.instruction.length > 60 ? prob.instruction.substring(0, 60) + '...' : prob.instruction}
                      </h3>
                      <div className="trending-item-meta">
                        <span className={`tag-difficulty ${prob.difficulty}`}>
                          {prob.difficulty}
                        </span>
                        <span>{prob.topic}</span>
                      </div>
                    </div>
                    <div className="trending-item-views">
                      <FiEye /> {prob.views || 0}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-light-muted dark:text-dark-muted">
                  No problems registered inside library.
                </div>
              )}
            </div>
          </div>

          {/* Popular Topics List */}
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
                    <span className="topic-item-views">{topic.views || 0} active telemetry views</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-light-muted dark:text-dark-muted">
                  No popular topics indexed.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default Home;
