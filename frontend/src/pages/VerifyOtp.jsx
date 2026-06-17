import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/Auth.css';

const VerifyOtp = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { verifyOtp, sendOtp } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email || !otp) {
      setError('Please enter both your email and OTP code');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await verifyOtp(email, otp);
      setSuccess(res.message || 'OTP verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email to resend OTP');
      return;
    }

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      const res = await sendOtp(email);
      setSuccess(res.message || 'Verification OTP sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">GoEpic</h2>
        <p className="auth-subtitle">Verify your account with OTP</p>

        {error && (
          <div className="auth-alert auth-alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="auth-alert auth-alert-success">
            <span>✅</span> {success}
          </div>
        )}

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="otp">OTP Code</label>
            <input
              type="text"
              id="otp"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-btn"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Did not get a code?{' '}
          <button 
            type="button" 
            onClick={handleResend} 
            style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', fontWeight: '600', cursor: 'pointer', padding: 0 }}
            disabled={loading}
          >
            Resend OTP
          </button>
        </div>

        <div className="auth-footer">
          Back to <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
