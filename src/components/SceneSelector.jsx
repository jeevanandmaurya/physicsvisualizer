import React, { useState, useEffect, useCallback } from 'react';
import { PanelGroup, Panel } from 'react-resizable-panels';
import { useDatabase } from '../contexts/DatabaseContext';
import './SceneSelector.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGlobe, faBookOpen, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import extractPrompt from '../prompts/extractPrompt.txt?raw';

function SceneSelector({
    currentScene,
    handleSceneChange, // <-- FIX: Changed prop name from onSceneChange to handleSceneChange
    conversationHistory,
    userScenes,
    loadingUserScenes,
    extractedScenes = [],
    onExtractedScene,
    currentUser,
}) {
    const [activeTab, setActiveTab] = useState('examples');
    const [publicScenes, setPublicScenes] = useState([]);
    const [exampleScenes, setExampleScenes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState(null);

    const dataManager = useDatabase();
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // --- Data Fetching Logic ---
    useEffect(() => {
        let isMounted = true;
        const fetchScenes = async () => {
            if (!dataManager || activeTab === 'user') return;
            setLoading(true);
            setError(null);
            try {
                const scenes = await dataManager.getScenes(activeTab);
                if (isMounted) {
                    if (activeTab === 'examples') setExampleScenes(scenes);
                    else if (activeTab === 'public') setPublicScenes(scenes);
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab} scenes:`, err);
                if (isMounted) setError(`Failed to load ${activeTab} scenes.`);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchScenes();
        return () => { isMounted = false; };
    }, [activeTab, dataManager]);
    
    // --- Handlers ---

    const handleExtractScene = async () => {
        if (!currentUser) return setError("Please log in to extract scenes.");
        if (!GEMINI_API_KEY) return setError("Gemini API key is missing.");
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
        if (!currentUser) return [];
        // Show newly extracted (unsaved) scenes at the top of the user's saved list
        return [...extractedScenes, ...userScenes];
    };

    // This function now correctly calls the prop passed from the parent.
    const handleSceneItemClick = (scene) => {
        handleSceneChange(scene);
    };

    // --- Render Logic ---
    const renderSceneList = (scenesToRender, isLoading, emptyMessage) => {
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
                        <div className="scene-name">
                            {scene.name}
                            {scene.authorName && <span className="scene-author">by {scene.authorName}</span>}
                            {(scene.isTemporary || scene.isExtracted) && (
                                <span className="unsaved-badge" title="Unsaved"><FontAwesomeIcon icon={faExclamationTriangle} /></span>
                            )}
                        </div>
                        <div className="scene-description">{scene.description}</div>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="scene-selector-container">
            <div className="scene-selector">
                <div className="scene-selector-header">
                    {currentUser ? (
                        <button className={`extract-button ${isExtracting ? 'extracting' : ''}`} onClick={handleExtractScene} disabled={isExtracting}>
                            {isExtracting ? <><FontAwesomeIcon icon={faSpinner} spin /> Extracting...</> : 'Extract Scene'}
                        </button>
                    ) : (
                        <div className="login-prompt"><FontAwesomeIcon icon={faUser} /> Log in to extract</div>
                    )}
                    {error && <div className="error-message" role="alert">{error}</div>}
                </div>

                <div className="scene-tabs">
                    <button className={activeTab === 'examples' ? 'active' : ''} onClick={() => setActiveTab('examples')}><FontAwesomeIcon icon={faBookOpen} /> Examples</button>
                    <button className={activeTab === 'user' ? 'active' : ''} onClick={() => setActiveTab('user')} disabled={!currentUser}><FontAwesomeIcon icon={faUser} /> My Scenes
                        {extractedScenes.length > 0 && <span className="unsaved-count">({extractedScenes.length})</span>}
                    </button>
                    <button className={activeTab === 'public' ? 'active' : ''} onClick={() => setActiveTab('public')}><FontAwesomeIcon icon={faGlobe} /> Public</button>
                </div>
                
                <PanelGroup direction="vertical">
                    <Panel className="scene-list-panel">
                        <h3 className="scene-list-title">
                            {activeTab === 'examples' && 'Predefined Examples'}
                            {activeTab === 'user' && 'My Scenes'}
                            {activeTab === 'public' && 'Public Scenes'}
                        </h3>
                        {activeTab === 'examples' && renderSceneList(exampleScenes, loading, "No examples found.")}
                        {activeTab === 'user' && renderSceneList(getCombinedUserScenes(), loadingUserScenes, currentUser ? "No saved scenes yet." : "Log in to see your scenes.")}
                        {activeTab === 'public' && renderSceneList(publicScenes, loading, "No public scenes available.")}
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}

export default SceneSelector;