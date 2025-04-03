// SceneSelector.jsx
import React from 'react';
import { mechanicsExamples } from './scenes.js'; // Import scene data
import './SceneSelector.css'; // New CSS file for styling (optional, or reuse App.css)

function SceneSelector({ currentScene, onSceneChange }) {
  const handleExampleClick = (example) => {
    onSceneChange(example); // Callback to update the current scene in App.jsx
  };

  return (
    <div className="component-section examples-panel">
      <div className="content-section">
        <h3>Examples</h3>
        <div className="examples-list" style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
          {mechanicsExamples.map((example) => (
            <div
              key={example.id}
              onClick={() => handleExampleClick(example)}
              className={`example-item ${currentScene.id === example.id ? 'selected' : ''}`}
              style={{
                padding: '5px',
                margin: '0 5px 8px 5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                color: 'whitesmoke',
                backgroundColor: currentScene.id === example.id ? 'blue' : 'black',
                transition: 'background-color 0.2s ease',
              }}
              title={example.description}
            >
              <div style={{ fontWeight: 'bold', fontSize: '1.05em', marginBottom: '3px', color: 'white' }}>
                {example.name}
              </div>
              <div style={{ fontSize: '0.9em', color: 'whitesmoke' }}>
                {example.description}
              </div>
            </div>
          ))}
        </div>
        {/* Parameter display */}
        <div className="physics-parameters-display" style={{ padding: '10px', borderTop: '1px solid #eee', marginTop: '10px' }}>
          <h3>Current Scene Details:</h3>
          <h4>{currentScene.name}</h4>
          {currentScene.objects.map((obj, index) => (
            <div key={obj.id || index} className="physics-object-details">
              <span>Obj {index + 1}: {obj.id} ({obj.type})</span><br />
            </div>
          ))}
          <div className="physics-environment-details">
            <span>Gravity: [{currentScene.gravity.join(", ")}] m/s²</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SceneSelector;