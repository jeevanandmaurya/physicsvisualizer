import React, { useState } from 'react';
import './topmenu.css'; // Assuming styles are fine

import logoFull from './assets/physicsvisualizer.svg';
import logoMini from './assets/icon-transparent.svg';

// Define base menu items - Removed Graph
const baseMenuItems = {
    File: ['Open', 'Save', 'Exit'],
    Scenes: ['New Scene', '2D Mechanics','3D Mechanics', 'Electrodynamics'],
    // Visualizer controls moved to the Visualizer component's timeControllbar
    Conversation: ['Clear Chat', 'Export Transcript'],
    Help: ['Tutorials', 'About', 'Documentation']
};

// Removed onAddGraph prop as it's no longer handled here
function TopMenu() {
    const [openMenu, setOpenMenu] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    // Simplified item click handler as graph actions are elsewhere
    const handleItemClick = (item) => {
         // Add handlers for other menu items here if needed
        console.log(`Menu item clicked: ${typeof item === 'object' ? item.label : item}`);
        setOpenMenu(null); // Close menu after click
    };

    //Fullscreen Mode for small devices
    const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else if (document.documentElement.mozRequestFullScreen) { // Firefox
        document.documentElement.mozRequestFullScreen();
        setIsFullscreen(true);
      } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari & Opera
        document.documentElement.webkitRequestFullscreen();
        setIsFullscreen(true);
      } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
        document.documentElement.msRequestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else if (document.mozCancelFullScreen) { // Firefox
        document.mozCancelFullScreen();
        setIsFullscreen(false);
      } else if (document.webkitExitFullscreen) { // Chrome, Safari & Opera
        document.webkitExitFullscreen();
        setIsFullscreen(false);
      } else if (document.msExitFullscreen) { // IE/Edge
        document.msExitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

    return (
        <div className="top-menu">
            <div id="icon">
                <img className="full-logo" src={logoFull} alt="Full logo" height="36px" />
                <img className="mini-logo" src={logoMini} alt="Mini logo" height="36px" />
            </div>
            {Object.entries(baseMenuItems).map(([title, options]) => (
                <div
                    key={title}
                    className="menu-item"
                    onClick={() => toggleMenu(title)}
                    onMouseLeave={() => { /* Optional: keep menu open on hover leave? */ }}
                >
                    {title}
                    {openMenu === title && (
                        <div className="dropdown" onMouseLeave={() => setOpenMenu(null)} /* Close dropdown on leave */ >
                            {options.map((option, i) => (
                                <div
                                    key={i}
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the parent menu-item click again
                                        handleItemClick(option);
                                    }}
                                >
                                    {typeof option === 'object' ? option.label : option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        <button id='fullscreen' onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Go Fullscreen'}
        </button>
        </div>
    );
}

export default TopMenu;