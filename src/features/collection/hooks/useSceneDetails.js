import { useState } from 'react';

export function useSceneDetails(scene) {
    const [expandedObjects, setExpandedObjects] = useState({});
    const [activeTab, setActiveTab] = useState('list');

    const toggleObjectDetails = (objectId) => {
        setExpandedObjects(prev => ({ ...prev, [objectId]: !prev[objectId] }));
    };

    // Helper to format array values for display
    const formatArray = (arr) => `[${arr?.map(v => v.toFixed(2)).join(', ') ?? ''}]`;

    // Helper to copy JSON to clipboard
    const copyJsonToClipboard = async () => {
        if (scene) {
            await navigator.clipboard.writeText(JSON.stringify(scene, null, 2));
        }
    };

    // Get scene data for rendering
    const getSceneData = () => {
        if (!scene) {
            return { hasScene: false };
        }

        return {
            hasScene: true,
            scene,
            formatArray,
            expandedObjects,
            activeTab
        };
    };

    return {
        // State
        expandedObjects,
        activeTab,
        setActiveTab,

        // Data
        sceneData: getSceneData(),

        // Handlers
        toggleObjectDetails,
        copyJsonToClipboard
    };
}
