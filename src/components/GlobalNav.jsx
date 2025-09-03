import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCube, faCompass, faChartLine } from '@fortawesome/free-solid-svg-icons';
import logoFull from '../assets/physicsvisualizer.svg';
import './GlobalNav.css';

function GlobalNav() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="global-nav">
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo">
            <img
              src={logoFull}
              alt="Physics Visualizer"
              width="160"
              height="40"
              loading="eager"
              decoding="async"
            />
          </Link>
        </div>
        
        <div className="nav-center">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faHome} />
            <span>Dashboard</span>
          </Link>
          <Link to="/visualizer" className={`nav-link ${isActive('/visualizer') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faCube} />
            <span>3D Visualizer</span>
          </Link>
          <Link to="/collection" className={`nav-link ${isActive('/collection') ? 'active' : ''}`}>
            <FontAwesomeIcon icon={faCompass} />
            <span>Collection</span>
          </Link>
        </div>
        
      </div>
    </nav>
  );
}

export default GlobalNav;
