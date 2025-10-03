import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Import physics calculations and engine components
import { PhysicsWorld } from '../../core/physics/engine.jsx';



// Import assets
import backgroundTexture from '../../assets/background.svg';
import spaceTexture from '../../assets/space.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import SceneDetailsUI from '../../views/components/scene-management/SceneDetailsUI';
import { functionCallSystem } from '../../core/FunctionCallSystem.js';

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
  return (<Grid position={[0, 0.01, 0]} args={[1000, 1000]} cellColor="#aaaaaa" sectionColor="#000000" sectionSize={10} cellSize={1} fadeDistance={200} fadeStrength={1} infiniteGrid={false} />); 
}
function LabeledAxesHelper({ size = 5 }) { 
  const textProps = { fontSize: 0.5, anchorX: 'center', anchorY: 'middle' }; 
  return (<group><axesHelper args={[size]} /><Text color="red" position={[size * 1.1, 0, 0]} {...textProps}>X</Text><Text color="green" position={[0, size * 1.1, 0]} {...textProps}>Y</Text><Text color="blue" position={[0, 0, size * 1.1]} {...textProps}>Z</Text></group>); 
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
function VelocityVector({ position, velocityData, velocityScale, color }) {
  if (!velocityData || !Array.isArray(velocityData)) return null;
  const velocityVector = new THREE.Vector3().fromArray(velocityData);
  const scaledVelocityVec = velocityVector.multiplyScalar(velocityScale || 1);
  if (scaledVelocityVec.length() < 0.01) return null;

  return (
    <group position={position || [0, 0, 0]}>
      <Arrow vec={scaledVelocityVec} color={color || "#00ff88"} />
    </group>
  );
}
function VelocityVectorVisuals({ show, velocities, positions, velocityScale, sceneObjects }) {
  if (!show || !velocities || !sceneObjects) return null;

  const dynamicObjects = sceneObjects.filter(obj => !obj.isStatic);

  return dynamicObjects.map((obj) => {
    const velocity = velocities[obj.id];
    if (!velocity || !Array.isArray(velocity)) return null;

    const velocityVector = new THREE.Vector3().fromArray(velocity);
    if (velocityVector.length() < 0.01) return null;

    return (
      <VelocityVector
        key={`velocity-${obj.id}`}
        position={positions[obj.id] || obj.position || [0, 0, 0]}
        velocityData={velocity}
        velocityScale={velocityScale || 1}
        color="#00ff88"
      />
    );
  });
}

function Skybox({ texturePath, backgroundType = 'normal' }) {
  if (backgroundType === 'black') {
    return (
      <mesh>
        <sphereGeometry args={[100000, 60, 40]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>
    );
  }

  if (backgroundType === 'white') {
    return (
      <mesh>
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
    <mesh>
      <sphereGeometry args={[100000, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Visualizer({ scene, showSceneDetails, onToggleSceneDetails, backgroundType = 'normal' }) {
    const { isPlaying, simulationTime, fps, showVelocityVectors, vectorScale, openGraphs, resetSimulation, loopReset, updateSimulationTime, updateFps, resetTrigger, removeGraph, setObjectHistory, loopMode, setIsPlaying, dataTimeStep } = useWorkspace();

    // Debug: Log scene changes
    useEffect(() => {
        console.log('Visualizer: Scene updated:', scene?.id, scene?.gravity, scene?.objects?.map(o => ({ id: o.id, mass: o.mass })));
    }, [scene]);

    const historyRef = useRef({});
    const lastLoopResetRef = useRef(0);
    const lastRecordTimeRef = useRef({}); // Track last recorded time for each object
    const [physicsData, setPhysicsData] = useState({ velocities: {}, positions: {} });
    const [canvasError, setCanvasError] = useState(false);
    const r3fCanvasRef = useRef(null);
    const [processedScene, setProcessedScene] = useState(null);

    // Process scene function calls when scene changes
    useEffect(() => {
        if (scene) {
            console.log('🎬 Visualizer: Processing scene functions for:', scene.id);
            const processed = functionCallSystem.processSceneFunctions(scene);
            setProcessedScene(processed);

            // Log any errors that occurred during processing
            if (processed.errors && processed.errors.length > 0) {
                console.warn('⚠️ Scene processing errors:', processed.errors);
            }

            console.log(`✅ Scene processed: ${scene.objects?.length || 0} → ${processed.objects?.length || 0} objects`);
        } else {
            setProcessedScene(null);
        }
    }, [scene]);

    const activeScene = processedScene || scene;
    const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = activeScene || {};
    const objectsToRender = activeScene?.objects || [];

    const defaultContactMaterial = {
        friction: contactMaterial.friction || 0.5,
        restitution: contactMaterial.restitution || 0.7
    };

    const MAX_HISTORY_POINTS = 2000;

  const handlePhysicsDataCalculated = useCallback((data) => {
    // data format: { objectId: { velocity: [vx,vy,vz], position: [x,y,z], time: t } }
    // Merge incoming per-object updates into the existing physicsData state
    // because PhysicsObject reports one object at a time from useFrame.
    const incomingVelocities = {};
    const incomingPositions = {};

    Object.entries(data).forEach(([id, info]) => {
      if (info && info.velocity && info.position && info.time !== undefined) {
        incomingVelocities[id] = info.velocity;
        incomingPositions[id] = info.position;

        // Check if enough time has passed since last recording based on dataTimeStep
        const lastRecordTime = lastRecordTimeRef.current[id] || 0;
        const timeSinceLastRecord = info.time - lastRecordTime;

        // Only record if time step has elapsed
        if (timeSinceLastRecord >= dataTimeStep) {
          // Update history
          if (!historyRef.current[id]) {
            historyRef.current[id] = [];
          }
          const history = historyRef.current[id];

          history.push({
            t: info.time,
            x: info.position[0],
            y: info.position[1],
            z: info.position[2],
            vx: info.velocity[0],
            vy: info.velocity[1],
            vz: info.velocity[2]
          });

          // Update last record time
          lastRecordTimeRef.current[id] = info.time;

          // Keep history size manageable
          if (history.length > MAX_HISTORY_POINTS) {
            history.shift();
          }
        }
      }
    });

    // Merge with previous state so we preserve data for objects that haven't been
    // reported in this particular frame call.
    setPhysicsData(prev => ({
      velocities: { ...(prev?.velocities || {}), ...incomingVelocities },
      positions: { ...(prev?.positions || {}), ...incomingPositions }
    }));
  }, [dataTimeStep]);

    useEffect(() => {
        historyRef.current = {};
        lastRecordTimeRef.current = {};
        setObjectHistory({});
        setPhysicsData({ velocities: {}, positions: {} });
        setIsPlaying(false);
    }, [scene, setIsPlaying]);

    // Reset data when reset button is pressed (resetTrigger changes)
    useEffect(() => {
        if (resetTrigger) {
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
                        gl={{ logLevel: 'errors', preserveDrawingBuffer: true }}
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
                        />
                        <VelocityVectorVisuals show={showVelocityVectors} velocities={physicsData.velocities} positions={physicsData.positions} velocityScale={vectorScale} sceneObjects={objectsToRender} />
                        <OrbitControls />
                        <LabeledAxesHelper size={5} />
                        <SimpleGrid show={hasGround} />
                        <FpsCounter updateFps={updateFps} />
                        <Skybox backgroundType={backgroundType} />
                    </Canvas>
                )}


            </div>
        </div>
    );
}

export default Visualizer;
