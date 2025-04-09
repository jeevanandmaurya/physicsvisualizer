import React, { useState } from 'react';
import './topmenu.css';

import logoFull from './assets/physicsvisualizer.svg';
import logoMini from './assets/icon-transparent.svg';

const menuItems = {
    File: ['New Scene', 'Extract Scene', 'Open', 'Save', 'Exit'],
    Scenes: ['Create Scene', 'Mechanics', 'Electrodynamics', 'Custom'],
    Visualizer: ['Start', 'Pause', 'Reset'],
    Graph: ['Show Velocity', 'Show Acceleration'],
    Conversation: ['Clear Chat', 'Export Transcript'],
    Help: ['Tutorials', 'About', 'Documentation']
};

function TopMenu() {
    const [openMenu, setOpenMenu] = useState(null);

    const toggleMenu = (menu) => {
        setOpenMenu(openMenu === menu ? null : menu);
    };

    return (
        <div className="top-menu">
            <div id="icon">
                <img className="full-logo" src={logoFull} alt="Full logo" height="36px" />
                <img className="mini-logo" src={logoMini} alt="Mini logo" height="36px" />
            </div>
            {Object.entries(menuItems).map(([title, options]) => (
                <div
                    key={title}
                    className="menu-item"
                    onClick={() => toggleMenu(title)}
                    onMouseLeave={() => setOpenMenu(null)}
                >
                    {title}
                    {openMenu === title && (
                        <div className="dropdown">
                            {options.map((option, i) => (
                                <div key={i} className="dropdown-item">
                                    {option}
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
