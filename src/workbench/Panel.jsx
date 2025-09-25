import React, { useState, useCallback, useEffect } from 'react';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat, useWorkspaceSettings } from '../contexts/WorkspaceContext';
import { useDatabase } from '../contexts/DatabaseContext';
import { useSceneSelector } from '../features/collection/hooks/useSceneSelector';
import { useSceneDetails } from '../features/collection/hooks/useSceneDetails';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBookOpen, faSpinner, faExclamationTriangle, faEllipsisV, faTrash, faSave, faEdit, faShare, faComments, faTimes, faCube, faEye, faEyeSlash, faList, faCode } from '@fortawesome/free-solid-svg-icons';
import '../features/collection/components/SceneSelector.css';
import '../features/collection/components/SceneDetails.css';

// Loading component
const ComponentLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
    <span>Loading...</span>
  </div>
);

const SidePanel = ({ showSceneDetails = false, onToggleSceneDetails }) => {
  const { setCurrentView } = useWorkspace();
  const { scene, replaceCurrentScene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const { uiMode } = useWorkspaceSettings();
  const dataManager = useDatabase();

  const [currentChatId, setCurrentChatId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userScenes, setUserScenes] = useState([]);
  const [loadingUserScenes, setLoadingUserScenes] = useState(false);

  // Load user scenes
  useEffect(() => {
    const loadUserScenes = async () => {
      if (!dataManager) return;
      setLoadingUserScenes(true);
      try {
        const scenes = await dataManager.getScenes('user', {
          orderBy: { field: 'updatedAt', direction: 'desc' }
        });
        setUserScenes(scenes || []);
      } catch (error) {
        console.error('Error loading user scenes:', error);
        setUserScenes([]);
      } finally {
        setLoadingUserScenes(false);
      }
    };

    loadUserScenes();
  }, [dataManager]);

  const handleSceneChange = useCallback((newScene) => {
    console.log('Changing scene to:', newScene);
    replaceCurrentScene(newScene);
  }, [replaceCurrentScene]);

  const handleChatSelect = useCallback((chat) => {
    if (chat === null) {
      setCurrentChatId(null);
      setConversationHistory([]);
      return;
    }

    setCurrentChatId(chat.id);
    setConversationHistory(chat.messages || []);
  }, []);

  const handleNewChat = useCallback(() => {
    // Create a new chat
    const newChatId = `chat-${Date.now()}`;
    setCurrentChatId(newChatId);
    setConversationHistory([]);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleSceneButtonClick = useCallback((chat, sceneIndex) => {
    // Handle scene switching from chat
    console.log('Scene button clicked:', chat, sceneIndex);
    if (chat.scenes && chat.scenes[sceneIndex]) {
      handleSceneChange(chat.scenes[sceneIndex]);
    }
  }, [handleSceneChange]);

  const handleSaveScene = useCallback(async (sceneToSave) => {
    if (!dataManager) return;
    try {
      const savedId = await dataManager.saveScene(sceneToSave);
      console.log('Scene saved with ID:', savedId);
      // Refresh user scenes
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
    } catch (error) {
      console.error('Error saving scene:', error);
      alert('Error saving scene');
    }
  }, [dataManager]);

  const handleUpdateScene = useCallback(async (sceneToUpdate) => {
    if (!dataManager) return;
    try {
      await dataManager.saveScene(sceneToUpdate);
      console.log('Scene updated:', sceneToUpdate.id);
      // Refresh user scenes
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
    } catch (error) {
      console.error('Error updating scene:', error);
      alert('Error updating scene');
    }
  }, [dataManager]);

  const handleDeleteScene = useCallback(async (sceneToDelete) => {
    if (!dataManager) return;
    if (!window.confirm(`Are you sure you want to delete "${sceneToDelete.name}"?`)) {
      return;
    }
    try {
      await dataManager.deleteScene(sceneToDelete.id);
      console.log('Scene deleted:', sceneToDelete.id);
      // Refresh user scenes
      const scenes = await dataManager.getScenes('user', {
        orderBy: { field: 'updatedAt', direction: 'desc' }
      });
      setUserScenes(scenes || []);
    } catch (error) {
      console.error('Error deleting scene:', error);
      alert('Error deleting scene');
    }
  }, [dataManager]);

  // Use the scene selector hook
  const sceneSelector = useSceneSelector({
    currentScene: scene,
    handleSceneChange,
    userScenes,
    loadingUserScenes,
    onDeleteScene: handleDeleteScene,
    onSaveScene: handleSaveScene,
    onUpdateScene: handleUpdateScene,
    currentChatId,
    onChatSelect: handleChatSelect,
    onNewChat: handleNewChat,
    onSceneButtonClick: handleSceneButtonClick,
    refreshTrigger,
    activeTab: uiMode === 'simple' ? 'examples' : 'chats',
    onTabChange: () => {},
    uiMode,
    showSceneDetails,
    onToggleSceneDetails
  });

  // Use the scene details hook
  const sceneDetails = useSceneDetails(scene);

  // --- Render Logic for SceneSelector ---
  const renderChatList = (chatsToRender, isLoading, emptyMessage) => {
    if (isLoading) {
      return <div className="loading-message"><FontAwesomeIcon icon={faSpinner} spin /> Loading...</div>;
    }
    if (!chatsToRender || chatsToRender.length === 0) {
      return (
        <div className="empty-chat-list">
          <p className="placeholder-text">{emptyMessage}</p>
          {handleNewChat && (
            <button className="new-chat-btn" onClick={handleNewChat}>
              New Chat
            </button>
          )}
        </div>
      );
    }
    return (
      <ul className="scene-list chat-list">
        {chatsToRender.map((chat) => (
          <li
            key={chat.id}
            onClick={() => handleChatSelect && handleChatSelect(chat)}
            className={`scene-item chat-item ${currentChatId === chat.id ? 'selected' : ''}`}
            title={`Chat created: ${new Date(chat.createdAt).toLocaleString()}`}
          >
            <div className="scene-content">
              <div className="chat-row chat-title">
                {chat.title || `Chat ${chat.id.slice(-4)}`}
                <button
                  className="scene-menu-button"
                  onClick={(e) => sceneSelector.handleMenuToggle(e, chat.id)}
                  title="More options"
                >
                  <FontAwesomeIcon icon={faEllipsisV} size="xs" />
                </button>
                {sceneSelector.openMenuId === chat.id && (
                  <div className="scene-menu-dropdown chat-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button
                      className="menu-item danger"
                      onClick={() => sceneSelector.handleChatDelete(chat.id)}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                      <span>Delete Chat</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="chat-row chat-description">
                {chat.messages ? `${chat.messages.length} messages` : 'Empty chat'}
              </div>
              <div className="chat-row chat-scenes">
                <div className="scene-buttons">
                  {/* 3D box buttons with scene IDs */}
                  {chat.scenes && chat.scenes.length > 0 ? (
                    chat.scenes.slice(0, 3).map((sceneData, index) => (
                      <button
                        key={sceneData.id}
                        className="scene-3d-button"
                        title={`${sceneData.name} (${sceneData.id})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (handleSceneButtonClick) {
                            handleSceneButtonClick(chat, index);
                          }
                        }}
                      >
                        <FontAwesomeIcon icon={faCube} />
                        <span className="scene-label">{sceneData.id}</span>
                      </button>
                    ))
                  ) : (
                    <>
                      <button
                        className="scene-3d-button"
                        title="Empty scene"
                        disabled
                      >
                        <FontAwesomeIcon icon={faCube} />
                        <span className="scene-label">Empty scene</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  const renderSceneList = (scenesToRender, isLoading, emptyMessage, isLocalSection = false) => {
    if (isLoading) {
      return <div className="loading-message"><FontAwesomeIcon icon={faSpinner} spin /> Loading...</div>;
    }
    if (!scenesToRender || scenesToRender.length === 0) {
      return <p className="placeholder-text">{emptyMessage}</p>;
    }
    return (
      <ul className="scene-list">
        {scenesToRender.map((sceneItem) => (
          <li
            key={sceneItem.id}
            onClick={() => sceneSelector.handleSceneItemClick(sceneItem)}
            className={`scene-item ${scene && scene.id === sceneItem.id ? 'selected' : ''}`}
            title={sceneItem.description}
          >
            <div className="scene-content">
              <div className="scene-name">
                <FontAwesomeIcon icon={faCube} className="scene-3d-icon" />
                {sceneItem.name}
                {sceneItem.authorName && <span className="scene-author">by {sceneItem.authorName}</span>}
                {(sceneItem.isTemporary || sceneItem.isExtracted) && (
                  <span className="unsaved-badge" title="Unsaved"><FontAwesomeIcon icon={faExclamationTriangle} /></span>
                )}
                <button
                  className="scene-menu-button"
                  onClick={(e) => sceneSelector.handleMenuToggle(e, sceneItem.id)}
                  title="More options"
                >
                  <FontAwesomeIcon icon={faEllipsisV} size="xs" />
                </button>
                {sceneSelector.openMenuId === sceneItem.id && (
                  <div className="scene-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                    {isLocalSection ? (
                      // Local scenes - essential options only
                      <>
                        {!sceneItem.isTemporary && (
                          <button
                            className="menu-item"
                            onClick={() => sceneSelector.handleMenuAction('update', sceneItem)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Update</span>
                          </button>
                        )}
                        {sceneItem.isTemporary && (
                          <button
                            className="menu-item"
                            onClick={() => sceneSelector.handleMenuAction('save', sceneItem)}
                          >
                            <FontAwesomeIcon icon={faSave} />
                            <span>Save</span>
                          </button>
                        )}
                        {!sceneItem.isTemporary && (
                          <button
                            className="menu-item danger"
                            onClick={() => sceneSelector.handleMenuAction('delete', sceneItem)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            <span>Delete</span>
                          </button>
                        )}
                      </>
                    ) : (
                      // Public/Example scenes - scene details toggle
                      <>
                        <button
                          className="menu-item"
                          onClick={() => {
                            sceneSelector.setOpenMenuId(null);
                            onToggleSceneDetails();
                          }}
                        >
                          <FontAwesomeIcon icon={showSceneDetails ? faEyeSlash : faEye} />
                          <span>{showSceneDetails ? 'Hide Scene Details' : 'Show Scene Details'}</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              <div className="scene-description">{sceneItem.description}</div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  // --- Render Logic for SceneDetails ---
  const renderSceneDetails = () => {
    const { sceneData } = sceneDetails;

    if (!sceneData.hasScene) {
      return (
        <div className="scene-details-container">
          <p className="placeholder-text">No scene selected.</p>
        </div>
      );
    }

    const { scene: currentScene, formatArray, expandedObjects, activeTab } = sceneData;

    return (
      <div className="scene-details-container">
        {/* Tabs for List and JSON views */}
        <div className="scene-details-tabs">
          <button
            className={`scene-tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => sceneDetails.setActiveTab('list')}
          >
            <FontAwesomeIcon icon={faList} /> List View
          </button>
          <button
            className={`scene-tab ${activeTab === 'json' ? 'active' : ''}`}
            onClick={() => sceneDetails.setActiveTab('json')}
          >
            <FontAwesomeIcon icon={faCode} /> JSON View
          </button>
          {onToggleSceneDetails && (
            <button
              className="scene-details-close-btn"
              onClick={onToggleSceneDetails}
              title="Close Scene Details"
            >
              ×
            </button>
          )}
        </div>

        <div className="details-content">
          {activeTab === 'list' && (
            <>
              {/* Scene title above description */}
              <div className="scene-title-section">
                <h4 className="scene-title">{currentScene.name}</h4>
              </div>

              <p className="scene-description-text"><strong>Description:</strong> {currentScene.description || 'No description.'}</p>

              {/* --- Scene Properties Section --- */}
              <div className="properties-section">
                <strong className="properties-section-title">Scene Properties</strong>
                <div className="property-row"><span>Gravity:</span> <span>{formatArray(currentScene.gravity)} m/s²</span></div>
                <div className="property-row"><span>Friction:</span> <span>{currentScene.contactMaterial?.friction?.toFixed(2) ?? 'N/A'}</span></div>
                <div className="property-row"><span>Restitution:</span> <span>{currentScene.contactMaterial?.restitution?.toFixed(2) ?? 'N/A'}</span></div>
                <div className="property-row"><span>Ground Plane:</span> <span>{currentScene.hasGround !== false ? 'Yes' : 'No'}</span></div>
                {currentScene.authorName && <div className="property-row"><span>Author:</span> <span>{currentScene.authorName}</span></div>}
              </div>

              {/* --- Gravitational Physics Section --- */}
              {currentScene.gravitationalPhysics?.enabled && (
                <div className="properties-section">
                  <strong className="properties-section-title">Gravitational Physics</strong>
                  <div className="property-row"><span>G Constant:</span> <span>{currentScene.gravitationalPhysics.gravitationalConstant?.toExponential(2) ?? 'N/A'}</span></div>
                  <div className="property-row"><span>Min Distance:</span> <span>{currentScene.gravitationalPhysics.minDistance?.toExponential(2) ?? 'N/A'}</span></div>
                  <div className="property-row"><span>Softening:</span> <span>{currentScene.gravitationalPhysics.softening?.toFixed(2) ?? 'N/A'}</span></div>
                </div>
              )}

              {/* --- Objects Section --- */}
              <div className="properties-section">
                <strong className="properties-section-title">Objects ({currentScene.objects?.length || 0})</strong>
                {currentScene.objects?.length > 0 ? (
                  <ul className="object-list">
                    {currentScene.objects.map((obj, index) => (
                      <li key={obj.id || index} className="object-list-item">
                        <div
                          className="object-header"
                          onClick={() => sceneDetails.toggleObjectDetails(obj.id || index)}
                          role="button" tabIndex={0}
                        >
                          <span className={`toggle-icon ${expandedObjects[obj.id || index] ? 'expanded' : ''}`}></span>
                          <span className="object-title">{obj.type} ({obj.id || `obj-${index}`})</span>
                          {obj.isStatic && <span className="static-badge">Static</span>}
                        </div>
                        {expandedObjects[obj.id || index] && (
                          <div className="object-properties">
                            <div className="property-row"><span>Mass:</span><span>{obj.mass ?? 'N/A'} kg</span></div>
                            <div className="property-row"><span>Position:</span><span>{formatArray(obj.position)}</span></div>
                            <div className="property-row"><span>Velocity:</span><span>{formatArray(obj.velocity)}</span></div>
                            <div className="property-row"><span>Color:</span><div style={{display: 'flex', alignItems: 'center'}}><span className="color-preview" style={{ backgroundColor: obj.color }}></span><span>{obj.color}</span></div></div>
                            {obj.radius && <div className="property-row"><span>Radius:</span><span>{obj.radius.toFixed(2)} m</span></div>}
                            {obj.dimensions && <div className="property-row"><span>Dimensions:</span><span>{formatArray(obj.dimensions)}</span></div>}
                            {obj.height && <div className="property-row"><span>Height:</span><span>{obj.height.toFixed(2)} m</span></div>}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="placeholder-text">No objects in this scene.</p>
                )}
              </div>
            </>
          )}

          {activeTab === 'json' && (
            <div className="json-view">
              <div className="json-header">
                <strong>Scene JSON</strong>
                <button
                  className="copy-json-btn"
                  onClick={sceneDetails.copyJsonToClipboard}
                  title="Copy JSON to clipboard"
                >
                  Copy JSON
                </button>
              </div>
              <pre className="json-content">
                {JSON.stringify(currentScene, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`side-panel ${showSceneDetails ? 'with-details' : 'without-details'}`}>
      <div className="left-panel">
        <div className="scene-selector-container">
          <div className="scene-selector">
            <div className="scene-selector-header">
              <div className="scene-tabs">
                <button className={sceneSelector.activeTab === 'examples' ? 'active' : ''} onClick={() => sceneSelector.setActiveTab('examples')}><FontAwesomeIcon icon={faBookOpen} /> Examples</button>
                {sceneSelector.uiMode === 'advanced' && (
                  <button className={sceneSelector.activeTab === 'chats' ? 'active' : ''} onClick={() => sceneSelector.setActiveTab('chats')}><FontAwesomeIcon icon={faComments} /> Chat History</button>
                )}
                <button className={sceneSelector.activeTab === 'user' ? 'active' : ''} onClick={() => sceneSelector.setActiveTab('user')}><FontAwesomeIcon icon={faUser} /> My Scenes</button>
              </div>
            </div>

            <div className="scene-list-panel">
              {sceneSelector.activeTab === 'examples' && renderSceneList(sceneSelector.scenesData.scenes, sceneSelector.scenesData.isLoading, sceneSelector.scenesData.emptyMessage, sceneSelector.scenesData.isLocalSection)}
              {sceneSelector.activeTab === 'chats' && renderChatList(sceneSelector.scenesData.chats, sceneSelector.scenesData.isLoading, sceneSelector.scenesData.emptyMessage)}
              {sceneSelector.activeTab === 'user' && renderSceneList(sceneSelector.scenesData.scenes, sceneSelector.scenesData.isLoading, sceneSelector.scenesData.emptyMessage, sceneSelector.scenesData.isLocalSection)}
            </div>
          </div>
        </div>
      </div>
      {showSceneDetails && (
        <div className="right-panel">
          {renderSceneDetails()}
        </div>
      )}
    </div>
  );
};

export default SidePanel;
