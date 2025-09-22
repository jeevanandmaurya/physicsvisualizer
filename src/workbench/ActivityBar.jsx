import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCube, faCompass, faHistory, faCog, faChartLine } from '@fortawesome/free-solid-svg-icons';

const ActivityBar = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'dashboard', icon: faHome, label: 'Dashboard' },
    { id: 'collection', icon: faCompass, label: 'Collection' },
    { id: 'visualizer', icon: faCube, label: '3D Visualizer' },
    { id: 'history', icon: faHistory, label: 'History' },
    { id: 'settings', icon: faCog, label: 'Settings' },
    { id: 'analytics', icon: faChartLine, label: 'Analytics' },
  ];

  return (
    <div className="activity-bar">
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
