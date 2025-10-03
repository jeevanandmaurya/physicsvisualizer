
import DashboardView from '../views/DashboardView';
import CollectionView from '../views/CollectionView';
import VisualizerView from '../views/VisualizerView';
import ChatView from '../views/ChatView';
import SettingsView from '../views/SettingsView';
import AboutView from '../views/AboutView';


const EditorArea = ({ activeView, onViewChange }) => {
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'collection':
        return <CollectionView />;
      case 'visualizer':
        return <VisualizerView />;
      case 'chat':
        return <ChatView onViewChange={onViewChange} />;
      case 'settings':
        return <SettingsView />;
      case 'about':
        return <AboutView />;
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
