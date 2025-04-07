import React, { useState } from 'react';
import { mechanicsExamples } from './scenes.js';
import { extractedScenes } from './extractedscenes.js';
import './SceneSelector.css';

function SceneSelector({ currentScene, onSceneChange, conversationHistory }) {
  const [scenes, setScenes] = useState([...mechanicsExamples, ...extractedScenes]);
  const [isExtracting, setIsExtracting] = useState(false);

  // Load Gemini API key from environment variable
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const handleExtractScene = async () => {
    if (!GEMINI_API_KEY) {
      console.error("Gemini API key is missing.");
      return;
    }

    setIsExtracting(true);
    try {
      console.log("Extracting scene from conversation using Gemini...");
      const conversationText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n');

      const prompt = `Extract a physics scene from this conversation:\n${conversationText}\nConvert it into plain JSON matching the format of mechanicsExamples from scenes.js. Example format:\n{
        "id": "example",
        "name": "Example Scene",
        "description": "A sample scene",
        "objects": [
          {
            "id": "obj-1",
            "type": "Sphere",
            "mass": 10,
            "radius": 0.5,
            "position": [0, 5, 0],
            "velocity": [0, 0, 0],
            "rotation": [0, 0, 0],
            "color": "#ff6347",
            "restitution": 0.7
          },
          {
            "id": "plane-1",
            "type": "Plane",
            "mass": 0,
            "position": [0, 0, 0],
            "rotation": [0.78539816339, 0, 0]
          }
        ],
        "gravity": [0, -9.81, 0],
        "contactMaterial": {
          "friction": 0.5,
          "restitution": 0.7
        }
      }\nImportant: Use calculated numeric values for all fields (e.g., use 0.78539816339 for 45 degrees instead of Math.PI / 4). Do not include JavaScript expressions or variables. Return only the plain JSON object, with no additional text or Markdown if possible. If Markdown is unavoidable, wrap the JSON in \`\`\`json markers.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      let rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('Raw Gemini response:', rawResponse);

      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      let cleanedJson = jsonMatch && jsonMatch[1] ? jsonMatch[1].replace(/^.*?(\{.*\})/s, '$1').trim() : rawResponse.replace(/^.*?(\{.*\})/s, '$1').trim();

      console.log('Cleaned JSON:', cleanedJson);

      let extractedScene;
      try {
        extractedScene = JSON.parse(cleanedJson);
      } catch (e) {
        console.error('Failed to parse JSON:', cleanedJson, e);
        throw new Error('Invalid JSON format in Gemini response');
      }

      // Normalize the scene
      extractedScene.id = extractedScene.id || `extracted-${Date.now()}`;
      extractedScene.name = extractedScene.name || `Extracted Scene ${extractedScenes.length + 1}`;
      extractedScene.description = extractedScene.description || 'Scene extracted from conversation';
      extractedScene.objects = Array.isArray(extractedScene.objects) ? extractedScene.objects : [];
      extractedScene.gravity = Array.isArray(extractedScene.gravity) && extractedScene.gravity.length === 3 ? extractedScene.gravity : [0, -9.81, 0];
      extractedScene.contactMaterial = extractedScene.contactMaterial || { friction: 0.5, restitution: 0.7 };

      extractedScene.objects = extractedScene.objects.map(obj => {
        const normalizedObj = {
          id: obj.id || `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: obj.type || 'Sphere',
          mass: typeof obj.mass === 'number' ? obj.mass : (obj.type === 'Plane' ? 0 : 1.0),
          position: Array.isArray(obj.position) && obj.position.length === 3 ? obj.position : [0, 0, 0],
          velocity: Array.isArray(obj.velocity) && obj.velocity.length === 3 ? obj.velocity : [0, 0, 0],
          rotation: Array.isArray(obj.rotation) && obj.rotation.length === 3 ? obj.rotation : [0, 0, 0],
          color: typeof obj.color === 'string' && obj.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? obj.color : '#ff6347',
          restitution: typeof obj.restitution === 'number' && obj.restitution >= 0 && obj.restitution <= 1 ? obj.restitution : 0.7,
        };

        // Type-specific properties
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
          case 'ConvexPolyhedron':
            normalizedObj.vertices = Array.isArray(obj.vertices) ? obj.vertices : [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]];
            normalizedObj.faces = Array.isArray(obj.faces) ? obj.faces : [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
            break;
          case 'Trimesh':
            normalizedObj.vertices = Array.isArray(obj.vertices) ? obj.vertices : [[-0.5, 0, -0.5], [0.5, 0, -0.5], [0, 1, 0]];
            normalizedObj.indices = Array.isArray(obj.indices) ? obj.indices : [0, 1, 2];
            break;
          case 'Compound':
            normalizedObj.shapes = Array.isArray(obj.shapes) ? obj.shapes.map(shape => ({
              type: shape.type || 'Sphere',
              args: shape.args || [0.5],
              offset: Array.isArray(shape.offset) && shape.offset.length === 3 ? shape.offset : [0, 0, 0],
            })) : [{ type: 'Sphere', args: [0.5], offset: [0, 0, 0] }];
            break;
          case 'Plane':
            // No additional properties needed beyond mass, position, rotation
            break;
          default:
            console.warn(`Unknown object type: ${normalizedObj.type}, defaulting to Sphere`);
            normalizedObj.type = 'Sphere';
            normalizedObj.radius = 0.5;
            break;
        }

        return normalizedObj;
      });

      // Add new scene to the top of extractedScenes
      extractedScenes.unshift(extractedScene);
      setScenes([...extractedScenes, ...mechanicsExamples]);
      console.log("Extracted Scene:", extractedScene);
    } catch (error) {
      console.error("Scene extraction failed:", error);
      const fallbackScene = {
        id: `extracted-${Date.now()}`,
        name: 'Error Scene',
        description: 'Failed to extract scene from conversation',
        objects: [],
        gravity: [0, -9.81, 0],
        contactMaterial: { friction: 0.5, restitution: 0.7 },
      };
      extractedScenes.unshift(fallbackScene);
      setScenes([...extractedScenes, ...mechanicsExamples]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExampleClick = (example) => {
    onSceneChange(example);
  };

  return (
    <div className="component-section examples-panel">
      <div className="content-section">
        <div>
          <button
            style={{
              padding: '4px 6px',
              backgroundColor: '#444',
              color: '#fff',
              border: '1px solid #666',
              borderRadius: '4px',
              cursor: isExtracting ? 'not-allowed' : 'pointer',
              opacity: isExtracting ? 0.6 : 1,
            }}
            onClick={handleExtractScene}
            disabled={isExtracting}
          >
            {isExtracting ? 'Extracting...' : 'Extract Scene from Conversation'}
          </button>
        </div>
        <h3>Examples</h3>
        <div className="examples-list" style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
          {scenes.map((example) => (
            <div
              key={example.id}
              onClick={() => handleExampleClick(example)}
              className={`example-item ${currentScene.id === example.id ? 'selected' : ''}`}
              style={{
                padding: '5px',
                margin: '0 5px 8px 5px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                cursor: 'pointer',
                color: 'whitesmoke',
                backgroundColor: currentScene.id === example.id ? 'blue' : 'black',
                transition: 'background-color 0.2s ease',
              }}
              title={example.description}
            >
              <div style={{ fontWeight: 'bold', fontSize: '1.05em', marginBottom: '3px', color: 'white' }}>
                {example.name}
              </div>
              <div style={{ fontSize: '0.9em', color: 'whitesmoke' }}>
                {example.description}
              </div>
            </div>
          ))}
        </div>
        <div className="physics-parameters-display" style={{ padding: '10px', borderTop: '1px solid #eee', marginTop: '10px' }}>
          <h3>Current Scene Details:</h3>
          <h4>{currentScene.name}</h4>
          {currentScene.objects.map((obj, index) => (
            <div key={obj.id || index} className="physics-object-details">
              <span>Obj {index + 1}: {obj.id} ({obj.type})</span><br />
            </div>
          ))}
          <div className="physics-environment-details">
            <span>Gravity: [{currentScene.gravity.join(", ")}] m/s²</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SceneSelector;