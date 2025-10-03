import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faSquare, faSquareFull, faImage, faRocket } from '@fortawesome/free-solid-svg-icons';
import Visualizer from '../ui-logic/visualizer/Visualizer';
import { useDatabase } from '../contexts/DatabaseContext';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat, useWorkspaceSettings } from '../contexts/WorkspaceContext';
import './VisualizerView.css';


// Lazy load non-critical components (none needed currently)

// Loading component for lazy-loaded components
const ComponentLoader = () => (
  <div className="component-loading">
    <FontAwesomeIcon icon={faSpinner} spin />
    <span>Loading...</span>
  </div>
);

// Helper to generate a default new scene
const createNewScene = () => ({
  id: `new-${Date.now()}`,
  name: 'New Scene',
  description: 'A new physics simulation.',
  isTemporary: true, // Flag to indicate it's not saved yet
  gravity: [0, -9.81, 0],
  hasGround: true, // GroundPlane component handles ground rendering
  simulationScale: 'terrestrial',
  gravitationalPhysics: { enabled: false },
  objects: [] // No default ground box - GroundPlane handles ground
});

function VisualizerView() {
  const dataManager = useDatabase();

  // Workspace hooks
  const { createWorkspace, loadWorkspace, saveWorkspace, updateWorkspace } = useWorkspace();
  const { scene: workspaceScene, updateScene: updateWorkspaceScene, scenes: workspaceScenes } = useWorkspaceScene();
  const { messages: workspaceMessages, addMessage: addWorkspaceMessage } = useWorkspaceChat();
  const { uiMode: workspaceUIMode, setUIMode: setWorkspaceUIMode } = useWorkspaceSettings();

  const [loading, setLoading] = useState(true);
  const [sceneSwitching, setSceneSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [capturedThumbnail, setCapturedThumbnail] = useState(null);
  const [rightPanelView, setRightPanelView] = useState(workspaceUIMode === 'simple' ? 'integrated' : 'chat');
  const [showSceneDetails, setShowSceneDetails] = useState(false);
  // Use workspace scene directly
  const scene = workspaceScene;
  // Determine initial background type from the scene JSON if provided.
  // Accept multiple possible keys for backward compatibility: scene.background or scene.backgroundType
  const inferBackgroundFromScene = (s) => {
    if (!s) return 'normal';
    // scene may store a simple string or an object like { type: 'space' }
    const value = s.background || s.backgroundType || (s.bg && (typeof s.bg === 'string' ? s.bg : s.bg.type));
    if (!value) return 'normal';
    // Normalize known values
    const v = String(value).toLowerCase();
    if (v === 'black' || v === '#000' || v === '#000000') return 'black';
    if (v === 'white' || v === '#fff' || v === '#ffffff') return 'white';
    if (v === 'space' || v === 'space.svg') return 'space';
    return 'normal';
  };

  const [backgroundType, setBackgroundType] = useState(() => inferBackgroundFromScene(scene)); // 'black', 'white', 'normal', 'space'

  // Keep backgroundType in sync when the workspace scene changes
  useEffect(() => {
    setBackgroundType(inferBackgroundFromScene(scene));
  }, [scene]);


  // --- Scene Manipulation Handlers ---
  const handleSceneUpdate = useCallback((updatedScene) => {
    // Update workspace scene
    updateWorkspaceScene(updatedScene);
  }, [updateWorkspaceScene]);

  const handleSceneChange = useCallback((newScene) => {
    // Update workspace with new scene
    updateWorkspaceScene(newScene);
  }, [updateWorkspaceScene]);

  const handleSaveScene = useCallback(async (sceneToSave = null) => {
    const targetScene = sceneToSave || scene;
    if (!targetScene) return;

    let sceneToSaveData = { ...targetScene };

    // Include captured thumbnail if available
    if (capturedThumbnail) {
      sceneToSaveData.thumbnailUrl = capturedThumbnail;
      console.log('📸 Including captured thumbnail in scene save');
      setCapturedThumbnail(null); // Clear after use
    }

    // If it's a temporary new scene, create a new ID
    if (sceneToSaveData.isTemporary) {
      delete sceneToSaveData.id; // Remove old/temporary ID to generate a new one
    }

    try {
      const savedId = await dataManager.saveScene(sceneToSaveData);
      console.log('💾 Scene saved with ID:', savedId);
    } catch (err) {
      console.error("Failed to save scene:", err);
      alert("Error: Could not save the scene.");
    }
  }, [dataManager, capturedThumbnail]);

  // --- Update Conversation Handler ---
  const handleUpdateConversation = useCallback(async (newMessages) => {
    setConversationHistory(newMessages);

    // Add new messages to workspace
    const latestMessage = newMessages[newMessages.length - 1];
    if (latestMessage) {
      addWorkspaceMessage(latestMessage);
    }

    // Update the current chat with the new messages
    if (currentChatId && currentChat) {
      const updatedChat = {
        ...currentChat,
        messages: newMessages,
        updatedAt: new Date().toISOString()
      };
      await dataManager.saveChat(updatedChat);
      setCurrentChat(updatedChat);
    }
  }, [currentChatId, currentChat, dataManager, addWorkspaceMessage]);

  // --- AI Scene Update Handler ---
  const handleAISceneUpdate = useCallback(async (propertyPath, value, reason) => {
    try {
      // Handle new JSON patch system
      if (propertyPath === 'scene.fullUpdate') {
        console.log('🔄 Applying full scene update from AI');
        // Value is the complete updated scene
        const updatedScene = { ...scene, ...value };
        updateWorkspaceScene(updatedScene);
        console.log('✅ Scene updated successfully');
        return;
      }

      // Fallback to old property-based system for backward compatibility
      if (dataManager?.setProperty && dataManager?.getSceneFromProperties && scene?.id) {
        await dataManager.setProperty(propertyPath, value, reason);
        // Get updated scene data
        const updatedScene = dataManager.getSceneFromProperties(scene.id);
        if (updatedScene) {
          updateWorkspaceScene(updatedScene);
        }
      }
    } catch (error) {
      console.error('💥 Failed to apply AI scene modification:', error);
    }
  }, [dataManager, scene, updateWorkspaceScene]);

  // --- Accept/Reject Changes Handlers ---
  const handleAcceptChanges = useCallback(async () => {
    if (!pendingChanges || !scene) return;

    try {
      console.log('✅ Accepting AI changes...');
      // Apply the changes permanently
      const updatedScene = await dataManager.applyScenePatches(scene, pendingChanges);

      // Include captured thumbnail if available
      if (capturedThumbnail) {
        updatedScene.thumbnailUrl = capturedThumbnail;
        setCapturedThumbnail(null);
      }

      // Save the updated scene
      const savedSceneId = await dataManager.saveScene(updatedScene);
      console.log('💾 Scene saved with ID:', savedSceneId);

      // Update workspace scene
      updateWorkspaceScene(updatedScene);
      setPendingChanges(null);
      setIsPreviewMode(false);

      console.log('✅ Changes accepted and applied successfully');
    } catch (error) {
      console.error('❌ Failed to accept changes:', error);
      alert('Failed to apply changes. Please try again.');
    }
  }, [pendingChanges, scene, dataManager, capturedThumbnail]);

  const handleRejectChanges = useCallback(() => {
    console.log('❌ Rejecting AI changes...');
    setPendingChanges(null);
    setIsPreviewMode(false);
    console.log('✅ Changes rejected - reverted to previous state');
  }, []);

  // --- Thumbnail Capture Handler ---
  const handleThumbnailCapture = useCallback((thumbnailDataUrl) => {
    console.log('📸 Thumbnail captured');
    setCapturedThumbnail(thumbnailDataUrl);
  }, []);

  // --- Scene Details Toggle Handler ---
  const handleToggleSceneDetails = useCallback(() => {
    setShowSceneDetails(prev => !prev);
  }, []);
  // Set loading to false after initialization
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

  if (error) {
    return (
      <div className="page-loading-container error-state">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="visualizer-container" style={{ position: 'relative' }}>
      {/* Background Controls Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '6px',
        padding: '6px',
        display: 'flex',
        gap: '4px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Left-to-right order: hollow square (black), filled square (white), image (normal), rocket (space) */}
        {[
          { type: 'black', icon: faSquare, tooltip: 'Solid Black (#000000)' },
          { type: 'white', icon: faSquareFull, tooltip: 'Solid White (#ffffff)' },
          { type: 'normal', icon: faImage, tooltip: 'Normal SVG (background.svg)' },
          { type: 'space', icon: faRocket, tooltip: 'Space SVG (space.svg)' }
        ].map(({ type, icon, tooltip }) => (
          <button
            key={type}
            onClick={() => setBackgroundType(type)}
            title={tooltip}
            aria-pressed={backgroundType === type}
            style={{
              backgroundColor: backgroundType === type ? 'rgba(0, 123, 255, 0.8)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
          >
            <FontAwesomeIcon icon={icon} style={{ fontSize: '12px' }} />
          </button>
        ))}
      </div>

      <Visualizer
        key={`visualizer-${scene?.id || 'new'}`}
        scene={scene}
        pendingChanges={pendingChanges}
        isPreviewMode={isPreviewMode}
        onAcceptChanges={handleAcceptChanges}
        onRejectChanges={handleRejectChanges}
        onThumbnailCapture={handleThumbnailCapture}
        uiMode={workspaceUIMode}
        onModeChange={setWorkspaceUIMode}
        showControls={false} // Controls are now in status bar
        showSceneDetails={showSceneDetails}
        onToggleSceneDetails={handleToggleSceneDetails}
        backgroundType={backgroundType}
      />
      {sceneSwitching && (
        <div className="scene-loading-overlay">
          <div className="scene-loading-content">
            <span>Loading Scene...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualizerView;
