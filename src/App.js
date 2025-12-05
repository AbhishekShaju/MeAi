import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ServerPage from './components/ServerPage';
import UserModule from './components/UserModule';
import ResearcherModule from './components/ResearcherModule';
import AdminModule from './components/AdminModule';

function Navigation() {
  const location = useLocation();
  
  // Don't show navigation on landing page or server page
  if (location.pathname === '/' || location.pathname === '/server') {
    return null;
  }

  return (
    <nav className="nav" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <Link to="/" className="nav-link">🏠 Home</Link>
      <Link to="/survey" className="nav-link">📝 Survey</Link>
      <Link to="/server" className="nav-link">⚙️ ServerSide</Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh' }}>
        <Navigation />

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/server" element={<ServerPage />} />
          <Route path="/survey" element={<UserModule />} />
          <Route path="/researcher" element={<ResearcherModule />} />
          <Route path="/admin" element={<AdminModule />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
