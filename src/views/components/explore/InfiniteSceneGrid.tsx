import React, { useRef, useEffect, useCallback } from 'react';
import { SceneCard, SceneSkeleton } from './SceneCard';
import './InfiniteSceneGrid.css';

interface InfiniteSceneGridProps {
    scenes: any[];
    loading: boolean;
    dataLoaded: boolean;
    displayCount: number;
    onLoadMore: () => void;
    emptyMessage?: React.ReactNode;
    onSceneClick: (sceneId: string, isPublic: boolean) => void;
    isPublic: boolean;
    skeletonsCount?: number;
}

export function InfiniteSceneGrid({
    scenes,
    loading,
    dataLoaded,
    displayCount,
    onLoadMore,
    emptyMessage = "No scenes found.",
    onSceneClick,
    isPublic,
    skeletonsCount = 8
}: InfiniteSceneGridProps) {
    
    // Observer for infinite scroll
    const observerTarget = useRef<HTMLDivElement>(null);
    const isLoadingMore = useRef(false);

    // Determine if we can load more
    const hasMore = dataLoaded && scenes.length > displayCount;

    // Stable callback that checks conditions before loading
    const handleIntersect = useCallback(() => {
        // Guard: only load if data is loaded, has more, and not currently loading
        if (!dataLoaded || !hasMore || isLoadingMore.current) {
            return;
        }
        
        isLoadingMore.current = true;
        onLoadMore();
        
        // Reset the loading guard after a short delay to allow state to update
        setTimeout(() => {
            isLoadingMore.current = false;
        }, 300);
    }, [dataLoaded, hasMore, onLoadMore]);

    useEffect(() => {
        const target = observerTarget.current;
        if (!target || !hasMore) return;

        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    handleIntersect();
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        );

        observer.observe(target);

        return () => {
            observer.unobserve(target);
        };
    }, [handleIntersect, hasMore]);

    // Determine what to show
    // 1. Loading and not loaded yet -> Skeletons
    if ((loading || !dataLoaded) && scenes.length === 0) {
        return (
            <div className="scene-grid">
                {Array.from({ length: skeletonsCount }).map((_, i) => (
                    <SceneSkeleton key={i} />
                ))}
            </div>
        );
    }

    // 2. Loaded but empty -> Empty State
    if (scenes.length === 0) {
        return (
             <div className="empty-state-container">
                {typeof emptyMessage === 'string' ? (
                     <p className="empty-state-message">{emptyMessage}</p>
                ) : (
                    emptyMessage
                )}
             </div>
        );
    }

    // 3. Render content
    const visibleScenes = scenes.slice(0, displayCount);

    return (
        <div className="scene-grid-container">
            <div className="scene-grid">
                {visibleScenes.map(scene => (
                    <SceneCard 
                        key={scene.id} 
                        scene={scene} 
                        isPublic={isPublic} 
                        onSceneClick={onSceneClick} 
                    />
                ))}
            </div>

            {hasMore ? (
                <div ref={observerTarget} className="load-more-container loading-bar">
                    <div className="loading-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            ) : (
                /* Optional: "No more results" message or spacing */
                <div style={{ height: '20px' }}></div> 
            )}
        </div>
    );
}
