import React, { useState } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { mechanicsExamples } from './scenes.js';
import { extractedScenes } from './extractedscenes.js';
import './SceneSelector.css';

function SceneSelector({ currentScene, onSceneChange, conversationHistory }) {
  const [scenes, setScenes] = useState([...mechanicsExamples, ...extractedScenes]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState(null);
  const [expandedObjects, setExpandedObjects] = useState({});

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
      const prompt = `Extract a physics scene from this conversation:\n${conversationText}\nConvert it into a plain JSON object matching the format below. Supported object types are "Sphere", "Box", "Cylinder", and "Box" (used for planes or platforms). Required fields for each type are listed; optional fields can be omitted if not specified. Use numeric values for all fields (e.g., 0.78539816339 for 45 degrees, 1.57079632679 for 90 degrees). If the conversation lacks details, use reasonable defaults (e.g., mass 1 for dynamic objects, 0 for static platforms, position [0, 0, 0]).

**Important:** Return the JSON object alone, without any additional text, comments, or Markdown (e.g., no json markers, no explanations). The response must be parseable directly as JSON by a program. Do not wrap it in code blocks or add formatting.

Example of expected output:
{"id":"example","name":"Bouncing Ball and Ramp","description":"A ball bounces on a sloped platform","objects":[{"id":"ball-1","type":"Sphere","mass":2,"radius":0.5,"position":[0,5,0],"velocity":[0,0,0],"rotation":[0,0,0],"color":"#ff6347","restitution":0.7},{"id":"ramp-1","type":"Box","mass":0,"dimensions":[5,0.2,5],"position":[0,0,0],"rotation":[0.52359877559,0,0],"color":"#88aa88","restitution":0.3},{"id":"cyl-1","type":"Cylinder","mass":1,"radius":0.3,"height":1.5,"position":[2,3,0],"velocity":[0,0,0],"rotation":[0,0,0],"color":"#4682b4","restitution":0.5}],"gravity":[0,-9.81,0],"contactMaterial":{"friction":0.5,"restitution":0.7}}

Required fields by type:
- "Sphere": "id", "type", "mass", "radius", "position"
- "Box": "id", "type", "mass", "dimensions" (array of 3 numbers: width, height, depth), "position"
- "Cylinder": "id", "type", "mass", "radius", "height", "position"
Optional fields for all types: "velocity" (default [0, 0, 0]), "rotation" (default [0, 0, 0]), "color" (default "#ff6347"), "restitution" (default 0.7, range 0 to 1).

Scene-level fields:
- "id": unique string (default to a timestamp if missing)
- "name": string (default "Extracted Scene")
- "description": string (default "Scene from conversation")
- "objects": array of objects (empty array if none found)
- "gravity": array of 3 numbers (default [0, -9.81, 0])
- "contactMaterial": object with "friction" (default 0.5) and "restitution" (default 0.7)

If no physics scene is identifiable, return this exact JSON object:
{"id":"empty","name":"No Scene Found","description":"No physics scene in conversation","objects":[],"gravity":[0,-9.81,0],"contactMaterial":{"friction":0.5,"restitution":0.7}}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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

      extractedScene.id = extractedScene.id || `extracted-${Date.now()}`;
      extractedScene.name = extractedScene.name || `Extracted Scene ${extractedScenes.length + 1}`;
      extractedScene.description = extractedScene.description || 'Scene from conversation';
      extractedScene.objects = Array.isArray(extractedScene.objects) ? extractedScene.objects : [];
      extractedScene.gravity = Array.isArray(extractedScene.gravity) && extractedScene.gravity.length === 3 ? extractedScene.gravity : [0, -9.81, 0];
      extractedScene.contactMaterial = extractedScene.contactMaterial || { friction: 0.5, restitution: 0.7 };

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

      const newExtractedScenes = [extractedScene, ...extractedScenes];
      setScenes([...newExtractedScenes, ...mechanicsExamples]);
    } catch (error) {
      setError(`Scene extraction failed: ${error.message}`);
      const fallbackScene = {
        id: `extracted-${Date.now()}`,
        name: 'Error Scene',
        description: 'Failed to extract scene',
        objects: [],
        gravity: [0, -9.81, 0],
        contactMaterial: { friction: 0.5, restitution: 0.7 },
      };
      const newExtractedScenes = [fallbackScene, ...extractedScenes];
      setScenes([...newExtractedScenes, ...mechanicsExamples]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExampleClick = (example) => {
    onSceneChange(example);
    setExpandedObjects({});
  };

  const toggleObjectDetails = (objectId) => {
    setExpandedObjects(prev => ({
      ...prev,
      [objectId]: !prev[objectId],
    }));
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
            aria-label="Extract scene from conversation"
          >
            {isExtracting ? (
              <>
                <span className="spinner" aria-hidden="true"></span> Extracting...
              </>
            ) : (
              'Extract Scene from Conversation'
            )}
          </button>
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}
        </div>
        <PanelGroup direction="vertical">
          <Panel defaultSize={60} minSize={20} className="scene-list-panel">
            <h3 className="scene-list-title">Scene Examples</h3>
            <ul className="scene-list">
              {scenes.map((example) => (
                <li
                  key={example.id}
                  onClick={() => handleExampleClick(example)}
                  className={`scene-item ${currentScene.id === example.id ? 'selected' : ''}`}
                  title={example.description}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleExampleClick(example)}
                  aria-label={`Select scene: ${example.name}`}
                >
                  <div className="scene-name">{example.name}</div>
                  <div className="scene-description">{example.description}</div>
                </li>
              ))}
            </ul>
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
                            </span>
                          </div>
                          {expandedObjects[obj.id || index] && (
                            <div className="object-properties">
                              <div className="property-row">
                                <span className="property-name">Mass:</span>
                                <span className="property-value">{obj.mass} kg</span>
                              </div>
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
                </div>
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );}
  export default SceneSelector;