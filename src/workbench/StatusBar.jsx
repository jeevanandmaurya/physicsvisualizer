import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faCamera, faSave, faEye, faEyeSlash, faChartLine, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useWorkspace } from '../contexts/WorkspaceContext';

const StatusBar = ({ activeView }) => {
  const { workspaceScenes, workspaceChats, isPlaying, simulationTime, fps, showVelocityVectors, vectorScale, openGraphs, togglePlayPause, resetSimulation, updateVectorScale, toggleVelocityVectors, addGraph, getCurrentScene, saveCurrentScene } = useWorkspace();
  const [showGraphDropdown, setShowGraphDropdown] = useState(false);
  const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const currentScene = getCurrentScene();

  const cycleScale = useCallback(() => {
    const scales = [1, 2, 3, 4, 5];
    const currentIndex = scales.indexOf(vectorScale);
    const nextIndex = (currentIndex + 1) % scales.length;
    updateVectorScale(scales[nextIndex]);
  }, [vectorScale, updateVectorScale]);

  const getViewInfo = () => {
    switch (activeView) {
      case 'dashboard':
        return `Dashboard`;
      case 'collection':
        return `Collection`;
      case 'visualizer':
        return `Visualizer`;
      case 'history':
        return `History`;
      case 'settings':
        return 'Settings';
      case 'analytics':
        return 'Analytics';
      default:
        return 'Ready';
    }
  };

  const getViewDetails = () => {
    switch (activeView) {
      case 'dashboard':
        return `${workspaceScenes.length} scenes`;
      case 'collection':
        return `${workspaceScenes.length} scenes`;
      case 'visualizer':
        return `Scene: ${currentScene?.name || 'None'} | Objects: ${currentScene?.objects?.length || 0} | FPS: ${fps}`;
      case 'history':
        return `${workspaceChats.length} chats`;
      case 'settings':
        return 'Preferences';
      case 'analytics':
        return 'Performance';
      default:
        return '';
    }
  };

  const handleThumbnailCapture = useCallback(() => {
    const canvas = document.querySelector('canvas[data-engine="three.js"]') ||
                   document.querySelector('.visualizer-container canvas') ||
                   document.querySelector('canvas');
    if (!canvas) {
      console.error('❌ No canvas found for thumbnail capture');
      return;
    }

    try {
      const thumbnailCanvas = document.createElement('canvas');
      const ctx = thumbnailCanvas.getContext('2d');

      const aspectRatio = canvas.width / canvas.height;
      const thumbnailWidth = 350;
      const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio);

      thumbnailCanvas.width = thumbnailWidth;
      thumbnailCanvas.height = thumbnailHeight;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      ctx.drawImage(canvas, 0, 0, thumbnailWidth, thumbnailHeight);

      const thumbnailDataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.8);
      setThumbnailPreview(thumbnailDataUrl);
      setShowThumbnailPreview(true);

      console.log('📸 Thumbnail captured successfully - showing preview');
    } catch (error) {
      console.error('❌ Failed to capture thumbnail:', error);
    }
  }, []);

  const handleThumbnailConfirm = useCallback(() => {
    console.log('✅ Thumbnail confirmed');
    setShowThumbnailPreview(false);
  }, []);

  const handleThumbnailReject = useCallback(() => {
    console.log('❌ Thumbnail rejected');
    setShowThumbnailPreview(false);
    setThumbnailPreview(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (currentScene) {
      try {
        let sceneToSave = { ...currentScene };
        if (thumbnailPreview) {
          sceneToSave.thumbnailUrl = thumbnailPreview;
        }
        const savedId = await saveCurrentScene(sceneToSave);
        console.log('💾 Scene saved with ID:', savedId);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  }, [currentScene, saveCurrentScene, thumbnailPreview]);

  const handleAddGraph = useCallback((type) => {
    addGraph(type);
    setShowGraphDropdown(false);
  }, [addGraph]);

  return (
    <div className="status-bar" style={{ height: '40px', padding: '5px 0' }}>
      <div className="status-bar-left">
        <div className="status-bar-item">View: {getViewInfo()}</div>
        <div className="status-bar-item" style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getViewDetails()}</div>
      </div>

      {activeView === 'visualizer' && (
        <div className="status-bar-controls">
          <button
            className="status-control-button"
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} style={{ fontSize: '20px' }} />
          </button>
          <button
            className="status-control-button"
            onClick={resetSimulation}
            title="Reset Simulation"
          >
            <FontAwesomeIcon icon={faRedo} style={{ fontSize: '20px' }} />
          </button>
          <div className="status-separator"></div>
          <button
            className="status-control-button"
            onClick={toggleVelocityVectors}
            title={showVelocityVectors ? 'Hide Velocity Vectors' : 'Show Velocity Vectors'}
          >
            Vector <FontAwesomeIcon icon={showVelocityVectors ? faEyeSlash : faEye} style={{ fontSize: '16px' }} />
          </button>
          <button
            className="status-control-button"
            onClick={cycleScale}
            title="Cycle Vector Scale (1x-5x)"
            style={{ fontSize: '20px' }}
          >
            x{vectorScale}
          </button>
          <div className="status-separator"></div>
          <button
            className="status-control-button"
            onClick={handleThumbnailCapture}
            title="Capture Thumbnail"
          >
            <FontAwesomeIcon icon={faCamera} style={{ fontSize: '20px' }} />
          </button>
          <button
            className="status-control-button"
            onClick={handleSave}
            title="Save Scene"
          >
            <FontAwesomeIcon icon={faSave} style={{ fontSize: '20px' }} />
          </button>
        </div>
      )}

      <div className="status-bar-right">
        <div className="status-bar-item">{isPlaying ? 'Running' : 'Ready'}</div>
      </div>

      {/* Thumbnail Preview Modal */}
      {activeView === 'visualizer' && showThumbnailPreview && thumbnailPreview && (
        <div className="thumbnail-preview-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }}>
          <div className="thumbnail-preview-content" style={{
            backgroundColor: '#2c2c2c',
            borderRadius: '8px',
            padding: '20px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>📸 Confirm Thumbnail</h3>
            <div style={{
              border: '2px solid #007acc',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <img
                src={thumbnailPreview}
                alt="Scene thumbnail preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
            <p style={{ color: '#cccccc', marginBottom: '20px', fontSize: '14px' }}>
              This thumbnail will be saved with your scene when you click Save.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={handleThumbnailConfirm}
                style={{
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✅ Accept
              </button>
              <button
                onClick={handleThumbnailReject}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
