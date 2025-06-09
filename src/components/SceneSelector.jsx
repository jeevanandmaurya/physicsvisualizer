import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback and useEffect
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { mechanicsExamples } from '../scenes.js'; // Your predefined local scene examples
import { useAuth } from '../contexts/AuthContext'; // Import the Auth Context
import './SceneSelector.css';

// Import FontAwesome for icons (if you use them for tabs/loaders)
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faGlobe, faBookOpen, faSpinner } from '@fortawesome/free-solid-svg-icons'; // Add icons as needed

function SceneSelector({
    currentScene,
    onSceneChange,
    conversationHistory,
    userScenes, // Prop from PhysicsVisualizerPage (user's saved scenes)
    loadingUserScenes, // Prop from PhysicsVisualizerPage (loading state for user scenes)
    queryPublicCollection, // Function to query public scenes
    // Removed currentUser prop - now getting from AuthContext
}) {
    // Get current user from AuthContext
    const { currentUser } = useAuth();
    
    const [activeTab, setActiveTab] = useState('examples'); // 'examples', 'user', 'public'
    const [publicScenes, setPublicScenes] = useState([]);
    const [loadingPublicScenes, setLoadingPublicScenes] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState(null);
    const [expandedObjects, setExpandedObjects] = useState({});

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    // --- Effect to load public scenes when component mounts or queryPublicCollection changes ---
    useEffect(() => {
        const fetchPublicScenes = async () => {
            if (!queryPublicCollection){
              console.error("fetchPublicScenes was called, but queryPublicCollection is not available!");
              return; // Don't proceed if database context isn't ready
            }
            console.log("1. Starting fetchPublicScenes..."); // Check if the function starts
            setLoadingPublicScenes(true);

            try {
                // Fetch public scenes that are explicitly marked as public
                console.log("2. Calling queryPublicCollection with:", 'public_scenes', [], 3);
                const scenes = await queryPublicCollection('public_scenes', [], 3);
                setPublicScenes(scenes);
                 console.log("3. Received scenes from Firestore:", scenes); // <<< THIS IS THE MOST IMPORTANT LOG

            } catch (err) {
                console.error("Error fetching public scenes:", err);
                setError("Failed to load public scenes.");
            } finally {
                setLoadingPublicScenes(false);
            }
        };

        if (activeTab === 'public') {
            fetchPublicScenes();
        }
    }, [activeTab, queryPublicCollection]); // Re-fetch if tab changes to public or query function changes

    const handleExtractScene = async () => {
        if (!GEMINI_API_KEY) {
            setError("Gemini API key is missing.");
            return;
        }
        if (!conversationHistory.length) {
            setError("No conversation history to extract from.");
            return;
        }

        setIsExtracting(true);
        setError(null);
        try {
            const conversationText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');
            const prompt = `Extract a physics scene from this conversation with enhanced gravitational physics support:\n${conversationText}\n

Convert it into a plain JSON object matching the format below. This system now supports realistic gravitational attraction between masses in addition to standard physics.

**Enhanced Gravitational Physics Support:**
The system now includes gravitational attraction between all objects with mass > 0. Objects with mass = 0 (like static platforms) do not participate in gravitational attraction but can still attract others if they have gravitationalMass specified.

**Object Types and Fields:**
Supported object types are "Sphere", "Box", and "Cylinder". Note: "Box" can also be used for planes or platforms.

**Required fields by type:**
- "Sphere": "id", "type", "mass", "radius", "position"
- "Box": "id", "type", "mass", "dimensions" (array of 3 numbers: width, height, depth), "position"
- "Cylinder": "id", "type", "mass", "radius", "height", "position"

**Optional fields for all types (enhanced with gravitational physics):**
- "velocity": array of 3 numbers (default [0, 0, 0]) - Critical for orbital mechanics
- "rotation": array of 3 numbers representing Euler angles in radians (default [0, 0, 0])
- "angularVelocity": array of 3 numbers for rotational motion (default [0, 0, 0])
- "color": string (hex or name, default varies)
- "restitution": number (range 0 to 1; overrides scene 'contactMaterial.restitution')
- "friction": number (range 0 to 1+; overrides scene 'contactMaterial.friction')
- "gravitationalMass": number (defaults to 'mass' if not specified) - Allows different gravitational vs inertial mass
- "isStatic": boolean (default false) - If true, object doesn't move but still attracts others gravitationally

**Enhanced Scene-level fields:**
- "id": unique string (default to a timestamp if missing)
- "name": string-based on scene name (default "Extracted Scene")
- "description": string-based on scene details (default "Scene from conversation")
- "objects": array of objects (empty array if none found)
- "gravity": array of 3 numbers (default [0, -9.81, 0] for Earth gravity, [0, 0, 0] for space/zero-gravity scenarios)
- "hasGround": boolean (true for terrestrial scenes with ground, false for space/zero-gravity scenarios)
- "contactMaterial": object that **must be present** defining default physical properties
    - "friction": number (default 0.5)
    - "restitution": number (default 0.7)
- "gravitationalPhysics": object defining gravitational simulation parameters
    - "enabled": boolean (default true) - Enable/disable gravitational attraction between masses
    - "gravitationalConstant": number (default 6.67430e-11) - Can be scaled for dramatic effect
    - "minDistance": number (default 1e-6) - Minimum distance for gravitational calculations
    - "softening": number (default 0) - Softening parameter for N-body simulations
- "simulationScale": string ("terrestrial", "solar_system", "galactic") - Helps with appropriate scaling

**Crucial Positioning and Sizing Guidelines:**
* **Avoid Initial Overlap:** When determining the "position" of each object, meticulously consider its "radius" (for Spheres and Cylinders) or "dimensions" (for Boxes) in conjunction with the positions and sizes of other objects. The goal is to ensure no objects are intersecting or overlapping in their initial state unless explicitly described as such.
* **Orbital Positioning:** For orbital scenarios, position objects at appropriate distances with calculated orbital velocities.
* **Multi-body Systems:** Consider gravitational interactions between all massive objects when positioning.

**Ground Plane Control (Enhanced):**
* **hasGround:** Set to true for scenes that require a ground plane (terrestrial physics, objects falling/bouncing on ground). Set to false for space scenes, celestial body simulations, or scenarios where objects should float freely without a ground reference.
* **Examples where hasGround should be false and gravitationalPhysics.enabled should be true:**
    - Space simulations, satellite orbits, planetary motion
    - Zero-gravity environments with gravitational attraction
    - Solar system simulations, moon-earth systems
    - Binary star systems, gravitational slingshot scenarios
* **Examples where hasGround should be true and gravitationalPhysics can be enabled or disabled:**
    - Balls bouncing with slight gravitational attraction between them
    - Projectile motion with gravitational effects
    - Pendulum systems with gravitational coupling

**Scenario Type Detection:**
Based on the conversation content, determine the appropriate scenario type:

1. **Terrestrial Scenarios (Small gravitational effects):**
    - Use gravitationalConstant: 6.67430e-11 (realistic)
    - simulationScale: "terrestrial"
    - hasGround: true typically
    - gravity: [0, -9.81, 0]

2. **Astronomical Scenarios (Enhanced gravitational effects):**
    - Use gravitationalConstant: 6.67430e-11 or scaled version
    - simulationScale: "solar_system" or "galactic"
    - hasGround: false typically
    - gravity: [0, 0, 0] (gravitational forces dominate)
    - Use realistic masses and distances for celestial bodies

3. **Abstract/Educational Scenarios:**
    - gravitationalConstant can be scaled for visualization
    - simulationScale: "terrestrial" typically
    - Adjust based on educational purpose

**Important:** Return the JSON object alone, without any additional text, comments, or Markdown. The response must be parseable directly as JSON by a program.

**Example outputs:**

Terrestrial with gravitational attraction:
{"id":"terrestrial_gravity","name":"Objects with Gravitational Attraction","description":"Small objects attracting each other","objects":[{"id":"sphere1","type":"Sphere","mass":1000,"radius":0.5,"position":[-2,2,0],"velocity":[0.1,0,0],"color":"#ff6347"},{"id":"sphere2","type":"Sphere","mass":1500,"radius":0.6,"position":[2,2,0],"velocity":[-0.1,0,0],"color":"#4682b4"}],"gravity":[0,-9.81,0],"hasGround":true,"contactMaterial":{"friction":0.5,"restitution":0.7},"gravitationalPhysics":{"enabled":true,"gravitationalConstant":6.67430e-11,"minDistance":1e-6,"softening":0},"simulationScale":"terrestrial"}

Orbital system:
{"id":"orbital_system","name":"Planet-Moon System","description":"Orbital mechanics demonstration","objects":[{"id":"planet","type":"Sphere","mass":5.972e24,"radius":6371000,"position":[0,0,0],"velocity":[0,0,0],"color":"#4169e1","isStatic":true},{"id":"moon","type":"Sphere","mass":7.342e22,"radius":1737000,"position":[384400000,0,0],"velocity":[0,1022,0],"color":"#c0c0c0"}],"gravity":[0,0,0],"hasGround":false,"contactMaterial":{"friction":0.1,"restitution":0.9},"gravitationalPhysics":{"enabled":true,"gravitationalConstant":6.67430e-11,"minDistance":1000,"softening":0},"simulationScale":"solar_system"}

If no physics scene is identifiable, return:
{"id":"empty","name":"No Scene Found","description":"No physics scene in conversation","objects":[],"gravity":[0,-9.81,0],"hasGround":true,"contactMaterial":{"friction":0.5,"restitution":0.7},"gravitationalPhysics":{"enabled":false,"gravitationalConstant":6.67430e-11,"minDistance":1e-6,"softening":0},"simulationScale":"terrestrial"}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                }
            );

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

            let extractedScene;
            try {
                extractedScene = JSON.parse(rawResponse);
            } catch (e) {
                const cleanedJson = rawResponse.match(/```json\s*([\s\S]*?)\s*```/)?.[1] || rawResponse.replace(/^.*?(\{.*\})/s, '$1').trim();
                extractedScene = JSON.parse(cleanedJson);
            }

            // Enhanced normalization with gravitational physics support
            extractedScene.id = extractedScene.id || `extracted-${Date.now()}`;
            extractedScene.name = extractedScene.name || `Extracted Scene ${Date.now()}`; // Use Date.now for unique name if no name
            extractedScene.description = extractedScene.description || 'Scene from conversation';
            extractedScene.objects = Array.isArray(extractedScene.objects) ? extractedScene.objects : [];
            extractedScene.gravity = Array.isArray(extractedScene.gravity) && extractedScene.gravity.length === 3 ? extractedScene.gravity : [0, -9.81, 0];
            extractedScene.contactMaterial = extractedScene.contactMaterial || { friction: 0.5, restitution: 0.7 };

            // Enhanced gravitational physics normalization
            extractedScene.gravitationalPhysics = extractedScene.gravitationalPhysics || {};
            extractedScene.gravitationalPhysics.enabled = extractedScene.gravitationalPhysics.enabled !== false;
            extractedScene.gravitationalPhysics.gravitationalConstant = extractedScene.gravitationalPhysics.gravitationalConstant || 6.67430e-11;
            extractedScene.gravitationalPhysics.minDistance = extractedScene.gravitationalPhysics.minDistance || 1e-6;
            extractedScene.gravitationalPhysics.softening = extractedScene.gravitationalPhysics.softening || 0;

            extractedScene.simulationScale = extractedScene.simulationScale || 'terrestrial';
            extractedScene.hasGround = extractedScene.hasGround !== false; // Default to true unless explicitly false

            // Enhanced object normalization with gravitational physics fields
            extractedScene.objects = extractedScene.objects.map(obj => {
                const normalizedObj = {
                    id: obj.id || `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: obj.type || 'Sphere',
                    mass: typeof obj.mass === 'number' ? obj.mass : (obj.type === 'Box' && obj.dimensions ? 0 : 1.0),
                    position: Array.isArray(obj.position) && obj.position.length === 3 ? obj.position : [0, 0, 0],
                    velocity: Array.isArray(obj.velocity) && obj.velocity.length === 3 ? obj.velocity : [0, 0, 0],
                    rotation: Array.isArray(obj.rotation) && obj.rotation.length === 3 ? obj.rotation : [0, 0, 0],
                    color: typeof obj.color === 'string' && obj.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? obj.color : '#ff6347',
                    restitution: typeof obj.restitution === 'number' && obj.restitution >= 0 && obj.restitution <= 1 ? obj.restitution : 0.7,
                };

                // Enhanced gravitational physics fields
                if (Array.isArray(obj.angularVelocity) && obj.angularVelocity.length === 3) {
                    normalizedObj.angularVelocity = obj.angularVelocity;
                }
                if (typeof obj.gravitationalMass === 'number') {
                    normalizedObj.gravitationalMass = obj.gravitationalMass;
                }
                if (typeof obj.isStatic === 'boolean') {
                    normalizedObj.isStatic = obj.isStatic;
                }
                if (typeof obj.friction === 'number') {
                    normalizedObj.friction = obj.friction;
                }

                switch (normalizedObj.type) {
                    case 'Sphere':
                        normalizedObj.radius = typeof obj.radius === 'number' && obj.radius > 0 ? obj.radius : 0.5;
                        break;
                    case 'Box':
                        normalizedObj.dimensions = Array.isArray(obj.dimensions) && obj.dimensions.length === 3 ? obj.dimensions : [1, 1, 1];
                        break;
                    case 'Cylinder':
                        normalizedObj.radius = typeof obj.radius === 'number' && obj.radius > 0 ? obj.radius : 0.5;
                        normalizedObj.height = typeof obj.height === 'number' && obj.height > 0 ? obj.height : 1.0;
                        break;
                    default:
                        normalizedObj.type = 'Sphere';
                        normalizedObj.radius = 0.5;
                        break;
                }
                return normalizedObj;
            });

            // Call onSceneChange directly with the new extracted scene
            onSceneChange(extractedScene);
            // Optionally, you might want to add the extracted scene to the user's scenes list if it's considered a "new" scene
            // This would typically involve saving it to the database, which is handled by PhysicsVisualizerPage's handleSaveScene.
            // For now, we'll just load it.

        } catch (error) {
            console.error("Error extracting scene:", error);
            setError(`Scene extraction failed: ${error.message}`);
            const fallbackScene = {
                id: `extracted-error-${Date.now()}`,
                name: 'Error Scene',
                description: 'Failed to extract scene',
                objects: [],
                gravity: [0, -9.81, 0],
                hasGround: true,
                contactMaterial: { friction: 0.5, restitution: 0.7 },
                gravitationalPhysics: {
                    enabled: false,
                    gravitationalConstant: 6.67430e-11,
                    minDistance: 1e-6,
                    softening: 0
                },
                simulationScale: 'terrestrial',
            };
            onSceneChange(fallbackScene); // Load the fallback scene
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSceneItemClick = (scene) => {
        onSceneChange(scene);
        setExpandedObjects({}); // Collapse any open object details
    };

    const toggleObjectDetails = (objectId) => {
        setExpandedObjects(prev => ({
            ...prev,
            [objectId]: !prev[objectId],
        }));
    };

    const renderSceneList = (scenesToRender, loading, emptyMessage) => {
        if (loading) {
            return <div className="loading-message"><FontAwesomeIcon icon={faSpinner} spin /> Loading scenes...</div>;
        }
        // FIX: Check if scenesToRender is falsy (like undefined) before accessing .length
        if (!scenesToRender || scenesToRender.length === 0) {
            return <p className="placeholder-text">{emptyMessage}</p>;
        }
        return (
            <ul className="scene-list">
                {scenesToRender.map((example) => (
                    <li
                        key={example.id}
                        onClick={() => handleSceneItemClick(example)}
                        className={`scene-item ${currentScene.id === example.id ? 'selected' : ''}`}
                        title={example.description}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleSceneItemClick(example)}
                        aria-label={`Select scene: ${example.name}`}
                    >
                        <div className="scene-name">{example.name} {example.authorName && <span className="scene-author">by {example.authorName}</span>}</div>
                        <div className="scene-description">{example.description}</div>
                        {example.isPublic && <div className="scene-badge public-badge">Public</div>}
                        {example.gravitationalPhysics?.enabled && (
                            <div className="scene-badge gravitational-badge">Gravitational Physics</div>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="scene-selector-container">
            <div className="scene-selector">
                <div className="scene-selector-header">
                    <button
                        className={`extract-button ${isExtracting ? 'extracting' : ''}`}
                        onClick={handleExtractScene}
                        disabled={isExtracting}
                        aria-busy={isExtracting}
                        aria-label="Extract scene from conversation with gravitational physics"
                    >
                        {isExtracting ? (
                            <>
                                <FontAwesomeIcon icon={faSpinner} spin /> Extracting...
                            </>
                        ) : (
                            'Extract Scene from Conversation (Enhanced Physics)'
                        )}
                    </button>
                    {error && (
                        <div className="error-message" role="alert">
                            {error}
                        </div>
                    )}
                </div>

                {/* Tabs for Scene Selection */}
                <div className="scene-tabs">
                    <button
                        className={activeTab === 'examples' ? 'active' : ''}
                        onClick={() => setActiveTab('examples')}
                    >
                        <FontAwesomeIcon icon={faBookOpen} /> Examples
                    </button>
                    <button
                        className={activeTab === 'user' ? 'active' : ''}
                        onClick={() => setActiveTab('user')}
                        disabled={!currentUser} // Disable if not logged in
                        title={!currentUser ? "Log in to see your scenes" : ""}
                    >
                        <FontAwesomeIcon icon={faUser} /> My Scenes
                    </button>
                    <button
                        className={activeTab === 'public' ? 'active' : ''}
                        onClick={() => setActiveTab('public')}
                    >
                        <FontAwesomeIcon icon={faGlobe} /> Public Scenes
                    </button>
                </div>

                <PanelGroup direction="vertical">
                    <Panel defaultSize={60} minSize={20} className="scene-list-panel">
                        <h3 className="scene-list-title">
                            {activeTab === 'examples' && 'Predefined Examples'}
                            {activeTab === 'user' && 'My Saved Scenes'}
                            {activeTab === 'public' && 'Public Scenes'}
                        </h3>
                        {activeTab === 'examples' && renderSceneList(mechanicsExamples, false, "No example scenes found.")}
                        {activeTab === 'user' && renderSceneList(userScenes, loadingUserScenes, "No saved scenes. Log in and save one!")}
                        {activeTab === 'public' && renderSceneList(publicScenes, loadingPublicScenes, "No public scenes available.")}
                    </Panel>
                    <PanelResizeHandle className="panel-resize-handle" />
                    <Panel minSize={20} className="scene-details-panel">
                        <div className="scene-details">
                            <h4 className="inspector-header">Current Scene: {currentScene.name}</h4>
                            <div className="details-content">
                                <p>
                                    <strong>Description:</strong> {currentScene.description}
                                </p>
                                <div>
                                    <strong className="scene-properties-title">
                                        Objects ({currentScene.objects.length}):
                                    </strong>
                                    {currentScene.objects.length > 0 ? (
                                        <ul className="object-list">
                                            {currentScene.objects.map((obj, index) => (
                                                <li key={obj.id || index} className="object-list-item">
                                                    <div
                                                        className={`object-header ${
                                                            expandedObjects[obj.id || index] ? '' : 'collapsed'
                                                        }`}
                                                        onClick={() => toggleObjectDetails(obj.id || index)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={(e) =>
                                                            e.key === 'Enter' && toggleObjectDetails(obj.id || index)
                                                        }
                                                        aria-expanded={!!expandedObjects[obj.id || index]}
                                                        aria-label={`Toggle details for ${obj.type} (${obj.id})`}
                                                    >
                                                        <span className="toggle-icon"></span>
                                                        <span className="object-title">
                                                            <span className="object-type">{obj.type}</span>
                                                            <span className="object-id">({obj.id})</span>
                                                            {obj.isStatic && <span className="static-badge">Static</span>}
                                                        </span>
                                                    </div>
                                                    {expandedObjects[obj.id || index] && (
                                                        <div className="object-properties">
                                                            <div className="property-row">
                                                                <span className="property-name">Mass:</span>
                                                                <span className="property-value">{obj.mass} kg</span>
                                                            </div>
                                                            {typeof obj.gravitationalMass === 'number' && obj.gravitationalMass !== obj.mass && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Gravitational Mass:</span>
                                                                    <span className="property-value">{obj.gravitationalMass} kg</span>
                                                                </div>
                                                            )}
                                                            <div className="property-row">
                                                                <span className="property-name">Position:</span>
                                                                <span className="property-value">
                                                                    [{obj.position.map((v) => v.toFixed(2)).join(', ')}] m
                                                                </span>
                                                            </div>
                                                            {obj.velocity && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Velocity:</span>
                                                                    <span className="property-value">
                                                                        [{obj.velocity.map((v) => v.toFixed(2)).join(', ')}] m/s
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {obj.rotation && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Rotation:</span>
                                                                    <span className="property-value">
                                                                        [
                                                                        {obj.rotation
                                                                            .map((v) => (v * 180 / Math.PI).toFixed(2))
                                                                            .join(', ')}
                                                                        ]°
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {obj.angularVelocity && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Angular Velocity:</span>
                                                                    <span className="property-value">
                                                                        [{obj.angularVelocity.map((v) => v.toFixed(2)).join(', ')}] rad/s
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div className="property-row">
                                                                <span className="property-name">Color:</span>
                                                                <span className="property-value">
                                                                    <span
                                                                        className="color-preview"
                                                                        style={{ backgroundColor: obj.color }}
                                                                    ></span>
                                                                    {obj.color}
                                                                </span>
                                                            </div>
                                                            {typeof obj.restitution === 'number' && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Restitution:</span>
                                                                    <span className="property-value">
                                                                        {obj.restitution.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {obj.type === 'Sphere' && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Radius:</span>
                                                                    <span className="property-value">{obj.radius} m</span>
                                                                </div>
                                                            )}
                                                            {obj.type === 'Box' && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Dimensions:</span>
                                                                    <span className="property-value">
                                                                        [{obj.dimensions.join(', ')}] m
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {obj.type === 'Cylinder' && (
                                                                <>
                                                                    <div className="property-row">
                                                                        <span className="property-name">Radius:</span>
                                                                        <span className="property-value">{obj.radius} m</span>
                                                                    </div>
                                                                    <div className="property-row">
                                                                        <span className="property-name">Height:</span>
                                                                        <span className="property-value">{obj.height} m</span>
                                                                    </div>
                                                                </>
                                                            )}
                                                            {typeof obj.friction === 'number' && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Friction:</span>
                                                                    <span className="property-value">
                                                                        {obj.friction.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {obj.isStatic && (
                                                                <div className="property-row">
                                                                    <span className="property-name">Static:</span>
                                                                    <span className="property-value">Yes</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="placeholder-text">No objects in this scene.</p>
                                    )}
                                </div>
                                <div className="scene-properties">
                                    <span className="scene-properties-title">Scene Properties</span>
                                    <p>
                                        <strong>Gravity:</strong> [{currentScene.gravity.join(', ')}] m/s²
                                    </p>
                                    <p>
                                        <strong>Contact Material:</strong> Friction:{' '}
                                        {currentScene.contactMaterial?.friction?.toFixed(2) ?? 'N/A'},
                                        Restitution:{' '}
                                        {currentScene.contactMaterial?.restitution?.toFixed(2) ?? 'N/A'}
                                    </p>
                                    {currentScene.gravitationalPhysics && (
                                        <div className="gravitational-physics-section">
                                            <p>
                                                <strong>Gravitational Physics:</strong>{' '}
                                                {currentScene.gravitationalPhysics.enabled ? 'Enabled' : 'Disabled'}
                                            </p>
                                            {currentScene.gravitationalPhysics.enabled && (
                                                <>
                                                    <p>
                                                        <strong>Gravitational Constant:</strong>{' '}
                                                        {currentScene.gravitationalPhysics.gravitationalConstant?.toExponential(3) ?? 'N/A'} m³/(kg⋅s²)
                                                    </p>
                                                    <p>
                                                        <strong>Min Distance:</strong>{' '}
                                                        {currentScene.gravitationalPhysics.minDistance?.toExponential(3) ?? 'N/A'} m
                                                    </p>
                                                    <p>
                                                        <strong>Softening:</strong>{' '}
                                                        {currentScene.gravitationalPhysics.softening ?? 'N/A'} m
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    <p>
                                        <strong>Simulation Scale:</strong> {currentScene.simulationScale || 'terrestrial'}
                                    </p>
                                    <p>
                                        <strong>Has Ground:</strong> {currentScene.hasGround !== false ? 'Yes' : 'No'}
                                    </p>
                                    {currentScene.authorName && (
                                        <p>
                                            <strong>Author:</strong> {currentScene.authorName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}

export default SceneSelector;