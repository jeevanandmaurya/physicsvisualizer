import { useTheme, OverlayOpacitySettings } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faComments, faChartLine, faSliders, faList, faBars, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import './SettingsView.css';

function SettingsView() {
  const { theme, toggleTheme, overlayOpacity, updateOverlayOpacity } = useTheme();

  const handleOpacityChange = (type: keyof OverlayOpacitySettings, value: string) => {
    updateOverlayOpacity(type, parseFloat(value));
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h2>Settings</h2>
        <p>Customize your Physics Visualizer experience</p>
      </div>

      <div className="settings-container">
        <div className="settings-left-column">
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="settings-card theme-card">
              <div className="theme-info">
                <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} className="theme-icon" />
                <span>{theme.charAt(0).toUpperCase() + theme.slice(1)} Mode</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>Overlay Opacity</h3>
            <div className="opacity-grid">
              <div className="opacity-control">
                <label><FontAwesomeIcon icon={faComments} /> Chat</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity.chat}
                  onChange={(e) => handleOpacityChange('chat', e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${overlayOpacity.chat * 100}%, var(--border-color) ${overlayOpacity.chat * 100}%, var(--border-color) 100%)`
                  }}
                />
                <span className="opacity-value">{Math.round(overlayOpacity.chat * 100)}%</span>
              </div>

              <div className="opacity-control">
                <label><FontAwesomeIcon icon={faChartLine} /> Graphs</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity.graph}
                  onChange={(e) => handleOpacityChange('graph', e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${overlayOpacity.graph * 100}%, var(--border-color) ${overlayOpacity.graph * 100}%, var(--border-color) 100%)`
                  }}
                />
                <span className="opacity-value">{Math.round(overlayOpacity.graph * 100)}%</span>
              </div>

              <div className="opacity-control">
                <label><FontAwesomeIcon icon={faSliders} /> Controls</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity.controller}
                  onChange={(e) => handleOpacityChange('controller', e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${overlayOpacity.controller * 100}%, var(--border-color) ${overlayOpacity.controller * 100}%, var(--border-color) 100%)`
                  }}
                />
                <span className="opacity-value">{Math.round(overlayOpacity.controller * 100)}%</span>
              </div>

              <div className="opacity-control">
                <label><FontAwesomeIcon icon={faList} /> Scenes</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity.sceneSelector}
                  onChange={(e) => handleOpacityChange('sceneSelector', e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${overlayOpacity.sceneSelector * 100}%, var(--border-color) ${overlayOpacity.sceneSelector * 100}%, var(--border-color) 100%)`
                  }}
                />
                <span className="opacity-value">{Math.round(overlayOpacity.sceneSelector * 100)}%</span>
              </div>

              <div className="opacity-control">
                <label><FontAwesomeIcon icon={faBars} /> Sidebar</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity.activityBar}
                  onChange={(e) => handleOpacityChange('activityBar', e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${overlayOpacity.activityBar * 100}%, var(--border-color) ${overlayOpacity.activityBar * 100}%, var(--border-color) 100%)`
                  }}
                />
                <span className="opacity-value">{Math.round(overlayOpacity.activityBar * 100)}%</span>
              </div>

              <div className="opacity-control">
                <label><FontAwesomeIcon icon={faTachometerAlt} /> Physics Stats</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={overlayOpacity.physicsStats}
                  onChange={(e) => handleOpacityChange('physicsStats', e.target.value)}
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${overlayOpacity.physicsStats * 100}%, var(--border-color) ${overlayOpacity.physicsStats * 100}%, var(--border-color) 100%)`
                  }}
                />
                <span className="opacity-value">{Math.round(overlayOpacity.physicsStats * 100)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-right-column">
          <div className="settings-section">
            <h3>Keyboard Shortcuts</h3>
            <div className="shortcuts-list">
              <div className="shortcut-group">
                <h4>Navigation</h4>
                <div className="shortcut-item"><span className="key">Ctrl</span> + <span className="key">1-5</span> <span>Switch Views</span></div>
                <div className="shortcut-item"><span className="key">Alt</span> + <span className="key">Z</span> <span>Zen Mode</span></div>
              </div>

              <div className="shortcut-group">
                <h4>Simulation</h4>
                <div className="shortcut-item"><span className="key">Space</span> <span>Play / Pause</span></div>
                <div className="shortcut-item"><span className="key">R</span> <span>Reset Scene</span></div>
              </div>

              <div className="shortcut-group">
                <h4>Overlays</h4>
                <div className="shortcut-item"><span className="key">C</span> <span>Toggle Chat</span></div>
                <div className="shortcut-item"><span className="key">G</span> <span>Toggle Graphs</span></div>
                <div className="shortcut-item"><span className="key">K</span> <span>Toggle Controls</span></div>
                <div className="shortcut-item"><span className="key">S</span> <span>Toggle Scenes</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsView;
