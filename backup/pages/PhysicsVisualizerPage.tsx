import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faChevronLeft, faChevronRight, faFolderOpen, faComments, faCog, faSearch, faChartBar } from '@fortawesome/free-solid-svg-icons';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';

import Visualizer from '../features/visualizer/components/Visualizer';
import SceneSelector from '../features/collection/components/SceneSelector';
import "./physicsvisualizer.css";
import { useDatabase } from "../contexts/DatabaseContext";
import { useWorkspace, useWorkspaceScene, useWorkspaceChat, useWorkspaceSettings } from "../contexts/WorkspaceContext";
import ScenePatcher from '../core/scene/patcher';

// VS Code-inspired Layout Components
const ActivityBar = ({ activeView, onViewChange }) => (
  <div className="activity-bar">
    <button
      className={`activity-button ${activeView === 'explorer' ? 'active' : ''}`}
      onClick={() => onViewChange('explorer')}
      title="Explorer"
    >
      <FontAwesomeIcon icon={faFolderOpen} />
    </button>
    <button
      className={`activity-button ${activeView === 'chat' ? 'active' : ''}`}
      onClick={() => onViewChange('chat')}
      title="Chat"
    >
      <FontAwesomeIcon icon={faComments} />
    </button>
    <button
      className={`activity-button ${activeView === 'search' ? 'active' : ''}`}
      onClick={() => onViewChange('search')}
      title="Search"
    >
      <FontAwesomeIcon icon={faSearch} />
    </button>
    <button
      className={`activity-button ${activeView === 'settings' ? 'active' : ''}`}
      onClick={() => onViewChange('settings')}
      title="Settings"
    >
      <FontAwesomeIcon icon={faCog} />
    </button>
    <button
      className={`activity-button ${activeView === 'analytics' ? 'active' : ''}`}
      onClick={() => onViewChange('analytics')}
      title="Analytics"
    >
      <FontAwesomeIcon icon={faChartBar} />
    </button>
  </div>
);

const SideBar = ({ activeView, children }) => (
  <div className="side-bar">
    <div className="side-bar-content">
      {children}
    </div>
  </div>
);

const StatusBar = ({ scene, uiMode }) => (
  <div className="status-bar">
    <div className="status-left">
      <span className="status-item">
        {scene ? `Scene: ${scene.name}` : 'No scene loaded'}
      </span>
      <span className="status-item">
        Objects: {scene?.objects?.length || 0}
      </span>
      <span className="status-item">
        Mode: {uiMode}
      </span>
    </div>
    <div className="status-right">
      <span className="status-item">Ready</span>
    </div>
  </div>
);

// Lazy load non-critical components
const SceneDetails = React.lazy(() => import('../features/collection/components/SceneDetails'));
const Conversation = React.lazy(() => import('../components/Conversation'));
const IntegratedPanel = React.lazy(() => import('../features/chat/components/IntegratedPanel'));

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

function PhysicsVisualizerPage() {
  const dataManager = useDatabase();
  const location = useLocation();
  const navigate = useNavigate();

  // Workspace hooks
  const { createWorkspace, loadWorkspace, saveWorkspace, updateWorkspace, setIsPlaying } = useWorkspace();
  const { scene, updateScene, scenes: workspaceScenes, setCurrentScene, currentSceneIndex } = useWorkspaceScene();
  const { messages: workspaceMessages, addMessage: addWorkspaceMessage } = useWorkspaceChat();
  const { uiMode: workspaceUIMode, setUIMode: setWorkspaceUIMode } = useWorkspaceSettings();

  const scenePatcher = useRef(new ScenePatcher());
  const [loading, setLoading] = useState(true);
  const [sceneSwitching, setSceneSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [extractedScenes, setExtractedScenes] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [chatRefreshTrigger, setChatRefreshTrigger] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [sceneSelectorTab, setSceneSelectorTab] = useState('examples'); // Track SceneSelector tab
  const [capturedThumbnail, setCapturedThumbnail] = useState(null);
  const [rightPanelView, setRightPanelView] = useState(workspaceUIMode === 'simple' ? 'integrated' : 'chat'); // 'chat', 'details', or 'integrated'

  // VS Code-inspired layout states
  const [activeActivityView, setActiveActivityView] = useState('explorer'); // 'explorer', 'chat', 'search', 'settings', 'analytics'
  const [sideBarCollapsed, setSideBarCollapsed] = useState(false);
  const [useVSCodeLayout, setUseVSCodeLayout] = useState(true); // Toggle between VS Code and classic layout

  // Panel management states
  const [leftSize, setLeftSize] = useState(20);
  const [rightSize, setRightSize] = useState(20);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [leftExpandedSize, setLeftExpandedSize] = useState(20);
  const [rightExpandedSize, setRightExpandedSize] = useState(20);

  // No local scene ref needed; use workspace scene directly

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
          updateScene(loadedScene);
        } else if (sceneIdToLoad) {
          // The new getSceneById handles both local and example scenes
          loadedScene = await dataManager.getSceneById(sceneIdToLoad);
          if (loadedScene) {
            // Log that this scene was viewed
            dataManager.logSceneView(loadedScene.id, loadedScene.name, isPublic);
            // If it's a public scene, mark it for "forking" on save
            if (isPublic) {
              loadedScene.isExtracted = true;

              // Create empty chat for example scene if it doesn't exist
              try {
                const exampleChat = await dataManager.getOrCreateExampleChat(loadedScene.id, loadedScene.name);
                console.log('📝 Example chat ready:', exampleChat.id);

                // Set this as the current chat
                setCurrentChatId(exampleChat.id);
                setCurrentChat(exampleChat);
                setConversationHistory(exampleChat.messages || []);
              } catch (error) {
                console.error('❌ Failed to create example chat:', error);
              }
            }
            updateScene(loadedScene);
            // Initialize property manager with the loaded scene (safely)
            try {
              dataManager.initializePropertiesFromScene?.(loadedScene);
            } catch (error) {
              console.warn('Property manager initialization failed:', error);
            }
          }
        } else {
          // No scene specified - don't load a default scene if we have chats
          // Let the chat selection handle scene loading
          console.log('📝 No specific scene requested, will load based on chat selection');
        }

        if (isMounted) {
          if (!sceneIdToLoad) {
            // If no scene was requested and none was loaded, wait for chat selection
            console.log('⏳ Waiting for chat selection to determine scene');
          } else if (!loadedScene) {
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
  }, [location.state, dataManager, navigate, updateScene]);

  // --- Scene Manipulation Handlers ---
  const handleSceneUpdate = useCallback((updatedScene) => {
    updateScene(updatedScene);
  }, [updateScene]);

  const handleSceneChange = useCallback((newScene) => {
    updateScene(newScene);
  }, [updateScene]);

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
    const targetScene = sceneToSave || scene;
    if (!targetScene) return;

    let sceneToSaveData = { ...targetScene };

    // Include captured thumbnail if available
    if (capturedThumbnail) {
      sceneToSaveData.thumbnailUrl = capturedThumbnail;
      console.log('📸 Including captured thumbnail in scene save');
      setCapturedThumbnail(null); // Clear after use
    }

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
        updateScene(updatedScene);

        // If user came from collection page, navigate back with refresh flag
        if (location.state?.fromCollection) {
          navigate('/collection', { state: { refreshScenes: true, activeTab: 'myScenes' }, replace: true });
        }
      }
    } catch (err) {
      console.error("Failed to save scene:", err);
      alert("Error: Could not save the scene.");
    }
  }, [dataManager, navigate, capturedThumbnail, scene, updateScene]);

  const handleUpdateScene = useCallback(async (sceneToUpdate) => {
    if (!sceneToUpdate) return;
    
    try {
      await dataManager.saveScene(sceneToUpdate);
      // Refresh the current scene
      const updatedScene = await dataManager.getSceneById(sceneToUpdate.id);
      updateScene(updatedScene);
    } catch (err) {
      console.error("Failed to update scene:", err);
      alert("Error: Could not update the scene.");
    }
  }, [dataManager, updateScene]);

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
    if (chat === null) {
      // Clear the current chat selection
      setCurrentChatId(null);
      setCurrentChat(null);
      setConversationHistory([]);
      return;
    }

    console.log('🎯 Selecting chat:', chat.id, 'sceneId:', chat.sceneId);

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
        console.log('🔍 Loading scene for chat:', chat.sceneId);
        const chatScene = await dataManager.getSceneById(chat.sceneId);
        if (chatScene) {
          console.log('✅ Loaded scene for chat:', chatScene.name);
          setScene(chatScene);
        } else {
          console.log('⚠️ Scene not found for chat, creating new scene');
          // If scene doesn't exist, create a new one for this chat
          const newScene = createNewScene();
          setScene(newScene);

          // Update the chat with the new scene ID
          const updatedChat = { ...chat, sceneId: newScene.id };
          await dataManager.saveChat(updatedChat);
          setCurrentChat(updatedChat);
        }
      } catch (err) {
        console.error("❌ Error loading chat scene:", err);
        // If there's an error loading the scene, create a new one
        console.log('🔄 Creating new scene due to error');
        const newScene = createNewScene();
        setScene(newScene);

        // Update the chat with the new scene ID
        const updatedChat = { ...chat, sceneId: newScene.id };
        await dataManager.saveChat(updatedChat);
        setCurrentChat(updatedChat);
      }
    } else {
      console.log('📝 Chat has no sceneId, creating new scene');
      // If chat doesn't have a sceneId, create a new scene
      const newScene = createNewScene();
      setScene(newScene);

      // Update the chat with the new scene ID
      const updatedChat = { ...chat, sceneId: newScene.id };
      await dataManager.saveChat(updatedChat);
      setCurrentChat(updatedChat);
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
      // Trigger refresh of chat history in SceneSelector
      setChatRefreshTrigger(prev => prev + 1);
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

      console.log('🎯 Scene button clicked:', chat.id, 'sceneIndex:', sceneIndex);

      // Get the scene data from the chat's scenes array
      const sceneData = chat.scenes?.[sceneIndex];
      if (!sceneData) {
        console.warn(`No scene data found at index ${sceneIndex} for chat ${chat.id}`);
        setSceneSwitching(false);
        return;
      }

      console.log('🔍 Loading scene:', sceneData.id, sceneData.name);

      // Load the scene by ID
      const sceneToLoad = await dataManager.getSceneById(sceneData.id);
      if (sceneToLoad) {
        console.log('✅ Scene loaded successfully:', sceneToLoad.name);
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
        console.error(`❌ Scene ${sceneData.id} not found, creating new scene`);
        // If scene doesn't exist, create a new one
        const newScene = createNewScene();
        setScene(newScene);

        // Update the chat with the new scene ID
        const updatedChat = { ...chat, sceneId: newScene.id };
        await dataManager.saveChat(updatedChat);

        // If this is the current chat, update it
        if (currentChatId === chat.id) {
          setCurrentChat(updatedChat);
        }
      }
    } catch (err) {
      console.error("❌ Error loading scene from chat:", err);
      // If there's an error, create a new scene
      console.log('🔄 Creating new scene due to error');
      const newScene = createNewScene();
      setScene(newScene);

      // Update the chat with the new scene ID
      const updatedChat = { ...chat, sceneId: newScene.id };
      await dataManager.saveChat(updatedChat);

      // If this is the current chat, update it
      if (currentChatId === chat.id) {
        setCurrentChat(updatedChat);
      }
    } finally {
      setSceneSwitching(false);
    }
  }, [dataManager, currentChatId, currentChat, conversationHistory]);

  // --- Update Conversation Handler ---
  const handleUpdateConversation = useCallback(async (newMessages) => {
    setConversationHistory(newMessages);

    // Add new messages to workspace
    const latestMessage = newMessages[newMessages.length - 1];
    if (latestMessage) {
      addWorkspaceMessage(latestMessage);
    }

    // Check if user just started chatting on an example scene
    const userMessages = newMessages.filter(msg => msg.isUser);
    const aiMessages = newMessages.filter(msg => !msg.isUser);
    const isExampleScene = scene && !scene.isTemporary && !scene.isExtracted;
    const isExampleChat = currentChat && currentChat.id && currentChat.id.startsWith('example-');

    // If user sends first message on example scene and we're on examples tab, switch to chats
    if (userMessages.length === 1 && aiMessages.length >= 1 && isExampleScene && isExampleChat && sceneSelectorTab === 'examples') {
      console.log('🔄 User started chatting on example scene, switching to chats tab');
      setSceneSelectorTab('chats');
      // Trigger refresh to show the new chat in the chats list
      setChatRefreshTrigger(prev => prev + 1);
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
  }, [currentChatId, currentChat, dataManager, scene, sceneSelectorTab, addWorkspaceMessage]);

  // --- AI Scene Update Handler ---
  const handleAISceneUpdate = useCallback(async (propertyPath, value, reason) => {
    try {
      // Handle new JSON patch system
      if (propertyPath === 'scene.fullUpdate') {
        console.log('🔄 Applying full scene update from AI');
        // Value is the complete updated scene
        const updatedScene = { ...scene, ...value };
        updateScene(updatedScene);
        console.log('✅ Scene updated successfully');
        return;
      }

      // Fallback to old property-based system for backward compatibility
      if (dataManager?.setProperty && dataManager?.getSceneFromProperties && scene?.id) {
        // Only clear objects if this is explicitly creating a fresh scene
        // Check the reason to see if this is a "create new scene" type command
        const isCreatingFreshScene = reason?.toLowerCase().includes('create') ||
                                   reason?.toLowerCase().includes('new scene') ||
                                   reason?.toLowerCase().includes('fresh scene');

        if (isCreatingFreshScene && propertyPath.startsWith('object.') && propertyPath.includes('.type')) {
          dataManager.clearObjectProperties?.();
        }

        await dataManager.setProperty(propertyPath, value, reason);

        // Get updated scene data
        const updatedScene = dataManager.getSceneFromProperties(scene.id);

        if (updatedScene) {
          updateScene(updatedScene);
        } else {
          console.error('❌ No updated scene returned from getSceneFromProperties');
        }
      } else {
        console.error('❌ Missing required dependencies:', {
          hasSetProperty: !!dataManager?.setProperty,
          hasGetSceneFromProperties: !!dataManager?.getSceneFromProperties,
          hasSceneId: !!scene?.id
        });
      }
    } catch (error) {
      console.error('💥 Failed to apply AI scene modification:', error);
      // Don't throw error to prevent chat from breaking
    }
  }, [dataManager, scene?.id, scene, updateScene]);

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
        console.log('📸 Including captured thumbnail in AI changes save');
        setCapturedThumbnail(null); // Clear after use
      }

      // Save the updated scene to persist changes
      const savedSceneId = await dataManager.saveScene(updatedScene);
      console.log('💾 Scene saved with ID:', savedSceneId);

      // Update the current chat with the new scene ID and scenes array
      if (currentChatId && currentChat) {
        // Ensure the chat has a scenes array
        const currentScenes = currentChat.scenes || [];

        // Check if this scene is already in the chat's scenes array
        const existingSceneIndex = currentScenes.findIndex(s => s.id === savedSceneId);

        let updatedScenes;
        if (existingSceneIndex !== -1) {
          // Update existing scene entry
          updatedScenes = [...currentScenes];
          updatedScenes[existingSceneIndex] = {
            ...updatedScenes[existingSceneIndex],
            name: updatedScene.name,
            timestamp: new Date().toISOString()
          };
        } else {
          // Add new scene entry
          updatedScenes = [...currentScenes, {
            id: savedSceneId,
            name: updatedScene.name,
            timestamp: new Date().toISOString()
          }];
        }

        const updatedChat = {
          ...currentChat,
          sceneId: savedSceneId,
          scenes: updatedScenes,
          messages: conversationHistory
        };

        await dataManager.saveChat(updatedChat);
        setCurrentChat(updatedChat);
        console.log('🔄 Chat updated with new scene ID and scenes array:', savedSceneId);
      }

      // Update local state
      setScene(updatedScene);

      // Clear preview state
      setPendingChanges(null);
      setIsPreviewMode(false);

      // Trigger refresh of chat history in SceneSelector to show updated scenes
      setChatRefreshTrigger(prev => prev + 1);

      console.log('✅ Changes accepted and applied successfully');
    } catch (error) {
      console.error('❌ Failed to accept changes:', error);
      alert('Failed to apply changes. Please try again.');
    }
  }, [pendingChanges, scene, dataManager, currentChatId, currentChat, conversationHistory, capturedThumbnail]);

  const handleRejectChanges = useCallback(() => {
    console.log('❌ Rejecting AI changes...');
    // Clear preview state - scene will revert to original state
    setPendingChanges(null);
    setIsPreviewMode(false);
    console.log('✅ Changes rejected - reverted to previous state');
  }, []);

  // --- Thumbnail Capture Handler ---
  const handleThumbnailCapture = useCallback((thumbnailDataUrl) => {
    try {
      const sizeKb = Math.round((thumbnailDataUrl.length * 3 / 4) / 1024);
      console.log(`📸 Thumbnail captured, storing for next save (approx ${sizeKb} KB)`);
    } catch (e) {
      console.log('📸 Thumbnail captured, storing for next save');
    }
    setCapturedThumbnail(thumbnailDataUrl);

    // Auto-save the current scene immediately with the captured thumbnail so it appears in the collection
    try {
      const currentScene = sceneRef.current || scene;
      if (currentScene) {
        const sceneWithThumb = { ...currentScene, thumbnailUrl: thumbnailDataUrl };
        // Fire-and-forget save; handleSaveScene will navigate or refresh as appropriate
        handleSaveScene(sceneWithThumb).catch(err => console.warn('Auto-save thumbnail failed:', err));
      } else {
        console.log('No active scene to attach thumbnail to');
      }
    } catch (e) {
      console.warn('Failed to auto-save thumbnail:', e);
    }
  }, []);

  // Panel toggle handlers
  const toggleLeftPanel = useCallback(() => {
    setLeftCollapsed(!leftCollapsed);
  }, [leftCollapsed]);

  const toggleRightPanel = useCallback(() => {
    setRightCollapsed(!rightCollapsed);
  }, [rightCollapsed]);



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

  // If no scene is loaded yet, show a loading state
  if (!scene) {
    return (
      <div className="physics-visualizer-page">
        <div className="visualizer-main-content" style={{ height: '100vh' }}>
          <PanelGroup direction="horizontal" className="visualizer-panels" style={{ height: '100vh' }}>
            {/* Left Panel - Scene Selector */}
            <Panel defaultSize={20} minSize={15} maxSize={30} className="left-panel">
              <div className="panel-content">
                <SceneSelector
                  currentScene={null}
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
                  refreshTrigger={chatRefreshTrigger}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle" />

            {/* Center Panel - 3D Visualizer */}
            <Panel defaultSize={60} minSize={40} className="center-panel">
              <div className="panel-content">
                <div className="scene-loading-overlay">
                  <div className="scene-loading-content">
                    <span>Please select a chat or scene to begin</span>
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="resize-handle" />

            {/* Right Panel - Toggle between Chat and Scene Details */}
            <Panel defaultSize={20} minSize={15} maxSize={30} className="right-panel">
              <div className="panel-content">
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
                <Suspense fallback={<ComponentLoader />}>
                  {rightPanelView === 'chat' ? (
                  <Conversation
                    updateConversation={handleUpdateConversation}
                    conversationHistory={conversationHistory}
                    initialMessage="Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
                    currentScene={null}
                    onSceneSwitch={handleSceneSwitch}
                    onNewChat={handleNewChat}
                    onSceneUpdate={handleAISceneUpdate}
                    onPendingChanges={setPendingChanges}
onPreviewMode={(mode) => {
  setIsPreviewMode(mode);
  if (mode) {
    setIsPlaying(false);
  }
}}
                    chatId={currentChatId}
                  />
                  ) : (
                    <SceneDetails scene={null} />
                  )}
                </Suspense>
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="vscode-workbench">
      {/* Activity Bar - Leftmost sidebar */}
      <ActivityBar
        activeView={activeActivityView}
        onViewChange={setActiveActivityView}
      />

      {/* Side Bar - Collapsible panel */}
      <SideBar activeView={activeActivityView}>
        <SceneSelector
          currentScene={scene}
          handleSceneChange={handleSceneChange}
          conversationHistory={conversationHistory}
          userScenes={[]}
          loadingUserScenes={false}
          extractedScenes={extractedScenes}
          workspaceScenes={workspaceScenes}
          currentSceneIndex={currentSceneIndex}
          onSetCurrentScene={setCurrentScene}
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
          refreshTrigger={chatRefreshTrigger}
          activeTab={sceneSelectorTab}
          onTabChange={setSceneSelectorTab}
          uiMode={workspaceUIMode}
        />
      </SideBar>

      {/* Editor Area - Main 3D visualization */}
      <div className="editor-area">
        <div className="editor-content">
          <div style={{ height: '100vh', width: '100%' }}>
            <Visualizer
              key={`visualizer-${scene.id}`}
              scene={scene}
              pendingChanges={pendingChanges}
              isPreviewMode={isPreviewMode}
              onAcceptChanges={handleAcceptChanges}
              onRejectChanges={handleRejectChanges}
              onThumbnailCapture={handleThumbnailCapture}
              uiMode={workspaceUIMode}
              onModeChange={setWorkspaceUIMode}
            />
          </div>
          {sceneSwitching && (
            <div className="scene-loading-overlay">
              <div className="scene-loading-content">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <span>Loading Scene...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Panel Area - Right side panels */}
      <div className="panel-area">
        <Suspense fallback={<ComponentLoader />}>
          {workspaceUIMode === 'simple' ? (
            <IntegratedPanel
              updateConversation={handleUpdateConversation}
              conversationHistory={conversationHistory}
              initialMessage="Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
              currentScene={scene}
              onSceneSwitch={handleSceneSwitch}
              onNewChat={handleNewChat}
              onSceneUpdate={handleAISceneUpdate}
              onPendingChanges={setPendingChanges}
onPreviewMode={(mode) => {
  setIsPreviewMode(mode);
  if (mode) {
    setIsPlaying(false);
  }
}}
              chatId={currentChatId}
            />
          ) : (
            <>
              {/* Panel Tabs */}
              <div className="panel-tabs">
                <button
                  className={`panel-tab ${rightPanelView === 'chat' ? 'active' : ''}`}
                  onClick={() => setRightPanelView('chat')}
                >
                  💬 Chat
                </button>
                <button
                  className={`panel-tab ${rightPanelView === 'details' ? 'active' : ''}`}
                  onClick={() => setRightPanelView('details')}
                >
                  📋 Details
                </button>
              </div>

              {/* Panel Content */}
              <div className="panel-content">
                {rightPanelView === 'chat' ? (
                  <Conversation
                    updateConversation={handleUpdateConversation}
                    conversationHistory={conversationHistory}
                    initialMessage="Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?"
                    currentScene={scene}
                    onSceneSwitch={handleSceneSwitch}
                    onNewChat={handleNewChat}
                    onSceneUpdate={handleAISceneUpdate}
                    onPendingChanges={setPendingChanges}
                    onPreviewMode={setIsPreviewMode}
                    chatId={currentChatId}
                  />
                ) : (
                  <SceneDetails scene={scene} />
                )}
              </div>
            </>
          )}
        </Suspense>
      </div>

      {/* Status Bar - Bottom bar */}
      <StatusBar scene={scene} uiMode={workspaceUIMode} />
    </div>
  );
}

export default PhysicsVisualizerPage;
