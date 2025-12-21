import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
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
    const { 
        registerOverlay, 
        unregisterOverlay, 
        focusOverlay, 
        getZIndex, 
        focusedOverlay,
        toggleMinimize,
        isMinimized: isOverlayMinimized,
        getMinimizedPosition
    } = useOverlay();
    
    const isMinimized = isOverlayMinimized('sceneSelector');

    // Overlay state
    const [position, setPosition] = useState({ x: 60, y: 60 });
    const [size, setSize] = useState({ width: 350, height: window.innerHeight - 120 });
    const [previousPosition, setPreviousPosition] = useState({ x: 60, y: 60 });
    const [previousSize, setPreviousSize] = useState({ width: 350, height: window.innerHeight - 120 });

    // Register overlay
    useEffect(() => {
        if (isOpen) {
            registerOverlay('sceneSelector', 'sceneSelector', 1000);
            return () => unregisterOverlay('sceneSelector');
        }
    }, [isOpen, registerOverlay, unregisterOverlay]);

    // Set initial position after mount
    useEffect(() => {
        if (isOpen) {
            // Position on the left, below the top
            const initialPos = { x: 60, y: 20 };
            const initialSize = { width: 350, height: Math.min(600, window.innerHeight - 100) };
            setPosition(initialPos);
            setSize(initialSize);
            setPreviousPosition(initialPos);
            setPreviousSize(initialSize);
        }
    }, [isOpen]);

    const handleMinimize = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isMinimized) {
            setPreviousPosition(position);
            setPreviousSize(size);
        }
        toggleMinimize('sceneSelector');
    };

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
                                <FontAwesomeIcon icon={faCube} className="scene-3d-icon" />
                                {scene.name}
                                {scene.authorName && <span className="scene-author">by {scene.authorName}</span>}
                                {(scene.isTemporary || scene.isExtracted) && (
                                    <span className="unsaved-badge" title="Unsaved"><FontAwesomeIcon icon={faExclamationTriangle} /></span>
                                )}
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
    const currentPosition = isMinimized ? getMinimizedPosition('sceneSelector') : position;

    return (
        <div className="scene-selector-overlay" style={{ zIndex }}>
            <Rnd
                size={isMinimized ? { width: 200, height: 28 } : size}
                position={currentPosition}
                onDragStop={(e, d) => {
                    if (!isMinimized) setPosition({ x: d.x, y: d.y });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    if (!isMinimized) {
                        setSize({
                            width: parseInt(ref.style.width),
                            height: parseInt(ref.style.height),
                        });
                        setPosition(position);
                    }
                }}
                minWidth={isMinimized ? 200 : 300}
                minHeight={isMinimized ? 28 : 200}
                bounds=".workbench-body"
                disableDragging={isMinimized}
                enableResizing={!isMinimized}
                dragHandleClassName="engine-overlay-header"
                className={`engine-overlay ${isFocused ? 'focused' : ''} ${isMinimized ? 'minimized' : ''}`}
                style={{
                    '--overlay-opacity': overlayOpacity.sceneSelector,
                    zIndex: zIndex,
                    pointerEvents: 'auto'
                } as React.CSSProperties}
                onMouseDown={() => focusOverlay('sceneSelector')}
            >
                {/* Header */}
                <div className="engine-overlay-header">
                    <div className="engine-overlay-title">
                        <FontAwesomeIcon icon={faCube} style={{ marginRight: '6px', fontSize: '12px', opacity: 0.7 }} />
                        Scene Selector
                    </div>
                    <div className="engine-overlay-controls">
                        <button
                            className="engine-overlay-button"
                            onClick={handleMinimize}
                            title={isMinimized ? 'Restore' : 'Minimize'}
                        >
                            <FontAwesomeIcon icon={isMinimized ? faExpand : faCompress} />
                        </button>
                        <button
                            className="engine-overlay-button close"
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
                {!isMinimized && (
                    <div className="engine-overlay-content">
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
                                    <h4 onClick={() => setWorkspaceScenesExpanded(!workspaceScenesExpanded)}>
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
                                <h4 onClick={() => setExampleScenesExpanded(!exampleScenesExpanded)}>
                                    <FontAwesomeIcon
                                        icon={exampleScenesExpanded ? faChevronDown : faChevronRight}
                                        style={{ marginRight: '8px', fontSize: '12px' }}
                                    />
                                    Example Scenes
                                </h4>
                                {exampleScenesExpanded && renderSceneList(exampleScenes, loading, "No examples found.", false)}
                            </div>
                            <div className="scene-section user-scenes">
                                <h4 onClick={() => setUserScenesExpanded(!userScenesExpanded)}>
                                    <FontAwesomeIcon
                                        icon={userScenesExpanded ? faChevronDown : faChevronRight}
                                        style={{ marginRight: '8px', fontSize: '12px' }}
                                    />
                                    Your Scenes
                                </h4>
                                {userScenesExpanded && renderSceneList(fetchedUserScenes, loading, "No saved scenes yet.", true)}
                            </div>
                        </div>
                    </div>
                )}
            </Rnd>
        </div>
    );
}

export default SceneSelectorUI;
