import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import logoFull from '../assets/physicsvisualizer.svg';
import { faPlus, faClockRotateLeft, faFolderOpen, faCompass, faUserCircle, faEye } from '@fortawesome/free-solid-svg-icons';

import './dashboard.css';

// --- Placeholder Data (assuming it's the same as your last version) ---
const DUMMY_RECENT_SCENES = [
  { id: 'projectile_motion_basic', name: 'Projectile Motion Basic', lastAccessed: '2 hours ago' },
  { id: 'inclined_plane_friction', name: 'Inclined Plane with Friction', lastAccessed: 'yesterday' },
  { id: 'simple_harmonic_oscillator', name: 'Simple Harmonic Oscillator', lastAccessed: '3 days ago' },
  { id: 'double_pendulum', name: 'Double Pendulum', lastAccessed: '1 week ago' },
  { id: 'collision_2d', name: '2D Elastic Collision', lastAccessed: '1 week ago' },
  { id: 'bouncing_ball', name: 'Bouncing Ball Simulation', lastAccessed: '2 weeks ago' },
  { id: 'orbital_mechanics', name: 'Basic Orbit Simulation', lastAccessed: '3 weeks ago' },
  { id: 'extra_recent_1', name: 'Extra Recent Scene 1', lastAccessed: '4 weeks ago' },
  { id: 'extra_recent_2', name: 'Extra Recent Scene 2', lastAccessed: '5 weeks ago' },
];

const DUMMY_YOUR_SCENES = [
  { id: 'custom_roller_coaster', name: 'My Custom Roller Coaster', created: '2 weeks ago' },
  { id: 'orbital_mechanics_study', name: 'Orbital Mechanics Study', created: '1 month ago' },
  { id: 'spring_mass_system', name: 'Complex Spring-Mass', created: '2 months ago' },
  { id: 'planetary_gear', name: 'Planetary Gear Setup', created: '3 months ago' },
  { id: 'fluid_dynamics_pipe', name: 'Fluid in a Pipe', created: '4 months ago' },
  { id: 'my_simulation_1', name: 'My Test Simulation 1', created: '5 months ago' },
];

const DUMMY_TOP_SCENES = [
  { id: 'top_gravity_sim', name: 'Advanced Gravity Simulator', views: '10.2k' },
  { id: 'top_wave_interference', name: 'Wave Interference Pattern', views: '8.5k' },
  { id: 'top_quantum_tunneling', name: 'Quantum Tunneling Intro', views: '7.1k' },
  { id: 'top_fluid_dynamics', name: 'Interactive Fluid Dynamics', views: '6.8k' },
  { id: 'top_electromagnetism', name: 'EM Field Visualizer', views: '6.5k' },
  { id: 'top_relativity_visual', name: 'Special Relativity Demo', views: '5.9k' },
];

const DUMMY_USER = {
  name: 'Jane Doe',
  avatar: ''
};
// --- End Placeholder Data ---

function DashboardPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleCreateNewScene = () => {
    if (!isLoggedIn) {
        alert("Please sign in to create a new scene.");
        return;
    }
    console.log("Dashboard: Initiating new scene creation.");
    navigate('/visualizer', { state: { sceneToLoad: 'new_empty_scene' } });
  };

  const handleExploreCollection = () => {
    console.log("Dashboard: Navigating to Scene Collection Page.");
    navigate('/collection');
  };

  const handleSignInOut = () => {
    setIsLoggedIn(!isLoggedIn);
    console.log(isLoggedIn ? "User signed out." : "User signed in.");
  };

  const handleSceneClick = (sceneId) => {
    console.log(`Dashboard: Loading scene with ID: ${sceneId}`);
    navigate('/visualizer', { state: { sceneToLoad: sceneId } });
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{display:'flex',alignItems:'center'}}>
          <img src={logoFull} alt="Physics Visualizer Logo" height="45px" />
          <span className="dashboard-title-text">Dashboard</span>
        </div>
        <div className="user-section">
          {isLoggedIn ? (
            <div className="user-info" onClick={handleSignInOut} title="Click to Sign Out">
              {DUMMY_USER.avatar ? (
                <img src={DUMMY_USER.avatar} alt={DUMMY_USER.name} className="user-avatar" />
              ) : (
                <FontAwesomeIcon icon={faUserCircle} className="user-avatar-default" />
              )}
              <span>{DUMMY_USER.name}</span>
              <span className="sign-out-link">(Sign Out)</span>
            </div>
          ) : (
            // Changed class name back to sign-in-button
            <button className="sign-in-button" onClick={handleSignInOut}>
              <FontAwesomeIcon icon={faUserCircle} /> Sign In
            </button>
          )}
        </div>
      </header>

      <main className="dashboard-content">
        {/* Left Column: Create New & Your Scenes */}
        <div className="dashboard-column-left">
          <section className="dashboard-card create-scene-card" onClick={handleCreateNewScene}>
            <FontAwesomeIcon icon={faPlus} className="card-icon-large" />
            <h3>Create New Scene</h3>
            <p>Start with a blank canvas.</p>
            {!isLoggedIn && <small style={{marginTop: '10px', color: '#ffcc00'}}>(Sign in required)</small>}
          </section>

          <section className="dashboard-card your-scenes-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faFolderOpen} className="card-icon" />
              <h3>Your Scenes</h3>
            </div>
            <div className="scene-list">
              {isLoggedIn ? (
                DUMMY_YOUR_SCENES.length > 0 ? (
                  <ul>
                    {DUMMY_YOUR_SCENES.map(scene => (
                      <li key={scene.id} onClick={() => handleSceneClick(scene.id)}>
                        <strong>{scene.name}</strong> <small>(Created: {scene.created})</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-scenes-message">You haven't created or saved any scenes yet.</p>
                )
              ) : (
                <p className="no-scenes-message">Sign in to see your saved scenes.</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Recent Scenes & Explore Collection (with Top Scenes) */}
        <div className="dashboard-column-right">
          <section className="dashboard-card recent-scenes-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faClockRotateLeft} className="card-icon" />
              <h3>Recent Scenes</h3>
            </div>
            <div className="scene-list">
              {isLoggedIn ? (
                DUMMY_RECENT_SCENES.length > 0 ? (
                  <ul>
                    {DUMMY_RECENT_SCENES.map(scene => (
                      <li key={scene.id} onClick={() => handleSceneClick(scene.id)}>
                        <strong>{scene.name}</strong> <small>(Accessed: {scene.lastAccessed})</small>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="no-scenes-message">No recently accessed scenes.</p>
                )
              ) : (
                <p className="no-scenes-message">Sign in to view your recent scenes.</p>
              )}
            </div>
          </section>

          <div className="horizontal-partition"></div>

          <section className="dashboard-card explore-collection-card">
            <div className="card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FontAwesomeIcon icon={faCompass} className="card-icon" />
                <h3>Explore Scene Collection</h3>
              </div>
              <button className="view-all-button" onClick={handleExploreCollection}>
                View All
              </button>
            </div>
            <p className="explore-description">Browse predefined examples and discover top-rated community scenes.</p>
            
            <h4><FontAwesomeIcon icon={faEye} /> Top Scenes:</h4>
            <div className="scene-list top-scenes-list">
              {DUMMY_TOP_SCENES.length > 0 ? (
                <ul>
                  {DUMMY_TOP_SCENES.map(scene => (
                    <li key={scene.id} onClick={() => handleSceneClick(scene.id)}>
                      <strong>{scene.name}</strong> <small>(Views: {scene.views})</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-scenes-message">No top scenes available at the moment.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;