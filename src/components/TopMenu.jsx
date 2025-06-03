// src/components/TopMenu.jsx
import React, { useState } from 'react';
import './topmenu.css'; // Assuming your CSS for the menu is here

// Import your logo assets
import logoFull from '../assets/physicsvisualizer.svg';
import logoMini from '../assets/icon-transparent.svg';
import {faMaximize,faMinimize  } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { color } from 'chart.js/helpers';
import { label } from 'three/tsl';



// Define base menu items with 'label' for display and 'action' for logic mapping.
// This structure allows for clear action handling in the parent component.
const baseMenuItems = {
    Dashboard: [
        { label: 'Open Dashboard', action: 'open_dashboard' },
        { label: 'New Scene', action: 'new_scene' },
        { label: 'Save Scene', action: 'save_scene' }
    ],
    Scenes: [
        { label: 'Scene Collection',action:'open_scene_collection'},
        { label: 'New Scene', action: 'new_scene' }, // This might trigger the same 'new_scene' handler as Dashboard
        { label: '2D Mechanics', action: 'load_2d_mechanics' },
        { label: '3D Mechanics', action: 'load_3d_mechanics' },
    ],
    Graphs: [ // Added a 'Graphs' menu for adding different types of graphs
        { label: 'Add X-Y Graph', action: 'add_xy_graph' },
        { label: 'Add Time-Position Graph', action: 'add_time_position_graph' },
        { label: 'Add Velocity-Time Graph', action: 'add_velocity_time_graph' }
    ],
    Conversation: [
        { label: 'Clear Chat', action: 'clear_chat' },
        { label: 'Export Transcript', action: 'export_transcript' }
    ],
    Help: [
        { label: 'Tutorials', action: 'show_tutorials' },
        { label: 'About', action: 'show_about' },
        { label: 'Documentation', action: 'show_documentation' }
    ]
};

/**
 * TopMenu Component
 *
 * This component renders the top navigation menu with dropdowns.
 * It takes various `on[ActionName]` props, which are functions
 * provided by its parent (PhysicsVisualizerPage) to handle menu item clicks.
 */
function TopMenu({
    onOpenDashboard,
    onOpenSceneCollection,
    onNewScene,
    onSaveScene,
    onLoadScene, // Handler for loading specific scene types
    onClearChat,
    onExportTranscript,
    onShowTutorials,
    onShowAbout,
    onShowDocumentation,
    onAddGraph // Handler for adding graphs
}) {
    // State to control which dropdown menu is currently open
    const [openMenu, setOpenMenu] = useState(null);
    // State to track fullscreen mode
    const [isFullscreen, setIsFullscreen] = useState(false);

    /**
     * Toggles the visibility of a dropdown menu.
     * If the clicked menu is already open, it closes it. Otherwise, it opens it.
     * @param {string} menuTitle - The title of the menu to toggle.
     */
    const toggleMenu = (menuTitle) => {
        setOpenMenu(openMenu === menuTitle ? null : menuTitle);
    };

    /**
     * Handles the click event for individual dropdown items.
     * It prevents event propagation to the parent menu item and calls
     * the appropriate handler function passed via props based on the item's action.
     * @param {object|string} item - The clicked menu item, expected to be an object with 'action'.
     */
    const handleItemClick = (item) => {
        // Ensure the item is an object and has an 'action' property
        if (typeof item === 'object' && item.action) {
            console.log(`TopMenu: Item clicked: ${item.label} (Action: ${item.action})`);

            // Use a switch statement to call the correct handler based on the action
            switch (item.action) {
                case 'open_dashboard':
                    onOpenDashboard && onOpenDashboard();
                    break;
                case 'new_scene':
                    onNewScene && onNewScene();
                    break;
                case 'save_scene':
                    onSaveScene && onSaveScene();
                    break;
                // For scene loading, pass the specific action type to the handler
                case 'open_scene_collection':
                    onOpenSceneCollection && onOpenSceneCollection();
                    break;
                case 'load_2d_mechanics':
                case 'load_3d_mechanics':
                    onLoadScene && onLoadScene(item.action); // Pass the action string as the scene type
                    break;
                // For adding graphs, pass the graph type to the handler
                case 'add_xy_graph':
                    onAddGraph && onAddGraph('xy');
                    break;
                case 'add_time_position_graph':
                    onAddGraph && onAddGraph('time_position');
                    break;
                case 'add_velocity_time_graph':
                    onAddGraph && onAddGraph('velocity_time');
                    break;
                case 'clear_chat':
                    onClearChat && onClearChat();
                    break;
                case 'export_transcript':
                    onExportTranscript && onExportTranscript();
                    break;
                case 'show_tutorials':
                    onShowTutorials && onShowTutorials();
                    break;
                case 'show_about':
                    onShowAbout && onShowAbout();
                    break;
                case 'show_documentation':
                    onShowDocumentation && onShowDocumentation();
                    break;
                default:
                    console.warn(`TopMenu: No handler found for action: ${item.action}`);
            }
        } else {
            console.warn(`TopMenu: Clicked item is not an object with an action or action is missing:`, item);
        }
        setOpenMenu(null); // Always close the dropdown menu after an item is clicked
    };

    /**
     * Toggles fullscreen mode for the document.
     * Uses browser-specific fullscreen APIs.
     */
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            // Request fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) { // Firefox
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari & Opera
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
                document.documentElement.msRequestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) { // Chrome, Safari & Opera
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
            setIsFullscreen(false);
        }
    };

    return (
        <div className="top-menu">
            {/* Logo Section */}
            <div id="icon">
                <img className="full-logo" src={logoFull} alt="Full logo" height="36px" />
                <img className="mini-logo" src={logoMini} alt="Mini logo" height="36px" />
            </div>

            {/* Map through baseMenuItems to render main menu items and their dropdowns */}
            {Object.entries(baseMenuItems).map(([title, options]) => (
                <div
                    key={title} // Unique key for each main menu item
                    className="menu-item"
                    onClick={() => toggleMenu(title)} // Toggle dropdown on click
                    // onMouseLeave={() => { /* Optional: keep menu open on hover leave? */ }}
                >
                    {title} {/* Display the main menu item title */}
                    {/* Conditionally render the dropdown if 'openMenu' matches the current title */}
                    {openMenu === title && (
                        <div className="dropdown" onMouseLeave={() => setOpenMenu(null)}>
                            {/* Map through options for the current dropdown */}
                            {options.map((option, i) => (
                                <div
                                    key={i} // Unique key for each dropdown item
                                    className="dropdown-item"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent click from bubbling up to parent menu-item
                                        handleItemClick(option); // Handle the specific item click
                                    }}
                                >
                                    {/* Display the label of the option (if it's an object) or the option itself */}
                                    {typeof option === 'object' ? option.label : option}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}

            {/* Fullscreen Toggle Button */}
            <button id='fullscreen' onClick={toggleFullscreen} className="fullscreen-button">
                <FontAwesomeIcon icon= {isFullscreen ?faMinimize:faMaximize}/>
            </button>
        </div>
    );
}

export default TopMenu;
