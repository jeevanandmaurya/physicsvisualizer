import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronUp, faChevronDown, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useOverlay } from '../../../contexts/OverlayContext';
import './ControllerOverlay.css';

// Type definitions
interface ControllerItem {
  id: string;
  label: string;
  type: 'slider' | 'number';
  propertyPath?: string;
  objectId?: string;
  property?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
}

interface SceneObject {
  id: string;
  [key: string]: any;
}

interface SceneData {
  id?: string;
  name?: string;
  objects?: SceneObject[];
  controllers?: ControllerItem[];
  [key: string]: any;
}

interface ControllerOverlayProps {
  isOpen: boolean;
  onToggle: () => void;
  scene?: SceneData | null;
  onSceneUpdate?: (scene: SceneData) => void;
  controllers?: ControllerItem[];
  onAddController?: () => void;
}

const ControllerOverlay = ({
  isOpen,
  onToggle,
  scene,
  onSceneUpdate,
  controllers,
  onAddController
}: ControllerOverlayProps) => {
  const { overlayOpacity, updateOverlayOpacity } = useTheme();
  const { 
    registerOverlay, 
    unregisterOverlay, 
    focusOverlay, 
    getZIndex, 
    focusedOverlay,
    overlays,
    toggleMinimize,
    getMinimizedPosition
  } = useOverlay();

  const overlayId = 'controller';
  const overlayState = overlays.get(overlayId);
  const isMinimized = overlayState?.isMinimized || false;

  const [position, setPosition] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return { 
      x: isMobile ? 10 : 100, 
      y: isMobile ? 60 : 100 
    };
  });

  const [size, setSize] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return { 
      width: isMobile ? window.innerWidth - 20 : 350, 
      height: isMobile ? 400 : 500 
    };
  });

  const [previousPosition, setPreviousPosition] = useState(position);
  const [previousSize, setPreviousSize] = useState(size);

  // Handle window resize to keep overlay in bounds
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setSize(prev => ({
          width: Math.min(prev.width, window.innerWidth - 20),
          height: Math.min(prev.height, window.innerHeight - 120)
        }));
        setPosition(prev => ({
          x: Math.max(0, Math.min(prev.x, window.innerWidth - 50)),
          y: Math.max(0, Math.min(prev.y, window.innerHeight - 50))
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Register overlay
  useEffect(() => {
    if (isOpen) {
      registerOverlay(overlayId, 'controller', 55);
      return () => unregisterOverlay(overlayId);
    }
  }, [isOpen, registerOverlay, unregisterOverlay]);

  // Handle minimized position
  useEffect(() => {
    if (isMinimized) {
      const minPos = getMinimizedPosition(overlayId);
      if (minPos) {
        setPosition(minPos);
      }
    } else {
      setPosition(previousPosition);
    }
  }, [isMinimized, getMinimizedPosition]);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMinimized) {
      setPreviousPosition(position);
      setPreviousSize(size);
    }
    toggleMinimize(overlayId);
  };

  const normalizePropertyPath = (path) => {
    if (!path) return [];
    return path
      .replace(/\[(\w+)\]/g, '.$1')
      .split('.')
      .map(part => part.trim())
      .filter(part => part.length > 0);
  };

  const isNumericSegment = (segment) => {
    return !isNaN(Number(segment)) && !isNaN(parseFloat(segment));
  };

  // Set initial position after mount, centered and above status bar
  useEffect(() => {
    if (isOpen) {
      // Offset slightly from center to avoid stacking with GraphOverlay
      const centerX = Math.max(60, (window.innerWidth - 350) / 2 + 40);
      const centerY = Math.max(0, (window.innerHeight - 500 - 40) / 2 + 40);
      setPosition({ x: centerX, y: centerY });
      setSize({ width: 350, height: 500 });
      setPreviousPosition({ x: centerX, y: centerY });
      setPreviousSize({ width: 350, height: 500 });
    }
  }, [isOpen]);

  // Handle escape key to close overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onToggle]);











  // Get current value from scene for a controller
  const getControllerValue = (controller) => {
    if (!scene) return controller.value;

    if (controller.propertyPath) {
      const pathParts = normalizePropertyPath(controller.propertyPath);
      let current = scene;
      for (let i = 0; i < pathParts.length; i++) {
        if (current === undefined || current === null) {
          return controller.value;
        }

        const segment = pathParts[i];
        if (isNumericSegment(segment)) {
          const index = Number(segment);
          if (!Array.isArray(current) || current[index] === undefined) {
            return controller.value;
          }
          current = current[index];
        } else {
          if (current[segment] === undefined) {
            return controller.value;
          }
          current = current[segment];
        }
      }

      return current !== undefined ? current : controller.value;
    } else if (controller.objectId && controller.property) {
      // Handle object property (including array properties like "velocity[0]")
      const object = scene.objects?.find(obj => obj.id === controller.objectId);
      if (object) {
        // Check if property contains array index notation
        if (controller.property.includes('[')) {
          const propParts = controller.property.split(/\[|\]/).filter(p => p !== '');
          const propName = propParts[0];
          const arrayIndex = parseInt(propParts[1]);
          
          if (object[propName] && Array.isArray(object[propName])) {
            return object[propName][arrayIndex] !== undefined ? object[propName][arrayIndex] : controller.value;
          }
        } else if (object[controller.property] !== undefined) {
          return object[controller.property];
        }
      }
    }

    return controller.value;
  };

  const handleControllerChange = (controllerId, value) => {
    if (isNaN(value)) return;

    if (!scene || !onSceneUpdate) return;

    const controller = controllers?.find(c => c.id === controllerId);
    if (!controller) return;

    let updatedScene = JSON.parse(JSON.stringify(scene)); // Deep clone

    // Update the scene property
    if (controller.propertyPath) {
      const pathParts = normalizePropertyPath(controller.propertyPath);
      if (pathParts.length > 0) {
        let current = updatedScene;
        let parent = null;
        let parentKey = null;

        for (let i = 0; i < pathParts.length - 1; i++) {
          const segment = pathParts[i];
          const nextSegment = pathParts[i + 1];
          const nextIsIndex = isNumericSegment(nextSegment);

          if (isNumericSegment(segment)) {
            const index = Number(segment);
            if (!Array.isArray(current)) {
              if (parent && parentKey !== null) {
                const placeholder = [];
                if (Array.isArray(parent)) {
                  parent[parentKey] = placeholder;
                } else {
                  parent[parentKey] = placeholder;
                }
                current = placeholder;
              } else {
                return;
              }
            }
            if (current[index] === undefined) {
              current[index] = nextIsIndex ? [] : {};
            } else if (nextIsIndex && !Array.isArray(current[index])) {
              current[index] = [];
            } else if (!nextIsIndex && (typeof current[index] !== 'object' || current[index] === null)) {
              current[index] = {};
            }
            parent = current;
            parentKey = index;
            current = current[index];
          } else {
            if (current[segment] === undefined) {
              current[segment] = nextIsIndex ? [] : {};
            } else if (nextIsIndex && !Array.isArray(current[segment])) {
              current[segment] = [];
            } else if (!nextIsIndex && (typeof current[segment] !== 'object' || current[segment] === null)) {
              current[segment] = {};
            }
            parent = current;
            parentKey = segment;
            current = current[segment];
          }
        }

        const lastPart = pathParts[pathParts.length - 1];
        if (isNumericSegment(lastPart)) {
          const index = Number(lastPart);
          if (!Array.isArray(current)) {
            if (parent && parentKey !== null) {
              const placeholder = [];
              if (Array.isArray(parent)) {
                parent[parentKey] = placeholder;
              } else {
                parent[parentKey] = placeholder;
              }
              current = placeholder;
            } else {
              return;
            }
          }
          while (current.length <= index) {
            current.push(0);
          }
          current[index] = value;
        } else {
          current[lastPart] = value;
        }
      }
    } else if (controller.objectId && controller.property) {
      // Handle object property (including array properties like "velocity[0]")
      const objectIndex = updatedScene.objects.findIndex(obj => obj.id === controller.objectId);
      if (objectIndex !== -1) {
        const obj = updatedScene.objects[objectIndex];
        
        // Check if property contains array index notation like "velocity[0]"
        if (controller.property.includes('[')) {
          const propParts = controller.property.split(/\[|\]/).filter(p => p !== '');
          const propName = propParts[0];
          const arrayIndex = parseInt(propParts[1]);
          
          // Create a copy of the array and update the specific index
          const newArray = [...(obj[propName] || [])];
          while (newArray.length <= arrayIndex) {
            newArray.push(0);
          }
          newArray[arrayIndex] = value;
          
          updatedScene.objects[objectIndex] = {
            ...obj,
            [propName]: newArray
          };
        } else {
          // Simple property update
          updatedScene.objects[objectIndex] = {
            ...obj,
            [controller.property]: value
          };
        }
      }
    }

    // Update the controller's value in the controllers array
    const controllerIndex = updatedScene.controllers.findIndex(c => c.id === controllerId);
    if (controllerIndex !== -1) {
      updatedScene.controllers[controllerIndex] = {
        ...updatedScene.controllers[controllerIndex],
        value: value
      };
    }

    onSceneUpdate(updatedScene);
  };

  const handleAddController = () => {
    if (onAddController) {
      onAddController();
    }
  };

  // Register with overlay system
  useEffect(() => {
    registerOverlay('controller-overlay', 'controller', 55);
    return () => unregisterOverlay('controller-overlay');
  }, [registerOverlay, unregisterOverlay]);

  const currentZIndex = getZIndex(overlayId);
  const isFocused = focusedOverlay === overlayId;
  
  const handleOverlayClick = () => {
    focusOverlay(overlayId);
  };

  if (!isOpen) return null;

  return (
    <Rnd
      size={isMinimized ? { width: 200, height: 28 } : size}
      position={position}
      onDragStop={(e, d) => {
        if (!isMinimized) {
          setPosition({ x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, newPosition) => {
        if (!isMinimized) {
          setSize({
            width: parseInt(ref.style.width),
            height: parseInt(ref.style.height),
          });
          setPosition(newPosition);
        }
      }}
      minWidth={isMinimized ? 200 : (window.innerWidth <= 768 ? Math.min(280, window.innerWidth - 20) : 300)}
      minHeight={isMinimized ? 28 : 150}
      bounds="window"
      disableDragging={isMinimized}
      enableResizing={!isMinimized}
      dragHandleClassName="engine-overlay-header"
      className={`engine-overlay ${isMinimized ? 'minimized' : ''} ${isFocused ? 'focused' : ''}`}
      onMouseDown={handleOverlayClick}
      style={{
        zIndex: currentZIndex,
        '--overlay-opacity': overlayOpacity.controller || overlayOpacity.chat
      } as React.CSSProperties}
    >
      <div className="engine-overlay-header">
        <div className="engine-overlay-title">Controllers</div>
        <div className="engine-overlay-controls">
          <button
            className="engine-overlay-button"
            onClick={handleAddController}
            title="Add Controller"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
          <button
            className="engine-overlay-button"
            onClick={handleMinimize}
            title={isMinimized ? "Maximize" : "Minimize"}
          >
            <FontAwesomeIcon icon={isMinimized ? faChevronUp : faChevronDown} />
          </button>
          <button
            className="engine-overlay-button close"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            title="Close"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="engine-overlay-content">
          <div className="controller-list">
            {(controllers || []).length === 0 ? (
              <div className="no-controllers">
                <p>No scene controllers configured.</p>
                <p>Click + to add a controller.</p>
              </div>
            ) : (
              (controllers || []).map(controller => (
                <div key={controller.id} className="controller-item">
                  <label className="controller-label">
                    {controller.label}
                  </label>
                  <div className="controller-input-group">
                    {controller.type === 'slider' && (
                      <>
                        <input
                          type="range"
                          min={controller.min}
                          max={controller.max}
                          step={controller.step || 1}
                          value={getControllerValue(controller)}
                          onChange={(e) => handleControllerChange(controller.id, parseFloat(e.target.value))}
                          className="controller-slider"
                        />
                        <input
                          type="number"
                          min={controller.min}
                          max={controller.max}
                          step={controller.step || 1}
                          value={getControllerValue(controller)}
                          onChange={(e) => handleControllerChange(controller.id, parseFloat(e.target.value))}
                          className="controller-number-input"
                        />
                      </>
                    )}
                    {controller.type === 'number' && (
                      <input
                        type="number"
                        min={controller.min}
                        max={controller.max}
                        step={controller.step || 1}
                        value={getControllerValue(controller)}
                        onChange={(e) => handleControllerChange(controller.id, parseFloat(e.target.value))}
                        className="controller-number-input full-width"
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Rnd>
  );
};

export default ControllerOverlay;
