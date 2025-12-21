import React, { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faTachometerAlt, faSave, faChartLine, faChevronDown, faChevronUp, faComments, faSlidersH, faRepeat, faList } from '@fortawesome/free-solid-svg-icons';
import { useWorkspace } from '../contexts/WorkspaceContext';


const StatusBar = ({ activeView, chatOpen, onChatToggle, graphOpen, onGraphToggle, controllerOpen, onControllerToggle, sceneSelectorOpen, onSceneSelectorToggle }) => {
  const { workspaceScenes, workspaceChats, isPlaying, simulationTime, fps, openGraphs, togglePlayPause, resetSimulation, addGraph, getCurrentScene, saveCurrentScene, loopMode, toggleLoop, simulationSpeed, setSimulationSpeed, showStats, setShowStats } = useWorkspace();



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

  const handleSave = useCallback(async () => {
    if (currentScene) {
      try {
        let sceneToSave = { ...currentScene };
        const savedId = await saveCurrentScene(sceneToSave);
        console.log('💾 Scene saved with ID:', savedId);
      } catch (err) {
        console.error('Save failed:', err);
      }
    }
  }, [currentScene, saveCurrentScene]);

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
              <span className="label">FPS:</span> 
              <span className="value" style={{ 
                color: fps < 30 ? '#ff6b6b' : (fps < 50 ? '#fcc419' : 'inherit') 
              }}>{fps}</span>
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
            <FontAwesomeIcon 
              icon={faTachometerAlt} 
              className={`status-stats-icon ${showStats ? 'active' : ''}`}
              onClick={() => setShowStats(!showStats)} 
              title="Toggle Physics Stats" 
            />
            <span className="time-value">{formatTime(simulationTime)}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default StatusBar;
