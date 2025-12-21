import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../contexts/ThemeContext';
import './AboutView.css';

const AboutView = () => {
  const { theme } = useTheme();

  return (
    <div className="about-view">
      <div className="about-content">
        <h1>About Physics Visualizer</h1>

        <h2>What is Physics Visualizer?</h2>
        <p>Physics Visualizer is a cutting-edge web-based 3D physics simulation platform designed for educational and experimental purposes. It enables users to create, visualize, and interact with complex physics scenarios in real-time.</p>

        <h2>How It Works</h2>
        <p>The application uses advanced physics engines and real-time rendering to simulate various physical phenomena. Users can build and modify scenes through an intelligent AI agent that can do anything, add controllers to modify parameters dynamically, view detailed stats tables, and visualize data through interactive graphs.</p>

        <h2>Unique Features</h2>
        <ul>
          <li><strong>AI Agent:</strong> Powerful AI agent that can create, modify, and optimize physics scenes - tell it what you want and it does it</li>
          <li><strong>Real-time 3D Visualization:</strong> High-performance rendering using Three.js and Rapier physics engine</li>
          <li><strong>Interactive Controllers:</strong> Dynamic parameter adjustment with immediate visual feedback</li>
          <li><strong>Detailed Stats Table:</strong> Comprehensive statistics and physics data tracking</li>
          <li><strong>Multi-physics Support:</strong> Mechanics, constraints, electrostatics, gravitation, and fluid simulations</li>
          <li><strong>Educational Tools:</strong> Graph overlays, conservation tracking, and physics analysis</li>
          <li><strong>Web-Based Platform:</strong> No installation required, runs directly in modern browsers</li>
        </ul>

        <h2>AI Assistance & Tools</h2>
        <p>This application was developed with the assistance of various AI tools and agents:</p>
        <div className="ai-tools-grid">
          <div className="ai-tool-card tool-copilot">
            <strong>GitHub Copilot</strong>
            <small>Code suggestions and autocomplete during development</small>
          </div>
          <div className="ai-tool-card tool-cline">
            <strong>Cline</strong>
            <small>AI-powered coding assistant for project planning and implementation</small>
          </div>
          <div className="ai-tool-card tool-grok">
            <strong>Grok</strong>
            <small>Problem-solving assistance and code optimization</small>
          </div>
          <div className="ai-tool-card tool-gemini">
            <strong>Gemini AI</strong>
            <small>Integrated AI features for physics simulations and this section</small>
          </div>
        </div>

        <h2>Open Source Software</h2>
        <p>This application is built using the following open source technologies:</p>
        <div className="tech-stack-grid">
          <div className="tech-item">React</div>
          <div className="tech-item">Three.js</div>
          <div className="tech-item">Rapier Physics</div>
          <div className="tech-item">Chart.js</div>
          <div className="tech-item">FontAwesome</div>
          <div className="tech-item">Lucide Icons</div>
          <div className="tech-item">Vite</div>
          <div className="tech-item">TypeScript</div>
        </div>

        <h2>Developer</h2>
        <div className="ai-tool-card" style={{ marginTop: '20px' }}>
          <strong>Jeevanand Maurya</strong>
          <p style={{ margin: '5px 0', fontSize: '14px' }}>BTech Student in CSE-AI, Lucknow University (Batch: 2024-28)</p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
            <a href="https://github.com/jeevanandmaurya" target="_blank" rel="noopener noreferrer" className="tech-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faGithub} /> GitHub
            </a>
            <a href="https://www.x.com/jeevanandmaurya" target="_blank" rel="noopener noreferrer" className="tech-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faTwitter} /> Twitter
            </a>
            <a href="https://www.linkedin.com/in/jeevanandmaurya/" target="_blank" rel="noopener noreferrer" className="tech-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FontAwesomeIcon icon={faLinkedinIn} /> LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
