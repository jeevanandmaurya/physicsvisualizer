import React from 'react';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import './ScenePreviewCard.css';

interface ScenePreviewCardProps {
  message: {
    sceneMetadata?: {
      hasSceneGeneration: boolean;
      sceneId: string;
      sceneAction: 'create' | 'modify' | 'none';
      sceneSummary: {
        name: string;
        objectCount: number;
        objectTypes: string[];
        thumbnailUrl?: string;
      };
    };
  };
  chatId: string;
}

const ScenePreviewCard: React.FC<ScenePreviewCardProps> = ({ message, chatId }) => {
  const { navigateToVisualizerWithScene } = useWorkspace();

  // Only render if message has scene generation AND action is not 'none'
  if (!message.sceneMetadata?.hasSceneGeneration || 
      message.sceneMetadata.sceneAction === 'none') {
    return null;
  }

  const { sceneId, sceneAction, sceneSummary } = message.sceneMetadata;
  const { name, objectCount, objectTypes, thumbnailUrl } = sceneSummary;

  const handleViewInVisualizer = () => {
    navigateToVisualizerWithScene(sceneId, chatId, { openChat: true });
  };

  const getActionIcon = () => {
    switch (sceneAction) {
      case 'create':
        return '✨';
      case 'modify':
        return '🔧';
      default:
        return '🎨';
    }
  };

  const getActionText = () => {
    switch (sceneAction) {
      case 'create':
        return 'Created Scene';
      case 'modify':
        return 'Modified Scene';
      default:
        return 'Scene';
    }
  };

  return (
    <div className="scene-preview-card">
      <div className="scene-preview-header">
        <span className="scene-preview-icon">{getActionIcon()}</span>
        <span className="scene-preview-action">{getActionText()}</span>
      </div>
      
      <div className="scene-preview-content">
        {thumbnailUrl && (
          <div className="scene-preview-thumbnail">
            <img src={thumbnailUrl} alt={name} />
          </div>
        )}
        
        <div className="scene-preview-info">
          <h4 className="scene-preview-title">{name}</h4>
          <div className="scene-preview-stats">
            <span className="scene-stat">
              <span className="stat-icon">📦</span>
              <span className="stat-value">{objectCount} objects</span>
            </span>
            {objectTypes.length > 0 && (
              <span className="scene-stat">
                <span className="stat-icon">🔷</span>
                <span className="stat-value">{objectTypes.slice(0, 3).join(', ')}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      
      <button 
        className="scene-preview-button"
        onClick={handleViewInVisualizer}
      >
        <span className="button-text">View in Visualizer</span>
        <span className="button-arrow">→</span>
      </button>
    </div>
  );
};

export default ScenePreviewCard;
