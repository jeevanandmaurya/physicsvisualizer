// src/components/TopMenu.jsx
import React, { useState, useEffect, useRef } from 'react';
import './topmenu.css';
import { useAuth } from '../contexts/AuthContext'; // Import the Auth Context

// Import your logo assets
import logoFull from '../assets/physicsvisualizer.svg';
import logoMini from '../assets/icon-transparent.svg';
// Import all necessary Font Awesome icons
import { faMaximize, faMinimize, faUserCircle, faSignOutAlt, faCog, faSignInAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Define base menu items with 'label' for display and 'action' for logic mapping.
const baseMenuItems = {
    Dashboard: [
        { label: 'Open Dashboard', action: 'open_dashboard' },
        { label: 'New Scene', action: 'new_scene' },
        { label: 'Save Scene', action: 'save_scene' }
    ],
    Scenes: [
        { label: 'Scene Collection', action: 'open_scene_collection' },
        { label: 'New Scene', action: 'new_scene' },
        { label: '2D Mechanics', action: 'load_2d_mechanics' },
        { label: '3D Mechanics', action: 'load_3d_mechanics' },
    ],
    Graphs: [
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

// User menu items when logged IN
const userProfileMenuItems = [
    { label: 'Profile', action: 'open_profile', icon: faUserCircle },
    { label: 'Settings', action: 'open_settings', icon: faCog },
    { label: 'Logout', action: 'logout', icon: faSignOutAlt }
];

// User menu items when logged OUT
const userLoginMenuItems = [
    { label: 'Login', action: 'login', icon: faSignInAlt }
];

/**
 * TopMenu Component
 *
 * This component renders the top navigation menu with dropdowns.
 * It now uses AuthContext for authentication state and handles login/logout internally.
 * Other action handlers are still provided by the parent component.
 */
function TopMenu({
    onOpenDashboard,
    onOpenSceneCollection,
    onNewScene,
    onSaveScene,
    onLoadScene,
    onClearChat,
    onExportTranscript,
    onShowTutorials,
    onShowAbout,
    onShowDocumentation,
    onAddGraph,
    onOpenProfile,
    onOpenSettings,
}) {
    // Get auth state and functions from AuthContext
    const { currentUser, googleSignIn, logout } = useAuth();

    const [openMenu, setOpenMenu] = useState(null);
    const [openUserDropdown, setOpenUserDropdown] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement != null);

    const menuRef = useRef(null);
    const userDropdownRef = useRef(null);

    // Determine authentication state and user info from context
    const isLoggedIn = !!currentUser;
    const username = currentUser?.displayName || currentUser?.email?.split('@')[0] || "Guest";

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setOpenUserDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [menuRef, userDropdownRef]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement != null);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.() ||
                document.documentElement.mozRequestFullScreen?.() ||
                document.documentElement.webkitRequestFullscreen?.() ||
                document.documentElement.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() ||
                document.mozCancelFullScreen?.() ||
                document.webkitExitFullscreen?.() ||
                document.msExitFullscreen?.();
        }
    };

    const toggleMenu = (menuTitle) => {
        setOpenMenu(openMenu === menuTitle ? null : menuTitle);
        setOpenUserDropdown(false);
    };

    const toggleUserDropdown = () => {
        setOpenUserDropdown(!openUserDropdown);
        setOpenMenu(null);
    };

    // Handle authentication actions internally
    const handleLogin = async () => {
        try {
            await googleSignIn();
            console.log('User signed in successfully');
        } catch (error) {
            console.error('Login failed:', error);
            // You might want to show a toast or error message here
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            console.log('User signed out successfully');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleItemClick = (item) => {
        if (typeof item === 'object' && item.action) {
            console.log(`TopMenu: Item clicked: ${item.label} (Action: ${item.action})`);

            switch (item.action) {
                case 'open_dashboard': onOpenDashboard?.(); break;
                case 'new_scene': onNewScene?.(); break;
                case 'save_scene': onSaveScene?.(); break;
                case 'open_scene_collection': onOpenSceneCollection?.(); break;
                case 'load_2d_mechanics':
                case 'load_3d_mechanics': onLoadScene?.(item.action); break;
                case 'add_xy_graph': onAddGraph?.('xy'); break;
                case 'add_time_position_graph': onAddGraph?.('time_position'); break;
                case 'add_velocity_time_graph': onAddGraph?.('velocity_time'); break;
                case 'clear_chat': onClearChat?.(); break;
                case 'export_transcript': onExportTranscript?.(); break;
                case 'show_tutorials': onShowTutorials?.(); break;
                case 'show_about': onShowAbout?.(); break;
                case 'show_documentation': onShowDocumentation?.(); break;
                case 'open_profile': onOpenProfile?.(); break;
                case 'open_settings': onOpenSettings?.(); break;
                case 'logout': handleLogout(); break; // Handle logout internally
                case 'login': handleLogin(); break; // Handle login internally
                default: console.warn(`TopMenu: No handler found for action: ${item.action}`);
            }
        } else {
            console.warn(`TopMenu: Clicked item is not an object with an action or action is missing:`, item);
        }
        setOpenMenu(null);
        setOpenUserDropdown(false);
    };

    // Determine which user menu items to display
    const currentUserMenuItems = isLoggedIn ? userProfileMenuItems : userLoginMenuItems;

    return (
        <div className="top-menu" ref={menuRef}>


        <div className="top-left-menu">


                {/* Logo Section */}
                <div id="icon">
                    <img className="full-logo" src={logoFull} alt="Physics Visualizer Full Logo" />
                    <img className="mini-logo" src={logoMini} alt="Physics Visualizer Mini Logo" />
                </div>

                {/* Main Navigation Container for menu items */}
                <nav className="menu-nav" aria-label="Main navigation menu">
                    {Object.entries(baseMenuItems).map(([title, options]) => (
                        <div
                        key={title}
                        className={`menu-item ${openMenu === title ? 'open' : ''}`}
                        onClick={() => toggleMenu(title)}
                        aria-haspopup="true"
                        aria-expanded={openMenu === title}
                        tabIndex="0"
                        >
                            {title}
                            {openMenu === title && (
                                <ul className="menu-dropdown" role="menu"> {/* Renamed */}
                                    {options.map((option, i) => (
                                        <li
                                        key={typeof option === 'object' && option.action ? option.action : i}
                                        className="menu-dropdown-item" /* Renamed */
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleItemClick(option);
                                        }}
                                        role="menuitem"
                                        tabIndex="-1"
                                        >
                                            {typeof option === 'object' ? option.label : option}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </nav>
            </div>


                {/* Right-aligned utility buttons: Fullscreen then User */}
                <div className="menu-utility-section">
                    {/* Fullscreen Toggle Button */}
                    <button
                        id='fullscreen-button'
                        onClick={toggleFullscreen}
                        className="fullscreen-button"
                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                        title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Enter Fullscreen (F11)'}
                    >
                        <FontAwesomeIcon icon={isFullscreen ? faMinimize : faMaximize} />
                    </button>

                    {/* User Icon/Profile/Login */}
                    <div
                        className={`user-menu-item menu-item ${openUserDropdown ? 'open' : ''}`}
                        onClick={toggleUserDropdown}
                        ref={userDropdownRef}
                        aria-haspopup="true"
                        aria-expanded={openUserDropdown}
                        tabIndex="0"
                        title={isLoggedIn ? `Logged in as ${username}` : 'Login / Register'}
                    >
                        {isLoggedIn ? (
                            <>
                                {currentUser?.photoURL ? (
                                    <img
                                        src={currentUser.photoURL}
                                        alt="User Avatar"
                                        className="user-avatar"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            marginRight: '8px'
                                        }}
                                    />
                                ) : (
                                    <FontAwesomeIcon icon={faUserCircle} className="user-icon" />
                                )}
                                <span className="username-label">{username.split(' ')[0]}</span>
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faSignInAlt} className="login-icon" />
                                <span className="username-label">Login</span>
                            </>
                        )}

                        {/* User Dropdown for Logged In or Logged Out */}
                        {openUserDropdown && (
                            <ul className="menu-dropdown user-menu-dropdown" role="menu"> {/* Renamed */}
                                {currentUserMenuItems.map((item) => (
                                    <li
                                        key={item.action}
                                        className="menu-dropdown-item" /* Renamed */
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleItemClick(item);
                                        }}
                                        role="menuitem"
                                        tabIndex="-1"
                                    >
                                        {item.icon && <FontAwesomeIcon icon={item.icon} className="menu-dropdown-icon" />} {/* Renamed */}
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
        </div>
    );
}

export default TopMenu;