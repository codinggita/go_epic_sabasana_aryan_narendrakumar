import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiDatabase, FiSearch, FiArrowRight, FiFileText, FiLayers } from 'react-icons/fi';
import '../styles/Problems.css';
import '../styles/Datasets.css';

const normalizeDifficulty = (d) => {
  if (!d) return 'medium';
  const v = d.toLowerCase();
  if (v === 'easy' || v === 'beginner') return 'easy';
  if (v === 'medium' || v === 'intermediate') return 'medium';
  if (v === 'advanced' || v === 'hard' || v === 'difficult') return 'advanced';
  return 'medium';
};

const Datasets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1);
  const difficultyParam = searchParams.get('difficulty') || '';
  const topicParam = searchParams.get('topic') || '';
  const sourceParam = searchParams.get('source') || '';

  const [datasets, setDatasets] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  // Summary aggregates
  const [totalDatasets, setTotalDatasets] = useState(0);
  const [totalProblemsInDatasets, setTotalProblemsInDatasets] = useState(0);
  const [uniqueSources, setUniqueSources] = useState([]);

  const [searchInput, setSearchInput] = useState(sourceParam);
  const limit = 9;

  // Fetch topics for filter dropdown
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/topics');
        setTopics(res.data?.data || []);
      } catch (err) {
        console.error('Error fetching topics:', err);
      }
    };
    fetchTopics();
  }, []);

  // Fetch datasets with filters
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        setLoading(true);
        setError('');

        const params = { page: pageParam, limit };
        if (difficultyParam) params.difficulty = difficultyParam;
        if (topicParam) params.topic = topicParam;
        if (sourceParam) params.source = sourceParam;

        const res = await api.get('/datasets', { params });
        const data = res.data?.data || [];
        setDatasets(data);
        setTotalPages(res.data?.totalPages || 1);
        setTotalDatasets(res.data?.totalDatasets || data.length);

        // Calculate aggregates from current page
        const totalProbs = data.reduce((sum, d) => sum + (d.totalProblems || 0), 0);
        setTotalProblemsInDatasets(totalProbs);
        const sources = [...new Set(data.map(d => d.source).filter(Boolean))];
        setUniqueSources(sources);
      } catch (err) {
        console.error('Error loading datasets:', err);
        setError('Could not retrieve datasets. Server might be offline.');
      } finally {
        setLoading(false);
      }
    };
    fetchDatasets();
  }, [pageParam, difficultyParam, topicParam, sourceParam]);

  useEffect(() => { setSearchInput(sourceParam); }, [sourceParam]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('page', '1');
    Object.entries(newParams).forEach(([key, val]) => {
      val === '' ? updated.delete(key) : updated.set(key, val);
    });
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ source: searchInput });
  };

  const handlePageChange = (newPage) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('page', newPage.toString());
    setSearchParams(updated);
  };

  // Navigate to problems filtered by this dataset's source and topic
  const handleDrillDown = (dataset) => {
    const params = new URLSearchParams();
    if (dataset.topic) params.set('topic', dataset.topic);
    if (dataset.source) params.set('source', dataset.source);
    navigate(`/problems?${params.toString()}`);
  };

  const hasFilters = difficultyParam || topicParam || sourceParam;

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="datasets-header">
          <h1 className="datasets-title">Datasets Explorer</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Browse curated Go problem collections grouped by source, topic, and difficulty.
          </p>
        </div>

        {/* Summary Stats Banner */}
        {!loading && (
          <div className="datasets-summary-bar">
            <div className="summary-stat">
              <span className="summary-stat-value">{totalDatasets}</span>
              <span className="summary-stat-label">Dataset Collections</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">{totalProblemsInDatasets.toLocaleString()}</span>
              <span className="summary-stat-label">Total Problems</span>
            </div>
            <div className="summary-stat">
              <span className="summary-stat-value">{uniqueSources.length}</span>
              <span className="summary-stat-label">Unique Sources</span>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="filters-left" style={{ flexWrap: 'wrap' }}>
            <form className="filter-input-wrapper" onSubmit={handleSearchSubmit}>
              <FiSearch className="filter-search-icon" />
              <input
                type="text"
                placeholder="Filter by source name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </form>

            <select
              className="filter-select"
              style={{ flex: '1 1 min(100%, 200px)' }}
              value={difficultyParam}
              onChange={(e) => updateFilters({ difficulty: e.target.value })}
            >
              <option value="">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="beginner">Beginner</option>
              <option value="medium">Medium</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            <select
              className="filter-select"
              style={{ flex: '1 1 min(100%, 200px)' }}
              value={topicParam}
              onChange={(e) => updateFilters({ topic: e.target.value })}
            >
              <option value="">All Topics</option>
              {topics.map(t => (
                <option key={t._id} value={t.name}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="filters-right">
            {hasFilters && (
              <button
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => { setSearchInput(''); setSearchParams({}); }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error" style={{ marginBottom: '24px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Dataset Cards Grid */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary-glow)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading datasets...</p>
          </div>
        ) : (
          <>
            <div className="datasets-grid responsive-grid">
              {datasets.length > 0 ? datasets.map((dataset) => (
                <div
                  key={dataset._id}
                  className="glass-card dataset-card"
                  onClick={() => handleDrillDown(dataset)}
                >
                  <div className="dataset-card-top">
                    <div>
                      <span className="dataset-source-badge">
                        <FiDatabase style={{ fontSize: '0.75rem' }} />
                        {dataset.source || 'Unknown Source'}
                      </span>
                    </div>
                    <span className={`tag-difficulty ${normalizeDifficulty(dataset.difficulty)}`}>
                      {normalizeDifficulty(dataset.difficulty)}
                    </span>
                  </div>

                  <div>
                    <div className="dataset-topic">{dataset.topic}</div>
                    <div className="dataset-description">{dataset.description}</div>
                  </div>

                  <div className="dataset-card-footer">
                    <div className="dataset-problems-count">
                      <FiFileText style={{ color: 'var(--text-muted)' }} />
                      <span className="count-num">{dataset.totalProblems}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>problems</span>
                    </div>
                    <button className="dataset-view-btn">
                      Explore Problems <FiArrowRight style={{ marginLeft: '4px', verticalAlign: 'middle' }} />
                    </button>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <FiLayers style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }} />
                  <h3>No datasets match the current filters</h3>
                  <p>Try adjusting the source, topic, or difficulty filter.</p>
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button className="pagination-btn" disabled={pageParam <= 1} onClick={() => handlePageChange(pageParam - 1)}>Previous</button>
                <span className="pagination-info">Page <strong>{pageParam}</strong> of <strong>{totalPages}</strong></span>
                <button className="pagination-btn" disabled={pageParam >= totalPages} onClick={() => handlePageChange(pageParam + 1)}>Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Datasets;
