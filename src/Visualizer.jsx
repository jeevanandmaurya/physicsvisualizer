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
import './Visualizer.css';

// Import Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo } from '@fortawesome/free-solid-svg-icons';

// --- Helper Component for Central Time Update ---
// This component will live inside the Canvas and use useFrame
function TimeUpdater({ isPlaying, setCurrentTime }) {
  useFrame((state, delta) => {
    if (isPlaying) {
      // Use state.clock.delta for precise time increments
      setCurrentTime(prevTime => prevTime + state.clock.delta);
    }
  });

  // This component doesn't render anything visual
  return null;
}


// --- Object Components (Sphere, Box, Cylinder, SceneBox) ---
// These remain the same as in the previous update, reporting position
// and providing their API refs to the parent. They correctly use R3F
// hooks because they are rendered inside the Canvas.

function Sphere({ config, id, onPositionUpdate, setApi }) {
  const { mass, radius, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "red", restitution = 0.7 } = config;

  const [ref, api] = useSphere(() => ({
    mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [radius],
    material: { restitution },
  }));

  useEffect(() => {
    if (api) {
      setApi(id, api);
    }
  }, [id, api, setApi]);

  const lastPosition = useRef(initialPosition);
  const positionThreshold = 0.05;

  useFrame(() => {
    const [x, y, z] = ref.current.position.toArray();

    if (
      Math.abs(x - lastPosition.current[0]) > positionThreshold ||
      Math.abs(y - lastPosition.current[1]) > positionThreshold ||
      Math.abs(z - lastPosition.current[2]) > positionThreshold
    ) {
      lastPosition.current = [x, y, z];
      // onPositionUpdate will be called with the current time by Visualizer's handler
      onPositionUpdate({ id, x, y, z });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Box({ config, id, onPositionUpdate, setApi }) {
  const { mass, dimensions, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "green", restitution = 0.7 } = config;
  const [width, height, depth] = dimensions || [1, 1, 1];

  const [ref, api] = useBox(() => ({
    mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [width, height, depth],
    material: { restitution },
  }));

  useEffect(() => {
    if (api) {
      setApi(id, api);
    }
  }, [id, api, setApi]);

  const lastPosition = useRef(initialPosition);
  const positionThreshold = 0.05;

  useFrame(() => {
    const [x, y, z] = ref.current.position.toArray();

    if (
      Math.abs(x - lastPosition.current[0]) > positionThreshold ||
      Math.abs(y - lastPosition.current[1]) > positionThreshold ||
      Math.abs(z - lastPosition.current[2]) > positionThreshold
    ) {
      lastPosition.current = [x, y, z];
      onPositionUpdate({ id, x, y, z });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Cylinder({ config, id, onPositionUpdate, setApi }) {
  const { mass, radius, height, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "blue", restitution = 0.7 } = config;

  const [ref, api] = useCylinder(() => ({
    mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [radius, radius, height, 16],
    material: { restitution },
  }));

  useEffect(() => {
    if (api) {
      setApi(id, api);
    }
  }, [id, api, setApi]);

  const lastPosition = useRef(initialPosition);
  const positionThreshold = 0.05;

  useFrame(() => {
    const [x, y, z] = ref.current.position.toArray();

    if (
      Math.abs(x - lastPosition.current[0]) > positionThreshold ||
      Math.abs(y - lastPosition.current[1]) > positionThreshold ||
      Math.abs(z - lastPosition.current[2]) > positionThreshold
    ) {
      lastPosition.current = [x, y, z];
      onPositionUpdate({ id, x, y, z });
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function SceneBox({ config, id, onPositionUpdate, setApi }) {
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

  const lastPosition = useRef(initialPosition);
  const positionThreshold = 0.05;

  useFrame(() => {
     if (mass > 0) { // Only check/report if mass > 0 for dynamic objects
        const [x, y, z] = ref.current.position.toArray();

        if (
          Math.abs(x - lastPosition.current[0]) > positionThreshold ||
          Math.abs(y - lastPosition.current[1]) > positionThreshold ||
          Math.abs(z - lastPosition.current[2]) > positionThreshold
        ) {
          lastPosition.current = [x, y, z];
          onPositionUpdate({ id, x, y, z });
        }
    }
  });

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}


// --- Default Ground Plane Component ---
function GroundPlane() {
  const [ref] = usePlane(() => ({
    mass: 0,
    rotation: [-Math.PI / 2, 0, 0],
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

// --- FpsCounter Component ---
// This component correctly uses useFrame inside the Canvas
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

// --- Simple Grid Component ---
function SimpleGrid() {
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

// --- Main Visualizer Component ---
function Visualizer({ scene, onPositionUpdate, onAddGraph }) {
  const [fps, setFps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Start paused as t=0
  const [currentTime, setCurrentTime] = useState(0);
  const objectApis = useRef({}); // Store physics APIs for objects
  const initialSceneObjects = useRef(scene?.objects || []); // Store initial config for reset
  const [showGraphDropdown, setShowGraphDropdown] = useState(false); // State for graph dropdown

  const { gravity = [0, -9.81, 0], contactMaterial = {} } = scene || {};
  const objectsToRender = scene?.objects || [];

  const defaultContactMaterial = {
    friction: contactMaterial.friction || 0.5,
    restitution: contactMaterial.restitution || 0.7,
  };

  // Store initial scene objects when the scene prop changes
  useEffect(() => {
      initialSceneObjects.current = scene?.objects || [];
      // Consider if you want to auto-reset when a new scene is loaded
      // handleReset(); // Uncomment if needed
  }, [scene]);

  // Function to store API refs from children
  const setApi = useCallback((id, api) => {
    objectApis.current[id] = api;
  }, []);

  // Handle play/pause
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // Handle reset
  const handleReset = () => {
    setIsPlaying(false); // Pause on reset
    setCurrentTime(0); // Reset time

    // Iterate through stored APIs and reset positions/velocities
    initialSceneObjects.current.forEach(initialConfig => {
      // Ensure object has an ID - use the same logic as rendering
      const objectId = initialConfig.id !== undefined ? initialConfig.id : `${initialConfig.type?.toLowerCase() || 'obj'}-${initialSceneObjects.current.indexOf(initialConfig)}`;

      const api = objectApis.current[objectId];
      if (api) {
        const initialPosition = initialConfig.position || [0,0,0];
        const initialVelocity = initialConfig.velocity || [0,0,0];

        api.position.set(...initialPosition);
        api.velocity.set(...initialVelocity);
        // api.wakeUp(); // Uncomment if objects don't react after setting state while paused
      } else {
        console.warn(`API not found for object ID: ${objectId} during reset.`);
      }
    });

    // Signal history clear to parent if needed
    if(typeof onPositionUpdate === 'function') {
        // onPositionUpdate({ type: 'RESET_HISTORY' }); // Example mechanism
    }
  };

   // Wrap the position update handler to add the current time
   // This handler is called by the object components' useFrame hooks (which are INSIDE Canvas)
  const handlePositionReport = useCallback(({ id, x, y, z }) => {
      if (typeof onPositionUpdate === 'function') {
          // Append the current time from the central timer state
          onPositionUpdate({ id, x, y, z, t: currentTime });
      }
  }, [onPositionUpdate, currentTime]);


  // Handle adding graph from dropdown
  const handleAddGraphAction = (type) => {
      if (typeof onAddGraph === 'function') {
          onAddGraph(type);
      }
      setShowGraphDropdown(false); // Close dropdown after selection
  };

  // Graph menu options
  const graphOptions = [
      { label: 'Add Y vs X Plot', type: 'yvx' },
      { label: 'Add X vs T Plot', type: 'xvt' },
      { label: 'Add Y vs T Plot', type: 'yvt' },
  ];


  return (
    <div className="visualizer">

      <div className="controllbar">
        <button>2D/3D</button> {/* No functionality yet */}

        {/* Graphs Button with Dropdown */}
        <div className="graph-control-container" style={{ position:'relative' }} >
            <button onClick={() => setShowGraphDropdown(!showGraphDropdown)}>
                Graphs
            </button>
            {showGraphDropdown && (
                <div className="graph-dropdown" style={{position:'absolute',top:'100%'}}>
                    {graphOptions.map((option, index) => (
                        <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => handleAddGraphAction(option.type)}
                        >
                            {option.label}
                        </div>
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
        {/* Render the TimeUpdater component INSIDE the Canvas */}
        <TimeUpdater isPlaying={isPlaying} setCurrentTime={setCurrentTime} />

        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 10, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        <Physics
          gravity={gravity}
          defaultContactMaterial={defaultContactMaterial}
          isPaused={!isPlaying} // Pause physics when not playing
        >
          <GroundPlane /> {/* Infinite ground plane */}
          {objectsToRender.map((obj, index) => {
            const objectId = obj.id !== undefined ? obj.id : `${obj.type?.toLowerCase() || 'obj'}-${index}`;
            const configWithId = { ...obj, id: objectId };

            switch (configWithId.type) {
              case "Sphere":
                return (
                  <Sphere
                    key={objectId}
                    config={configWithId}
                    id={objectId}
                    onPositionUpdate={handlePositionReport}
                    setApi={setApi}
                  />
                );
              case "Box":
                return (
                  <Box
                    key={objectId}
                    config={configWithId}
                    id={objectId}
                    onPositionUpdate={handlePositionReport}
                    setApi={setApi}
                  />
                );
              case "Cylinder":
                return (
                  <Cylinder
                    key={objectId}
                    config={configWithId}
                    id={objectId}
                    onPositionUpdate={handlePositionReport}
                    setApi={setApi}
                  />
                );
              case "Plane": // Now interpreted as a thin box
                 return (
                    <SceneBox
                      key={objectId}
                      config={configWithId}
                      id={objectId}
                      onPositionUpdate={handlePositionReport}
                      setApi={setApi}
                    />
                  );
              default:
                console.warn(`Unsupported object type: ${configWithId.type}`);
                return null;
            }
          })}
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <SimpleGrid />
        {/* FpsCounter is correctly placed inside Canvas */}
        <FpsCounter setFps={setFps} />
      </Canvas>

      <div className="fps-counter">
        FPS: {fps}
      </div>

      <div className="timeControllbar">
        <button onClick={handlePlayPause}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /> {/* Toggle icon */}
        </button>
        <button onClick={handleReset}>
          <FontAwesomeIcon icon={faRedo} /> {/* Reset icon */}
        </button>
        {/* Display Time */}
        <span className="time-display">Time: {currentTime.toFixed(2)} s</span>
      </div>
    </div>
  );
}

export default Visualizer;