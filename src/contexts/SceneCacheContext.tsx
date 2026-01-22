import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { SceneData, useDatabase } from './DatabaseContext';

interface SceneCacheContextType {
    exampleScenes: any[];
    userScenes: SceneData[];
    recentScenes: SceneData[];
    
    // Pagination state
    exampleDisplayCount: number;
    userDisplayCount: number;
    
    // Actions
    loadExampleScenes: () => Promise<void>;
    loadUserScenes: () => Promise<void>;
    loadRecentScenes: () => Promise<void>;
    
    // Pagination actions
    incrementExampleDisplayCount: () => void;
    incrementUserDisplayCount: () => void;
    resetDisplayCounts: () => void; // Optional if we want to reset on specific actions
    
    loading: {
        examples: boolean;
        user: boolean;
        recent: boolean;
    };
    dataLoaded: {
        examples: boolean;
        user: boolean;
        recent: boolean;
    };
}

const SceneCacheContext = createContext<SceneCacheContextType | null>(null);

export function useSceneCache() {
    return useContext(SceneCacheContext);
}

export function SceneCacheProvider({ children }: { children: React.ReactNode }) {
    const dataManager = useDatabase();
    
    // Data Cache
    const [exampleScenes, setExampleScenes] = useState<any[]>([]);
    const [userScenes, setUserScenes] = useState<SceneData[]>([]);
    const [recentScenes, setRecentScenes] = useState<SceneData[]>([]);
    
    // Loading State
    const [loading, setLoading] = useState({
        examples: false,
        user: false,
        recent: false
    });
    
    // Data Loaded State (to prevent flash of empty state)
    const [dataLoaded, setDataLoaded] = useState({
        examples: false,
        user: false,
        recent: false
    });

    // Pagination State (persisted here so it survives tab switching)
    const [exampleDisplayCount, setExampleDisplayCount] = useState(8);
    const [userDisplayCount, setUserDisplayCount] = useState(8);

    // Track if data has been fetched to avoid refetching
    const fetchedRef = useRef({
        examples: false,
        user: false,
        recent: false
    });

    const loadExampleScenes = useCallback(async (force = false) => {
        if (!dataManager) return;
        if (fetchedRef.current.examples && !force && exampleScenes.length > 0) return;

        setLoading(prev => ({ ...prev, examples: true }));
        try {
            const scenes = await dataManager.getScenes('examples');
            // Transform for compatibility if needed (matches CollectionView logic)
            const exampleChats = scenes.map(scene => ({
                id: `chat-${scene.id}`,
                name: scene.name,
                description: scene.description,
                sceneId: scene.id,
                isExample: true,
                ...scene // preserve other props
            }));
            setExampleScenes(exampleChats);
            fetchedRef.current.examples = true;
            setDataLoaded(prev => ({ ...prev, examples: true }));
        } catch (err) {
            console.error("Error fetching example scenes:", err);
        } finally {
            setDataLoaded(prev => ({ ...prev, examples: true }));
            setLoading(prev => ({ ...prev, examples: false }));
        }
    }, [dataManager, exampleScenes.length]);

    const loadUserScenes = useCallback(async (force = false) => {
        if (!dataManager) return;
        if (fetchedRef.current.user && !force && userScenes.length > 0) return;

        setLoading(prev => ({ ...prev, user: true }));
        try {
            const scenes = await dataManager.getScenes('user', { orderBy: { field: 'updatedAt', direction: 'desc' } });
            setUserScenes(scenes);
            fetchedRef.current.user = true;
        } catch (err) {
            console.error("Error fetching user scenes:", err);
        } finally {
            setDataLoaded(prev => ({ ...prev, user: true }));
            setLoading(prev => ({ ...prev, user: false }));
        }
    }, [dataManager, userScenes.length]);

    const loadRecentScenes = useCallback(async (force = false) => {
        if (!dataManager) return;
        // Recents are usually fast and local, but we can cache them too
        // Note: Recent scenes might change more often, so maybe 'force' is more relevant here
        // For now, simple cache
        if (fetchedRef.current.recent && !force && recentScenes.length > 0) return;

        setLoading(prev => ({ ...prev, recent: true }));
        try {
            const recents = dataManager.getRecentScenes();
            setRecentScenes(recents || []);
            fetchedRef.current.recent = true;
        } catch (err) {
            console.error("Error fetching recent scenes:", err);
        } finally {
            setDataLoaded(prev => ({ ...prev, recent: true }));
            setLoading(prev => ({ ...prev, recent: false }));
        }
    }, [dataManager, recentScenes.length]);

    const incrementExampleDisplayCount = useCallback(() => {
        setExampleDisplayCount(prev => prev + 8);
    }, []);

    const incrementUserDisplayCount = useCallback(() => {
        setUserDisplayCount(prev => prev + 8);
    }, []);

    const resetDisplayCounts = useCallback(() => {
        setExampleDisplayCount(8);
        setUserDisplayCount(8);
    }, []);

    const value = {
        exampleScenes,
        userScenes,
        recentScenes,
        exampleDisplayCount,
        userDisplayCount,
        loadExampleScenes,
        loadUserScenes,
        loadRecentScenes,
        incrementExampleDisplayCount,
        incrementUserDisplayCount,
        resetDisplayCounts,
        loading,
        dataLoaded
    };

    return (
        <SceneCacheContext.Provider value={value}>
            {children}
        </SceneCacheContext.Provider>
    );
}
