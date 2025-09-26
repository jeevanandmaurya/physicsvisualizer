import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

function SettingsView() {
  const { theme, toggleTheme, overlayOpacity, updateOverlayOpacity } = useTheme();

  const handleOpacityChange = (type, value) => {
    updateOverlayOpacity(type, parseFloat(value));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Settings</h2>

      <div style={{ marginBottom: '30px' }}>
        <h3>Theme</h3>
        <p>Current theme: {theme}</p>
        <button onClick={toggleTheme}>
          Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Overlay Opacity</h3>
        <p>Adjust the opacity of overlay windows (chat, graph, and controller panels).</p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Chat Overlay Opacity: {(overlayOpacity.chat * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={overlayOpacity.chat}
            onChange={(e) => handleOpacityChange('chat', e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Graph Overlay Opacity: {(overlayOpacity.graph * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={overlayOpacity.graph}
            onChange={(e) => handleOpacityChange('graph', e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Controller Overlay Opacity: {((overlayOpacity.controller || 0.8) * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={overlayOpacity.controller || 0.8}
            onChange={(e) => handleOpacityChange('controller', e.target.value)}
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </div>
      </div>

      <p>Other application preferences and settings will be configured here.</p>
    </div>
  );
}

export default SettingsView;
