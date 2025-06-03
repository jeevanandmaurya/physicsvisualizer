// src/pages/CollectionPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './collection.css'
// --- Mock User Authentication ---
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState({
    id: 'user123',
    name: 'Physics Enthusiast',
    isLoggedIn: true,
  });
  return { currentUser };
};

// --- Placeholder Data ---
const placeholderData = {
  scenes: [
    { id: 's1', title: 'Quantum Entanglement Visualizer', description: 'Explore the fascinating world of quantum entanglement with interactive particles.', thumbnailUrl: 'https://via.placeholder.com/350x180/FF6347/FFFFFF?Text=Quantum+Scene', topic: 'Quantum Mechanics', organization: 'QuantumLeap Org', authorId: 'user456', views: 12050, likes: 1502, createdAt: new Date('2024-01-15T10:00:00Z') },
    { id: 's2', title: 'Newtonian Gravity Simulator', description: 'Simulate planetary orbits and gravitational forces between multiple bodies.', thumbnailUrl: 'https://via.placeholder.com/350x180/6495ED/FFFFFF?Text=Gravity+Sim', topic: 'Classical Mechanics', organization: 'AstroSimulators', authorId: 'user789', views: 25600, likes: 3200, createdAt: new Date('2024-02-20T14:30:00Z') },
    { id: 's3', title: 'Optics: Lens and Mirror Lab', description: 'Experiment with different types of lenses and mirrors to understand light refraction and reflection.', thumbnailUrl: 'https://via.placeholder.com/350x180/3CB371/FFFFFF?Text=Optics+Lab', topic: 'Optics', organization: 'PhysicsEdu Initiative', authorId: 'user123', views: 18900, likes: 2100, createdAt: new Date('2023-12-01T09:00:00Z') },
    { id: 's4', title: 'Thermodynamics: Heat Engine', description: 'A detailed simulation of a Carnot heat engine cycle.', thumbnailUrl: 'https://via.placeholder.com/350x180/FFA500/000000?Text=Heat+Engine', topic: 'Thermodynamics', organization: 'ThermoWorks', authorId: 'user456', views: 9800, likes: 750, createdAt: new Date('2024-03-10T11:00:00Z') },
    { id: 's5', title: 'My Awesome Fluid Dynamics', description: 'My custom simulation showing cool fluid patterns.', thumbnailUrl: 'https://via.placeholder.com/350x180/BA55D3/FFFFFF?Text=My+Fluid+Sim', topic: 'Fluid Dynamics', organization: null, authorId: 'user123', views: 500, likes: 50, createdAt: new Date('2024-04-05T16:00:00Z') },
    { id: 's6', title: 'E&M: Wave Propagation', description: 'Visualizing electromagnetic wave propagation in different media.', thumbnailUrl: 'https://via.placeholder.com/350x180/4682B4/FFFFFF?Text=EM+Wave', topic: 'Electromagnetism', organization: 'QuantumLeap Org', authorId: 'user789', views: 11500, likes: 900, createdAt: new Date('2024-03-25T08:20:00Z') },
  ],
  // Topics and organizations will be derived in useEffect
};


// --- Reusable SceneCard Component ---
// Add className props for styling via external CSS
function SceneCard({ scene }) {
  return (
    <div className="scene-card">
      <img src={scene.thumbnailUrl} alt={scene.title} className="scene-thumbnail" />
      <div className="scene-card-content">
        <h3 className="scene-title" title={scene.title}>{scene.title}</h3>
        {scene.topic && <p className="scene-topic-org-info">Topic: {scene.topic}</p>}
        {scene.organization && <p className="scene-topic-org-info">By: {scene.organization}</p>}
        <p className="scene-description">{scene.description}</p>
        <div className="scene-meta">
          <span className="scene-meta-item"> {scene.views.toLocaleString()}</span>
          <span className="scene-meta-item"> {scene.likes.toLocaleString()}</span>
        </div>
      </div>
      <div className="scene-actions">
        <Link to={`/scene/${scene.id}`} className="scene-action-button">View Scene</Link>
      </div>
    </div>
  );
}

// --- Main CollectionPage Component ---
function CollectionPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('topics');
  const [allScenes, setAllScenes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedOrganization, setSelectedOrganization] = useState('');

  useEffect(() => {
    // Simulating API call
    console.log("Fetching data (simulated)...");
    setAllScenes(placeholderData.scenes);
    const uniqueTopics = ['All', ...new Set(placeholderData.scenes.map(s => s.topic).filter(Boolean))];
    const uniqueOrgs = ['All', ...new Set(placeholderData.scenes.map(s => s.organization).filter(Boolean))];
    setTopics(uniqueTopics);
    setOrganizations(uniqueOrgs);
    setSelectedTopic('All');
    setSelectedOrganization('All');
  }, []);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (tabName === 'topics') setSelectedTopic('All');
    if (tabName === 'organizations') setSelectedOrganization('All');
  };

  const renderScenes = (scenesToRender) => {
    if (!scenesToRender || scenesToRender.length === 0) {
      return <p className="empty-state-message">No scenes found for this selection. Try adjusting your filters or explore other categories! 🌌</p>;
    }
    return (
      <div className="scene-grid">
        {scenesToRender.map(scene => <SceneCard key={scene.id} scene={scene} />)}
      </div>
    );
  };

  const getFilteredScenes = () => {
    let filtered = [...allScenes];

    if (activeTab === 'topics') {
      if (selectedTopic && selectedTopic !== 'All') {
        filtered = filtered.filter(scene => scene.topic === selectedTopic);
      }
    } else if (activeTab === 'trending') {
      filtered.sort((a, b) => (b.views + b.likes * 10) - (a.views + a.likes * 10));
    } else if (activeTab === 'organizations') {
      if (selectedOrganization && selectedOrganization !== 'All') {
        filtered = filtered.filter(scene => scene.organization === selectedOrganization);
      }
    } else if (activeTab === 'myScenes' && currentUser?.isLoggedIn) {
      filtered = filtered.filter(scene => scene.authorId === currentUser.id);
    } else if (activeTab === 'myScenes' && !currentUser?.isLoggedIn) {
      return [];
    }
    return filtered;
  };

  const currentScenesToDisplay = getFilteredScenes();

  return (
    // Assign a root class for page-level styling
    <div className="collection-page-container">
      <header className="collection-page-header">
        <h1 className="collection-page-title">🌌 Physics Scene Collection</h1>
        <Link to="/" className="dashboard-link">← Back to Dashboard</Link>
      </header>

      <nav className="collection-page-nav-tabs">
        <button
          className={`tab-button ${activeTab === 'topics' ? 'active-tab' : ''}`}
          onClick={() => handleTabClick('topics')}
        >
          Browse by Topic
        </button>
        <button
          className={`tab-button ${activeTab === 'trending' ? 'active-tab' : ''}`}
          onClick={() => handleTabClick('trending')}
        >
          Trending Scenes
        </button>
        <button
          className={`tab-button ${activeTab === 'organizations' ? 'active-tab' : ''}`}
          onClick={() => handleTabClick('organizations')}
        >
          By Organization
        </button>
        {currentUser?.isLoggedIn && (
          <button
            className={`tab-button ${activeTab === 'myScenes' ? 'active-tab' : ''}`}
            onClick={() => handleTabClick('myScenes')}
          >
           My Scenes
          </button>
        )}
      </nav>

      <main className="collection-page-main-content">
        {activeTab === 'topics' && (
          <section className="content-section">
            <div className="section-header-controls">
              <h2 className="section-title">Explore by Topic</h2>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="category-select"
              >
                {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
              </select>
            </div>
            {renderScenes(currentScenesToDisplay)}
          </section>
        )}

        {activeTab === 'trending' && (
          <section className="content-section">
            <h2 className="section-title">Trending Now</h2>
            {renderScenes(currentScenesToDisplay)}
          </section>
        )}

        {activeTab === 'organizations' && (
          <section className="content-section">
             <div className="section-header-controls">
              <h2 className="section-title">Discover from Organizations</h2>
              <select
                value={selectedOrganization}
                onChange={(e) => setSelectedOrganization(e.target.value)}
                className="category-select"
              >
                {organizations.map(org => <option key={org} value={org}>{org}</option>)}
              </select>
            </div>
            {renderScenes(currentScenesToDisplay)}
          </section>
        )}

        {activeTab === 'myScenes' && (
          <section className="content-section">
            <h2 className="section-title">My Created Scenes</h2>
            {currentUser?.isLoggedIn ? renderScenes(currentScenesToDisplay)
              : <p className="empty-state-message">Please log in to see your scenes. ✨</p>
            }
          </section>
        )}
      </main>
    </div>
  );
}

export default CollectionPage;