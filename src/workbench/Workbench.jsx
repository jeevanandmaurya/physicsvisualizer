import React, { useState, useEffect } from 'react';
import ActivityBar from './ActivityBar';
import Panel from './Panel';
import EditorArea from './EditorArea';
import StatusBar from './StatusBar';
import ChatOverlay from '../features/chat/components/ChatOverlay';
import GraphOverlay from '../features/visualizer/components/GraphOverlay';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat } from '../contexts/WorkspaceContext';
import './Workbench.css';

const Workbench = () => {
  const { currentView, setCurrentView, getChatForScene } = useWorkspace();
  const { scene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const [chatOpen, setChatOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [showSceneDetails, setShowSceneDetails] = useState(false);

  // VS Code-inspired layout configuration for each view
  const getLayoutConfig = (view) => {
    const configs = {
      // Dashboard: Clean welcome/overview (like VS Code's welcome)
      dashboard: {
        sidebar: false,
        panel: false,
        description: 'Welcome and overview'
      },
      // Collection: Scene gallery (clean grid view)
      collection: {
        sidebar: false,
        panel: false,
        description: 'Scene gallery and overview'
      },
      // Visualizer: Main physics workspace (like VS Code's editor with panels)
      visualizer: {
        sidebar: true,
        panel: true,
        description: '3D physics simulation with chat and details'
      },
      // Chat: Full chat experience
      chat: {
        sidebar: false,
        panel: false,
        description: 'Advanced chat system for physics discussions'
      },
      // Settings: Configuration (like VS Code's settings)
      settings: {
        sidebar: false,
        panel: false,
        description: 'Application preferences and settings'
      }
    };
    return configs[view] || configs.dashboard;
  };

  const layoutConfig = getLayoutConfig(currentView);

  // Keyboard shortcuts for view switching (VS Code style: Ctrl+1,2,3...)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentView('dashboard');
            break;
          case '2':
            e.preventDefault();
            setCurrentView('collection');
            break;
          case '3':
            e.preventDefault();
            setCurrentView('visualizer');
            break;
          case '4':
            e.preventDefault();
            setCurrentView('chat');
            break;
          case '5':
            e.preventDefault();
            setCurrentView('settings');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  return (
    <div className="workbench">
      <ActivityBar
        activeView={currentView}
        onViewChange={setCurrentView}
      />
      <div className="workbench-main">
        <div className="workbench-content">
          {currentView === 'visualizer' && (
            <Panel
              showSceneDetails={showSceneDetails}
              onToggleSceneDetails={() => setShowSceneDetails(!showSceneDetails)}
            />
          )}
          <EditorArea activeView={currentView} onViewChange={setCurrentView} />
        </div>
      </div>
      <StatusBar
        activeView={currentView}
        chatOpen={chatOpen}
        onChatToggle={() => setChatOpen(!chatOpen)}
        graphOpen={graphOpen}
        onGraphToggle={() => setGraphOpen(!graphOpen)}
      />
      <ChatOverlay
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
        messages={messages}
        addMessage={addMessage}
        scene={scene}
        getChatForScene={getChatForScene}
        onSceneUpdate={(propertyPath, value, reason) => {
          console.log('Scene update:', propertyPath, value, reason);
        }}
      />
      <GraphOverlay
        isOpen={graphOpen}
        onToggle={() => setGraphOpen(!graphOpen)}
      />
    </div>
  );
};

export default Workbench;
