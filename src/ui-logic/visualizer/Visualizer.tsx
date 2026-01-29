import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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
import { useSimulation } from '../../contexts/SimulationContext';
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

function ShootingHandler({ onShoot }) {
  const { camera, gl } = useThree();
  const [fKeyHeld, setFKeyHeld] = useState(false);
  const [isCanvasFocused, setIsCanvasFocused] = useState(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleFocus = () => setIsCanvasFocused(true);
    const handleBlur = () => setIsCanvasFocused(false);
    const handleMouseEnter = () => setIsCanvasFocused(true);
    const handleMouseLeave = () => setIsCanvasFocused(false);

    canvas.addEventListener('focus', handleFocus);
    canvas.addEventListener('blur', handleBlur);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('focus', handleFocus);
      canvas.removeEventListener('blur', handleBlur);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gl]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shooting if canvas is focused or mouse is over it
      if (!isCanvasFocused && document.activeElement !== gl.domElement) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        setFKeyHeld(true);
        // If 'f' is pressed alone (not held), shoot default sphere
        setTimeout(() => {
          if (fKeyHeld) return; // Don't shoot if still held (waiting for number)
          shootObject('Sphere');
        }, 200); // Small delay to detect if number key follows
      } else if (fKeyHeld && ['1', '2', '3', '4', '5'].includes(event.key)) {
        // Shoot different geometry based on number key
        const geometryTypes = {
          '1': 'Sphere',
          '2': 'Box', 
          '3': 'Cylinder',
          '4': 'Cone',
          '5': 'Capsule'
        };
        shootObject(geometryTypes[event.key]);
        setFKeyHeld(false);
      }
    };

    const handleKeyUp = (event) => {
      // Only handle key up if canvas is focused or mouse is over it
      if (!isCanvasFocused && document.activeElement !== gl.domElement) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        setFKeyHeld(false);
      }
    };

    const shootObject = (type) => {
      // Calculate direction from camera
      const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const position = camera.position.clone().add(direction.clone().multiplyScalar(2));
      const velocity = direction.clone().multiplyScalar(20);
      
      onShoot({
        position: position.toArray(),
        velocity: velocity.toArray(),
        type: type
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, onShoot, fKeyHeld, isCanvasFocused, gl]);

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
    <gridHelper args={[30, 30, 0x333333, 0x1a1a1a]} position={[0, -0.01, 0]} />
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

    // Smaller default multipliers and minimum caps for more compact vectors
    const headHeight = Math.max(length * 0.18, 0.06);
    const headRadius = Math.max(length * 0.06, 0.02);
    const shaftRadius = Math.max(length * 0.012, 0.005);
    const shaftLength = Math.max(length - headHeight, 0.03);

    // Clamp radii so arrows never become excessively thick
    // Reduced maximum radii to keep arrows slimmer
    const maxHeadRadius = Math.max(0.06, length * 0.3);
    const maxShaftRadius = Math.max(0.03, length * 0.15);
    const finalHeadRadius = Math.min(headRadius, maxHeadRadius);
    const finalShaftRadius = Math.min(shaftRadius, maxShaftRadius);

    // Apply scales and positions
    shaft.scale.set(finalShaftRadius, shaftLength, finalShaftRadius);
    shaft.position.set(0, shaftLength / 2, 0);

    cone.scale.set(finalHeadRadius, headHeight, finalHeadRadius);
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
  if (backgroundType === 'normal') {
    // Default Clean Dark Theme (matches ScenePreviewRenderer)
    return <color attach="background" args={['#0d0d0d']} />;
  }

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

  // For 'space' use texture
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

function Visualizer({ scene, showSceneDetails, onToggleSceneDetails, onSceneUpdate }) {
    // Simulation state from SimulationContext
    const { 
        isPlaying, 
        simulationTime, 
        fps, 
        showVelocityVectors, 
        vectorScale, 
        openGraphs, 
        resetTrigger, 
        loopMode, 
        setIsPlaying, 
        dataTimeStep, 
        simulationSpeed, 
        showGrid, 
        showAxes, 
        setShowGrid, 
        setShowAxes, 
        showStats, 
        zenMode, 
        setZenMode,
        setObjectHistory,
        updateSimulationTime,
        updateFps,
        resetSimulation,
        loopReset,
        removeGraph
    } = useSimulation();

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
    const shotTimersRef = useRef({}); // Track removal timers for shot objects

    // Process scene function calls when scene changes - MEMOIZED to prevent re-processing
    // Use scene._version to force re-processing when scene is updated via patches
    const processedSceneMemo = useMemo(() => {
        if (scene) {
            console.log('🎬 Visualizer: Processing scene functions for:', scene.id, 'version:', scene._version || 0);
            console.log('🎬 Scene before processing:', { objects: scene.objects?.length || 0, functionCalls: scene.functionCalls?.length || 0 });
            const processed = functionCallSystem.processSceneFunctions(scene);

            // Log any errors that occurred during processing
            if (processed.errors && processed.errors.length > 0) {
                console.error('❌ Scene processing errors:', processed.errors);
                console.error('❌ Failed scene details:', { id: scene.id, functionCalls: scene.functionCalls });
            } else {
                console.log('✅ Scene processed successfully');
            }

            console.log(`✅ Scene processed: ${scene.objects?.length || 0} → ${processed.objects?.length || 0} objects`);
            console.log('✅ Processed scene details:', { objects: processed.objects?.length || 0, joints: processed.joints?.length || 0, errors: processed.errors?.length || 0 });
            return processed;
        }
        console.log('🎬 No scene to process');
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

        // Check boundary for shot objects
        if (id.startsWith('__physics_visualizer_shot_')) {
          const distance = Math.sqrt(
            info.position[0] * info.position[0] + 
            info.position[1] * info.position[1] + 
            info.position[2] * info.position[2]
          );
          
          // Remove shot objects that exceed boundary (50 units from origin)
          if (distance > 50) {
            console.log(`🗑️ Removing shot object ${id} - exceeded boundary (distance: ${distance.toFixed(2)})`);
            
            // Remove from scene immediately - use original scene state
            const currentScene = scene;
            const sceneWithoutObject = {
              ...currentScene,
              objects: (currentScene.objects || [])
                .filter(obj => obj.id !== id)
                .map(obj => ({ ...obj })), // Deep copy remaining objects
              _isShootingUpdate: true,
              _version: (currentScene._version || 0) + 1
            };
            
            if (onSceneUpdate) {
              onSceneUpdate(sceneWithoutObject);
            }

            // Clear the timeout for this shot since it's being removed by boundary
            if (shotTimersRef.current[id]) {
              clearTimeout(shotTimersRef.current[id]);
              delete shotTimersRef.current[id];
            }
          }
        }
      }
    });
    
    // No more React state updates here! 
    // Subscribers (graphs, UI) get updates via event system at their own rate
  }, [onSceneUpdate, scene]);

  const handleShoot = useCallback((shotData) => {
    if (!onSceneUpdate) return;

    // Create a unique ID for the shot object - make it extremely unique to avoid collisions
    const shotId = `__physics_visualizer_shot_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Default to sphere if no type specified
    const objectType = shotData.type || 'Sphere';
    
    // Create object based on type using existing geometry definitions
    let ballObject;
    
    switch (objectType) {
      case 'Sphere':
        ballObject = {
          id: shotId,
          type: 'Sphere',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          mass: 0.2,
          material: {
            color: '#ff4444',
            friction: 0.5,
            restitution: 0.8
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Box':
        ballObject = {
          id: shotId,
          type: 'Box',
          position: shotData.position,
          velocity: shotData.velocity,
          dimensions: [0.4, 0.4, 0.4],
          mass: 0.3,
          material: {
            color: '#44ff44',
            friction: 0.6,
            restitution: 0.6
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Cylinder':
        ballObject = {
          id: shotId,
          type: 'Cylinder',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          height: 0.6,
          mass: 0.25,
          material: {
            color: '#4444ff',
            friction: 0.5,
            restitution: 0.7
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Cone':
        ballObject = {
          id: shotId,
          type: 'Cone',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          height: 0.6,
          mass: 0.2,
          material: {
            color: '#ff44ff',
            friction: 0.5,
            restitution: 0.8
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Capsule':
        ballObject = {
          id: shotId,
          type: 'Capsule',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.15,
          height: 0.6,
          mass: 0.25,
          material: {
            color: '#ffff44',
            friction: 0.5,
            restitution: 0.7
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      default:
        // Default to sphere
        ballObject = {
          id: shotId,
          type: 'Sphere',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          mass: 0.2,
          material: {
            color: '#ff4444',
            friction: 0.5,
            restitution: 0.8
          },
          physics: {
            type: 'dynamic'
          }
        };
    }

    // Add the object to the scene - update the original scene, not the processed one
    const updatedScene = {
      ...scene, // Use original scene, not activeScene (processed)
      objects: [
        ...(scene.objects || []).map(obj => ({ ...obj })), // Deep copy original scene objects
        { ...ballObject } // Fresh copy of new object
      ],
      _isShootingUpdate: true, // Flag to indicate this update is from shooting
      _version: (scene._version || 0) + 1 // Increment version for proper memoization
    };

    onSceneUpdate(updatedScene);

    // Remove the object after 8 seconds (longer than before for more fun)
    // Capture the current scene state for this specific shot
    const sceneSnapshot = { ...scene };
    const timerId = setTimeout(() => {
      if (onSceneUpdate) {
        // Use the captured scene snapshot instead of the current scene
        const sceneWithoutObject = {
          ...sceneSnapshot,
          objects: (sceneSnapshot.objects || [])
            .filter(obj => obj.id !== shotId)
            .map(obj => ({ ...obj })), // Deep copy remaining objects
          _isShootingUpdate: true, // Flag to indicate this update is from shooting cleanup
          _version: (sceneSnapshot._version || 0) + 1 // Increment version for proper memoization
        };
        onSceneUpdate(sceneWithoutObject);
        
        // Clean up the timer reference
        delete shotTimersRef.current[shotId];
      }
    }, 8000);
    
    // Store the timer reference for this shot
    shotTimersRef.current[shotId] = timerId;
  }, [onSceneUpdate, scene]);

    useEffect(() => {
        // Clear PhysicsDataStore on scene change
        // Don't pause simulation if this is a shooting update
        if (!scene?._isShootingUpdate) {
            physicsDataStore.clear();
            physicsDataStore.setUpdateRates(100, 500, dataTimeStep);
            historyRef.current = {};
            lastRecordTimeRef.current = {};
            setObjectHistory({});
            setPhysicsData({ velocities: {}, positions: {} });
            setIsPlaying(false);
        } else {
            // For shooting updates, just update the data rates
            physicsDataStore.setUpdateRates(100, 500, dataTimeStep);
        }
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

    // Clean up shot timers when scene changes (not shooting updates)
    useEffect(() => {
        if (!scene?._isShootingUpdate) {
            // Clear all active shot timers when scene changes
            Object.values(shotTimersRef.current).forEach(timerId => {
                clearTimeout(timerId);
            });
            shotTimersRef.current = {};
        }
    }, [scene]);

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

    // Clean up shot timers on unmount
    useEffect(() => {
        return () => {
            Object.values(shotTimersRef.current).forEach(timerId => {
                clearTimeout(timerId);
            });
            shotTimersRef.current = {};
        };
    }, []);

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
                        dpr={Math.min(window.devicePixelRatio, 2)}
                        performance={{ min: 0.5 }}
                        gl={{ 
                            logLevel: 'errors', 
                            preserveDrawingBuffer: false,
                            antialias: true,
                            powerPreference: 'high-performance',
                            alpha: false,
                            stencil: false,
                            depth: true
                        }}
                        camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 200000 }}
                        onError={() => setCanvasError(true)}
                        onCreated={({ gl }) => {
                            window._webglContext = gl;
                            // Ensure crisp rendering
                            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                            try {
                                r3fCanvasRef.current = gl.domElement;
                                if (r3fCanvasRef.current) r3fCanvasRef.current.dataset.engine = 'three.js';
                            } catch (e) {
                                console.warn('Could not set r3fCanvasRef:', e);
                            }
                        }}
                    >
                        <TimeUpdater isPlaying={isPlaying} updateSimulationTime={updateSimulationTime} />
                        <ShootingHandler onShoot={handleShoot} />
                        <ambientLight intensity={1.0} />
                        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
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
