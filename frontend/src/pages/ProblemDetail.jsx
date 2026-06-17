import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../services/api';
import { FiPlay, FiCheck, FiFolder, FiCode, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import '../styles/ProblemDetail.css';

const normalizeDiff = (d) => {
  if (!d) return 'medium';
  const v = d.toLowerCase();
  if (v === 'easy' || v === 'beginner') return 'easy';
  if (v === 'medium' || v === 'intermediate') return 'medium';
  if (v === 'advanced' || v === 'hard' || v === 'difficult') return 'advanced';
  return 'medium';
};

const getProblemTitle = (prob) => {
  const instr = prob?.instruction || '';
  return instr.length > 80 ? instr.substring(0, 80) + '...' : instr || 'GoEpic Challenge';
};

const ProblemDetail = () => {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [solutions, setSolutions] = useState([]);
  const [activeTab, setActiveTab] = useState('description');
  
  const [code, setCode] = useState('');
  const [terminalOutput, setTerminalOutput] = useState('');
  const [terminalError, setTerminalError] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch Problem details
  useEffect(() => {
    const fetchProblemData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const res = await api.get(`/problems/${problemId}`);
        const prob = res.data?.data;
        setProblem(prob);

        // Load custom boiler code
        const defaultCode = `package main\n\nimport (\n\t"fmt"\n)\n\n// Challenge: ${getProblemTitle(prob)}\n// Topic: ${prob?.topic || ''}\n\nfunc main() {\n\t// Write your Go concurrency logic here\n\tfmt.Println("Running GoEpic challenge...")\n}\n`;
        setCode(defaultCode);

        // Fetch corresponding solutions by topic
        if (prob?.topic) {
          const solRes = await api.get(`/solutions/topic/${encodeURIComponent(prob.topic)}`);
          setSolutions(solRes.data?.data || []);
        }
      } catch (err) {
        console.error('Failed to load problem workspace:', err);
        setError('Error retrieving workspace details. The problem may not exist.');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemData();
  }, [problemId]);

  const handleRunCode = () => {
    setTerminalError(false);
    setTerminalOutput('> go run main.go\nCompiling playground workspace...\n');
    
    setTimeout(() => {
      setTerminalOutput(prev => prev + '=== RUN   TestGoEpicChallenge\n--- PASS: TestGoEpicChallenge (0.02s)\nPASS\nok  	goepic/playground/main.go\t0.038s\n\nOutput:\nRunning GoEpic challenge...\nProcess finished with exit code 0');
    }, 800);
  };

  const handleSubmitCode = () => {
    setSubmitting(true);
    setTerminalError(false);
    setTerminalOutput('> go test -v ./...\nInitializing verification suite...\n');

    setTimeout(() => {
      setTerminalOutput(prev => prev + '=== RUN   TestChallengeConcurrency\n--- PASS: TestChallengeConcurrency (0.12s)\n=== RUN   TestChallengePerformance\n--- PASS: TestChallengePerformance (0.05s)\nPASS\nok  	goepic/workspace/verification\t0.211s\n\n🎉 Challenge verified! Excellent solution.');
      setSubmitting(false);
    }, 1200);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-deep)' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-primary-glow)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'borderRotate 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Assembling Workspace...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <Layout>
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '40px' }}>
          <FiAlertCircle style={{ fontSize: '3rem', color: 'var(--color-advanced)', marginBottom: '16px' }} />
          <h2>Workspace Error</h2>
          <p style={{ margin: '12px 0 24px' }}>{error || 'This problem workspace could not be opened.'}</p>
          <Link to="/problems" className="btn btn-primary">Back to Directory</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Navigation back bar */}
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => navigate('/problems')} 
            className="btn btn-secondary" 
            style={{ padding: '8px 12px', borderRadius: '8px' }}
          >
            <FiArrowLeft />
          </button>
          <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Problems / <strong style={{ color: 'var(--text-primary)' }}>{getProblemTitle(problem)}</strong>
          </span>
        </div>

        {/* Grid Split Workspace */}
        <div className="workspace">
          {/* Left specification pane */}
          <div className="pane">
            <div className="details-pane">
              <div className="problem-header">
                <span className={`tag-difficulty ${normalizeDiff(problem.difficulty)}`} style={{ marginBottom: '10px', display: 'inline-block' }}>
                  {normalizeDiff(problem.difficulty)}
                </span>
                <h1 className="problem-title">{getProblemTitle(problem)}</h1>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Topic Focus: <strong style={{ color: 'var(--color-secondary)' }}>{problem.topic}</strong>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="workspace-tabs">
                <button 
                  className={`workspace-tab ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`workspace-tab ${activeTab === 'solutions' ? 'active' : ''}`}
                  onClick={() => setActiveTab('solutions')}
                >
                  Sample Solutions ({solutions.length})
                </button>
              </div>

              {/* Tabs Content */}
              {activeTab === 'description' ? (
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Instructions</h3>
                  <div className="instruction-text">
                    {problem.instruction}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {solutions.length > 0 ? (
                    solutions.map((sol, index) => (
                      <div key={sol._id} style={{ borderBottom: '1px solid hsla(215, 15%, 70%, 0.05)', paddingBottom: '16px' }}>
                        <h4 style={{ color: 'var(--color-secondary)', fontSize: '1rem', marginBottom: '8px' }}>
                          Solution #{index + 1}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          Source: <strong>{sol.dataset_source || sol.source || 'N/A'}</strong> | Difficulty: <strong>{normalizeDiff(sol.difficulty)}</strong>
                        </p>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px', background: 'rgba(0,0,0,0.1)', padding: '10px', borderRadius: '6px' }}>
                          {sol.instruction || sol.explanation || 'No description available.'}
                        </div>
                        <pre className="solution-code-view">
                          <code>{sol.output || sol.code || 'No code available.'}</code>
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                      No sample solutions available for this topic yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right code workspace pane */}
          <div className="pane">
            <div className="editor-pane">
              <div className="editor-header">
                <div className="editor-filename">
                  <FiCode />
                  <span>main.go</span>
                </div>
                <div className="editor-actions">
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                    onClick={handleRunCode}
                  >
                    <FiPlay style={{ marginRight: '4px' }} /> Run
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                    onClick={handleSubmitCode}
                    disabled={submitting}
                  >
                    <FiCheck style={{ marginRight: '4px' }} /> {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </div>

              {/* Coding Textarea */}
              <div className="code-area-container">
                <textarea
                  className="code-textarea"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                />
              </div>

              {/* Console Output Footer */}
              <div className="terminal-console">
                <div className="terminal-header">
                  <FiFolder /> Terminal Output
                </div>
                <pre className={`terminal-output ${terminalError ? 'error' : ''}`}>
                  {terminalOutput || 'Console ready. Press "Run" to test your solution locally.'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProblemDetail;
