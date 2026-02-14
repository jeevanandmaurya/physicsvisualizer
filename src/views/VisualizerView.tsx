import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import Visualizer from '../ui-logic/visualizer/Visualizer';
import { useWorkspaceScene } from '../contexts/WorkspaceContext';
import './VisualizerView.css';

function VisualizerView() {
  const { scene: workspaceScene, updateScene: updateWorkspaceScene } = useWorkspaceScene();
  const [loading, setLoading] = useState<boolean>(true);
  const [showSceneDetails, setShowSceneDetails] = useState<boolean>(false);

  const handleSceneUpdate = useCallback((updatedScene: any) => {
    updateWorkspaceScene(updatedScene);
  }, [updateWorkspaceScene]);

  const handleToggleSceneDetails = useCallback(() => {
    setShowSceneDetails((prev) => !prev);
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="page-loading-container">
        <FontAwesomeIcon icon={faSpinner} spin size="3x" />
        <span>Loading Visualizer...</span>
      </div>
    );
  }

  return (
    <div className="visualizer-container" style={{ position: 'relative' }}>
      <Visualizer
        key={`visualizer-${workspaceScene?.id || 'new'}`}
        scene={workspaceScene}
        showSceneDetails={showSceneDetails}
        onToggleSceneDetails={handleToggleSceneDetails}
        onSceneUpdate={handleSceneUpdate}
      />
    </div>
  );
}

export default VisualizerView;
