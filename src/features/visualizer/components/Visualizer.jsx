import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
import SceneConsole from './SceneConsole';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faChartLine, faChevronDown, faChevronUp, faEye, faEyeSlash, faCube, faCamera } from '@fortawesome/free-solid-svg-icons';

const MAX_HISTORY_POINTS = 2000;

// --- Visualizer-specific helper components ---
function TimeUpdater({ isPlaying, setCurrentTime }) { useFrame((state, delta) => { if (isPlaying) setCurrentTime(prevTime => prevTime + delta); }); return null; }
function FpsCounter({ setFps }) { const lastTimeRef = useRef(performance.now()); const frameCountRef = useRef(0); useFrame(() => { const now = performance.now(); frameCountRef.current += 1; const delta = now - lastTimeRef.current; if (delta >= 1000) { setFps(Math.round((frameCountRef.current * 1000) / delta)); frameCountRef.current = 0; lastTimeRef.current = now; } }); return null; }
function SimpleGrid({ show }) { if (!show) return null; return (<Grid position={[0, 0.01, 0]} args={[1000, 1000]} cellColor="#aaaaaa" sectionColor="#000000" sectionSize={10} cellSize={1} fadeDistance={200} fadeStrength={1} infiniteGrid={false} />); }
function LabeledAxesHelper({ size = 5 }) { const textProps = { fontSize: 0.5, anchorX: 'center', anchorY: 'middle' }; return (<group><axesHelper args={[size]} /><Text color="red" position={[size * 1.1, 0, 0]} {...textProps}>X</Text><Text color="green" position={[0, size * 1.1, 0]} {...textProps}>Y</Text><Text color="blue" position={[0, 0, size * 1.1]} {...textProps}>Z</Text></group>); }
function Arrow({ vec, color }) { const groupRef = useRef(); const shaftRef = useRef(); const coneRef = useRef(); const geometries = useMemo(() => ({ shaft: new THREE.CylinderGeometry(1, 1, 1, 8), cone: new THREE.ConeGeometry(1, 1, 8) }), []); useEffect(() => { return () => { geometries.shaft.dispose(); geometries.cone.dispose(); }; }, [geometries]); useEffect(() => { const group = groupRef.current; const shaft = shaftRef.current; const cone = coneRef.current; if (!group || !shaft || !cone) return; const length = vec.length(); if (length < 1e-4) { group.visible = false; return; } group.visible = true; const start = new THREE.Vector3(0, 1, 0); const end = vec.clone().normalize(); const quaternion = new THREE.Quaternion(); quaternion.setFromUnitVectors(start, end); group.quaternion.copy(quaternion); const headHeight = Math.max(length * 0.25, 0.1); const headRadius = Math.max(length * 0.1, 0.05); const shaftRadius = Math.max(length * 0.03, 0.02); const shaftLength = Math.max(length - headHeight, 0.1); shaft.scale.set(shaftRadius, shaftLength, shaftRadius); shaft.position.set(0, shaftLength / 2, 0); cone.scale.set(headRadius, headHeight, headRadius); cone.position.set(0, shaftLength + headHeight / 2, 0); }, [vec, geometries]); return (<group ref={groupRef}><mesh ref={shaftRef} geometry={geometries.shaft}><meshStandardMaterial color={color} /></mesh><mesh ref={coneRef} geometry={geometries.cone}><meshStandardMaterial color={color} /></mesh></group>); }
function VelocityVector({ api, velocityData, velocityScale }) { const groupRef = useRef(); const positionRef = useRef([0, 0, 0]); useEffect(() => { if (api) { const unsubscribe = api.position.subscribe(p => { positionRef.current = [...p]; }); return unsubscribe; } }, [api]); useFrame(() => { if (groupRef.current && positionRef.current) { const [x, y, z] = positionRef.current; groupRef.current.position.set(x, y, z); } }); if (!velocityData || !Array.isArray(velocityData)) return null; const velocityVector = new THREE.Vector3().fromArray(velocityData); const scaledVelocityVec = velocityVector.multiplyScalar(velocityScale); if (scaledVelocityVec.length() < 0.01) return null; return (<group ref={groupRef}><Arrow vec={scaledVelocityVec} color="white" /></group>); }
function VelocityVectorVisuals({ show, velocities, objectApis, velocityScale }) { if (!show || !velocities) return null; return (<>{Object.entries(velocities).map(([id, velocity]) => { const api = objectApis.current[id]; if (!api) return null; return (<VelocityVector key={id} api={api} velocityData={velocity} velocityScale={velocityScale} />); })}</>); }


// --- Main Visualizer Component ---
function Visualizer({ scene, onAddGraph: onExternalAddGraph, pendingChanges, isPreviewMode, onAcceptChanges, onRejectChanges, onThumbnailCapture, uiMode = 'simple', onModeChange }) {
    const [fps, setFps] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [vectorScale, setVectorScale] = useState(1.5);
    const objectApis = useRef({});
    const gravitationalPhysics = useRef(new GravitationalPhysics(scene || {}));
    const initialSceneObjects = useRef(scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : []);
    const [openGraphs, setOpenGraphs] = useState([]);
    const historyRef = useRef({});
    const [objectHistory, setObjectHistory] = useState({});
    const [showGraphDropdown, setShowGraphDropdown] = useState(false);
    const [showVelocityVectors, setShowVelocityVectors] = useState(false);
    const [physicsData, setPhysicsData] = useState({ velocities: {} });
    const [canvasError, setCanvasError] = useState(false);
    const [thumbnailPreview, setThumbnailPreview] = useState(null);
    const [showThumbnailPreview, setShowThumbnailPreview] = useState(false);
    const r3fCanvasRef = useRef(null);

    // Apply pending changes to scene for preview
    const effectiveScene = useMemo(() => {
      if (!isPreviewMode || !pendingChanges || !scene) return scene;

      try {
        // Create a deep copy of the scene
        const sceneCopy = JSON.parse(JSON.stringify(scene));

        // Apply the pending changes
        pendingChanges.forEach(change => {
          const pathParts = change.path.split('/').filter(p => p);
          let current = sceneCopy;

          // Navigate to the parent of the target property
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (part === 'objects' && !isNaN(pathParts[i + 1])) {
              // Handle array indices for objects
              const index = parseInt(pathParts[i + 1]);
              if (!current[part]) current[part] = [];
              if (!current[part][index]) current[part][index] = {};
              current = current[part][index];
              i++; // Skip the next part since we handled it
            } else {
              if (!current[part]) current[part] = {};
              current = current[part];
            }
          }

          // Apply the change
          const lastPart = pathParts[pathParts.length - 1];
          if (change.op === 'replace') {
            current[lastPart] = change.value;
          } else if (change.op === 'add') {
            if (Array.isArray(current)) {
              if (lastPart === '-') {
                current.push(change.value);
              } else {
                current.splice(parseInt(lastPart), 0, change.value);
              }
            } else {
              current[lastPart] = change.value;
            }
          } else if (change.op === 'remove') {
            if (Array.isArray(current)) {
              current.splice(parseInt(lastPart), 1);
            } else {
              delete current[lastPart];
            }
          }
        });

        return sceneCopy;
      } catch (error) {
        console.error('Error applying preview changes:', error);
        return scene;
      }
    }, [scene, pendingChanges, isPreviewMode]);

    const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = effectiveScene || {};
    const objectsToRender = effectiveScene?.objects || [];


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
        setIsPlaying(false);
        setCurrentTime(0);
    }, []);

    const handleAddGraph = useCallback((type) => {
        const id = `graph-${Date.now()}`;
        setOpenGraphs(prev => [...prev, { id, initialType: type }]);
        setShowGraphDropdown(false);
        if (typeof onExternalAddGraph === 'function') onExternalAddGraph({ id, initialType: type });
    }, [onExternalAddGraph]);

    const handleCloseGraph = useCallback((id) => setOpenGraphs(prev => prev.filter(g => g.id !== id)), []);
    const handlePhysicsDataCalculated = useCallback((data) => { setPhysicsData(data); }, []);

    // Thumbnail capture functionality
    const handleThumbnailCapture = useCallback(() => {
        // Find the React Three Fiber canvas specifically
        const canvas = document.querySelector('canvas[data-engine="three.js"]') ||
                      document.querySelector('.visualizer-container canvas') ||
                      document.querySelector('canvas');
        if (!canvas) {
            console.error('❌ No canvas found for thumbnail capture');
            return;
        }

        try {
            // Create a low-resolution thumbnail (350x180 to match collection card size)
            const thumbnailCanvas = document.createElement('canvas');
            const ctx = thumbnailCanvas.getContext('2d');

            // Set thumbnail dimensions (maintain aspect ratio)
            const aspectRatio = canvas.width / canvas.height;
            const thumbnailWidth = 350;
            const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio);

            thumbnailCanvas.width = thumbnailWidth;
            thumbnailCanvas.height = thumbnailHeight;

            // Draw and resize the canvas content
            // Fill with white first so transparent areas in the WebGL canvas don't become black when
            // exporting to JPEG (JPEG doesn't support alpha and browsers render transparent as black).
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
            ctx.drawImage(canvas, 0, 0, thumbnailWidth, thumbnailHeight);

            // Convert to data URL
            const thumbnailDataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.8);

            // Show preview instead of directly saving
            setThumbnailPreview(thumbnailDataUrl);
            setShowThumbnailPreview(true);

            console.log('📸 Thumbnail captured successfully - showing preview');
        } catch (error) {
            console.error('❌ Failed to capture thumbnail:', error);
        }
    }, []);

    // Handle thumbnail confirmation
    const handleThumbnailConfirm = useCallback(() => {
        if (thumbnailPreview && onThumbnailCapture) {
            onThumbnailCapture(thumbnailPreview);
            console.log('✅ Thumbnail confirmed and saved');
        }
        setShowThumbnailPreview(false);
        setThumbnailPreview(null);
    }, [thumbnailPreview, onThumbnailCapture]);

    // Handle thumbnail rejection
    const handleThumbnailReject = useCallback(() => {
        console.log('❌ Thumbnail rejected');
        setShowThumbnailPreview(false);
        setThumbnailPreview(null);
    }, []);

    useEffect(() => {
        initialSceneObjects.current = scene?.objects?.map((obj, i) => ({
            ...obj,
            id: obj.id ?? `${obj.type?.toLowerCase() || 'obj'}-${i}`
        })) || [];
        gravitationalPhysics.current = new GravitationalPhysics(scene || {});
        handleReset();
    }, [scene, handleReset]);

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

    return (
        <div className="visualizer-container">
            <div className="controllbar">
                {/* Mode Toggle */}
                <div className="mode-toggle">
                    <button
                        className={`mode-btn ${uiMode === 'simple' ? 'active' : ''}`}
                        onClick={() => onModeChange && onModeChange('simple')}
                        title="Simple mode - Educational focus with basic controls"
                    >
                        📚 Simple
                    </button>
                    <button
                        className={`mode-btn ${uiMode === 'advanced' ? 'active' : ''}`}
                        onClick={() => onModeChange && onModeChange('advanced')}
                        title="Advanced mode - Full control suite for detailed analysis"
                    >
                        ⚙️ Advanced
                    </button>
                </div>

                {/* Simple Mode Controls */}
                {uiMode === 'simple' && (
                    <>
                        <button onClick={() => setShowVelocityVectors(p => !p)}>
                            <FontAwesomeIcon icon={showVelocityVectors ? faEye : faEyeSlash} style={{ marginRight: '8px' }} />
                            Show Vectors
                        </button>
                        <div className="graphs-dropdown-container">
                            <button onClick={() => setShowGraphDropdown(prev => !prev)}>
                                <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '5px' }} />
                                Add Graph
                                <FontAwesomeIcon icon={showGraphDropdown ? faChevronUp : faChevronDown} style={{ marginLeft: '5px' }} />
                            </button>
                            {showGraphDropdown && (
                                <div className="graphs-dropdown-menu">
                                    {[
                                        { label: 'Position vs Time', value: 'yvt' },
                                        { label: 'Trajectory', value: 'yvx' }
                                    ].map(plotType => (
                                        <button key={plotType.value} onClick={() => handleAddGraph(plotType.value)} className="dropdown-item">
                                            {plotType.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Advanced Mode Controls */}
                {uiMode === 'advanced' && (
                    <>
                        <button onClick={() => setShowVelocityVectors(p => !p)}>
                            <FontAwesomeIcon icon={showVelocityVectors ? faEye : faEyeSlash} style={{ marginRight: '8px' }} />
                            Velocity Vectors
                        </button>
                        <div className="vector-scale-control">
                            <button onClick={() => setVectorScale(s => Math.max(0.1, s - 0.2))}>
                                <FontAwesomeIcon icon={faChevronDown} />
                            </button>
                            <span>Scale: {vectorScale.toFixed(1)}x</span>
                            <button onClick={() => setVectorScale(s => s + 0.2)}>
                                <FontAwesomeIcon icon={faChevronUp} />
                            </button>
                        </div>
                        <button onClick={handleThumbnailCapture} title="Capture Thumbnail">
                            <FontAwesomeIcon icon={faCamera} style={{ marginRight: '8px' }} />
                            Capture Thumbnail
                        </button>
                        <div className="graphs-dropdown-container">
                            <button onClick={() => setShowGraphDropdown(prev => !prev)}>
                                <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '5px' }} />
                                Graphs
                                <FontAwesomeIcon icon={showGraphDropdown ? faChevronUp : faChevronDown} style={{ marginLeft: '5px' }} />
                            </button>
                            {showGraphDropdown && (
                                <div className="graphs-dropdown-menu">
                                    {[
                                        { label: 'Y vs T', value: 'yvt' },
                                        { label: 'X vs T', value: 'xvt' },
                                        { label: 'Z vs T', value: 'zvt' },
                                        { label: 'Y vs X', value: 'yvx' }
                                    ].map(plotType => (
                                        <button key={plotType.value} onClick={() => handleAddGraph(plotType.value)} className="dropdown-item">
                                            {plotType.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
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
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        shadows
                        // preserveDrawingBuffer allows readback (toDataURL/drawImage) of the rendered frame.
                        // Without this the canvas content may be cleared and produce a black image when captured.
                        gl={{ logLevel: 'errors', preserveDrawingBuffer: true }}
                        camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 200000 }}
                        onError={() => setCanvasError(true)}
                        onCreated={({ gl }) => {
                            // Store WebGL context for cleanup
                            window._webglContext = gl;
                            try {
                                // Save a direct reference to the renderer's canvas for reliable capture
                                r3fCanvasRef.current = gl.domElement;
                                if (r3fCanvasRef.current) r3fCanvasRef.current.dataset.engine = 'three.js';
                            } catch (e) {
                                console.warn('Could not set r3fCanvasRef:', e);
                            }
                        }}
                    >
                        <TimeUpdater isPlaying={isPlaying} setCurrentTime={setCurrentTime} />
                        <ambientLight intensity={0.6} />
                        <directionalLight position={[8, 10, 5]} intensity={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                        <Physics gravity={gravity} defaultContactMaterial={defaultContactMaterial} isPaused={!isPlaying}>
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
                        <FpsCounter setFps={setFps} />
                    </Canvas>
                )}

                {/* The graphs are now rendered inside the main content area */}
                {openGraphs.map((graphConfig, index) => (
                    <OverlayGraph
                        key={graphConfig.id}
                        id={graphConfig.id}
                        initialType={graphConfig.initialType}
                        data={objectHistory}
                        onClose={handleCloseGraph}
                        initialPosition={{ x: 20 + index * 30, y: 20 + index * 30 }}
                    />
                ))}

                <div className="fps-counter">FPS: {fps}</div>

                {/* Scene Console for AI Changes Preview */}
                <SceneConsole
                    changes={pendingChanges}
                    isVisible={isPreviewMode && pendingChanges && pendingChanges.length > 0}
                    onAccept={onAcceptChanges}
                    onReject={onRejectChanges}
                />
            </div>

            <div className="timeControllbar">
                <button onClick={() => setIsPlaying(p => !p)}><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></button>
                <button onClick={handleReset}><FontAwesomeIcon icon={faRedo} /></button>
                <span className="time-display">Time: {currentTime.toFixed(3)}s</span>
            </div>

            {/* Thumbnail Preview Modal */}
            {showThumbnailPreview && thumbnailPreview && (
                <div className="thumbnail-preview-modal" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000
                }}>
                    <div className="thumbnail-preview-content" style={{
                        backgroundColor: '#2c2c2c',
                        borderRadius: '8px',
                        padding: '20px',
                        maxWidth: '400px',
                        width: '90%',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>📸 Confirm Thumbnail</h3>
                        <div style={{
                            border: '2px solid #007acc',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            marginBottom: '20px'
                        }}>
                            <img
                                src={thumbnailPreview}
                                alt="Scene thumbnail preview"
                                style={{
                                    width: '100%',
                                    height: 'auto',
                                    display: 'block'
                                }}
                            />
                        </div>
                        <p style={{ color: '#cccccc', marginBottom: '20px', fontSize: '14px' }}>
                            This thumbnail will be used in your scene collection. You can always capture a new one later.
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button
                                onClick={handleThumbnailConfirm}
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ✅ Accept
                            </button>
                            <button
                                onClick={handleThumbnailReject}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ❌ Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export { GravitationalPhysics };
export default Visualizer;
