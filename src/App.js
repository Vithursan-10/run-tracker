import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './MainPage';
import RunHistory from './RunHistory';
import ChartsPage from './ChartsPage';
import Sidebar from './Sidebar';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <Router>
      <div>
        {/* Toggle Button (Hamburger) */}
        <button
          onClick={() => {
  setOpen(prev => {
    const newState = !prev;
    setSidebarOpen(newState);
    return newState;
  });
    }}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            zIndex: 1100,
            fontSize: '1.5rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'black',
          }}
        >
          ☰
        </button>

        {/* Sidebar Component */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div style={{ marginLeft: sidebarOpen ? '200px' : '0', padding: '1rem', transition: 'margin-left 0.3s'}}>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/history" element={<RunHistory />} />
            <Route path= "/analytics" element={<ChartsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
