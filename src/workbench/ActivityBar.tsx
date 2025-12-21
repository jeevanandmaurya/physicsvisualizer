
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCube, faCompass, faCog, faComments, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/icon-transparent.svg';

const ActivityBar = ({ activeView, onViewChange }) => {
  const topViews = [
    { id: 'dashboard', icon: faHome, label: 'Dashboard' },
    { id: 'collection', icon: faCompass, label: 'Collection' },
    { id: 'visualizer', icon: faCube, label: '3D Visualizer' },
    { id: 'chat', icon: faComments, label: 'Chat' },
  ];

  const bottomViews = [
    { id: 'settings', icon: faCog, label: 'Settings' },
    { id: 'about', icon: faInfoCircle, label: 'About' },
  ];

  const renderViewButton = (view) => (
    <button
      key={view.id}
      className={`activity-item ${activeView === view.id ? 'active' : ''}`}
      onClick={() => onViewChange(view.id)}
      title={view.label}
    >
      <FontAwesomeIcon icon={view.icon} />
      {activeView === view.id && <div className="active-indicator" />}
    </button>
  );

  return (
    <div className="activity-bar">
      <div className="activity-bar-top">
        <div className="activity-bar-logo">
          <img
            src={logo}
            alt="Logo"
            title="Physics Visualizer"
          />
        </div>
        {topViews.map(renderViewButton)}
      </div>
      
      <div className="activity-bar-bottom">
        {bottomViews.map(renderViewButton)}
      </div>
    </div>
  );
};

export default ActivityBar;
