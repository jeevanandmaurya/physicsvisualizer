import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Import physics calculations and engine components
import { PhysicsWorld } from '../../core/physics/engine.jsx';

// Import visual annotation system
import { VisualAnnotationManager } from '../../core/visuals';



// Import assets
import backgroundTexture from '../../assets/background.svg';
import spaceTexture from '../../assets/space.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import SceneDetailsUI from '../../views/components/scene-management/SceneDetailsUI';
import { functionCallSystem } from '../../core/tools/FunctionCallSystem.js';
import { physicsDataStore } from '../../core/physics/PhysicsDataStore';
import { PhysicsOverlay } from '../../views/components/PhysicsOverlay';

// --- Visualizer-specific helper components ---
function TimeUpdater({ isPlaying, updateSimulationTime }) {
  useFrame((state, delta) => {
    // Update simulation time only when playing (world time stops when paused)
    if (isPlaying) {
      updateSimulationTime(prevTime => prevTime + delta);
    }
  });
  return null;
}
function FpsCounter({ updateFps }) { 
  const lastTimeRef = useRef(performance.now()); 
  const frameCountRef = useRef(0); 
  useFrame(() => { 
    const now = performance.now(); 
    frameCountRef.current += 1; 
    const delta = now - lastTimeRef.current; 
    if (delta >= 1000) { 
      updateFps(Math.round((frameCountRef.current * 1000) / delta)); 
      frameCountRef.current = 0; 
      lastTimeRef.current = now; 
    } 
  }); 
  return null; 
}
function SimpleGrid({ show }) { 
  if (!show) return null; 
  return (
    <Grid 
      position={[0, -0.001, 0]} 
      args={[100, 100]} 
      cellSize={1} 
      cellThickness={1} 
      cellColor="#6f6f6f" 
      sectionSize={10} 
      sectionThickness={1.5} 
      sectionColor="#9d9d9d" 
      fadeDistance={200} 
      fadeStrength={5} 
      infiniteGrid 
    />
  ); 
}
function LabeledAxesHelper({ size = 5, visible = true }) { 
  if (!visible) return null;
  const textProps = { fontSize: 0.5, anchorX: 'center', anchorY: 'middle' }; 
  return (<group renderOrder={10}><axesHelper args={[size]} /><Text color="red" position={[size * 1.1, 0, 0]} {...textProps}>X</Text><Text color="green" position={[0, size * 1.1, 0]} {...textProps}>Y</Text><Text color="blue" position={[0, 0, size * 1.1]} {...textProps}>Z</Text></group>); 
}

function GroundPlane({ show }) { 
  if (!show) return null; 
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial 
        color="#111111" 
        opacity={0.4} 
        transparent 
        polygonOffset 
        polygonOffsetFactor={1} 
        polygonOffsetUnits={1}
      />
    </mesh>
  ); 
}
function Arrow({ vec, color }) { 
  const groupRef = useRef(); 
  const shaftRef = useRef(); 
  const coneRef = useRef(); 
  const geometries = useMemo(() => ({ 
    // Create unit geometries aligned along +Y. We'll scale the mesh transforms
    // instead of modifying the geometry parameters each frame.
    shaft: new THREE.CylinderGeometry(1, 1, 1, 8), 
    cone: new THREE.ConeGeometry(1, 1, 8) 
  }), []); 
  useEffect(() => { return () => { geometries.shaft.dispose(); geometries.cone.dispose(); }; }, [geometries]); 
  const vecRef = useRef(vec);

  // Reusable Three.js objects to avoid re-instantiation in useFrame
  const dir = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  useEffect(() => {
    vecRef.current = vec;
  }, [vec]);

  useFrame(() => {
    const group = groupRef.current;
    const shaft = shaftRef.current;
    const cone = coneRef.current;
    const currentVec = vecRef.current;

    if (!group || !shaft || !cone || !currentVec) return;

    const length = currentVec.length();
    if (length < 1e-4) {
      group.visible = false;
      return;
    }
    group.visible = true;

    // Orient the arrow
    dir.copy(currentVec).normalize(); // Copy currentVec to dir and normalize
    quaternion.setFromUnitVectors(up, dir);
    group.quaternion.copy(quaternion);

    // Determine sizes relative to vector length
    const headHeight = Math.max(length * 0.25, 0.1);
    const headRadius = Math.max(length * 0.08, 0.03);
    const shaftRadius = Math.max(length * 0.02, 0.01);
    const shaftLength = Math.max(length - headHeight, 0.05);

    // Apply scales and positions
    shaft.scale.set(shaftRadius, shaftLength, shaftRadius);
    shaft.position.set(0, shaftLength / 2, 0);

    cone.scale.set(headRadius, headHeight, headRadius);
    cone.position.set(0, shaftLength + headHeight / 2, 0);
  });

  return (
    <group ref={groupRef}>
      <mesh ref={shaftRef} geometry={geometries.shaft}>
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh ref={coneRef} geometry={geometries.cone}>
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
// OLD VELOCITY VECTOR SYSTEM - Replaced by Visual Annotation System
// Use visualAnnotations in scene JSON instead
// Example: { "type": "vector", "vectorType": "velocity", ... }

function Skybox({ texturePath, backgroundType = 'normal' }) {
  if (backgroundType === 'black') {
    return (
      <mesh key="skybox-black">
        <sphereGeometry args={[100000, 60, 40]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>
    );
  }

  if (backgroundType === 'white') {
    return (
      <mesh key="skybox-white">
        <sphereGeometry args={[100000, 60, 40]} />
        <meshBasicMaterial color="#ffffff" side={THREE.BackSide} />
      </mesh>
    );
  }

  // For 'normal' and 'space' use textures
  const texturePathToUse = backgroundType === 'space' ? spaceTexture :
                           texturePath ? texturePath : backgroundTexture;

  const texture = useTexture(texturePathToUse);
  return (
    <mesh key={`skybox-${backgroundType}`}>
      <sphereGeometry args={[100000, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Visualizer({ scene, showSceneDetails, onToggleSceneDetails }) {
    const { isPlaying, simulationTime, fps, showVelocityVectors, vectorScale, openGraphs, resetSimulation, loopReset, updateSimulationTime, updateFps, resetTrigger, removeGraph, setObjectHistory, loopMode, setIsPlaying, dataTimeStep, simulationSpeed, showGrid, showAxes, setShowGrid, setShowAxes, showStats, zenMode, setZenMode } = useWorkspace();

    // Skybox state - cycles through: normal, space, black, white
    const [skyboxType, setSkyboxType] = useState('normal');

    // Debug: Log scene changes
    useEffect(() => {
        console.log('Visualizer: Scene updated:', scene?.id, scene?.gravity, scene?.objects?.map(o => ({ id: o.id, mass: o.mass })));
    }, [scene]);

    const historyRef = useRef({});
    const lastLoopResetRef = useRef(0);
    const lastRecordTimeRef = useRef({}); // Track last recorded time for each object
    const physicsDataRef = useRef({ velocities: {}, positions: {} }); // Changed to ref to avoid re-renders
    const [physicsData, setPhysicsData] = useState({ velocities: {}, positions: {} });
    const [canvasError, setCanvasError] = useState(false);
    const r3fCanvasRef = useRef(null);
    const [processedScene, setProcessedScene] = useState(null);
    const physicsUpdateCountRef = useRef(0); // Batch updates

    // Process scene function calls when scene changes - MEMOIZED to prevent re-processing
    // Use scene._version to force re-processing when scene is updated via patches
    const processedSceneMemo = useMemo(() => {
        if (scene) {
            console.log('🎬 Visualizer: Processing scene functions for:', scene.id, 'version:', scene._version || 0);
            const processed = functionCallSystem.processSceneFunctions(scene);

            // Log any errors that occurred during processing
            if (processed.errors && processed.errors.length > 0) {
                console.warn('⚠️ Scene processing errors:', processed.errors);
            }

            console.log(`✅ Scene processed: ${scene.objects?.length || 0} → ${processed.objects?.length || 0} objects`);
            return processed;
        }
        return null;
    }, [scene, scene?._version]);

    useEffect(() => {
        setProcessedScene(processedSceneMemo);
    }, [processedSceneMemo]);

    const activeScene = processedScene || scene;
    const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = activeScene || {};
    const objectsToRender = activeScene?.objects || [];

    const defaultContactMaterial = {
        friction: contactMaterial.friction || 0.5,
        restitution: contactMaterial.restitution || 0.7
    };

    const MAX_HISTORY_POINTS = 2000;

  const handlePhysicsDataCalculated = useCallback((data) => {
    // NEW: Use PhysicsDataStore - bypasses React entirely!
    // This is now the fastest possible path - direct memory write
    Object.entries(data).forEach(([id, info]) => {
      if (info && info.velocity && info.position && info.time !== undefined) {
        // Store handles all throttling, history management, and notifications
        physicsDataStore.updatePhysicsData(
          id,
          info.velocity,
          info.position,
          info.time
        );
      }
    });
    
    // No more React state updates here! 
    // Subscribers (graphs, UI) get updates via event system at their own rate
  }, []);

    useEffect(() => {
        // Clear PhysicsDataStore on scene change
        physicsDataStore.clear();
        physicsDataStore.setUpdateRates(100, 500, dataTimeStep);
        historyRef.current = {};
        lastRecordTimeRef.current = {};
        setObjectHistory({});
        setPhysicsData({ velocities: {}, positions: {} });
        setIsPlaying(false);
    }, [scene, setIsPlaying, dataTimeStep]);

    // Reset data when reset button is pressed (resetTrigger changes)
    useEffect(() => {
        if (resetTrigger) {
            physicsDataStore.clear();
            historyRef.current = {};
            lastRecordTimeRef.current = {};
            setObjectHistory({});
            setPhysicsData({ velocities: {}, positions: {} });
        }
    }, [resetTrigger, setObjectHistory]);

    useEffect(() => {
        const i = setInterval(() => {
            if (Object.keys(historyRef.current).length) setObjectHistory({ ...historyRef.current });
        }, 200);
        return () => clearInterval(i);
    }, [setObjectHistory]);

    // Handle WebGL context loss
    useEffect(() => {
        const handleContextLoss = (event) => {
            console.log('WebGL context lost, preventing default behavior');
            event.preventDefault();
            setCanvasError(true);
        };

        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('webglcontextlost', handleContextLoss);
            return () => canvas.removeEventListener('webglcontextlost', handleContextLoss);
        }
    }, []);

    // Handle loop reset
    useEffect(() => {
        if (loopMode !== 'none' && isPlaying) {
            const interval = loopMode === '5sec' ? 5 : 10;
            if (simulationTime >= interval) {
                // loopReset() will trigger resetTrigger effect which clears the data
                loopReset();
            }
        }
    }, [loopMode, isPlaying, simulationTime, loopReset]);

    return (
        <div className="visualizer-container">
            {showSceneDetails && (
                <div className="scene-details-panel">
                    <SceneDetailsUI
                        scene={scene}
                        onToggleSceneDetails={onToggleSceneDetails}
                    />
                </div>
            )}
            <div className="main-content">
                {canvasError ? (
                    <div className="canvas-fallback">
                        <div className="fallback-content">
                            <FontAwesomeIcon icon={faCube} size="3x" style={{ color: '#666', marginBottom: '20px' }} />
                            <h3>3D Visualizer Unavailable</h3>
                            <p>
                                WebGL context lost. Please refresh the page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007acc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginTop: '15px'
                                }}
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                ) : (
                    <Canvas
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
                        shadows
                        frameloop="always"
                        dpr={[1, 2]}
                        performance={{ min: 0.5 }}
                        gl={{ 
                            logLevel: 'errors', 
                            preserveDrawingBuffer: false,
                            antialias: true,
                            powerPreference: 'high-performance',
                            alpha: false
                        }}
                        camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 200000 }}
                        onError={() => setCanvasError(true)}
                        onCreated={({ gl }) => {
                            window._webglContext = gl;
                            try {
                                r3fCanvasRef.current = gl.domElement;
                                if (r3fCanvasRef.current) r3fCanvasRef.current.dataset.engine = 'three.js';
                            } catch (e) {
                                console.warn('Could not set r3fCanvasRef:', e);
                            }
                        }}
                    >
                        <TimeUpdater isPlaying={isPlaying} updateSimulationTime={updateSimulationTime} />
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[8, 10, 5]} intensity={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                        <PhysicsWorld
                            scene={activeScene}
                            isPlaying={isPlaying}
                            onPhysicsDataCalculated={handlePhysicsDataCalculated}
                            resetTrigger={resetTrigger}
                            defaultContactMaterial={defaultContactMaterial}
                            simulationTime={simulationTime}
                            simulationSpeed={simulationSpeed}
                        />
                        {/* Visual Annotation System - Gets data directly from PhysicsDataStore */}
                        {activeScene?.visualAnnotations && activeScene.visualAnnotations.length > 0 && (
                            <VisualAnnotationManager
                                annotations={activeScene.visualAnnotations}
                                physicsData={{}} // Not used - component gets data from PhysicsDataStore
                                sceneObjects={objectsToRender}
                                isPlaying={isPlaying}
                                enabled={true}
                            />
                        )}
                        <OrbitControls />
                        <LabeledAxesHelper size={5} visible={showAxes} />
                        <SimpleGrid show={showGrid} />
                        <GroundPlane show={hasGround} />
                        <FpsCounter updateFps={updateFps} />
                        <Skybox texturePath={backgroundTexture} backgroundType={skyboxType} />
                    </Canvas>
                )}
                
                {/* Visualizer Controls */}
                <div className="visualizer-controls-top-right">
                    {/* Skybox Switch Button */}
                    <button 
                        className="visualizer-control-btn skybox-switch-btn"
                        onClick={() => {
                            const types = ['normal', 'space', 'black', 'white'];
                            const currentIndex = types.indexOf(skyboxType);
                            const nextIndex = (currentIndex + 1) % types.length;
                            setSkyboxType(types[nextIndex]);
                        }}
                        title={`Theme: ${skyboxType}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    </button>

                    {/* Grid Toggle Button */}
                    <button 
                        className={`visualizer-control-btn grid-toggle-btn ${showGrid ? 'active' : ''}`}
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Grid"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
                        </svg>
                    </button>

                    {/* Axes Toggle Button */}
                    <button 
                        className={`visualizer-control-btn axes-toggle-btn ${showAxes ? 'active' : ''}`}
                        onClick={() => setShowAxes(!showAxes)}
                        title="Toggle Axes"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="12" x2="20" y2="12" stroke="red" />
                            <line x1="12" y1="12" x2="12" y2="4" stroke="green" />
                            <line x1="12" y1="12" x2="8" y2="16" stroke="blue" />
                            <circle cx="12" cy="12" r="1" fill="white" />
                        </svg>
                    </button>

                    {/* Zen Mode Toggle Button */}
                    <button 
                        className={`visualizer-control-btn zen-toggle-btn ${zenMode ? 'active' : ''}`}
                        onClick={() => setZenMode(!zenMode)}
                        title={zenMode ? "Exit Full Window" : "Full Window (Zen Mode)"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {zenMode ? (
                                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                            ) : (
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                            )}
                        </svg>
                    </button>
                </div>


            </div>
        </div>
    );
}

export default Visualizer;
