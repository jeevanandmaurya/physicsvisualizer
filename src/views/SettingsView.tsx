//// import React from 'react';
import { useTheme, OverlayOpacitySettings } from '../contexts/ThemeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, faComments, faChartLine, faSliders, faList, faBars } from '@fortawesome/free-solid-svg-icons';

function SettingsView() {
  const { theme, toggleTheme, overlayOpacity, updateOverlayOpacity } = useTheme();

  const handleOpacityChange = (type: keyof OverlayOpacitySettings, value: string) => {
    updateOverlayOpacity(type, parseFloat(value));
  };

  // Theme-aware colors
  const isDark = theme === 'dark';
  const colors = {
    background: isDark ? '#1a1a1a' : '#ffffff',
    textPrimary: isDark ? '#ffffff' : '#212529',
    textSecondary: isDark ? '#adb5bd' : '#6c757d',
    textMuted: isDark ? '#6c757d' : '#495057',
    cardBackground: isDark ? '#2d3436' : '#f8f9fa',
    border: isDark ? '#495057' : '#e9ecef',
    heading: isDark ? '#ffffff' : '#333333'
  };

  return (
    <div style={{

      margin: '0 auto',
      padding: '20px',
      backgroundColor: colors.background,
      color: colors.textPrimary,
      minHeight: '100vh',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        marginBottom: '32px',
        borderBottom: `2px solid ${colors.border}`,
        paddingBottom: '16px'
      }}>
        <h2 style={{
          color: colors.textPrimary,
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 4px 0',
          letterSpacing: '-0.025em'
        }}>
          Settings
        </h2>
        <p style={{
          color: colors.textSecondary,
          fontSize: '16px',
          margin: '0',
          fontWeight: '400'
        }}>
          Customize your Physics Visualizer experience
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{
          marginBottom: '16px',
          color: colors.heading,
          fontSize: '18px',
          fontWeight: '600'
        }}>Theme</h3>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: colors.cardBackground,
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease'
        }}>
          <label style={{
            position: 'relative',
            display: 'inline-block',
            width: '60px',
            height: '30px'
          }}>
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              style={{
                opacity: 0,
                width: 0,
                height: 0
              }}
            />
            <span style={{
              position: 'absolute',
              cursor: 'pointer',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: theme === 'dark' ? '#007bff' : '#6c757d',
              transition: '0.4s',
              borderRadius: '30px'
            }} />
            <span style={{
              position: 'absolute',
              content: '""',
              height: '22px',
              width: '22px',
              left: '4px',
              bottom: '4px',
              backgroundColor: 'white',
              transition: '0.4s',
              borderRadius: '50%',
              transform: theme === 'dark' ? 'translateX(30px)' : 'translateX(0)'
            }} />
          </label>

          <span style={{
            fontSize: '16px',
            fontWeight: '500',
            color: colors.textMuted,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FontAwesomeIcon icon={theme === 'dark' ? faMoon : faSun} style={{ fontSize: '16px' }} />
            {theme.charAt(0).toUpperCase() + theme.slice(1)} Mode
          </span>
        </div>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3 style={{
          marginBottom: '12px',
          color: colors.heading,
          fontSize: '18px',
          fontWeight: '600'
        }}>Overlay Opacity</h3>
        <p style={{
          color: colors.textSecondary,
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          Adjust the transparency of overlay windows (chat, graph, and controller panels).
        </p>

        <div style={{
          backgroundColor: colors.cardBackground,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${colors.border}`,
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '8px 0'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#adb5bd' : '#495057',
              flex: '1',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faComments} style={{
                fontSize: '14px',
                minWidth: '16px',
                color: colors.textSecondary
              }} />
              Chat Overlay
            </span>

            <div style={{
              flex: '2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '300px'
            }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={overlayOpacity.chat}
                onChange={(e) => handleOpacityChange('chat', e.target.value)}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: isDark ? '#495057' : '#ddd',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                minWidth: '35px',
                textAlign: 'right'
              }}>
                {(overlayOpacity.chat * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '8px 0'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#adb5bd' : '#495057',
              flex: '1',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faChartLine} style={{
                fontSize: '14px',
                minWidth: '16px',
                color: colors.textSecondary
              }} />
              Graph Overlay
            </span>

            <div style={{
              flex: '2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '300px'
            }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={overlayOpacity.graph}
                onChange={(e) => handleOpacityChange('graph', e.target.value)}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: isDark ? '#495057' : '#ddd',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                minWidth: '35px',
                textAlign: 'right'
              }}>
                {(overlayOpacity.graph * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '8px 0'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#adb5bd' : '#495057',
              flex: '1',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faSliders} style={{
                fontSize: '14px',
                minWidth: '16px',
                color: colors.textSecondary
              }} />
              Controller Overlay
            </span>

            <div style={{
              flex: '2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '300px'
            }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={overlayOpacity.controller}
                onChange={(e) => handleOpacityChange('controller', e.target.value)}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: isDark ? '#495057' : '#ddd',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                minWidth: '35px',
                textAlign: 'right'
              }}>
                {(overlayOpacity.controller * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '8px 0'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#adb5bd' : '#495057',
              flex: '1',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faList} style={{
                fontSize: '14px',
                minWidth: '16px',
                color: colors.textSecondary
              }} />
              Scene Selector
            </span>

            <div style={{
              flex: '2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '300px'
            }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={overlayOpacity.sceneSelector}
                onChange={(e) => handleOpacityChange('sceneSelector', e.target.value)}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: isDark ? '#495057' : '#ddd',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                minWidth: '35px',
                textAlign: 'right'
              }}>
                {(overlayOpacity.sceneSelector * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0',
            padding: '8px 0'
          }}>
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#adb5bd' : '#495057',
              flex: '1',
              minWidth: '140px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FontAwesomeIcon icon={faBars} style={{
                fontSize: '14px',
                minWidth: '16px',
                color: colors.textSecondary
              }} />
              Activity Bar
            </span>

            <div style={{
              flex: '2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              maxWidth: '300px'
            }}>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={overlayOpacity.activityBar}
                onChange={(e) => handleOpacityChange('activityBar', e.target.value)}
                style={{
                  flex: '1',
                  height: '6px',
                  borderRadius: '3px',
                  background: isDark ? '#495057' : '#ddd',
                  outline: 'none',
                  WebkitAppearance: 'none',
                  transition: 'all 0.3s ease'
                }}
              />
              <span style={{
                fontSize: '12px',
                color: colors.textSecondary,
                minWidth: '35px',
                textAlign: 'right'
              }}>
                {(overlayOpacity.activityBar * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <p>Other application preferences and settings will be configured here.</p>
    </div>
  );
}

export default SettingsView;
