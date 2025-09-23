import React from 'react';
import { useWorkspaceScene } from '../contexts/WorkspaceContext';
import SceneDetails from '../features/collection/components/SceneDetails';

const PanelArea = ({ activeView, collapsed, onToggleCollapse }) => {
  const { scene } = useWorkspaceScene();

  const getPanelContent = () => {
    switch (activeView) {
      case 'visualizer':
        // Main physics workspace: Scene details with tabs
        return <SceneDetails scene={scene} />;

      case 'analytics':
        // Analytics: Performance metrics and data visualization
        return (
          <div style={{ padding: '20px', color: '#cccccc' }}>
            <h3>📊 Performance Analytics</h3>
            <p>Real-time physics simulation metrics and performance data.</p>
            {/* Analytics components would go here */}
          </div>
        );

      default:
        return (
          <div style={{ padding: '20px', color: '#cccccc' }}>
            <h3>Panel</h3>
            <p>Additional information for {activeView}.</p>
          </div>
        );
    }
  };

  return (
    <div className={`panel-area ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed && (
        <>
          <div className="panel-header">
            <span>{activeView.charAt(0).toUpperCase() + activeView.slice(1)} Panel</span>
            <button className="toggle-button" onClick={onToggleCollapse}>×</button>
          </div>
          <div className="panel-content">
            {getPanelContent()}
          </div>
        </>
      )}
      {collapsed && (
        <button className="toggle-button" onClick={onToggleCollapse} style={{ margin: '10px' }}>
          ☰
        </button>
      )}
    </div>
  );
};

export default PanelArea;
