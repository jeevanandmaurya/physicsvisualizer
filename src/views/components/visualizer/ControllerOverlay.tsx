import React, { useState, useEffect, useRef } from 'react';
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
  const { registerOverlay, unregisterOverlay, focusOverlay, getZIndex } = useOverlay();
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 350, height: 500 });
  const [previousPosition, setPreviousPosition] = useState({ x: 100, y: 100 });
  const [previousSize, setPreviousSize] = useState({ width: 350, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const overlayRef = useRef(null);

  const normalizePropertyPath = (path) => {
    if (!path) return [];
    return path
      .replace(/\[(\w+)\]/g, '.$1')
      .split('.')
      .map(part => part.trim())
      .filter(part => part.length > 0);
  };

  const isNumericSegment = (segment) => segment !== '' && !Number.isNaN(Number(segment));

  // Set initial position after mount, centered and above status bar
  useEffect(() => {
    if (isOpen) {
      const centerX = Math.max(48, (window.innerWidth - 350) / 2);
      const centerY = Math.max(0, (window.innerHeight - 500 - 40) / 2);
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

  // Drag functionality - only from header
  const handleMouseDown = (e) => {
    // Focus overlay first
    focusOverlay('controller-overlay');
    
    // Only allow dragging from header, not from control buttons or resize handle
    if (e.target.closest('.controller-overlay-control-btn') || e.target.closest('.resize-handle')) return;

    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;

      // Keep within viewport bounds, avoiding activity bar (left ~48px) and status bar (bottom ~40px)
      const activityBarWidth = 48;
      const statusBarHeight = 40;
      const currentWidth = isMinimized ? 90 : Math.max(350, size.width);
      const currentHeight = isMinimized ? 28 : Math.max(300, size.height);
      newX = Math.max(activityBarWidth, Math.min(window.innerWidth - currentWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - currentHeight - statusBarHeight, newY));

      setPosition({ x: newX, y: newY });
    } else if (isResizing && !isMinimized) {
      const rect = overlayRef.current.getBoundingClientRect();
      const newWidth = Math.max(350, e.clientX - rect.left);
      const newHeight = Math.max(150, e.clientY - rect.top);
      setSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    });
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, isResizing]);



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

  const { focusedOverlay } = useOverlay();
  const currentZIndex = getZIndex('controller-overlay');
  const isFocused = focusedOverlay === 'controller-overlay';
  
  const handleOverlayClick = () => {
    focusOverlay('controller-overlay');
  };

  if (!isOpen) return null;

  return (
    <div className={`controller-overlay ${isMinimized ? 'minimized' : ''}`}>
      <div
        className={`controller-overlay-container ${isFocused ? 'focused' : ''}`}
        ref={overlayRef}
        onMouseDown={handleOverlayClick}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: isMinimized ? '28px' : `${size.height}px`,
          cursor: isResizing ? 'nw-resize' : 'default',
          zIndex: currentZIndex,
          '--controller-bg-opacity': overlayOpacity.controller || overlayOpacity.chat
        } as React.CSSProperties}
      >
        {/* Header */}
        <div
          className="controller-overlay-header"
          onMouseDown={handleMouseDown}
          title={isMinimized ? 'Drag to move. Click to expand.' : 'Drag to move.'}
        >
          <div className="controller-overlay-title">Controllers</div>
          <div className="controller-overlay-header-controls">
            <button
              className="controller-overlay-control-btn"
              onClick={handleAddController}
              title="Add Controller"
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              className="controller-overlay-control-btn"
              onClick={() => {
                if (isMinimized) {
                  // Maximize: restore previous
                  setPosition(previousPosition);
                  setSize(previousSize);
                  setIsMinimized(false);
                } else {
                  // Minimize: save current, set compact
                  setPreviousPosition(position);
                  setPreviousSize(size);
                  setPosition({
                    x: (window.innerWidth - 90) / 2,
                    y: window.innerHeight - 80
                  });
                  setSize({ width: 90, height: 28 });
                  setIsMinimized(true);
                }
              }}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              <FontAwesomeIcon icon={isMinimized ? faChevronUp : faChevronDown} />
            </button>
            <button
              className="controller-overlay-control-btn close-btn"
              onClick={onToggle}
              title="Close (Esc)"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="controller-overlay-content">
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
            <div
              className="resize-handle"
              onMouseDown={handleResizeStart}
              title="Resize"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ControllerOverlay;
