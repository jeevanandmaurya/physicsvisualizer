import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../../../contexts/DatabaseContext';

export function useSceneSelector({
    currentScene,
    handleSceneChange,
    userScenes,
    loadingUserScenes,
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
    uiMode = 'simple'
}) {
    // Use external tab state if provided, otherwise use internal state
    const [internalActiveTab, setInternalActiveTab] = useState('examples');
    const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
    const setActiveTab = externalOnTabChange || setInternalActiveTab;

    const [exampleScenes, setExampleScenes] = useState([]);
    const [fetchedUserScenes, setFetchedUserScenes] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);

    const dataManager = useDatabase();

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

    const handleSceneItemClick = useCallback((scene) => {
        handleSceneChange(scene);
    }, [handleSceneChange]);

    const handleMenuToggle = useCallback((e, sceneId) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === sceneId ? null : sceneId);
    }, [openMenuId]);

    const handleMenuAction = useCallback(async (action, scene) => {
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
    }, [onDeleteScene, onSaveScene, onUpdateScene, onShareToPublic, onOpenProperties, activeTab, dataManager]);

    const handleChatDelete = useCallback(async (chatId) => {
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
    }, [currentChatId, onChatSelect, dataManager]);

    // --- Data for rendering ---
    const getScenesData = () => {
        switch (activeTab) {
            case 'examples':
                return { scenes: exampleScenes, isLoading: loading, emptyMessage: "No examples found.", isLocalSection: false };
            case 'chats':
                return { chats: chatHistory, isLoading: loading, emptyMessage: "No chat history yet. Start a new chat!" };
            case 'user':
                return { scenes: fetchedUserScenes, isLoading: loading, emptyMessage: "No saved scenes yet.", isLocalSection: true };
            default:
                return { scenes: [], isLoading: false, emptyMessage: "", isLocalSection: false };
        }
    };

    return {
        // State
        activeTab,
        setActiveTab,
        loading,
        error,
        openMenuId,
        setOpenMenuId,

        // Data
        scenesData: getScenesData(),

        // Handlers
        handleSceneItemClick,
        handleMenuToggle,
        handleMenuAction,
        handleChatDelete,

        // UI helpers
        uiMode
    };
}
