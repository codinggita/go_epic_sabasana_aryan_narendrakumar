import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiSearch, FiEye, FiChevronDown, FiChevronUp, FiCopy, FiCheck } from 'react-icons/fi';
import '../styles/Problems.css';
import '../styles/Solutions.css';

const Solutions = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Math.max(1, Number(searchParams.get('page')) || 1);
  const difficultyParam = searchParams.get('difficulty') || '';
  const topicParam = searchParams.get('topic') || '';
  const keywordParam = searchParams.get('keyword') || '';

  const [solutions, setSolutions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [totalSolutions, setTotalSolutions] = useState(0);
  const [searchInput, setSearchInput] = useState(keywordParam);

  // Track which solution cards are expanded and copied
  const [expanded, setExpanded] = useState({});
  const [copied, setCopied] = useState({});

  const limit = 6;

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

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        setLoading(true);
        setError('');

        const params = { page: pageParam, limit };
        if (difficultyParam) params.difficulty = difficultyParam;
        if (topicParam) params.topic = topicParam;
        if (keywordParam) params.keyword = keywordParam;

        const res = await api.get('/solutions', { params });
        setSolutions(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
        setTotalSolutions(res.data?.count || 0);
      } catch (err) {
        console.error('Error loading solutions:', err);
        setError('Could not retrieve solutions. Server might be offline.');
      } finally {
        setLoading(false);
      }
    };
    fetchSolutions();
  }, [pageParam, difficultyParam, topicParam, keywordParam]);

  useEffect(() => { setSearchInput(keywordParam); }, [keywordParam]);

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
    updateFilters({ keyword: searchInput });
  };

  const handlePageChange = (newPage) => {
    const updated = new URLSearchParams(searchParams);
    updated.set('page', newPage.toString());
    setSearchParams(updated);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
    });
  };

  return (
    <Layout>
      <div className="animate-fade-in">
        <div className="solutions-header">
          <h1 className="solutions-title">Solutions Explorer</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Browse curated Go solutions with code examples and step-by-step explanations.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="filters-bar">
          <div className="filters-left" style={{ flexWrap: 'wrap' }}>
            <form className="filter-input-wrapper" onSubmit={handleSearchSubmit}>
              <FiSearch className="filter-search-icon" />
              <input
                type="text"
                placeholder="Search solutions..."
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
              <option value="medium">Medium</option>
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
            {(keywordParam || difficultyParam || topicParam) && (
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

        {/* Solutions List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary-glow)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
            <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Loading solutions...</p>
          </div>
        ) : (
          <>
            <div className="solutions-list">
              {solutions.length > 0 ? solutions.map((sol) => (
                <div key={sol._id} className="glass-card solution-card">
                  <div className="solution-card-header">
                    <div>
                      <div className="solution-card-title">{sol.title}</div>
                      <div className="solution-card-meta">
                        <span className={`tag-difficulty ${sol.difficulty}`}>{sol.difficulty}</span>
                        <span className="meta-badge">{sol.topic}</span>
                        <span className="meta-badge source">{sol.source}</span>
                        <span className="meta-badge">
                          <FiEye style={{ fontSize: '0.8rem' }} /> {sol.views || 0} views
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="solution-explanation">
                    {sol.explanation}
                  </div>

                  {/* Code Block */}
                  {expanded[sol._id] && (
                    <div className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-block-lang">go</span>
                        <button
                          className="code-copy-btn"
                          onClick={() => handleCopy(sol._id, sol.code)}
                        >
                          {copied[sol._id] ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy</>}
                        </button>
                      </div>
                      <div className="code-block-body">
                        <pre><code>{sol.code}</code></pre>
                      </div>
                    </div>
                  )}

                  <button
                    className="solution-toggle-btn"
                    onClick={() => toggleExpand(sol._id)}
                  >
                    {expanded[sol._id] ? <><FiChevronUp /> Hide Code</> : <><FiChevronDown /> View Code</>}
                  </button>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <h3>No solutions match the current filters</h3>
                  <p>Try adjusting the search or clearing the filter criteria.</p>
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

export default Solutions;
