import React, { useState, useEffect } from 'react';
import ActivityBar from './ActivityBar';
import SideBar from './SideBar';
import EditorArea from './EditorArea';
import PanelArea from './PanelArea';
import StatusBar from './StatusBar';
import ChatOverlay from '../features/chat/components/ChatOverlay';
import { useWorkspace, useWorkspaceScene, useWorkspaceChat } from '../contexts/WorkspaceContext';
import './Workbench.css';

const Workbench = () => {
  const { currentView, setCurrentView, getChatForScene } = useWorkspace();
  const { scene } = useWorkspaceScene();
  const { messages, addMessage } = useWorkspaceChat();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
          {layoutConfig.sidebar && (
            <SideBar
              activeView={currentView}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
          <EditorArea activeView={currentView} />
          {layoutConfig.panel && (
            <PanelArea
              activeView={currentView}
              collapsed={panelCollapsed}
              onToggleCollapse={() => setPanelCollapsed(!panelCollapsed)}
            />
          )}
        </div>
        <StatusBar
          activeView={currentView}
          chatOpen={chatOpen}
          onChatToggle={() => setChatOpen(!chatOpen)}
        />
      </div>
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
    </div>
  );
};

export default Workbench;
