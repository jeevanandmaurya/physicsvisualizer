import React, { useRef, useEffect, useCallback, useState } from 'react';
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
    shaft: new THREE.CylinderGeometry(1, 1, 1, 8), 
    cone: new THREE.ConeGeometry(1, 1, 8) 
  }), []); 
  useEffect(() => { return () => { geometries.shaft.dispose(); geometries.cone.dispose(); }; }, [geometries]); 
  useEffect(() => { 
    const group = groupRef.current; 
    const shaft = shaftRef.current; 
    const cone = coneRef.current; 
    if (!group || !shaft || !cone) return; 
    const length = vec.length(); 
    if (length < 1e-4) { 
      group.visible = false; 
      return; 
    } 
    group.visible = true; 
    const start = new THREE.Vector3(0, 1, 0); 
    const end = vec.clone().normalize(); 
    const quaternion = new THREE.Quaternion(); 
    quaternion.setFromUnitVectors(start, end); 
    group.quaternion.copy(quaternion); 
    const headHeight = Math.max(length * 0.25, 0.1); 
    const headRadius = Math.max(length * 0.1, 0.05); 
    const shaftRadius = Math.max(length * 0.03, 0.02); 
    const shaftLength = Math.max(length - headHeight, 0.1); 
    shaft.scale.set(shaftRadius, shaftLength, shaftRadius); 
    shaft.position.set(0, shaftLength / 2, 0); 
    cone.scale.set(headRadius, headHeight, headRadius); 
    cone.position.set(0, shaftLength + headHeight / 2, 0); 
  }, [vec, geometries]); 
  return (<group ref={groupRef}><mesh ref={shaftRef} geometry={geometries.shaft}><meshStandardMaterial color={color} /></mesh><mesh ref={coneRef} geometry={geometries.cone}><meshStandardMaterial color={color} /></mesh></group>); 
}
function VelocityVector({ position, velocityData, velocityScale, color }) {
  if (!velocityData || !Array.isArray(velocityData)) return null;
  const velocityVector = new THREE.Vector3().fromArray(velocityData);
  const scaledVelocityVec = velocityVector.multiplyScalar(velocityScale);
  if (scaledVelocityVec.length() < 0.01) return null;

  return (
    <group position={position || [0, 0, 0]}>
      <Arrow vec={scaledVelocityVec} color={color || "#00ff88"} />
    </group>
  );
}
function VelocityVectorVisuals({ show, velocities, velocityScale, sceneObjects }) {
  if (!show || !velocities || !sceneObjects) return null;

  return sceneObjects.map((obj) => {
    const velocity = velocities[obj.id];
    if (!velocity || !Array.isArray(velocity)) return null;

    const velocityVector = new THREE.Vector3().fromArray(velocity);
    if (velocityVector.length() < 0.01) return null;

    return (
      <VelocityVector
        key={`velocity-${obj.id}`}
        position={obj.position || [0, 0, 0]}
        velocityData={velocity}
        velocityScale={velocityScale || 1}
        color="#00ff88"
      />
    );
  });
}

function Skybox({ texturePath }) {
  const texture = useTexture(texturePath || backgroundTexture);
  return (
    <mesh>
      <sphereGeometry args={[100000, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Visualizer({ scene, showSceneDetails, onToggleSceneDetails }) {
    const { isPlaying, simulationTime, fps, showVelocityVectors, vectorScale, openGraphs, resetSimulation, loopReset, updateSimulationTime, updateFps, resetTrigger, removeGraph, setObjectHistory, loopMode, setIsPlaying } = useWorkspace();

    // Debug: Log scene changes
    useEffect(() => {
        console.log('Visualizer: Scene updated:', scene?.id, scene?.gravity, scene?.objects?.map(o => ({ id: o.id, mass: o.mass })));
    }, [scene]);

    const historyRef = useRef({});
    const lastLoopResetRef = useRef(0);
    const [physicsData, setPhysicsData] = useState({ velocities: {} });
    const [canvasError, setCanvasError] = useState(false);
    const r3fCanvasRef = useRef(null);

    const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = scene || {};
    const objectsToRender = scene?.objects || [];

    const defaultContactMaterial = {
        friction: contactMaterial.friction || 0.5,
        restitution: contactMaterial.restitution || 0.7
    };

    const handlePhysicsDataCalculated = useCallback((data) => { 
      setPhysicsData(data); 
    }, []);

    useEffect(() => {
        historyRef.current = {};
        setObjectHistory({});
        setPhysicsData({ velocities: {} });
        setIsPlaying(false);
    }, [scene, setIsPlaying]);

    useEffect(() => {
        const i = setInterval(() => {
            if (Object.keys(historyRef.current).length) setObjectHistory({ ...historyRef.current });
        }, 200);
        return () => clearInterval(i);
    }, []);

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
                            scene={scene}
                            isPlaying={isPlaying}
                            onPhysicsDataCalculated={handlePhysicsDataCalculated}
                            resetTrigger={resetTrigger}
                        />
                        <VelocityVectorVisuals show={showVelocityVectors} velocities={physicsData.velocities} velocityScale={vectorScale} sceneObjects={objectsToRender} />
                        <OrbitControls />
                        <LabeledAxesHelper size={5} />
                        <SimpleGrid show={hasGround} />
                        <FpsCounter updateFps={updateFps} />
                        <Skybox texturePath={scene?.type === 'extraterrestrial' || scene?.theme === 'space' ? spaceTexture : backgroundTexture} />
                    </Canvas>
                )}


            </div>
        </div>
    );
}

export default Visualizer;
