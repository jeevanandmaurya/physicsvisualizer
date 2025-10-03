import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faTwitter, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

const AboutView = () => {
  return (
    <div className="about-view" style={{ padding: '20px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px', marginTop: '10px' }}>
        <div style={{ backgroundColor: '#f8f9ff', padding: '10px', borderRadius: '6px', border: '1px solid #e1e5f2' }}>
          <strong>GitHub Copilot</strong><br />
          <small>Code suggestions and autocomplete during development</small>
        </div>
        <div style={{ backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
          <strong>Cline</strong><br />
          <small>AI-powered coding assistant for project planning and implementation</small>
        </div>
        <div style={{ backgroundColor: '#fdf4ff', padding: '10px', borderRadius: '6px', border: '1px solid #e9d5ff' }}>
          <strong>Grok</strong><br />
          <small>Problem-solving assistance and code optimization</small>
        </div>
        <div style={{ backgroundColor: '#f0fdfa', padding: '10px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
          <strong>Gemini AI</strong><br />
          <small>Integrated AI features for physics simulations</small>
        </div>
      </div>

      <h2>Open Source Software</h2>
      <p>This application is built using the following open source technologies:</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', marginTop: '10px' }}>
        <div><strong>Physics Engine:</strong> @dimforge/rapier3d-compat, @react-three/rapier</div>
        <div><strong>3D Graphics:</strong> three, @react-three/fiber, @react-three/drei</div>
        <div><strong>AI Integration:</strong> @google/generative-ai</div>
        <div><strong>UI Components:</strong> react, react-dom, @fortawesome/react-fontawesome</div>
        <div><strong>Charts & Math:</strong> chart.js, react-chartjs-2, katex, jsxgraph</div>
        <div><strong>Drag & Drop:</strong> @dnd-kit/core, @dnd-kit/utilities</div>
        <div><strong>Utilities:</strong> jsonpatch, lucide-react, re-resizable</div>
        <div><strong>UI Controls:</strong> leva, react-resizable-panels, react-rnd</div>
      </div>

      <h2>Developer</h2>
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div>
          <h3 style={{ marginTop: '0', marginBottom: '5px', color: '#333' }}><strong>Jeevanand Maurya</strong></h3>
          <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>BTech Student in CSE-AI, Lucknow University (Batch: 2024-28)</p>
        </div>

        <div>
          <h4 style={{ marginTop: '0', marginBottom: '15px', color: '#333' }}>Connect & Follow</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            <a
              href="https://github.com/jeevanandmaurya"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 15px',
                backgroundColor: '#24292e',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FontAwesomeIcon icon={faGithub} />
              GitHub
              <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '12px' }} />
            </a>

            <a
              href="https://www.x.com/jeevanandmaurya"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 15px',
                backgroundColor: '#1da1f2',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FontAwesomeIcon icon={faTwitter} />
              Twitter
              <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '12px' }} />
            </a>

            <a
              href="https://www.linkedin.com/in/jeevanandmaurya/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 15px',
                backgroundColor: '#0077b5',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FontAwesomeIcon icon={faLinkedinIn} />
              LinkedIn
              <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '12px' }} />
            </a>

            <a
              href="https://github.com/jeevanandmaurya/physicsvisualizer"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 15px',
                backgroundColor: '#24292e',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <FontAwesomeIcon icon={faGithub} />
              Project Repo
              <FontAwesomeIcon icon={faExternalLinkAlt} style={{ fontSize: '12px' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutView;
