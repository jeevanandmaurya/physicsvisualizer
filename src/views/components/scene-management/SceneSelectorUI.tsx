import React, { useState, useEffect, useRef } from 'react';
import { useDatabase } from '../../../contexts/DatabaseContext';
import { useWorkspace } from '../../../contexts/WorkspaceContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOverlay } from '../../../contexts/OverlayContext';
import { useSceneSelector } from '../../../ui-logic/scene-management/useSceneSelector';
import './SceneSelector.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBookOpen, faSpinner, faExclamationTriangle, faEllipsisV, faTrash, faSave, faEdit, faComments, faTimes, faCube, faEye, faChevronRight, faChevronDown, faChevronUp, faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

function SceneSelectorUI({
    isOpen,
    onToggle,
    currentScene,
    handleSceneChange,
    userScenes,
    loadingUserScenes,
    onDeleteScene,
    onSaveScene,
    onUpdateScene,
    currentChatId,
    onChatSelect,
    onNewChat,
    onSceneButtonClick,
    refreshTrigger,
    activeTab: externalActiveTab,
    onTabChange: externalOnTabChange,
    onToggleSceneDetails,
    onRefreshSceneList,
    workspaceScenes // Add workspace scenes
}) {
    const dataManager = useDatabase();
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const { setCurrentScene: setWorkspaceCurrentScene } = useWorkspace(); // Get workspace scene switching function
    const { overlayOpacity } = useTheme();
    const { registerOverlay, unregisterOverlay, focusOverlay, getZIndex, focusedOverlay } = useOverlay();
    
    // Overlay state
    const [isMinimized, setIsMinimized] = useState(true);
    const overlayRef = useRef(null);

    // Register overlay
    useEffect(() => {
        if (isOpen) {
            registerOverlay('sceneSelector', 'sceneSelector', 1000);
            return () => unregisterOverlay('sceneSelector');
        }
    }, [isOpen, registerOverlay, unregisterOverlay]);

    const {
        activeTab,
        setActiveTab,
        exampleScenes,
        fetchedUserScenes,
        chatHistory,
        loading,
        openMenuId,
        setOpenMenuId,
        getCombinedUserScenes,
        handleSceneItemClick,
        handleMenuToggle,
        handleMenuAction,
        handleChatDelete
    } = useSceneSelector({
        currentScene,
        handleSceneChange,
        userScenes,
        loadingUserScenes,
        onDeleteScene,
        onSaveScene,
        onUpdateScene,
        onShareToPublic: null, // Not used
        onOpenProperties: null, // Not used
        currentChatId,
        onChatSelect,
        onNewChat,
        onSceneButtonClick,
        refreshTrigger,
        externalActiveTab: externalActiveTab || 'examples', // Default to examples tab
        externalOnTabChange,
        dataManager, // Add dataManager from context
        GEMINI_API_KEY, // Add API key
        workspaceScenes // Pass workspace scenes
    });

    // State for section expansion
    const [userScenesExpanded, setUserScenesExpanded] = useState(true);
    const [exampleScenesExpanded, setExampleScenesExpanded] = useState(true);
    const [workspaceScenesExpanded, setWorkspaceScenesExpanded] = useState(true);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);



    // --- Render Logic ---
    const renderChatList = (chatsToRender, isLoading, emptyMessage) => {
        if (isLoading) {
            return <div className="loading-message"><FontAwesomeIcon icon={faSpinner} spin /> Loading...</div>;
        }
        if (!chatsToRender || chatsToRender.length === 0) {
            return (
                <div className="empty-chat-list">
                    <p className="placeholder-text">{emptyMessage}</p>
                    {onNewChat && (
                        <button className="new-chat-btn" onClick={onNewChat}>
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
                        onClick={() => onChatSelect && onChatSelect(chat)}
                        className={`scene-item chat-item ${currentChatId === chat.id ? 'selected' : ''}`}
                        title={`Chat created: ${new Date(chat.createdAt).toLocaleString()}`}
                    >
                        <div className="scene-content">
                            <div className="chat-row chat-title">
                                {chat.title || `Chat ${chat.id.slice(-4)}`}
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
                                                    if (onSceneButtonClick) {
                                                        onSceneButtonClick(chat, index);
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
                {scenesToRender.map((scene) => (
                    <li
                        key={isLocalSection ? scene.id : `example-${scene.id}`}
                        onClick={() => handleSceneItemClick(scene)}
                        className={`scene-item ${currentScene && currentScene.id === scene.id ? 'selected' : ''}`}
                        title={scene.description}
                    >
                        <div className="scene-content">
                            <div className="scene-name">
                                <button
                                    className="scene-details-toggle-btn-inline"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSceneItemClick(scene);
                                        onToggleSceneDetails();
                                    }}
                                    title="Open Scene Details"
                                >
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                                <FontAwesomeIcon icon={faCube} className="scene-3d-icon" />
                                {scene.name}
                                {scene.authorName && <span className="scene-author">by {scene.authorName}</span>}
                                {(scene.isTemporary || scene.isExtracted) && (
                                    <span className="unsaved-badge" title="Unsaved"><FontAwesomeIcon icon={faExclamationTriangle} /></span>
                                )}
                            </div>
                        </div>
                        {isLocalSection && (
                            <button
                                className="scene-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (onDeleteScene) {
                                        onDeleteScene(scene);
                                    }
                                }}
                                title="Delete Scene"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                </li>
            ))}
        </ul>
    )};

    const handleNewScene = async () => {
        const newScene = {
            id: 'new-scene-' + Date.now(),
            name: 'New Scene',
            description: 'Start with an empty scene to build your physics simulation.',
            isTemporary: false,
            gravity: [0, -9.81, 0],
            hasGround: true,
            simulationScale: 'terrestrial',
            gravitationalPhysics: { enabled: false },
            objects: []
        };

        // Save to database first so it appears in "Your Scenes"
        if (dataManager) {
            try {
                const savedId = await dataManager.saveScene(newScene);
                newScene.id = savedId; // Update with saved ID
                console.log('New scene saved to database:', savedId);

                // Create and link a chat for this scene
                await dataManager.getOrCreateChatForScene(savedId, newScene.name);

                // Refresh the scene list in the parent component
                if (onRefreshSceneList) {
                    await onRefreshSceneList();
                }
            } catch (error) {
                console.error('Failed to save new scene:', error);
            }
        }

        handleSceneChange(newScene);
    };

    if (!isOpen) return null;

    const isFocused = focusedOverlay === 'sceneSelector';
    const zIndex = getZIndex('sceneSelector');

    return (
        <div className="scene-selector-overlay" style={{ zIndex }}>
            <div 
                ref={overlayRef}
                className={`scene-selector-overlay-container ${isFocused ? 'focused' : ''} ${isMinimized ? 'minimized' : ''}`}
                style={{
                    '--scene-selector-opacity': overlayOpacity.sceneSelector
                } as React.CSSProperties}
                onClick={() => focusOverlay('sceneSelector')}
            >
                {/* Header without drag functionality */}
                <div 
                    className="scene-selector-overlay-header"
                >
                    <div className="scene-selector-overlay-title">Scene Selector</div>
                    <div className="scene-selector-overlay-header-controls">
                        <button
                            className="scene-selector-overlay-control-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMinimized(!isMinimized);
                            }}
                            title={isMinimized ? 'Maximize' : 'Minimize'}
                        >
                            <FontAwesomeIcon icon={isMinimized ? faChevronUp : faChevronDown} />
                        </button>
                        <button
                            className="scene-selector-overlay-control-btn close-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggle();
                            }}
                            title="Close"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="scene-selector-overlay-content">
                    <div className="scene-list-panel">
                        {/* New Scene Button */}
                        <div className="scene-selector-top-bar">
                            <button
                                className="new-scene-btn"
                                onClick={handleNewScene}
                                title="Create a new empty scene"
                            >
                                <FontAwesomeIcon icon={faCube} />
                                New Scene
                            </button>
                        </div>

                    {/* Workspace Scenes - Currently Active Scenes */}
                    {workspaceScenes && workspaceScenes.length > 1 && (
                        <div className="scene-section workspace-scenes">
                            <h4 onClick={() => setWorkspaceScenesExpanded(!workspaceScenesExpanded)} style={{ cursor: 'pointer' }}>
                                <FontAwesomeIcon
                                    icon={workspaceScenesExpanded ? faChevronDown : faChevronRight}
                                    style={{ marginRight: '8px', fontSize: '12px' }}
                                />
                                Current Workspace ({workspaceScenes.length} scenes)
                            </h4>
                            {workspaceScenesExpanded && (
                                <ul className="scene-list workspace-list">
                                    {workspaceScenes.map((scene, index) => (
                                        <li
                                            key={scene.id || `workspace-scene-${index}`}
                                            onClick={() => {
                                                console.log('Switching to workspace scene:', index);
                                                setWorkspaceCurrentScene(index);
                                            }}
                                            className={`scene-item workspace-item ${currentScene && currentScene.id === scene.id ? 'selected' : ''}`}
                                            title={`Workspace scene: ${scene.description || 'No description'}`}
                                        >
                                            <div className="scene-content">
                                                <div className="scene-name">
                                                    <FontAwesomeIcon icon={faCube} className="scene-3d-icon" />
                                                    {scene.name || `Scene ${index + 1}`}
                                                    <span className="workspace-indicator" title="Workspace scene">●</span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    <div className="scene-section example-scenes">
                        <h4 onClick={() => setExampleScenesExpanded(!exampleScenesExpanded)} style={{ cursor: 'pointer' }}>
                            <FontAwesomeIcon
                                icon={exampleScenesExpanded ? faChevronDown : faChevronRight}
                                style={{ marginRight: '8px', fontSize: '12px' }}
                            />
                            Example Scenes
                        </h4>
                        {exampleScenesExpanded && renderSceneList(exampleScenes, loading, "No examples found.", false)}
                    </div>
                    <div className="scene-section user-scenes">
                        <h4 onClick={() => setUserScenesExpanded(!userScenesExpanded)} style={{ cursor: 'pointer' }}>
                            <FontAwesomeIcon
                                icon={userScenesExpanded ? faChevronDown : faChevronRight}
                                style={{ marginRight: '8px', fontSize: '12px' }}
                            />
                            Your Scenes
                        </h4>
                        {userScenesExpanded && renderSceneList(userScenes, loadingUserScenes, "No saved scenes yet.", true)}
                    </div>
                </div>
            </div>
            </div>
        </div>
    );
}

export default SceneSelectorUI;
