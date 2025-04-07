// App.jsx
import React, { useState, useCallback } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import TopMenu from './TopMenu';
import Visualizer from './Visualizer';
import Graph from './Graph';
import Conversation from './Conversation';
import SceneSelector from './SceneSelector';
import './App.css';
import { mechanicsExamples } from './scenes.js';

function App() {
  const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]);
  const [motionData, setMotionData] = useState({});
  const [conversationHistory, setConversationHistory] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);

  const handlePositionUpdate = (posDataWithId) => {
    const { id, x, y, z, t } = posDataWithId;
    setMotionData((prevData) => {
      const objectHistory = prevData[id] || [];
      const updatedHistory = [...objectHistory, { x, y, t }];
      return { ...prevData, [id]: updatedHistory };
    });
  };

  const handleSceneChange = (example) => {
    setCurrentScene(example);
    setMotionData({});
  };

  const updateConversation = useCallback((newConversation) => {
    setConversationHistory(newConversation);
  }, []); // Empty dependency array since setConversationHistory is stable

  return (
    <div className="main">
      <TopMenu/>
      <PanelGroup direction="vertical">
        <Panel className="main-panel" defaultSize={90}>
          <PanelGroup direction="horizontal">
            <Panel className="component-section examples-panel" defaultSize={20} minSize={15}>
              <SceneSelector
                currentScene={currentScene}
                onSceneChange={handleSceneChange}
                conversationHistory={conversationHistory}
              />
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            <Panel className="visualization-section" defaultSize={35} minSize={20}>
              <div className="content-section">
                <Visualizer
                  key={currentScene.id}
                  scene={currentScene}
                  onPositionUpdate={handlePositionUpdate}
                />
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            <Panel className="graph-section" defaultSize={25} minSize={15}>
              <div className="content-section" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Graph data={motionData} />
              </div>
            </Panel>
            <PanelResizeHandle className="resize-handle" />
            <Panel className="solution-section" defaultSize={20} minSize={15}>
              <div className="content-section">
                <Conversation updateConversation={updateConversation}
                 conversationHistory={conversationHistory}/>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;