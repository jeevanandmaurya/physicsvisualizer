import React, { useState, useEffect } from 'react';
import ActivityBar from './ActivityBar';
import SideBar from './SideBar';
import EditorArea from './EditorArea';
import PanelArea from './PanelArea';
import StatusBar from './StatusBar';
import { useWorkspace } from '../contexts/WorkspaceContext';
import './Workbench.css';

const Workbench = () => {
  const { currentView, setCurrentView } = useWorkspace();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);

  // Keyboard shortcuts for view switching
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
            setCurrentView('history');
            break;
          case '5':
            e.preventDefault();
            setCurrentView('settings');
            break;
          case '6':
            e.preventDefault();
            setCurrentView('analytics');
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setCurrentView]);

  // Determine which panels to show based on active view
  const showSidebar = ['collection', 'visualizer', 'history'].includes(currentView);
  const showPanelArea = ['visualizer'].includes(currentView);

  return (
    <div className="workbench">
      <ActivityBar
        activeView={currentView}
        onViewChange={setCurrentView}
      />
      <div className="workbench-main">
        <div className="workbench-content">
          {showSidebar && (
            <SideBar
              activeView={currentView}
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          )}
          <EditorArea activeView={currentView} />
          {showPanelArea && (
            <PanelArea
              activeView={currentView}
              collapsed={panelCollapsed}
              onToggleCollapse={() => setPanelCollapsed(!panelCollapsed)}
            />
          )}
        </div>
        <StatusBar activeView={currentView} />
      </div>
    </div>
  );
};

export default Workbench;
