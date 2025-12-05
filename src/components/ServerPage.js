import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ServerPage.css';

function ServerPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === '12345') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="server-page">
        {/* Animated background elements */}
        <div className="background-animations">
          <div className="floating-circle circle-1"></div>
          <div className="floating-circle circle-2"></div>
          <div className="floating-circle circle-3"></div>
          <div className="floating-circle circle-4"></div>
          <div className="floating-circle circle-5"></div>
        </div>

        <div className="server-content">
          <div className="password-container">
            <div className="lock-icon">🔒</div>
            <h1>Server Access</h1>
            <p className="password-subtitle">Please enter password to continue</p>

            <form onSubmit={handlePasswordSubmit} className="password-form">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="password-input"
                autoFocus
              />
              
              {error && <div className="password-error">{error}</div>}

              <button type="submit" className="password-submit">
                Unlock →
              </button>
            </form>

            <button className="back-button" onClick={() => navigate('/')}>
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="server-page">
      {/* Animated background elements */}
      <div className="background-animations">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
        <div className="floating-circle circle-4"></div>
        <div className="floating-circle circle-5"></div>
      </div>

      <div className="server-content">
        <div className="server-header">
          <div className="server-icon">⚙️</div>
          <h1>Server Dashboard</h1>
          <p className="server-subtitle">Choose your role to continue</p>
        </div>

        <div className="options-container">
          <div className="option-card" onClick={() => navigate('/researcher')}>
            <div className="option-icon">🔬</div>
            <h2>Researcher</h2>
            <p>Design and manage survey questions</p>
            <div className="option-features">
              <span>✓ Add/Edit Questions</span>
              <span>✓ Drag & Drop</span>
              <span>✓ Preview Form</span>
            </div>
            <button className="option-button">
              Enter Dashboard →
            </button>
          </div>

          <div className="option-card" onClick={() => navigate('/admin')}>
            <div className="option-icon">📊</div>
            <h2>Admin Panel</h2>
            <p>View analytics and export data</p>
            <div className="option-features">
              <span>✓ Analytics</span>
              <span>✓ Export Data</span>
              <span>✓ Reports</span>
            </div>
            <button className="option-button">
              Enter Dashboard →
            </button>
          </div>
        </div>

        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default ServerPage;
