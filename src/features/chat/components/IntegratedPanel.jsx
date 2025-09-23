import React from 'react';
import SceneDetails from '../../collection/components/SceneDetails';
import './IntegratedPanel.css';

function IntegratedPanel({
  currentScene,
  onSceneUpdate
}) {
  return (
    <div className="integrated-panel">
      {/* Content Area */}
      <div className="integrated-content">
        <SceneDetails scene={currentScene} />
      </div>
    </div>
  );
}

export default IntegratedPanel;
