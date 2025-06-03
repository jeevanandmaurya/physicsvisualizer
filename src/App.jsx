// src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import CollectionPage from './pages/CollectionPage';
import PhysicsVisualizerPage from './pages/PhysicsVisualizerPage';

// Optional: A simple global navigation component if you want it on every page
// const GlobalNav = () => (
//   <nav style={{ padding: '10px', background: '#eee', marginBottom: '20px' }}>
//     <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
//     <Link to="/visualizer" style={{ marginRight: '10px' }}>Visualizer</Link>
//     <Link to="/collection">Collection</Link>
//   </nav>
// );

function App() {
  return (
    <>
      {/* <GlobalNav /> Uncomment this if you want a persistent navigation bar */}
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/visualizer" element={<PhysicsVisualizerPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        {/* You can add more routes here, e.g., for specific scenes or user profiles */}
      </Routes>
    </>
  );
}

export default App;