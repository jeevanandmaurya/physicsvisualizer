import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

import Visualizer from '../components/Visualizer';
import SceneDetails from '../components/SceneDetails';
import SceneSelector from '../components/SceneSelector';
import Conversation from '../components/Conversation';
import "./physicsvisualizer.css";
import { useDatabase } from "../contexts/DatabaseContext";

// Helper to generate a default new scene
const createNewScene = () => ({
  id: `new-${Date.now()}`,
  name: 'New Scene',
  description: 'A new physics simulation.',
  isTemporary: true, // Flag to indicate it's not saved yet
  gravity: [0, -9.81, 0],
  hasGround: true,
  simulationScale: 'terrestrial',
  gravitationalPhysics: { enabled: false },
  objects: [
    { id: 'obj-1', type: 'Sphere', name: 'Bouncing Ball', mass: 1, radius: 0.5, position: [0, 5, 0], velocity: [1, 0, 0], color: '#ff8800' },
    { id: 'obj-2', type: 'Box', name: 'Static Block', isStatic: true, dimensions: [5, 0.5, 2], position: [5, 2, -2], rotation: [0, -0.2, 0.1], color: '#cccccc' }
  ]
});

function PhysicsVisualizerPage() {
  const dataManager = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();

  const [scene, setScene] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sceneSwitching, setSceneSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [extractedScenes, setExtractedScenes] = useState([]);
  const [rightPanelView, setRightPanelView] = useState('chat'); // 'chat' or 'details'
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);

  // Ref to hold the most up-to-date scene state for saving
  const sceneRef = useRef(null);
  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  // --- EFFECT: Load Scene Data ---
  useEffect(() => {
    let isMounted = true;
    const sceneIdToLoad = location.state?.sceneToLoad;
    const isPublic = location.state?.isPublic || false;

    const loadScene = async () => {
      setLoading(true);
      setError(null);
      try {
        let loadedScene = null;
        if (sceneIdToLoad === 'new_empty_scene') {
          loadedScene = createNewScene();
        } else if (sceneIdToLoad) {
          // The new getSceneById handles both local and example scenes
          loadedScene = await dataManager.getSceneById(sceneIdToLoad);
          if (loadedScene) {
            // Log that this scene was viewed
            dataManager.logSceneView(loadedScene.id, loadedScene.name, isPublic);
            // If it's a public scene, mark it for "forking" on save
            if (isPublic) {
              loadedScene.isExtracted = true;
            }
          }
        } else {
          // No scene specified - load the first example scene as default
          const exampleScenes = await dataManager.getScenes('examples');
          if (exampleScenes && exampleScenes.length > 0) {
            loadedScene = exampleScenes[0]; // Load the first example scene
          } else {
            // Fallback to new empty scene if no examples available
            loadedScene = createNewScene();
          }
        }

        if (isMounted) {
          if (loadedScene) {
            setScene(loadedScene);
          } else {
            setError(`Scene with ID "${sceneIdToLoad}" not found.`);
          }
        }
      } catch (err) {
        console.error("Error loading scene:", err);
        if (isMounted) setError("An unexpected error occurred while loading the scene.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (dataManager) {
      loadScene();
    }

    return () => { isMounted = false; };
  }, [location.state, dataManager, navigate]);

  // --- Scene Manipulation Handlers ---
  const handleSceneUpdate = useCallback((updatedScene) => {
    setScene(prevScene => ({ ...prevScene, ...updatedScene }));
  }, []);

  const handleSceneChange = useCallback((newScene) => {
    setScene(newScene);
  }, []);

  const handleExtractedScene = useCallback((extractedScene) => {
    setExtractedScenes(prev => [...prev, extractedScene]);
  }, []);

  const handleDeleteScene = useCallback(async (scene) => {
    if (!scene || scene.isTemporary || scene.isExtracted) return;

    if (window.confirm(`Are you sure you want to delete "${scene.name}"? This cannot be undone.`)) {
      try {
        await dataManager.deleteScene(scene.id);
        // Refresh the scene list or navigate to dashboard
        navigate('/dashboard');
      } catch (err) {
        console.error("Failed to delete scene:", err);
        alert("Error: Could not delete the scene.");
      }
    }
  }, [dataManager, navigate]);

  const handleSaveScene = useCallback(async (sceneToSave = null) => {
    const targetScene = sceneToSave || sceneRef.current;
    if (!targetScene) return;

    let sceneToSaveData = { ...targetScene };

    // If it's a temporary new scene or a forked public scene, create a new ID
    if (sceneToSaveData.isTemporary || sceneToSaveData.isExtracted) {
      delete sceneToSaveData.id; // Remove old/temporary ID to generate a new one
    }

    try {
      const savedId = await dataManager.saveScene(sceneToSaveData);
      
      // If it was a new scene, update the URL to reflect the new ID
      if (sceneToSaveData.isTemporary || sceneToSaveData.isExtracted) {
        navigate('/visualizer', { state: { sceneToLoad: savedId }, replace: true });
      } else {
        // For existing scenes, just refetch to get the latest `updatedAt` timestamp
        const updatedScene = await dataManager.getSceneById(savedId);
        setScene(updatedScene);
      }
    } catch (err) {
      console.error("Failed to save scene:", err);
      alert("Error: Could not save the scene.");
    }
  }, [dataManager, navigate]);

  const handleUpdateScene = useCallback(async (sceneToUpdate) => {
    if (!sceneToUpdate) return;
    
    try {
      await dataManager.saveScene(sceneToUpdate);
      // Refresh the current scene
      const updatedScene = await dataManager.getSceneById(sceneToUpdate.id);
      setScene(updatedScene);
    } catch (err) {
      console.error("Failed to update scene:", err);
      alert("Error: Could not update the scene.");
    }
  }, [dataManager]);

  const handleShareToPublic = useCallback(async (sceneToShare) => {
    if (!sceneToShare) return;
    
    if (window.confirm(`Are you sure you want to share "${sceneToShare.name}" to the public collection? This will make it available to all users.`)) {
      try {
        // Mark scene as public and save
        const publicScene = { ...sceneToShare, isPublic: true };
        await dataManager.saveScene(publicScene);
        alert("Scene shared to public collection successfully!");
      } catch (err) {
        console.error("Failed to share scene:", err);
        alert("Error: Could not share the scene.");
      }
    }
  }, [dataManager]);

  const handleOpenProperties = useCallback((sceneToEdit) => {
    if (!sceneToEdit) return;

    // For now, we'll just set it as the current scene
    // In the future, you could open a properties panel or modal
    setScene(sceneToEdit);
  }, []);

  // --- Chat Management Handlers ---
  const handleChatSelect = useCallback(async (chat) => {
    setCurrentChatId(chat.id);
    setCurrentChat(chat);

    // Load the chat's conversation history
    if (chat.messages) {
      setConversationHistory(chat.messages);
    } else {
      setConversationHistory([]);
    }

    // If the chat has an associated scene, load it
    if (chat.sceneId) {
      try {
        const chatScene = await dataManager.getSceneById(chat.sceneId);
        if (chatScene) {
          setScene(chatScene);
        }
      } catch (err) {
        console.error("Error loading chat scene:", err);
      }
    }
  }, [dataManager]);

  const handleNewChat = useCallback(async () => {
    // Create a new empty scene for the chat
    const newScene = createNewScene();
    setScene(newScene);

    // Create a new chat
    const newChatData = {
      title: `Chat ${new Date().toLocaleString()}`,
      sceneId: newScene.id,
      messages: []
    };

    try {
      const chatId = await dataManager.saveChat(newChatData);
      setCurrentChatId(chatId);
      setCurrentChat({ ...newChatData, id: chatId });
      setConversationHistory([]);
    } catch (err) {
      console.error("Error creating new chat:", err);
      alert("Error: Could not create new chat.");
    }
  }, [dataManager]);

  const handleSceneSwitch = useCallback(async (newSceneId) => {
    try {
      const newSceneData = await dataManager.getSceneById(newSceneId);
      if (newSceneData) {
        setScene(newSceneData);

        // Update the current chat with the new scene
        if (currentChatId && currentChat) {
          const updatedChat = {
            ...currentChat,
            sceneId: newSceneId,
            messages: conversationHistory
          };
          await dataManager.saveChat(updatedChat);
          setCurrentChat(updatedChat);
        }
      }
    } catch (err) {
      console.error("Error switching scene:", err);
      alert("Error: Could not switch scene.");
    }
  }, [dataManager, currentChatId, currentChat, conversationHistory]);

  // --- Scene Button Click Handler ---
  const handleSceneButtonClick = useCallback(async (chat, sceneIndex) => {
    try {
      setSceneSwitching(true);

      // Get the scene data from the chat's scenes array
      const sceneData = chat.scenes?.[sceneIndex];
      if (!sceneData) {
        console.warn(`No scene data found at index ${sceneIndex} for chat ${chat.id}`);
        setSceneSwitching(false);
        return;
      }

      // Load the scene by ID
      const sceneToLoad = await dataManager.getSceneById(sceneData.id);
      if (sceneToLoad) {
        setScene(sceneToLoad);

        // Update the current chat with the new scene
        if (currentChatId && currentChat) {
          const updatedChat = {
            ...currentChat,
            sceneId: sceneData.id,
            messages: conversationHistory
          };
          await dataManager.saveChat(updatedChat);
          setCurrentChat(updatedChat);
        }

        // Don't switch right panel view - preserve current tab
      } else {
        console.error(`Scene ${sceneData.id} not found`);
        alert(`Scene "${sceneData.name}" could not be loaded.`);
      }
    } catch (err) {
      console.error("Error loading scene from chat:", err);
      alert("Error: Could not load scene from chat.");
    } finally {
      setSceneSwitching(false);
    }
  }, [dataManager, currentChatId, currentChat, conversationHistory]);

  // --- Update Conversation Handler ---
  const handleUpdateConversation = useCallback(async (newMessages) => {
    setConversationHistory(newMessages);

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
  }, [currentChatId, currentChat, dataManager]);

  // --- UI Rendering ---

  if (loading) {
    return <div className="page-loading-container"><FontAwesomeIcon icon={faSpinner} spin size="3x" /><span>Loading Scene...</span></div>;
  }

  if (error) {
    return (
      <div className="page-loading-container error-state">
        <FontAwesomeIcon icon={faExclamationTriangle} size="3x" />
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/dashboard" className="button-primary">Go to Dashboard</Link>
      </div>
    );
  }

  if (!scene) {
    return null; // Should be handled by loading/error states
  }

  return (
    <div className="physics-visualizer-page">
      <div className="visualizer-main-content">
        <PanelGroup direction="horizontal" className="visualizer-panels">
          {/* Left Panel - Scene Selector */}
          <Panel defaultSize={20} minSize={15} maxSize={30} className="left-panel">
            <div className="panel-content">
              <SceneSelector
                currentScene={scene}
                handleSceneChange={handleSceneChange}
                conversationHistory={conversationHistory}
                userScenes={[]}
                loadingUserScenes={false}
                extractedScenes={extractedScenes}
                onExtractedScene={handleExtractedScene}
                onDeleteScene={handleDeleteScene}
                onSaveScene={handleSaveScene}
                onUpdateScene={handleUpdateScene}
                onShareToPublic={handleShareToPublic}
                onOpenProperties={handleOpenProperties}
                currentChatId={currentChatId}
                onChatSelect={handleChatSelect}
                onNewChat={handleNewChat}
                onSceneButtonClick={handleSceneButtonClick}
              />
            </div>
          </Panel>

          <PanelResizeHandle className="resize-handle" />

          {/* Center Panel - 3D Visualizer */}
          <Panel defaultSize={60} minSize={40} className="center-panel">
            <div className="panel-content">
              <Visualizer key={scene.id} scene={scene} />
              {/* Toggle Buttons */}
              <div className="panel-toggle-buttons">
                <button
                  className={`toggle-button ${rightPanelView === 'chat' ? 'active' : ''}`}
                  onClick={() => setRightPanelView('chat')}
                >
                  💬 Chat
                </button>
                <button
                  className={`toggle-button ${rightPanelView === 'details' ? 'active' : ''}`}
                  onClick={() => setRightPanelView('details')}
                >
                  📋 Details
                </button>
              </div>

              {/* Conditional Content */}
              {rightPanelView === 'chat' ? (
                <Conversation
                  updateConversation={handleUpdateConversation}
                  conversationHistory={conversationHistory}
                  initialMessage="Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
                  currentScene={scene}
                  onSceneSwitch={handleSceneSwitch}
                  onNewChat={handleNewChat}
                />
              ) : (
                <SceneDetails scene={scene} />
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default PhysicsVisualizerPage;
