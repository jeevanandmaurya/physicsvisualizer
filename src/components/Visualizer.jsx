import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, useBox, useCylinder, usePlane } from '@react-three/cannon';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import './Visualizer.css';

// Import the separate, self-contained graph component
import OverlayGraph from './OverlayGraph';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faChartLine, faChevronDown, faChevronUp, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const MAX_HISTORY_POINTS = 2000;

// --- Gravitational Physics Engine (No changes needed) ---
class GravitationalPhysics {
    constructor(scene) { 
        this.scene = scene; 
        this.G = scene.gravitationalPhysics?.gravitationalConstant || 6.67430e-11; 
        this.minDistance = scene.gravitationalPhysics?.minDistance || 1e-6; 
        this.softening = scene.gravitationalPhysics?.softening || 0; 
        this.enabled = scene.gravitationalPhysics?.enabled !== false; 
        this.simulationScale = scene.simulationScale || 'terrestrial'; 
        if (this.simulationScale === 'terrestrial' && this.G === 6.67430e-11) { 
            this.G = 6.67430e-8; 
        } 
        this.currentPositions = {}; 
        this.currentVelocities = {}; 
    }
    
    calculateGravitationalForces(objects, objectApis) { 
        if (!this.enabled || !objects || objects.length < 2) return {}; 
        const forces = {}; 
        const positions = {}; 
        const masses = {}; 
        
        objects.forEach(obj => { 
            if (obj.mass > 0 && objectApis[obj.id]) { 
                forces[obj.id] = [0, 0, 0]; 
                masses[obj.id] = obj.gravitationalMass || obj.mass; 
                positions[obj.id] = this.currentPositions[obj.id] || obj.position || [0, 0, 0]; 
            } 
        }); 
        
        const objectIds = Object.keys(positions); 
        for (let i = 0; i < objectIds.length; i++) { 
            for (let j = i + 1; j < objectIds.length; j++) { 
                const id1 = objectIds[i], id2 = objectIds[j]; 
                const obj1 = objects.find(o => o.id === id1), obj2 = objects.find(o => o.id === id2); 
                if (!obj1 || !obj2) continue; 
                
                const pos1 = positions[id1], pos2 = positions[id2]; 
                const m1 = masses[id1], m2 = masses[id2]; 
                const dx = pos2[0] - pos1[0], dy = pos2[1] - pos1[1], dz = pos2[2] - pos1[2]; 
                const distSq = dx * dx + dy * dy + dz * dz + this.softening * this.softening; 
                const dist = Math.sqrt(distSq); 
                const effectiveDistSq = Math.max(distSq, this.minDistance * this.minDistance); 
                const forceMag = (this.G * m1 * m2) / effectiveDistSq; 
                
                if (dist > 0) { 
                    const unitX = dx / dist, unitY = dy / dist, unitZ = dz / dist; 
                    const fX = forceMag * unitX, fY = forceMag * unitY, fZ = forceMag * unitZ; 
                    if (!obj1.isStatic && forces[id1]) { 
                        forces[id1][0] += fX; 
                        forces[id1][1] += fY; 
                        forces[id1][2] += fZ; 
                    } 
                    if (!obj2.isStatic && forces[id2]) { 
                        forces[id2][0] -= fX; 
                        forces[id2][1] -= fY; 
                        forces[id2][2] -= fZ; 
                    } 
                } 
            } 
        } 
        return forces; 
    }
    
    updatePosition(id, p) { this.currentPositions[id] = [...p]; } 
    updateVelocity(id, v) { this.currentVelocities[id] = [...v]; }
}

// --- Helper Components (No changes needed) ---
function GravitationalForceUpdater({ scene, objectApis, gravitationalPhysics, isPlaying, onPhysicsDataCalculated }) {
    useFrame(() => {
        if (!isPlaying || !scene?.objects) return;
        const forces = gravitationalPhysics.current.enabled ? gravitationalPhysics.current.calculateGravitationalForces(scene.objects, objectApis.current) : {};
        const velocities = {};
        scene.objects.forEach(obj => {
            const id = obj.id;
            if (objectApis.current[id] && !obj.isStatic) {
                velocities[id] = gravitationalPhysics.current.currentVelocities[id] || [0, 0, 0];
            }
        });
        onPhysicsDataCalculated({ velocities });
        Object.entries(forces).forEach(([objectId, force]) => {
            const api = objectApis.current[objectId];
            if (api && force && force.some(f => f !== 0)) {
                try { api.applyForce(force, [0, 0, 0]); } catch (e) { console.warn(`Failed to apply force to ${objectId}:`, e); }
            }
        });
    });
    return null;
}
function TimeUpdater({ isPlaying, setCurrentTime }) { useFrame((state, delta) => { if (isPlaying) setCurrentTime(prevTime => prevTime + delta); }); return null; }
function ObjectComponent({ usePhysicsHook, config, id, setApi, onPhysicsUpdate, gravitationalPhysics, isPlaying, children, args }) { const { mass, position, velocity, rotation = [0, 0, 0], restitution = 0.7, isStatic = false } = config; const [ref, api] = usePhysicsHook(() => ({ mass: isStatic ? 0 : mass, position, velocity, rotation, args, material: { restitution }, type: isStatic ? 'Static' : 'Dynamic' })); const posRef = useRef(position || [0, 0, 0]); useEffect(() => { if (api) { setApi(id, api); const unsubPos = api.position.subscribe(p => { posRef.current = [...p]; gravitationalPhysics.current?.updatePosition(id, p); }); const unsubVel = api.velocity.subscribe(v => { gravitationalPhysics.current?.updateVelocity(id, v); }); return () => { unsubPos(); unsubVel(); }; } }, [id, api, setApi, gravitationalPhysics]); useFrame((state) => { if (isPlaying) onPhysicsUpdate({ id, time: state.clock.elapsedTime, position: posRef.current }); }); return (<mesh ref={ref} castShadow>{children}<meshStandardMaterial color={config.color} opacity={config.opacity || 1.0} transparent={(config.opacity || 1.0) < 1.0} /></mesh>); }
function Sphere(props) { return (<ObjectComponent {...props} usePhysicsHook={useSphere} args={[props.config.radius]}><sphereGeometry args={[props.config.radius, 32, 32]} /></ObjectComponent>); }
function Box(props) { return (<ObjectComponent {...props} usePhysicsHook={useBox} args={props.config.dimensions || [1, 1, 1]}><boxGeometry args={props.config.dimensions || [1, 1, 1]} /></ObjectComponent>); }
function Cylinder(props) { return (<ObjectComponent {...props} usePhysicsHook={useCylinder} args={[props.config.radius, props.config.radius, props.config.height, 16]}><cylinderGeometry args={[props.config.radius, props.config.radius, props.config.height, 16]} /></ObjectComponent>); }
function SceneBox({ config, id, setApi }) { const { mass = 0, dimensions = [10, 0.2, 10], position = [0, 0, 0], velocity = [0, 0, 0], rotation = [0, 0, 0], color = "#88aa88", restitution = 0.3, opacity = 1.0 } = config; const [ref, api] = useBox(() => ({ mass, position, velocity, rotation, args: dimensions, material: { friction: 0.5, restitution } })); useEffect(() => { if (api) { setApi(id, api); } }, [id, api, setApi]); return (<mesh ref={ref} receiveShadow castShadow><boxGeometry args={dimensions} /><meshStandardMaterial color={color} opacity={opacity} transparent={opacity < 1.0} /></mesh>); }
function GroundPlane() { const [ref] = usePlane(() => ({ mass: 0, rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], material: { friction: 0.5, restitution: 0.3 } })); return (<mesh ref={ref} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#88aa88" side={THREE.DoubleSide} /></mesh>); }
function FpsCounter({ setFps }) { const lastTimeRef = useRef(performance.now()); const frameCountRef = useRef(0); useFrame(() => { const now = performance.now(); frameCountRef.current += 1; const delta = now - lastTimeRef.current; if (delta >= 1000) { setFps(Math.round((frameCountRef.current * 1000) / delta)); frameCountRef.current = 0; lastTimeRef.current = now; } }); return null; }
function SimpleGrid({ show }) { if (!show) return null; return (<Grid position={[0, 0.01, 0]} args={[100, 100]} cellColor="#aaaaaa" sectionColor="#888888" sectionSize={10} cellSize={1} fadeDistance={200} fadeStrength={1} infiniteGrid={false} />); }
function LabeledAxesHelper({ size = 5 }) { const textProps = { fontSize: 0.5, anchorX: 'center', anchorY: 'middle' }; return (<group><axesHelper args={[size]} /><Text color="red" position={[size * 1.1, 0, 0]} {...textProps}>X</Text><Text color="green" position={[0, size * 1.1, 0]} {...textProps}>Y</Text><Text color="blue" position={[0, 0, size * 1.1]} {...textProps}>Z</Text></group>); }
function Arrow({ vec, color }) { const groupRef = useRef(); const shaftRef = useRef(); const coneRef = useRef(); const geometries = useMemo(() => ({ shaft: new THREE.CylinderGeometry(1, 1, 1, 8), cone: new THREE.ConeGeometry(1, 1, 8) }), []); useEffect(() => { return () => { geometries.shaft.dispose(); geometries.cone.dispose(); }; }, [geometries]); useEffect(() => { const group = groupRef.current; const shaft = shaftRef.current; const cone = coneRef.current; if (!group || !shaft || !cone) return; const length = vec.length(); if (length < 1e-4) { group.visible = false; return; } group.visible = true; const start = new THREE.Vector3(0, 1, 0); const end = vec.clone().normalize(); const quaternion = new THREE.Quaternion(); quaternion.setFromUnitVectors(start, end); group.quaternion.copy(quaternion); const headHeight = Math.max(length * 0.25, 0.1); const headRadius = Math.max(length * 0.1, 0.05); const shaftRadius = Math.max(length * 0.03, 0.02); const shaftLength = Math.max(length - headHeight, 0.1); shaft.scale.set(shaftRadius, shaftLength, shaftRadius); shaft.position.set(0, shaftLength / 2, 0); cone.scale.set(headRadius, headHeight, headRadius); cone.position.set(0, shaftLength + headHeight / 2, 0); }, [vec, geometries]); return (<group ref={groupRef}><mesh ref={shaftRef} geometry={geometries.shaft}><meshStandardMaterial color={color} /></mesh><mesh ref={coneRef} geometry={geometries.cone}><meshStandardMaterial color={color} /></mesh></group>); }
function VelocityVector({ api, velocityData, velocityScale }) { const groupRef = useRef(); const positionRef = useRef([0, 0, 0]); useEffect(() => { if (api) { const unsubscribe = api.position.subscribe(p => { positionRef.current = [...p]; }); return unsubscribe; } }, [api]); useFrame(() => { if (groupRef.current && positionRef.current) { const [x, y, z] = positionRef.current; groupRef.current.position.set(x, y, z); } }); if (!velocityData || !Array.isArray(velocityData)) return null; const velocityVector = new THREE.Vector3().fromArray(velocityData); const scaledVelocityVec = velocityVector.multiplyScalar(velocityScale); if (scaledVelocityVec.length() < 0.01) return null; return (<group ref={groupRef}><Arrow vec={scaledVelocityVec} color="white" /></group>); }
function VelocityVectorVisuals({ show, velocities, objectApis, velocityScale }) { if (!show || !velocities) return null; return (<>{Object.entries(velocities).map(([id, velocity]) => { const api = objectApis.current[id]; if (!api) return null; return (<VelocityVector key={id} api={api} velocityData={velocity} velocityScale={velocityScale} />); })}</>); }


// --- Main Visualizer Component ---
function Visualizer({ scene, onAddGraph: onExternalAddGraph }) {
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

    return (
        <div className="visualizer-container">
            <div className="controllbar">
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
            </div>

            <div className="main-content">
                <Canvas
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    shadows
                    gl={{ logLevel: 'errors' }}
                    camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 200000 }}
                >
                    <TimeUpdater isPlaying={isPlaying} setCurrentTime={setCurrentTime} />
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[8, 10, 5]} intensity={1.0} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                    <Physics gravity={gravity} defaultContactMaterial={defaultContactMaterial} isPaused={!isPlaying}>
                        <GravitationalForceUpdater scene={scene} objectApis={objectApis} gravitationalPhysics={gravitationalPhysics} isPlaying={isPlaying} onPhysicsDataCalculated={handlePhysicsDataCalculated} />
                        {hasGround && <GroundPlane />}
                        {objectsToRender.map((obj, index) => {
                            const objectId = obj.id ?? `${obj.type?.toLowerCase() || 'obj'}-${index}`;
                            const configWithId = { ...obj, id: objectId };
                            const commonProps = { config: configWithId, id: objectId, setApi, onPhysicsUpdate, gravitationalPhysics, isPlaying };
                            switch (configWithId.type) {
                                case "Sphere": return <Sphere key={objectId} {...commonProps} />;
                                case "Box": return <Box key={objectId} {...commonProps} />;
                                case "Cylinder": return <Cylinder key={objectId} {...commonProps} />;
                                case "Plane": return <SceneBox key={objectId} config={{ ...configWithId, mass: configWithId.mass ?? 0 }} id={objectId} setApi={setApi} />;
                                default: return null;
                            }
                        })}
                    </Physics>
                    <VelocityVectorVisuals show={showVelocityVectors} velocities={physicsData.velocities} objectApis={objectApis} velocityScale={vectorScale} />
                    <OrbitControls />
                    <LabeledAxesHelper size={5} />
                    <SimpleGrid show={hasGround} />
                    <FpsCounter setFps={setFps} />
                </Canvas>
                
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
            </div>
            
            <div className="timeControllbar">
                <button onClick={() => setIsPlaying(p => !p)}><FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /></button>
                <button onClick={handleReset}><FontAwesomeIcon icon={faRedo} /></button>
                <span className="time-display">Time: {currentTime.toFixed(3)}s</span>
            </div>
        </div>
    );
}

export { GravitationalPhysics };
export default Visualizer;