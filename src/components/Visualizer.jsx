import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Physics,
  useSphere,
  useBox,
  useCylinder,
  usePlane,
} from '@react-three/cannon';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import './Visualizer.css'; // Assuming this file exists

// Import the OverlayGraph component
import OverlayGraph from './OverlayGraph'; // Assuming OverlayGraph.js is in the same directory

// Import Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faChartLine, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

// Define a constant for maximum history points to prevent performance issues
const MAX_HISTORY_POINTS = 2000; // Keep track of up to 2000 points per object

// --- Gravitational Physics Engine ---
class GravitationalPhysics {
  constructor(scene) {
    this.scene = scene;
    this.G = scene.gravitationalPhysics?.gravitationalConstant || 6.67430e-11;
    this.minDistance = scene.gravitationalPhysics?.minDistance || 1e-6;
    this.softening = scene.gravitationalPhysics?.softening || 0;
    this.enabled = scene.gravitationalPhysics?.enabled !== false;
    this.simulationScale = scene.simulationScale || 'terrestrial';
    
    // Scale gravitational constant based on simulation scale
    if (this.simulationScale === 'terrestrial' && this.G === 6.67430e-11) {
      this.G = 6.67430e-8; // Scale up for terrestrial scenarios
    }
    
    // Store current positions for objects
    this.currentPositions = {};
  }

  calculateGravitationalForces(objects, objectApis) {
    if (!this.enabled || !objects || objects.length < 2) return {};
    
    const forces = {};
    const positions = {};
    const masses = {};
    
    // Initialize force arrays and get current positions from physics APIs
    objects.forEach(obj => {
      if (obj.mass > 0 && objectApis[obj.id]) {
        forces[obj.id] = [0, 0, 0];
        masses[obj.id] = obj.gravitationalMass || obj.mass;
        
        // Use stored position if available, otherwise use initial position
        if (this.currentPositions[obj.id]) {
          positions[obj.id] = this.currentPositions[obj.id];
        } else {
          positions[obj.id] = obj.position || [0, 0, 0];
        }
      }
    });

    // Calculate pairwise gravitational forces
    const objectIds = Object.keys(positions);
    for (let i = 0; i < objectIds.length; i++) {
      for (let j = i + 1; j < objectIds.length; j++) {
        const id1 = objectIds[i];
        const id2 = objectIds[j];
        
        const obj1 = objects.find(o => o.id === id1);
        const obj2 = objects.find(o => o.id === id2);
        
        // Skip static objects for force application (they can still attract others)
        if (!obj1 || !obj2) continue;
        
        const pos1 = positions[id1];
        const pos2 = positions[id2];
        const m1 = masses[id1];
        const m2 = masses[id2];
        
        // Calculate distance vector
        const dx = pos2[0] - pos1[0];
        const dy = pos2[1] - pos1[1];
        const dz = pos2[2] - pos1[2];
        
        // Calculate distance magnitude with softening
        const distanceSquared = dx*dx + dy*dy + dz*dz + this.softening*this.softening;
        const distance = Math.sqrt(distanceSquared);
        
        // Apply minimum distance constraint to prevent singularities
        const effectiveDistanceSquared = Math.max(distanceSquared, this.minDistance * this.minDistance);
        
        // Calculate gravitational force magnitude
        const forceMagnitude = this.G * m1 * m2 / effectiveDistanceSquared;
    
        
        // Calculate unit direction vector
        if (distance > 0) {
          const unitX = dx / distance;
          const unitY = dy / distance;
          const unitZ = dz / distance;
          
          // Calculate force components
          const forceX = forceMagnitude * unitX;
          const forceY = forceMagnitude * unitY;
          const forceZ = forceMagnitude * unitZ;
          
          // Apply forces to both objects (Newton's 3rd law)
          if (!obj1.isStatic && forces[id1]) {
            forces[id1][0] += forceX;
            forces[id1][1] += forceY;
            forces[id1][2] += forceZ;
          }
          
          if (!obj2.isStatic && forces[id2]) {
            forces[id2][0] -= forceX;
            forces[id2][1] -= forceY;
            forces[id2][2] -= forceZ;
          }
        }
      }
    }
    
    return forces;
  }

  // Update position tracking
  updatePosition(objectId, position) {
    this.currentPositions[objectId] = [...position];
  }

  // Calculate orbital velocity for circular orbit
  static calculateOrbitalVelocity(centralMass, orbitalRadius, G = 6.67430e-11) {
    return Math.sqrt(G * centralMass / orbitalRadius);
  }

  // Calculate escape velocity
  static calculateEscapeVelocity(mass, radius, G = 6.67430e-11) {
    return Math.sqrt(2 * G * mass / radius);
  }
}

// --- Gravitational Force Updater Component ---
function GravitationalForceUpdater({ scene, objectApis, gravitationalPhysics, isPlaying }) {
  const frameCounter = useRef(0);
  const forceUpdateFrequency = 1; // Apply forces every frame for smooth simulation

  useFrame(() => {
    if (!isPlaying || !gravitationalPhysics.current.enabled || !scene?.objects) return;
    
    frameCounter.current++;
    
    // Apply gravitational forces at the specified frequency
    if (frameCounter.current % forceUpdateFrequency === 0) {
      // Calculate gravitational forces
      const forces = gravitationalPhysics.current.calculateGravitationalForces(
        scene.objects, 
        objectApis.current
      );
      
      // Apply forces to physics bodies
      Object.entries(forces).forEach(([objectId, force]) => {
        const api = objectApis.current[objectId];
        if (api && force && (force[0] !== 0 || force[1] !== 0 || force[2] !== 0)) {
          try {
            // Apply force to the physics body
            api.applyForce(force, [0, 0, 0]); // Apply force at center of mass
          } catch (e) {
            console.warn(`Failed to apply gravitational force to object ${objectId}:`, e);
          }
        }
      });
    }
  });

  return null;
}

// --- Helper Component for Central Time Update ---
function TimeUpdater({ isPlaying, setCurrentTime }) {
  useFrame((state, delta) => {
    if (isPlaying) {
      setCurrentTime(prevTime => prevTime + delta);
    }
  });
  return null;
}

// --- Object Components (Sphere, Box, Cylinder, SceneBox) ---

// Modified Sphere component with position tracking
function Sphere({ config, id, setApi, onPhysicsUpdate, gravitationalPhysics }) {
  const { mass, radius, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "red", restitution = 0.7, isStatic = false } = config;
  const [ref, api] = useSphere(() => ({
    mass: isStatic ? 0 : mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [radius],
    material: { restitution },
    type: isStatic ? 'Static' : 'Dynamic',
  }));

  // Ref to store the latest physics position from the subscription
  const physicsPositionRef = useRef(initialPosition || [0, 0, 0]);

  useEffect(() => {
    if (api) {
      setApi(id, api);

      // Subscribe to the physics body's position
      const unsubscribe = api.position.subscribe(p => {
        physicsPositionRef.current = [...p];
        // Update gravitational physics with new position
        if (gravitationalPhysics?.current) {
          gravitationalPhysics.current.updatePosition(id, p);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [id, api, setApi, gravitationalPhysics]);

  useFrame((state) => {
    // Report the real-time physics position and time up to the parent (Visualizer)
    if (onPhysicsUpdate && physicsPositionRef.current) {
        onPhysicsUpdate({
            id: id,
            time: state.clock.elapsedTime,
            position: physicsPositionRef.current
        });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Box component with position tracking
function Box({ config, id, setApi, onPhysicsUpdate, gravitationalPhysics }) {
  const { mass, dimensions, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "green", restitution = 0.7, isStatic = false } = config;
  const [width, height, depth] = dimensions || [1, 1, 1];
  const [ref, api] = useBox(() => ({
    mass: isStatic ? 0 : mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [width, height, depth],
    material: { restitution },
    type: isStatic ? 'Static' : 'Dynamic',
  }));

  const physicsPositionRef = useRef(initialPosition || [0, 0, 0]);

  useEffect(() => {
    if (api) {
      setApi(id, api);
      
      const unsubscribe = api.position.subscribe(p => {
        physicsPositionRef.current = [...p];
        // Update gravitational physics with new position
        if (gravitationalPhysics?.current) {
          gravitationalPhysics.current.updatePosition(id, p);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [id, api, setApi, gravitationalPhysics]);

  useFrame((state) => {
    if (onPhysicsUpdate && physicsPositionRef.current) {
        onPhysicsUpdate({
            id: id,
            time: state.clock.elapsedTime,
            position: physicsPositionRef.current
        });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Cylinder component with position tracking
function Cylinder({ config, id, setApi, onPhysicsUpdate, gravitationalPhysics }) {
  const { mass, radius, height, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "blue", restitution = 0.7, isStatic = false } = config;
  const [ref, api] = useCylinder(() => ({
    mass: isStatic ? 0 : mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [radius, radius, height, 16],
    material: { restitution },
    type: isStatic ? 'Static' : 'Dynamic',
  }));

  const physicsPositionRef = useRef(initialPosition || [0, 0, 0]);

  useEffect(() => {
    if (api) {
      setApi(id, api);
      
      const unsubscribe = api.position.subscribe(p => {
        physicsPositionRef.current = [...p];
        // Update gravitational physics with new position
        if (gravitationalPhysics?.current) {
          gravitationalPhysics.current.updatePosition(id, p);
        }
      });

      return () => {
        unsubscribe();
      };
    }
  }, [id, api, setApi, gravitationalPhysics]);

  useFrame((state) => {
    if (onPhysicsUpdate && physicsPositionRef.current) {
        onPhysicsUpdate({
            id: id,
            time: state.clock.elapsedTime,
            position: physicsPositionRef.current
        });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// SceneBox component
function SceneBox({ config, id, setApi }) {
  const {
    mass = 0, // Static by default
    dimensions = [10, 0.2, 10],
    position: initialPosition = [0, 0, 0],
    velocity: initialVelocity = [0, 0, 0],
    rotation = [0, 0, 0],
    color = "#88aa88",
    restitution = 0.3,
  } = config;
  const [width, height, depth] = dimensions;
  const [ref, api] = useBox(() => ({
    mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [width, height, depth],
    material: { friction: 0.5, restitution },
  }));

  useEffect(() => {
    if (api) {
      setApi(id, api);
    }
  }, [id, api, setApi]);

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// GroundPlane component
function GroundPlane() {
  const [ref] = usePlane(() => ({
    mass: 0, // Static
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, 0, 0],
    material: { friction: 0.5, restitution: 0.3 },
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#88aa88" side={THREE.DoubleSide} />
    </mesh>
  );
}

// FpsCounter component
function FpsCounter({ setFps }) {
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useFrame(() => {
    const now = performance.now();
    frameCountRef.current += 1;
    const delta = now - lastTimeRef.current;

    if (delta >= 1000) {
      setFps(Math.round((frameCountRef.current * 1000) / delta));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return null;
}

// SimpleGrid component - now conditional based on hasGround
function SimpleGrid({ show }) {
  if (!show) return null;
  
  return (
    <Grid
      position={[0, 0.01, 0]}
      args={[100, 100]}
      cellColor="#aaaaaa"
      sectionColor="#888888"
      sectionSize={10}
      cellSize={1}
      fadeDistance={200}
      fadeStrength={1}
      infiniteGrid={false}
    />
  );
}

function Visualizer({ scene, onPositionUpdate: onExternalPositionUpdate, onAddGraph: onExternalAddGraph }) {
  const [fps, setFps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const objectApis = useRef({});
  const gravitationalPhysics = useRef(new GravitationalPhysics(scene || {}));
  const initialSceneObjects = useRef(scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : []);
  const [openGraphs, setOpenGraphs] = useState([]);
  const historyRef = useRef({});
  const [objectHistory, setObjectHistory] = useState({});
  const [showGraphDropdown, setShowGraphDropdown] = useState(false);

  const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = scene || {};
  const objectsToRender = scene?.objects || [];

  const defaultContactMaterial = {
    friction: contactMaterial.friction || 0.5,
    restitution: contactMaterial.restitution || 0.7,
  };

  const setApi = useCallback((id, api) => {
    objectApis.current[id] = api;
  }, []);

  const onPhysicsUpdate = useCallback(({ id, time, position }) => {
    if (!historyRef.current[id]) {
      historyRef.current[id] = [];
    }

    historyRef.current[id].push({
      t: time,
      x: position[0],
      y: position[1],
      z: position[2],
    });

    if (historyRef.current[id].length > MAX_HISTORY_POINTS) {
      historyRef.current[id].shift();
    }
  }, []);

  const handleReset = useCallback(() => {
    historyRef.current = {};
    setObjectHistory({});

    // Reset gravitational physics positions
    gravitationalPhysics.current.currentPositions = {};

    initialSceneObjects.current.forEach((initialConfig, index) => {
      const objectId = initialConfig.id !== undefined && initialConfig.id !== null && initialConfig.id !== ''
        ? String(initialConfig.id)
        : `${initialConfig.type?.toLowerCase() || 'obj'}-${index}`;
      const api = objectApis.current[objectId];
      
      if (api) {
        api.wakeUp();
        const initialPosition = initialConfig.position || [0, 0, 0];
        const initialVelocity = initialConfig.velocity || [0, 0, 0];
        const initialRotation = initialConfig.rotation || [0, 0, 0];
        const initialAngularVelocity = initialConfig.angularVelocity || [0, 0, 0];
        api.position.set(...initialPosition);
        api.velocity.set(...initialVelocity);
        api.rotation.set(...initialRotation);
        api.angularVelocity.set(...initialAngularVelocity);
        
        // Update gravitational physics with reset position
        gravitationalPhysics.current.updatePosition(objectId, initialPosition);
      }
    });
    setIsPlaying(false);
    setCurrentTime(0);
  }, [objectApis, initialSceneObjects]);

  const handleAddGraph = useCallback((initialType) => {
    const newGraphId = `graph-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setOpenGraphs(prevGraphs => [
      ...prevGraphs,
      {
        id: newGraphId,
        initialType: initialType,
      }
    ]);
    setShowGraphDropdown(false);
    if (typeof onExternalAddGraph === 'function') {
      onExternalAddGraph({ id: newGraphId, initialType: initialType });
    }
  }, [onExternalAddGraph]);

  const handleCloseGraph = useCallback((graphIdToRemove) => {
    setOpenGraphs(prevGraphs => prevGraphs.filter(graph => graph.id !== graphIdToRemove));
  }, []);

  useEffect(() => {
    initialSceneObjects.current = scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : [];
    gravitationalPhysics.current = new GravitationalPhysics(scene || {});
    handleReset();
  }, [scene, handleReset]);

  useEffect(() => {
    const updateStateInterval = setInterval(() => {
      if (Object.keys(historyRef.current).length > 0) {
        setObjectHistory({ ...historyRef.current });
      }
    }, 100);

    return () => clearInterval(updateStateInterval);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  return (
    <div className="visualizer">
      <div className="controllbar">
        <button onClick={() => alert("2D/3D toggle not implemented yet")}>2D/3D</button>
        <div className="graphs-dropdown-container">
          <button
            className="graphs-button"
            onClick={() => setShowGraphDropdown(prev => !prev)}
            aria-expanded={showGraphDropdown}
          >
            <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '5px' }} />
            Graphs
            <FontAwesomeIcon icon={showGraphDropdown ? faChevronUp : faChevronDown} style={{ marginLeft: '5px' }} />
          </button>
          {showGraphDropdown && (
            <div className="graphs-dropdown-menu">
              {[{ label: 'Y vs T', value: 'yvt' }, { label: 'X vs T', value: 'xvt' }, { label: 'Z vs T', value: 'zvt' }, { label: 'Y vs X', value: 'yvx' }].map(plotType => (
                <button
                  key={plotType.value}
                  onClick={() => handleAddGraph(plotType.value)}
                  className="dropdown-item"
                >
                  {plotType.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Canvas
        style={{ height: '100%', width: '100%' }}
        shadows
        gl={{ logLevel: 'errors' }}
        camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 20000 }}
      >
        <TimeUpdater isPlaying={isPlaying} setCurrentTime={setCurrentTime} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 10, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        <Physics
          gravity={gravity}
          defaultContactMaterial={defaultContactMaterial}
          isPaused={!isPlaying}
        >
          {/* Add the gravitational force updater */}
          <GravitationalForceUpdater 
            scene={scene} 
            objectApis={objectApis} 
            gravitationalPhysics={gravitationalPhysics}
            isPlaying={isPlaying} 
          />
          
          {hasGround && <GroundPlane />}
          {objectsToRender.map((obj, index) => {
            const objectId = obj.id !== undefined && obj.id !== null && obj.id !== ''
              ? String(obj.id)
              : `${obj.type?.toLowerCase() || 'obj'}-${index}`;
            const configWithId = { ...obj, id: objectId };
            
            switch (configWithId.type) {
              case "Sphere":
                return <Sphere key={objectId} config={configWithId} id={objectId} setApi={setApi} onPhysicsUpdate={onPhysicsUpdate} gravitationalPhysics={gravitationalPhysics} />;
              case "Box":
                return <Box key={objectId} config={configWithId} id={objectId} setApi={setApi} onPhysicsUpdate={onPhysicsUpdate} gravitationalPhysics={gravitationalPhysics} />;
              case "Cylinder":
                return <Cylinder key={objectId} config={configWithId} id={objectId} setApi={setApi} onPhysicsUpdate={onPhysicsUpdate} gravitationalPhysics={gravitationalPhysics} />;
              case "Plane":
                return <SceneBox key={objectId} config={{ ...configWithId, mass: configWithId.mass ?? 0 }} id={objectId} setApi={setApi} />;
              default:
                console.warn(`Unsupported object type: ${configWithId.type}`);
                return null;
            }
          })}
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <SimpleGrid show={hasGround} />
        <FpsCounter setFps={setFps} />
      </Canvas>

      <div className="timeControllbar">
        <button onClick={handlePlayPause} style={{ padding: "5px", marginLeft: "5px" }}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        <button onClick={handleReset} style={{ padding: "5px", marginRight: "5px" }}>
          <FontAwesomeIcon icon={faRedo} />
        </button>
        <span className="time-display">Time: {currentTime.toFixed(3)}s</span>
      </div>

      <div className="fps-counter">
        FPS: {fps}
      </div>
      
      {openGraphs.map(graphConfig => (
        <OverlayGraph
          key={graphConfig.id}
          id={graphConfig.id}
          initialType={graphConfig.initialType}
          data={objectHistory}
          onClose={handleCloseGraph}
        />
      ))}
    </div>
  );
}

export { GravitationalPhysics };
export default Visualizer;