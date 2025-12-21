import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faCamera, faSave, faChartLine, faChevronDown, faChevronUp, faComments, faSlidersH, faRepeat, faList } from '@fortawesome/free-solid-svg-icons';
import { useWorkspace } from '../contexts/WorkspaceContext';


const StatusBar = ({ activeView, chatOpen, onChatToggle, graphOpen, onGraphToggle, controllerOpen, onControllerToggle, sceneSelectorOpen, onSceneSelectorToggle }) => {
  const { workspaceScenes, workspaceChats, isPlaying, simulationTime, fps, openGraphs, togglePlayPause, resetSimulation, addGraph, getCurrentScene, saveCurrentScene, loopMode, toggleLoop, simulationSpeed, setSimulationSpeed } = useWorkspace();



  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }, []);

  const handleGraphToggle = useCallback(() => {
    if (!graphOpen) {
      // When opening graphs, add a default position graph if none exist
      if (openGraphs.length === 0) {
        addGraph('position');
      }
    }
    onGraphToggle();
  }, [graphOpen, onGraphToggle, openGraphs.length, addGraph]);
  const [showGraphDropdown, setShowGraphDropdown] = useState(false);
  const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const currentScene = getCurrentScene();

  const cycleSimulationSpeed = useCallback(() => {
    const speeds = [0.125, 0.25, 0.5, 1];
    const currentIndex = speeds.indexOf(simulationSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setSimulationSpeed(speeds[nextIndex]);
  }, [simulationSpeed, setSimulationSpeed]);

  const getViewInfo = () => {
    const viewNames = {
      dashboard: 'Dashboard',
      collection: 'Collection',
      visualizer: 'Visualizer',
      settings: 'Settings'
    };
    return viewNames[activeView] || 'Ready';
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
    <div className="status-bar">
      <div className="status-bar-left">
        {activeView === 'visualizer' && currentScene && (
          <>
            <div className="status-bar-item scene-name">
              <FontAwesomeIcon icon={faList} style={{ fontSize: '10px', opacity: 0.8 }} />
              {currentScene.name}
            </div>
            <div className="status-separator"></div>
            <div className="status-bar-item performance-info">
              <span className="label">FPS:</span> <span className="value">{fps}</span>
            </div>
          </>
        )}
      </div>

      {activeView === 'visualizer' && currentScene && (
        <div className="status-bar-controls">
          <button
            className="status-control-button"
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
          </button>
          <button
            className="status-control-button"
            onClick={resetSimulation}
            title="Reset"
          >
            <FontAwesomeIcon icon={faRedo} />
          </button>
          <div className="status-separator"></div>
          <button
            className="status-control-button speed-button"
            onClick={cycleSimulationSpeed}
            title="Speed"
          >
            {simulationSpeed}x
          </button>
          <div className="status-separator"></div>
          <button
            className={`status-control-button ${sceneSelectorOpen ? 'active' : ''}`}
            onClick={onSceneSelectorToggle}
            title="Scenes"
          >
            <FontAwesomeIcon icon={faList} />
          </button>
          <button
            className={`status-control-button ${chatOpen ? 'active' : ''}`}
            onClick={onChatToggle}
            title="AI Chat"
          >
            <FontAwesomeIcon icon={faComments} />
          </button>
          <button
            className={`status-control-button ${graphOpen ? 'active' : ''}`}
            onClick={handleGraphToggle}
            title="Graphs"
          >
            <FontAwesomeIcon icon={faChartLine} />
          </button>
          <button
            className={`status-control-button ${controllerOpen ? 'active' : ''}`}
            onClick={onControllerToggle}
            title="Controls"
          >
            <FontAwesomeIcon icon={faSlidersH} />
          </button>
        </div>
      )}

      <div className="status-bar-right">
        {activeView === 'visualizer' && currentScene && (
          <div className="status-bar-item time-display">
            <FontAwesomeIcon icon={faCamera} style={{ marginRight: '8px', cursor: 'pointer', opacity: 0.8 }} onClick={handleThumbnailCapture} title="Capture Thumbnail" />
            {formatTime(simulationTime)}
          </div>
        )}
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
              border: '2px solid #0098ff',
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
