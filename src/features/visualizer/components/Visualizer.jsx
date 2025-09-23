import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import './Visualizer.css';

// Import physics calculations and engine components
import { GravitationalPhysics } from '../../../core/physics/gravitation/calculations';
import {
    PhysicsForceApplier,
    Sphere,
    Box,
    Cylinder,
    SceneBox,
    GroundPlane
} from '../../../core/physics/engine.jsx';

// Import the separate, self-contained graph component
import OverlayGraph from './OverlayGraph';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import { useWorkspace } from '../../../contexts/WorkspaceContext';

const MAX_HISTORY_POINTS = 2000;

// --- Visualizer-specific helper components ---
function TimeUpdater({ isPlaying, updateSimulationTime }) { 
  useFrame((state, delta) => { 
    if (isPlaying) updateSimulationTime(prevTime => prevTime + delta); 
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
function VelocityVector({ api, velocityData, velocityScale }) { 
  const groupRef = useRef(); 
  const positionRef = useRef([0, 0, 0]); 
  useEffect(() => { 
    if (api) { 
      const unsubscribe = api.position.subscribe(p => { positionRef.current = [...p]; }); 
      return unsubscribe; 
    } 
  }, [api]); 
  useFrame(() => { 
    if (groupRef.current && positionRef.current) { 
      const [x, y, z] = positionRef.current; 
      groupRef.current.position.set(x, y, z); 
    } 
  }); 
  if (!velocityData || !Array.isArray(velocityData)) return null; 
  const velocityVector = new THREE.Vector3().fromArray(velocityData); 
  const scaledVelocityVec = velocityVector.multiplyScalar(velocityScale); 
  if (scaledVelocityVec.length() < 0.01) return null; 
  return (<group ref={groupRef}><Arrow vec={scaledVelocityVec} color="white" /></group>); 
}
function VelocityVectorVisuals({ show, velocities, objectApis, velocityScale }) {
  if (!show || !velocities) return null;
  return (<>{Object.entries(velocities).map(([id, velocity]) => {
    const api = objectApis.current[id];
    if (!api) return null;
    return (<VelocityVector key={id} api={api} velocityData={velocity} velocityScale={velocityScale} />);
  })}</>);
}

function Visualizer({ scene }) {
    const { isPlaying, simulationTime, fps, showVelocityVectors, vectorScale, openGraphs, resetSimulation, updateSimulationTime, updateFps, resetTrigger, setIsPlaying } = useWorkspace();
    const objectApis = useRef({});
    const gravitationalPhysics = useRef(new GravitationalPhysics(scene || {}));
    const initialSceneObjects = useRef(scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : []);
    const historyRef = useRef({});
    const [objectHistory, setObjectHistory] = useState({});
    const [physicsData, setPhysicsData] = useState({ velocities: {} });
    const [canvasError, setCanvasError] = useState(false);
    const r3fCanvasRef = useRef(null);

    const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = scene || {};
    const objectsToRender = scene?.objects || [];

    const defaultContactMaterial = {
        friction: contactMaterial.friction || 0.5,
        restitution: contactMaterial.restitution || 0.7
    };

    const setApi = useCallback((id, api) => { objectApis.current[id] = api; }, []);

    const onPhysicsUpdate = useCallback(({ id, time, position }) => {
        if (!historyRef.current[id]) historyRef.current[id] = [];
        const history = historyRef.current[id];
        const lastPoint = history[history.length - 1];

        if (!lastPoint || (position[0] - lastPoint.x) ** 2 + (position[1] - lastPoint.y) ** 2 + (position[2] - lastPoint.z) ** 2 > 1e-8) {
            history.push({ t: time, x: position[0], y: position[1], z: position[2] });
            if (history.length > MAX_HISTORY_POINTS) history.shift();
        }
    }, []);

    const handleReset = useCallback(() => {
        historyRef.current = {};
        setObjectHistory({});
        setPhysicsData({ velocities: {} });
        gravitationalPhysics.current.currentPositions = {};
        gravitationalPhysics.current.currentVelocities = {};

        initialSceneObjects.current.forEach(config => {
            const api = objectApis.current[config.id];
            if (api) {
                api.wakeUp();
                const pos = config.position || [0, 0, 0];
                const vel = config.velocity || [0, 0, 0];
                api.position.set(...pos);
                api.velocity.set(...vel);
                api.rotation.set(...(config.rotation || [0, 0, 0]));
                api.angularVelocity.set(...(config.angularVelocity || [0, 0, 0]));
                gravitationalPhysics.current.updatePosition(config.id, pos);
                gravitationalPhysics.current.updateVelocity(config.id, vel);
            }
        });
    }, []);

    const handlePhysicsDataCalculated = useCallback((data) => { 
      setPhysicsData(data); 
    }, []);

    useEffect(() => {
        initialSceneObjects.current = scene?.objects?.map((obj, i) => ({
            ...obj,
            id: obj.id ?? `${obj.type?.toLowerCase() || 'obj'}-${i}`
        })) || [];
        gravitationalPhysics.current = new GravitationalPhysics(scene || {});
        handleReset();
        setIsPlaying(false);
    }, [scene, handleReset, setIsPlaying]);

    useEffect(() => {
        const i = setInterval(() => {
            if (Object.keys(historyRef.current).length) setObjectHistory({ ...historyRef.current });
        }, 200);
        return () => clearInterval(i);
    }, []);

    // Reset objects when resetTrigger changes
    useEffect(() => {
        if (resetTrigger > 0) {
            handleReset();
        }
    }, [resetTrigger, handleReset]);

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

    return (
        <div className="visualizer-container">
            <div className="controllbar">
            </div>
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
                        <Physics key={`physics-${scene?.id || 'default'}`} gravity={gravity} defaultContactMaterial={defaultContactMaterial} isPaused={!isPlaying}>
                            <PhysicsForceApplier scene={scene} objectApis={objectApis} gravitationalPhysics={gravitationalPhysics} isPlaying={isPlaying} onPhysicsDataCalculated={handlePhysicsDataCalculated} />
                            {hasGround && <GroundPlane />}
                            {objectsToRender.map((obj, index) => {
                                const objectId = obj.id ?? `${obj.type?.toLowerCase() || 'obj'}-${index}`;
                                const configWithId = { ...obj, id: objectId };
                                const commonProps = { config: configWithId, id: objectId, setApi, onPhysicsUpdate, gravitationalPhysics, isPlaying };

                                switch (configWithId.type) {
                                    case "Sphere":
                                        return <Sphere key={objectId} {...commonProps} />;
                                    case "Box":
                                        return <Box key={objectId} {...commonProps} />;
                                    case "Cylinder":
                                        return <Cylinder key={objectId} {...commonProps} />;
                                    case "Plane":
                                        return <SceneBox key={objectId} config={{ ...configWithId, mass: configWithId.mass ?? 0 }} id={objectId} setApi={setApi} />;
                                    default:
                                        return null;
                                }
                            })}
                        </Physics>
                        <VelocityVectorVisuals show={showVelocityVectors} velocities={physicsData.velocities} objectApis={objectApis} velocityScale={vectorScale} />
                        <OrbitControls />
                        <LabeledAxesHelper size={5} />
                        <SimpleGrid show={hasGround} />
                        <FpsCounter updateFps={updateFps} />
                    </Canvas>
                )}

                {/* The graphs are now rendered inside the main content area */}
                {openGraphs.map((graphConfig, index) => (
                    <OverlayGraph
                        key={graphConfig.id}
                        id={graphConfig.id}
                        initialType={graphConfig.initialType}
                        data={objectHistory}
                        onClose={useWorkspace().removeGraph}
                        initialPosition={{ x: 20 + index * 30, y: 20 + index * 30 }}
                    />
                ))}
            </div>
        </div>
    );
}

export { GravitationalPhysics };
export default Visualizer;
