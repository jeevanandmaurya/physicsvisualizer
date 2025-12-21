import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronUp, faChevronDown, faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { physicsDataStore } from '../../core/physics/PhysicsDataStore';
import { useOverlay } from '../../contexts/OverlayContext';
import { useTheme } from '../../contexts/ThemeContext';
import './PhysicsOverlay.css';

interface PhysicsOverlayProps {
  scene: any;
  isPlaying: boolean;
  simulationSpeed?: number;
  isOpen: boolean;
  onToggle: () => void;
  fps?: number;
}

export function PhysicsOverlay({ scene, isPlaying, simulationSpeed = 1, isOpen, onToggle, fps = 0 }: PhysicsOverlayProps) {
  const { overlayOpacity } = useTheme();
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

  const overlayId = 'physics-stats-overlay';
  const overlayState = overlays.get(overlayId);
  const isMinimized = overlayState?.isMinimized || false;
  const isFocused = focusedOverlay === overlayId;

  // Mobile optimization: Adjust initial size and position
  const [position, setPosition] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return { 
      x: isMobile ? 10 : 20, 
      y: isMobile ? 50 : 60 
    };
  });

  const [size, setSize] = useState(() => {
    const isMobile = window.innerWidth <= 768;
    return { 
      width: isMobile ? Math.min(window.innerWidth - 20, 300) : 220, 
      height: isMobile ? 300 : 380 
    };
  });

  // Handle window resize to keep overlay in bounds
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        setPosition(prev => ({
          x: Math.min(prev.x, window.innerWidth - 50),
          y: Math.min(prev.y, window.innerHeight - 50)
        }));
        setSize(prev => ({
          width: Math.min(prev.width, window.innerWidth - 20),
          height: Math.min(prev.height, window.innerHeight - 100)
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    registerOverlay(overlayId, 'physicsStats', 100);
    return () => unregisterOverlay(overlayId);
  }, [registerOverlay, unregisterOverlay]);

  const [stats, setStats] = useState({
    objectCount: 0,
    totalEnergy: 0,
    timeStep: 0.0166,
    activeBodies: 0
  });

  useEffect(() => {
    // Subscribe to throttled data updates from the store
    // This uses requestIdleCallback internally to avoid blocking the main thread
    const unsubscribe = physicsDataStore.subscribeToData((snapshot) => {
      const objects = scene?.objects || [];
      
      let kineticEnergy = 0;
      let potentialEnergy = 0;
      let activeCount = 0;
      const gravity = scene?.gravity?.[1] || -9.81;

      objects.forEach((obj: any) => {
        const vel = snapshot.velocities[obj.id];
        const pos = snapshot.positions[obj.id];
        
        if (vel && pos && !obj.isStatic) {
          const m = obj.mass || 1;
          // KE = 1/2 * m * v^2
          const speedSq = vel[0]**2 + vel[1]**2 + vel[2]**2;
          kineticEnergy += 0.5 * m * speedSq;
          
          // PE = m * g * h (relative to y=0)
          potentialEnergy += m * Math.abs(gravity) * Math.max(0, pos[1]);
          
          if (speedSq > 0.001) activeCount++;
        }
      });

      setStats({
        objectCount: objects.length,
        totalEnergy: kineticEnergy + potentialEnergy,
        timeStep: (1/60) * simulationSpeed,
        activeBodies: activeCount
      });
    });

    return () => unsubscribe();
  }, [scene, simulationSpeed]);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMinimize(overlayId);
  };

  const handleOverlayClick = () => {
    focusOverlay(overlayId);
  };

  if (!isOpen || !scene) return null;

  const currentZIndex = getZIndex(overlayId);
  const minimizedPos = getMinimizedPosition(overlayId);
  const displayPosition = isMinimized && minimizedPos ? minimizedPos : position;

  return (
    <Rnd
      position={displayPosition}
      size={isMinimized ? { width: 200, height: 28 } : size}
      onDragStop={(e, d) => {
        if (!isMinimized) {
          setPosition({ x: d.x, y: d.y });
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        setSize({
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        setPosition(position);
      }}
      minWidth={isMinimized ? 200 : 200}
      minHeight={isMinimized ? 28 : 100}
      bounds="window"
      dragHandleClassName="engine-overlay-header"
      className={`engine-overlay ${isMinimized ? 'minimized' : ''} ${isFocused ? 'focused' : ''}`}
      onMouseDown={handleOverlayClick}
      style={{
        zIndex: currentZIndex,
        '--overlay-opacity': overlayOpacity.physicsStats
      } as React.CSSProperties}
    >
      <div className="engine-overlay-header">
        <div className="engine-overlay-title">
          <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: '8px' }} />
          Physics Stats
        </div>
        <div className="engine-overlay-controls">
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
        <div className="engine-overlay-content physics-overlay-content">
          <div className="physics-overlay-inner">
            <div className="overlay-section">
              <h4>Scene Details</h4>
              <p>
                <span>Name</span>
                <span>{scene.name || 'Untitled'}</span>
              </p>
              <p>
                <span>Total Objects</span>
                <span>{stats.objectCount}</span>
              </p>
            </div>

            <div className="overlay-section">
              <h4>Physics Engine</h4>
              <p>
                <span>Status</span>
                <span className={`status-tag ${isPlaying ? 'status-running' : 'status-paused'}`}>
                  {isPlaying ? 'RUNNING' : 'PAUSED'}
                </span>
              </p>
              <p>
                <span>System Energy</span>
                <span>{stats.totalEnergy.toFixed(2)} J</span>
              </p>
              <p>
                <span>Time Step</span>
                <span>{stats.timeStep.toFixed(4)} s</span>
              </p>
              <p>
                <span>Active Bodies</span>
                <span>{stats.activeBodies}</span>
              </p>
            </div>

            <div className="overlay-section">
              <h4>System State</h4>
              <p>
                <span>Frame Rate</span>
                <span style={{ 
                  color: fps < 30 ? '#ff6b6b' : (fps < 50 ? '#fcc419' : '#51cf66'),
                  fontWeight: 'bold'
                }}>
                  {fps} FPS
                </span>
              </p>
              <p>
                <span>Engine</span>
                <span>Rapier3D (WASM)</span>
              </p>
              <p>
                <span>Threads</span>
                <span>1 (Main Thread)</span>
              </p>
              <p>
                <span>Bottleneck Risk</span>
                <span style={{ color: stats.objectCount > 100 ? '#ff6b6b' : '#51cf66' }}>
                  {stats.objectCount > 100 ? 'HIGH' : 'LOW'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </Rnd>
  );
}
 