import React, { useState, useCallback, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import TopMenu from './TopMenu';
import Visualizer from './Visualizer';
import OverlayGraph from './OverlayGraph';
import RightPanel from './rightPanel.jsx';
import LeftPanel from './leftPanel.jsx';
import Conversation from './Conversation';
import SceneSelector from './SceneSelector';
import './App.css';
import { mechanicsExamples } from './scenes.js';

function App() {
  const [currentScene, setCurrentScene] = useState(mechanicsExamples[0]);
  const [motionData, setMotionData] = useState({});
  const [activeLeftPanel, setActiveLeftPanel] = useState(null);
  const [activeRightPanel, setActiveRightPanel] = useState(null);


  const [conversationHistory, setConversationHistory] = useState([
    { role: 'ai', content: "Hello! How can I help you with physics today?" }
  ]);
  const [activeGraphs, setActiveGraphs] = useState([]);

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

  //Left Right Panle Toggle handling
  //Left
  const toggleLeftPanel = (panelName) => {
    setActiveLeftPanel(currentActive => {
      return currentActive === panelName ? null : panelName;
    })
  }
  //Right
  const toggleRightPanel = (panelName) => {
    setActiveRightPanel(currentActive => {
      return currentActive === panelName ? null : panelName;
    })
  }

  const updateConversation = useCallback((newConversation) => {
    setConversationHistory(newConversation);
  }, []);

  const addGraph = useCallback((type) => {
    const newGraph = {
      id: Date.now(),
      type: type,
    };
    setActiveGraphs((prev) => [...prev, newGraph]);
  }, []);

  const removeGraph = useCallback((idToRemove) => {
    setActiveGraphs((prev) => prev.filter((graph) => graph.id !== idToRemove));
  }, []);

  return (
    <div className="main">
      <TopMenu onAddGraph={addGraph} />
      <PanelGroup direction="vertical" >

        <Panel className="main-panel" defaultSize={100}>
          <PanelGroup direction="horizontal">
            {/* Left Panel (Toggle Button) */}
            <div className="left-section">
              <LeftPanel
                onSceneExamples={() => toggleLeftPanel('scene-examples')}
                onCreateScene={() => toggleLeftPanel('creat-scene')}
                onUploadScene={() => toggleLeftPanel('upload-scene')}
              />
            </div>
            {/* Scene Selector Panel */}
            {activeLeftPanel === 'scene-examples' && (
              <>
              <Panel className="component-section examples-panel" defaultSize={30} minSize={15} order={0}>
                <SceneSelector
                  currentScene={currentScene}
                  onSceneChange={handleSceneChange}
                  conversationHistory={conversationHistory}
                  />
              </Panel>
              <PanelResizeHandle className="resize-handle" />
              </>
            )}

            {/* Visualizer Panel */}

            <Panel className="visualization-section" defaultSize={70} minSize={30} order={1}>
              <div className="content-section">
                <Visualizer
                  key={currentScene.id}
                  scene={currentScene}
                  onPositionUpdate={handlePositionUpdate}
                />
                {activeGraphs.map((graph) => (
                  <OverlayGraph
                    key={graph.id}
                    id={graph.id}
                    initialType={graph.type}
                    data={motionData}
                    onClose={removeGraph}
                  />
                ))}
              </div>
            </Panel>
            {/* Conversation Panel */}
            {activeRightPanel === 'chat' && (
              <>
              <PanelResizeHandle className="resize-handle" />
              <Panel
                className="solution-section"
                minSize={15}
                defaultSize={30}
                order={2}
                >
                <div className="content-section">
                  <Conversation
                    updateConversation={updateConversation}
                    conversationHistory={conversationHistory}
                    />
                </div>
              </Panel>
              </>
            )}
            {/* Right Panel (Toggle Button) */}
            <div className="right-section">
              <RightPanel
                onChat={() => toggleRightPanel('chat')}
                onProperties={() => toggleRightPanel('properties')} />
            </div>
          </PanelGroup>
        </Panel>
      </PanelGroup >
    </div >
  );
}

export default App;