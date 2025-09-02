import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import './SceneSelector.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBookOpen, faSpinner, faExclamationTriangle, faEllipsisV, faTrash, faSave, faEdit, faShare, faCog, faComments, faTimes, faCube } from '@fortawesome/free-solid-svg-icons';
import extractPrompt from '../prompts/extractPrompt.txt?raw';

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
    onSceneButtonClick
}) {
    const [activeTab, setActiveTab] = useState('examples');
    const [exampleScenes, setExampleScenes] = useState([]);
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
        return [...extractedScenes, ...userScenes];
    };

    // This function now correctly calls the prop passed from the parent.
    const handleSceneItemClick = (scene) => {
        handleSceneChange(scene);
    };

    const handleMenuToggle = (e, sceneId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === sceneId ? null : sceneId);
    };

    const handleMenuAction = (action, scene) => {
        setOpenMenuId(null);
        switch (action) {
            case 'delete':
                if (onDeleteScene) onDeleteScene(scene);
                break;
            case 'save':
                if (onSaveScene) onSaveScene(scene);
                break;
            case 'update':
                if (onUpdateScene) onUpdateScene(scene);
                break;
            case 'share':
                if (onShareToPublic) onShareToPublic(scene);
                break;
            case 'properties':
                if (onOpenProperties) onOpenProperties(scene);
                break;
            case 'load':
                if (onSaveScene) onSaveScene(scene); // Assuming onSaveScene handles loading to local
                break;
        }
    };

    const handleChatDelete = async (chatId) => {
        setOpenMenuId(null);
        if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
            try {
                await dataManager.deleteChat(chatId);
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
                        className={`scene-item ${currentScene.id === scene.id ? 'selected' : ''}`}
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
                                            // Local scenes - full editing options
                                            <>
                                                <button
                                                    className="menu-item"
                                                    onClick={() => handleMenuAction('properties', scene)}
                                                >
                                                    <FontAwesomeIcon icon={faCog} />
                                                    <span>Properties</span>
                                                </button>
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
                                                {!scene.isPublic && (
                                                    <button
                                                        className="menu-item"
                                                        onClick={() => handleMenuAction('share', scene)}
                                                    >
                                                        <FontAwesomeIcon icon={faShare} />
                                                        <span>Share to Public</span>
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
                                            // Public/Example scenes - limited options
                                            <>
                                                <button
                                                    className="menu-item"
                                                    onClick={() => handleMenuAction('properties', scene)}
                                                >
                                                    <FontAwesomeIcon icon={faCog} />
                                                    <span>View Properties</span>
                                                </button>
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
                    <button className={activeTab === 'chats' ? 'active' : ''} onClick={() => setActiveTab('chats')}><FontAwesomeIcon icon={faComments} /> Chat History</button>
                    <button className={activeTab === 'user' ? 'active' : ''} onClick={() => setActiveTab('user')}><FontAwesomeIcon icon={faUser} /> My Scenes
                        {extractedScenes.length > 0 && <span className="unsaved-count">({extractedScenes.length})</span>}
                    </button>
                </div>
                
                <div className="scene-list-panel">
                    {activeTab === 'examples' && renderSceneList(exampleScenes, loading, "No examples found.", false)}
                    {activeTab === 'chats' && renderChatList(chatHistory, loading, "No chat history yet. Start a new chat!")}
                    {activeTab === 'user' && renderSceneList(getCombinedUserScenes(), loadingUserScenes, "No saved scenes yet.", true)}
                </div>
            </div>
        </div>
    );
}

export default SceneSelector;
