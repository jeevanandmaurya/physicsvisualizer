import React from 'react';
import DashboardView from '../views/DashboardView';
import CollectionView from '../views/CollectionView';
import VisualizerView from '../views/VisualizerView';
import HistoryView from '../views/HistoryView';
import SettingsView from '../views/SettingsView';
import AnalyticsView from '../views/AnalyticsView';

const EditorArea = ({ activeView }) => {
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'collection':
        return <CollectionView />;
      case 'visualizer':
        return <VisualizerView />;
      case 'history':
        return <HistoryView />;
      case 'settings':
        return <SettingsView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="editor-area">
      <div className="editor-content">
        {renderView()}
      </div>
    </div>
  );
};

export default EditorArea;
