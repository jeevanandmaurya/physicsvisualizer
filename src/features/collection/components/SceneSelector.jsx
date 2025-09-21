import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../../../contexts/DatabaseContext';
import './SceneSelector.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBookOpen, faSpinner, faExclamationTriangle, faEllipsisV, faTrash, faSave, faEdit, faShare, faCog, faComments, faTimes, faCube } from '@fortawesome/free-solid-svg-icons';
import extractPrompt from '../../../core/ai/prompts/extractPrompt.txt?raw';

function SceneSelector({
    currentScene,
    handleSceneChange,
    conversationHistory,
    userScenes,
    loadingUserScenes,
    extractedScenes = [],
    onExtractedScene,
    onDeleteScene,
    onSaveScene,
    onUpdateScene,
    onShareToPublic,
    onOpenProperties,
    currentChatId,
    onChatSelect,
    onNewChat,
    onSceneButtonClick,
    refreshTrigger,
    activeTab: externalActiveTab,
    onTabChange: externalOnTabChange,
    uiMode = 'simple' // 'simple' or 'advanced'
}) {
    // Use external tab state if provided, otherwise use internal state
    const [internalActiveTab, setInternalActiveTab] = useState('examples');
    const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
    const setActiveTab = externalOnTabChange || setInternalActiveTab;
    const [exampleScenes, setExampleScenes] = useState([]);
    const [fetchedUserScenes, setFetchedUserScenes] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    const dataManager = useDatabase();
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // --- Data Fetching Logic ---
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!dataManager) return;
            setLoading(true);
            setError(null);
            try {
                if (activeTab === 'examples') {
                    const scenes = await dataManager.getScenes('examples');
                    if (isMounted) {
                        setExampleScenes(scenes);
                    }
                } else if (activeTab === 'chats') {
                    const chats = await dataManager.getChatHistory();
                    if (isMounted) {
                        setChatHistory(chats);
                    }
                } else if (activeTab === 'user') {
                    const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
                    if (isMounted) {
                        setFetchedUserScenes(scenes);
                    }
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab} data:`, err);
                if (isMounted) setError(`Failed to load ${activeTab} data.`);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchData();
        return () => { isMounted = false; };
    }, [activeTab, dataManager]);

    // Refresh chat history when refreshTrigger changes
    useEffect(() => {
        if (refreshTrigger && activeTab === 'chats') {
            const refreshChats = async () => {
                try {
                    const chats = await dataManager.getChatHistory();
                    setChatHistory(chats);
                } catch (err) {
                    console.error('Error refreshing chat history:', err);
                }
            };
            refreshChats();
        }
    }, [refreshTrigger, activeTab, dataManager]);

    // Refresh user scenes when needed (after save/update operations)
    useEffect(() => {
        if (activeTab === 'user') {
            const refreshUserScenes = async () => {
                try {
                    const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
                    setFetchedUserScenes(scenes);
                } catch (err) {
                    console.error('Error refreshing user scenes:', err);
                }
            };
            refreshUserScenes();
        }
    }, [activeTab, dataManager]);
    
    // --- Handlers ---

    const handleExtractScene = async () => {
        if (!conversationHistory.length) return setError("No conversation history to extract from.");

        setIsExtracting(true);
        setError(null);
        try {
            const conversationText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            const prompt = extractPrompt.replace('${conversationText}', conversationText);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
                { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) }
            );
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            
            const data = await response.json();
            const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const cleanedJson = rawResponse.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || rawResponse;
            const extractedScene = JSON.parse(cleanedJson);

            if (onExtractedScene) {
                onExtractedScene(extractedScene);
                setActiveTab('user');
            }
        } catch (error) {
            console.error("Error extracting scene:", error);
            setError(`Scene extraction failed: ${error.message}`);
        } finally {
            setIsExtracting(false);
        }
    };
    
    const getCombinedUserScenes = () => {
        // Show newly extracted (unsaved) scenes at the top of the user's saved list
        return [...extractedScenes, ...fetchedUserScenes];
    };

    // This function now correctly calls the prop passed from the parent.
    const handleSceneItemClick = (scene) => {
        handleSceneChange(scene);
    };

    const handleMenuToggle = (e, sceneId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === sceneId ? null : sceneId);
    };

    const handleMenuAction = async (action, scene) => {
        setOpenMenuId(null);
        switch (action) {
            case 'delete':
                if (onDeleteScene) {
                    await onDeleteScene(scene);
                    // Refresh user scenes after deletion
                    if (activeTab === 'user') {
                        const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
                        setFetchedUserScenes(scenes);
                    }
                }
                break;
            case 'save':
                if (onSaveScene) {
                    await onSaveScene(scene);
                    // Refresh user scenes after save
                    if (activeTab === 'user') {
                        const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
                        setFetchedUserScenes(scenes);
                    }
                }
                break;
            case 'update':
                if (onUpdateScene) {
                    await onUpdateScene(scene);
                    // Refresh user scenes after update
                    if (activeTab === 'user') {
                        const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
                        setFetchedUserScenes(scenes);
                    }
                }
                break;
            case 'share':
                if (onShareToPublic) onShareToPublic(scene);
                break;
            case 'properties':
                if (onOpenProperties) onOpenProperties(scene);
                break;
            case 'load':
                if (onSaveScene) {
                    await onSaveScene(scene);
                    // Refresh user scenes after loading to local
                    if (activeTab === 'user') {
                        const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
                        setFetchedUserScenes(scenes);
                    }
                }
                break;
        }
    };

    const handleChatDelete = async (chatId) => {
        setOpenMenuId(null);
        if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            try {
                await dataManager.deleteChat(chatId);

                // If the deleted chat is currently selected, clear the selection
                if (currentChatId === chatId) {
                    console.log('🗑️ Deleted chat was currently selected, clearing selection');
                    // Clear the current chat selection by calling onChatSelect with null
                    if (onChatSelect) {
                        onChatSelect(null);
                    }
                }

                // Refresh the chat list
                const updatedChats = await dataManager.getChatHistory();
                setChatHistory(updatedChats);
            } catch (error) {
                console.error('Error deleting chat:', error);
                alert('Error: Could not delete chat.');
            }
        }
    };

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
                                <button
                                    className="scene-menu-button"
                                    onClick={(e) => handleMenuToggle(e, chat.id)}
                                    title="More options"
                                >
                                    <FontAwesomeIcon icon={faEllipsisV} size="xs" />
                                </button>
                                {openMenuId === chat.id && (
                                    <div className="scene-menu-dropdown chat-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            className="menu-item danger"
                                            onClick={() => handleChatDelete(chat.id)}
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
                        key={scene.id}
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
                                    className="scene-menu-button"
                                    onClick={(e) => handleMenuToggle(e, scene.id)}
                                    title="More options"
                                >
                                    <FontAwesomeIcon icon={faEllipsisV} size="xs" />
                                </button>
                                {openMenuId === scene.id && (
                                    <div className="scene-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                                        {isLocalSection ? (
                                            // Local scenes - essential options only
                                            <>
                                                {!scene.isTemporary && (
                                                    <button
                                                        className="menu-item"
                                                        onClick={() => handleMenuAction('update', scene)}
                                                    >
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        <span>Update</span>
                                                    </button>
                                                )}
                                                {scene.isTemporary && (
                                                    <button
                                                        className="menu-item"
                                                        onClick={() => handleMenuAction('save', scene)}
                                                    >
                                                        <FontAwesomeIcon icon={faSave} />
                                                        <span>Save</span>
                                                    </button>
                                                )}
                                                {!scene.isTemporary && (
                                                    <button
                                                        className="menu-item danger"
                                                        onClick={() => handleMenuAction('delete', scene)}
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        <span>Delete</span>
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            // Public/Example scenes - essential options only
                                            <>
                                                <button
                                                    className="menu-item"
                                                    onClick={() => handleMenuAction('load', scene)}
                                                >
                                                    <FontAwesomeIcon icon={faSave} />
                                                    <span>Load to Local</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="scene-description">{scene.description}</div>
                        </div>
                </li>
            ))}
        </ul>
    );
};

    return (
        <div className="scene-selector-container">
            <div className="scene-selector">
                <div className="scene-selector-header">
                    <button className={`extract-button ${isExtracting ? 'extracting' : ''}`} onClick={handleExtractScene} disabled={isExtracting}>
                        {isExtracting ? <><FontAwesomeIcon icon={faSpinner} spin /> Extracting...</> : 'Extract Scene'}
                    </button>
                    {error && <div className="error-message" role="alert">{error}</div>}
                </div>

                <div className="scene-tabs">
                    <button className={activeTab === 'examples' ? 'active' : ''} onClick={() => setActiveTab('examples')}><FontAwesomeIcon icon={faBookOpen} /> Examples</button>
                    {uiMode === 'advanced' && (
                        <button className={activeTab === 'chats' ? 'active' : ''} onClick={() => setActiveTab('chats')}><FontAwesomeIcon icon={faComments} /> Chat History</button>
                    )}
                    <button className={activeTab === 'user' ? 'active' : ''} onClick={() => setActiveTab('user')}><FontAwesomeIcon icon={faUser} /> My Scenes
                        {extractedScenes.length > 0 && <span className="unsaved-count">({extractedScenes.length})</span>}
                    </button>
                </div>
                
                <div className="scene-list-panel">
                    {activeTab === 'examples' && renderSceneList(exampleScenes, loading, "No examples found.", false)}
                    {activeTab === 'chats' && renderChatList(chatHistory, loading, "No chat history yet. Start a new chat!")}
                    {activeTab === 'user' && renderSceneList(getCombinedUserScenes(), loading, "No saved scenes yet.", true)}
                </div>
            </div>
        </div>
    );
}

export default SceneSelector;
