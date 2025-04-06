import React, { useState } from 'react';
import { mechanicsExamples } from './scenes.js';
import { extractedScenes } from './extractedscenes.js';
import './SceneSelector.css';

function SceneSelector({ currentScene, onSceneChange, conversationHistory }) {
  const [scenes, setScenes] = useState([...mechanicsExamples, ...extractedScenes]);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractScene = async () => {
    setIsExtracting(true);
    try {
      console.log("Extracting scene from conversation...");
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
              "radius": 10,
              "position": [0, 5, 0],
              "velocity": [0, 0, 0],
              "color": "#ff6347",
              "restitution": 0.7
            }
          ],
          "gravity": [0, -9.81, 0]
        }\nReturn only the plain JSON object, with no additional text or Markdown if possible. If Markdown is unavoidable, wrap the JSON in \`\`\`json markers.`;

      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
      }

      const data = await response.json();
      let rawResponse = data.response || '';
      console.log('Raw AI response:', rawResponse);

      const jsonMatch = rawResponse.match(/```json\s*([\s\S]*?)\s*```/);
      let cleanedJson = jsonMatch && jsonMatch[1] ? jsonMatch[1].replace(/^.*?(\{.*\})/s, '$1').trim() : rawResponse.replace(/^.*?(\{.*\})/s, '$1').trim();

      console.log('Cleaned JSON:', cleanedJson);

      let extractedScene;
      try {
        extractedScene = JSON.parse(cleanedJson);
      } catch (e) {
        console.error('Failed to parse JSON:', cleanedJson, e);
        throw new Error('Invalid JSON format in AI response');
      }

      // Normalize the scene
      extractedScene.id = extractedScene.id || `extracted-${Date.now()}`;
      extractedScene.name = extractedScene.name || `Extracted Scene ${extractedScenes.length + 1}`;
      extractedScene.description = extractedScene.description || 'Scene extracted from conversation';
      extractedScene.objects = Array.isArray(extractedScene.objects) ? extractedScene.objects : [];
      extractedScene.gravity = Array.isArray(extractedScene.gravity) ? extractedScene.gravity : [0, -9.81, 0];

      extractedScene.objects = extractedScene.objects.map(obj => ({
        id: obj.id || `obj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: obj.type || 'Sphere',
        mass: typeof obj.mass === 'number' && obj.mass > 0 ? obj.mass : 1.0,
        radius: typeof obj.radius === 'number' && obj.radius > 0 ? obj.radius : 0.5,
        position: Array.isArray(obj.position) && obj.position.length === 3 ? obj.position : [0, 0, 0],
        velocity: Array.isArray(obj.velocity) && obj.velocity.length === 3 ? obj.velocity : [0, 0, 0],
        color: typeof obj.color === 'string' && obj.color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) ? obj.color : '#ff6347',
        restitution: typeof obj.restitution === 'number' && obj.restitution >= 0 && obj.restitution <= 1 ? obj.restitution : 0.7,
      }));

      extractedScenes.length = 0;
      extractedScenes.push(extractedScene);
      setScenes([...mechanicsExamples, ...extractedScenes]);
      console.log("Extracted Scene:", extractedScene);
    } catch (error) {
      console.error("Scene extraction failed:", error);
      const fallbackScene = {
        id: `extracted-${Date.now()}`,
        name: 'Error Scene',
        description: 'Failed to extract scene from conversation',
        objects: [],
        gravity: [0, -9.81, 0],
      };
      extractedScenes.length = 0;
      extractedScenes.push(fallbackScene);
      setScenes([...mechanicsExamples, ...extractedScenes]);
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
