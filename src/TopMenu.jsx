// src/TopMenu.js
import React, { useState } from 'react';
import './topmenu.css'; // Assuming styles are fine

import logoFull from './assets/physicsvisualizer.svg';
import logoMini from './assets/icon-transparent.svg';

// Define base menu items
const baseMenuItems = {
    File: ['Open', 'Save', 'Exit'],
    Scenes: ['New Scene', '2D Mechanics','3D Mechanics', 'Electrodynamics'],
    Visualizer: ['Start', 'Pause', 'Reset'], // Keep these, handle logic in App/Visualizer
    // Graph menu now adds overlays
    Graph: [
        { label: 'Add Y vs X Plot', action: 'addGraph', type: 'yvx' },
        { label: 'Add X vs T Plot', action: 'addGraph', type: 'xvt' },
        { label: 'Add Y vs T Plot', action: 'addGraph', type: 'yvt' },
        // Add 'Close All Graphs' later if needed
    ],
    Conversation: ['Clear Chat', 'Export Transcript'],
    Help: ['Tutorials', 'About', 'Documentation']
};


// Pass onAddGraph function as a prop
function TopMenu({ onAddGraph }) {
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    const handleItemClick = (item) => {
        // Handle graph actions
        if (item.action === 'addGraph' && typeof onAddGraph === 'function') {
            onAddGraph(item.type); // Call the passed function with the type
        }
        // Add handlers for other menu items here if needed
        setOpenMenu(null); // Close menu after click
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
                    // Use onMouseEnter/onMouseLeave for hover effect if preferred
                    onClick={() => toggleMenu(title)} // Click to open/close
                    onMouseLeave={() => { /* Optional: keep menu open on hover leave? */ }}
                >
                    {title}
                    {openMenu === title && (
                        <div className="dropdown" onMouseLeave={() => setOpenMenu(null)} /* Close dropdown on leave */ >
                            {options.map((option, i) => (
                                <div
                                    key={i}
                                    className="dropdown-item"
                                    // Check if option is an object (like Graph items) or string
                                    onClick={() => typeof option === 'object' ? handleItemClick(option) : handleItemClick({ label: option })}
                                >
                                    {typeof option === 'object' ? option.label : option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default TopMenu;