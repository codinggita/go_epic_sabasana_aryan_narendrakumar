import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-deep)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-sans)',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '5rem',
            marginBottom: '16px',
            animation: 'pulse 2s infinite'
          }}>
            ⚙️
          </div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '12px'
          }}>
            System Interrupted
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            marginBottom: '32px',
            lineHeight: 1.6
          }}>
            An unexpected error has crashed the UI renderer. We have flagged this error for review. Please click the button below to recover.
          </p>
          {this.state.error && (
            <pre style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--border-glow)',
              borderRadius: '8px',
              padding: '16px',
              maxWidth: '600px',
              overflowX: 'auto',
              fontFamily: 'var(--font-code)',
              fontSize: '0.8rem',
              color: 'var(--color-advanced)',
              marginBottom: '32px',
              textAlign: 'left'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
          <button 
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            Reset Workspace Shell
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
