
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCube, faCompass, faCog, faComments, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/icon-transparent.svg';

const ActivityBar = ({ activeView, onViewChange, onClose, isVisualizer, overlayMode = false, overlayVisible = false, onToggleOverlay }) => {
  // Ensure onClose and onToggleOverlay have default functions to prevent errors
  onClose = onClose || (() => {});
  onToggleOverlay = onToggleOverlay || (() => {});
  const views = [
    { id: 'dashboard', icon: faHome, label: 'Dashboard' },
    { id: 'collection', icon: faCompass, label: 'Collection' },
    { id: 'visualizer', icon: faCube, label: '3D Visualizer' },
    { id: 'chat', icon: faComments, label: 'Chat' },
    { id: 'settings', icon: faCog, label: 'Settings' },
    { id: 'about', icon: faInfoCircle, label: 'About' },
  ];

  return (
    <div className={`activity-bar ${overlayMode ? 'overlay' : ''} ${overlayMode && !overlayVisible ? 'hidden' : ''}`}>
      <div className="activity-bar-logo">
        <img
          src={logo}
          alt="Physics Visualizer Logo"
          title={overlayMode ? "Show/Hide Navigation" : "Physics Visualizer"}
          onClick={overlayMode ? onToggleOverlay : undefined}
          style={overlayMode ? { cursor: 'pointer' } : {}}
        />
      </div>
      {(!overlayMode || overlayVisible) && views.map((view) => (
        <button
          key={view.id}
          className={activeView === view.id ? 'active' : ''}
          onClick={() => onViewChange(view.id)}
          title={view.label}
        >
          <FontAwesomeIcon icon={view.icon} />
        </button>
      ))}
      {isVisualizer && !overlayMode && onClose && (
        <button
          className="activity-bar-close"
          onClick={onClose}
          title="Hide Navigation"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  );
};

export default ActivityBar;
