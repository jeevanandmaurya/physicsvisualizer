// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import PhysicsVisualizerPage from './pages/PhysicsVisualizerPage';
import GlobalNav from './shared/ui/components/GlobalNav';

function App() {
  return (
    <>
      <GlobalNav />
      <div className="app-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/visualizer" element={<PhysicsVisualizerPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          {/* You can add more routes here, e.g., for specific scenes or user profiles */}
        </Routes>
      </div>
    </>
  );
}

export default App;
