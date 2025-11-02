import { useState, useEffect, useCallback } from 'react';

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
    externalActiveTab,
    externalOnTabChange,
    dataManager,
    GEMINI_API_KEY,
    workspaceScenes // Add workspace scenes
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

    // --- Data Fetching Logic ---
    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            if (!dataManager) return;
            setLoading(true);
            setError(null);
            try {
                if (activeTab === 'examples') {
                    console.log('🔍 Fetching example scenes...');
                    const scenes = await dataManager.getScenes('examples');
                    console.log('✅ Fetched example scenes:', scenes.length, scenes);
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

    const getCombinedUserScenes = () => {
        // Only show database scenes in "Your Scenes" - workspace scenes are temporary
        return fetchedUserScenes || [];
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

    return {
        // State
        activeTab,
        setActiveTab,
        exampleScenes,
        fetchedUserScenes,
        chatHistory,
        loading,
        error,
        openMenuId,
        setOpenMenuId,
        setError,

        // Handlers
        getCombinedUserScenes,
        handleSceneItemClick,
        handleMenuToggle,
        handleMenuAction,
        handleChatDelete
    };
}
