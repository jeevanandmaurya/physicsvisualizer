
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCube, faCompass, faCog, faComments, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/icon-transparent.svg';

const ActivityBar = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'dashboard', icon: faHome, label: 'Dashboard' },
    { id: 'collection', icon: faCompass, label: 'Collection' },
    { id: 'visualizer', icon: faCube, label: '3D Visualizer' },
    { id: 'chat', icon: faComments, label: 'Chat' },
    { id: 'settings', icon: faCog, label: 'Settings' },
    { id: 'about', icon: faInfoCircle, label: 'About' },
  ];

  return (
    <div className="activity-bar">
      <div className="activity-bar-logo">
        <img
          src={logo}
          alt="Physics Visualizer Logo"
          title="Physics Visualizer"
        />
      </div>
      {views.map((view) => (
        <button
          key={view.id}
          className={activeView === view.id ? 'active' : ''}
          onClick={() => onViewChange(view.id)}
          title={view.label}
        >
          <FontAwesomeIcon icon={view.icon} />
        </button>
      ))}
    </div>
  );
};

export default ActivityBar;
