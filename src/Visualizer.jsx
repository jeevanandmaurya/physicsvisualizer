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

// Import the OverlayGraph component
import OverlayGraph from './OverlayGraph'; // Assuming OverlayGraph.js is in the same directory

// Import Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faRedo, faChartLine, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

// --- Helper Component for Central Time Update ---
// This component uses useFrame to update the central time state in the parent (Visualizer)
function TimeUpdater({ isPlaying, setCurrentTime }) {
  useFrame((state, delta) => {
    if (isPlaying) {
      setCurrentTime(prevTime => prevTime + delta);
    }
  });
  // This component does not render anything visual
  return null;
}

// --- Object Components (Sphere, Box, Cylinder, SceneBox) ---
// These components report their position when it changes significantly or it's the first frame.
// The parent (Visualizer) handles collecting this data into historyRef.

function Sphere({ config, id, onPositionUpdate, setApi }) {
  const { mass, radius, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "red", restitution = 0.7 } = config;

  // Ensure initialPosition is an array for consistent comparison later
  const initialPosArray = initialPosition || [0, 0, 0];

  const [ref, api] = useSphere(() => ({
    mass,
    position: initialPosArray,
    velocity: initialVelocity,
    rotation,
    args: [radius],
    material: { restitution },
  }));

  // Provide the physics API ref to the parent component
  useEffect(() => {
    if (api) {
      setApi(id, api);
    }
  }, [id, api, setApi]); // setApi is wrapped in useCallback in parent, so it's stable

  // Ref to track the last reported position, initialized with the initial position
  const lastReportedPosition = useRef([...initialPosArray]); // Store a copy

  // Threshold to avoid reporting tiny movements every frame
  const positionThreshold = 0.01;

  // Use useFrame to get object's current position from the physics engine
  useFrame(() => {
    // Check if ref.current exists and has a position property
    if (ref.current?.position) { // Safe access
      const currentPosition = ref.current.position.toArray();
      // const [x, y, z] = currentPosition; // Destructure later if needed

      // Calculate distance moved since last report
      const dx = currentPosition[0] - lastReportedPosition.current[0];
      const dy = currentPosition[1] - lastReportedPosition.current[1];
      const dz = currentPosition[2] - lastReportedPosition.current[2];
      const distanceSq = dx * dx + dy * dy + dz * dz;

      // Determine if this is the very first report for this object
      // Check if the current lastReportedPosition still matches the initial position state
      const isFirstReport = lastReportedPosition.current.every((val, index) => val === initialPosArray[index]);

      // Report position if moved significantly or if it's the first report (to capture initial state)
      if (distanceSq > positionThreshold * positionThreshold || isFirstReport) {
        lastReportedPosition.current = [...currentPosition]; // Update the last reported position (store a copy)
        // Report to parent, including x, y, z
        onPositionUpdate({ id, x: currentPosition[0], y: currentPosition[1], z: currentPosition[2] });
      }
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
  const initialPosArray = initialPosition || [0, 0, 0];

  const [ref, api] = useBox(() => ({
    mass,
    position: initialPosArray,
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

  const lastReportedPosition = useRef([...initialPosArray]);
  const positionThreshold = 0.01;

  useFrame(() => {
    if (ref.current?.position) {
      const currentPosition = ref.current.position.toArray();
      const dx = currentPosition[0] - lastReportedPosition.current[0];
      const dy = currentPosition[1] - lastReportedPosition.current[1];
      const dz = currentPosition[2] - lastReportedPosition.current[2];
      const distanceSq = dx * dx + dy * dy + dz * dz;

      const isFirstReport = lastReportedPosition.current.every((val, index) => val === initialPosArray[index]);

      if (distanceSq > positionThreshold * positionThreshold || isFirstReport) {
        lastReportedPosition.current = [...currentPosition];
        onPositionUpdate({ id, x: currentPosition[0], y: currentPosition[1], z: currentPosition[2] });
      }
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
  const initialPosArray = initialPosition || [0, 0, 0];

  const [ref, api] = useCylinder(() => ({
    mass,
    position: initialPosArray,
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

  const lastReportedPosition = useRef([...initialPosArray]);
  const positionThreshold = 0.01;

  useFrame(() => {
    if (ref.current?.position) {
      const currentPosition = ref.current.position.toArray();
      const dx = currentPosition[0] - lastReportedPosition.current[0];
      const dy = currentPosition[1] - lastReportedPosition.current[1];
      const dz = currentPosition[2] - lastReportedPosition.current[2];
      const distanceSq = dx * dx + dy * dy + dz * dz;

      const isFirstReport = lastReportedPosition.current.every((val, index) => val === initialPosArray[index]);

      if (distanceSq > positionThreshold * positionThreshold || isFirstReport) {
        lastReportedPosition.current = [...currentPosition];
        onPositionUpdate({ id, x: currentPosition[0], y: currentPosition[1], z: currentPosition[2] });
      }
    }
  });

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// SceneBox can be used for static objects (mass=0) like walls, or dynamic boxes
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
  const initialPosArray = initialPosition || [0, 0, 0];

  const [ref, api] = useBox(() => ({
    mass,
    position: initialPosArray,
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

  const lastReportedPosition = useRef([...initialPosArray]);
  const positionThreshold = 0.01;

  // Only dynamic objects (mass > 0) need position reporting based on movement,
  // but we report the initial position for all objects (including static ones)
  useFrame(() => {
    if (ref.current?.position) {
      const currentPosition = ref.current.position.toArray();
      const dx = currentPosition[0] - lastReportedPosition.current[0];
      const dy = currentPosition[1] - lastReportedPosition.current[1];
      const dz = currentPosition[2] - lastReportedPosition.current[2];
      const distanceSq = dx * dx + dy * dy + dz * dz;

      const isFirstReport = lastReportedPosition.current.every((val, index) => val === initialPosArray[index]);

      // Report if it's the first report OR if mass > 0 and it moved significantly
      if (isFirstReport || (mass > 0 && distanceSq > positionThreshold * positionThreshold)) {
        lastReportedPosition.current = [...currentPosition];
        onPositionUpdate({ id, x: currentPosition[0], y: currentPosition[1], z: currentPosition[2] });
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
  // A Plane in cannon is internally a Box with zero height, rotated
  const [ref] = usePlane(() => ({
    mass: 0, // Static
    rotation: [-Math.PI / 2, 0, 0], // Rotate to be horizontal
    position: [0, 0, 0],
    material: { friction: 0.5, restitution: 0.3 },
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} /> {/* Visual representation */}
      <meshStandardMaterial color="#88aa88" side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- FpsCounter Component ---
function FpsCounter({ setFps }) {
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useFrame(() => {
    const now = performance.now();
    frameCountRef.current += 1;
    const delta = now - lastTimeRef.current;

    if (delta >= 1000) { // Update approximately every second
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
      position={[0, 0.01, 0]} // Slightly above the ground plane
      args={[100, 100]} // Size of the grid
      cellColor="#aaaaaa"
      sectionColor="#888888"
      sectionSize={10} // Grid lines every 10 units
      cellSize={1} // Smaller grid lines every 1 unit
      fadeDistance={200}
      fadeStrength={1}
      infiniteGrid={false} // Finite grid
    />
  );
}

// --- Main Visualizer Component ---
function Visualizer({ scene, onPositionUpdate: onExternalPositionUpdate, onAddGraph: onExternalAddGraph }) {
  // --- State and Ref Definitions ---
  const [fps, setFps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  // Initialize currentTime as 0. The TimeUpdater will manage its increase.
  const [currentTime, setCurrentTime] = useState(0);
  const objectApis = useRef({}); // Store physics APIs for objects
  // Store initial config for reset (make a deep copy if initial configs are complex objects)
  const initialSceneObjects = useRef(scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : []);

  // --- State for managing overlay graphs ---
  const [openGraphs, setOpenGraphs] = useState([]);
  // Ref to store position history (updated frequently by handlePositionReport)
  // This prevents frequent Visualizer re-renders
  const historyRef = useRef({});
  // State for history (updated periodically from historyRef, triggers graph re-renders)
  const [objectHistory, setObjectHistory] = useState({});
  const [showGraphDropdown, setShowGraphDropdown] = useState(false); // State for graph dropdown


  // Destructure scene properties with defaults
  const { gravity = [0, -9.81, 0], contactMaterial = {} } = scene || {};
  const objectsToRender = scene?.objects || []; // Objects currently being rendered

  const defaultContactMaterial = {
    friction: contactMaterial.friction || 0.5,
    restitution: contactMaterial.restitution || 0.7,
  };

  // --- Callback Definitions (using useCallback for stability) ---

  // Function to receive API refs from child components
  const setApi = useCallback((id, api) => {
    objectApis.current[id] = api;
  }, []); // Empty dependency array means setApi is stable

  // Handle reset
  // DEFINE handleReset BEFORE the useEffect that calls it
  const handleReset = useCallback(() => {
    // setIsPlaying(false); // Pause on reset
    // setCurrentTime(0); // Reset time display

    // Clear history storage
    historyRef.current = {};
    // Clearing the state will trigger graph updates with empty data
    setObjectHistory({});

    // Reset physics positions and velocities using stored APIs
    initialSceneObjects.current.forEach((initialConfig, index) => {
      // Ensure we have a reliable ID for lookup
      const objectId = initialConfig.id !== undefined && initialConfig.id !== null && initialConfig.id !== ''
        ? String(initialConfig.id) // Use provided ID if valid
        : `${initialConfig.type?.toLowerCase() || 'obj'}-${index}`; // Generate fallback ID

        const api = objectApis.current[objectId];
        if (api) {
        // Wake up the object if it might have been sleeping
        api.wakeUp();
        // Reset position and velocity from initial config
        const initialPosition = initialConfig.position || [0, 0, 0];
        const initialVelocity = initialConfig.velocity || [0, 0, 0];
        const initialRotation = initialConfig.rotation || [0, 0, 0];
        const initialAngularVelocity = initialConfig.angularVelocity || [0, 0, 0];
        api.position.set(...initialPosition);
        api.velocity.set(...initialVelocity);
        api.rotation.set(...initialRotation);
        api.angularVelocity.set(...initialAngularVelocity);


      } else {
        // This might happen if the scene changes before all objects render/register their API
        // console.warn(`API not found for object ID: ${objectId} during reset.`);
      }
    });
    setIsPlaying(false); // Pause on reset
    setCurrentTime(0); // Reset time display
    // No need to explicitly add initial positions to history here.
    // The 'isFirstReport' logic in the object components' useFrame,
    // combined with the periodic objectHistory state update, will capture them
    // on the very first frame(s) after the reset.

  }, [objectApis, initialSceneObjects]); // Depend on refs that store mutable data

  // This handler is called frequently from object components' useFrame
  // It adds the reported position and the *current* time to the historyRef
  const handlePositionReport = useCallback(({ id, x, y, z }) => {
    // Add the current time when storing the position report
    historyRef.current[id] = historyRef.current[id] || [];
    // Add {x, y, z, t: currentTime} to the history array for this object ID
    historyRef.current[id].push({ x, y, z, t: currentTime });

    // Optional: also send to external listener if needed
    if (typeof onExternalPositionUpdate === 'function') {
      onExternalPositionUpdate({ id, x, y, z, t: currentTime });
    }
  }, [currentTime, onExternalPositionUpdate]); // Dependency on currentTime is crucial

  // Function to add a new graph overlay
  const handleAddGraph = useCallback((initialType) => {
    const newGraphId = `graph-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; // Unique ID
    setOpenGraphs(prevGraphs => [
      ...prevGraphs,
      {
        id: newGraphId,
        initialType: initialType,
        // Could add objectId filtering here later if needed
      }
    ]);
    setShowGraphDropdown(false); // Close dropdown after selecting
    // Optional: Notify external listener
    if (typeof onExternalAddGraph === 'function') {
      onExternalAddGraph({ id: newGraphId, initialType: initialType });
    }
  }, [onExternalAddGraph]); // Depends on the prop

  // Function to close a graph overlay
  const handleCloseGraph = useCallback((graphIdToRemove) => {
    setOpenGraphs(prevGraphs => prevGraphs.filter(graph => graph.id !== graphIdToRemove));
  }, []); // No dependencies


  // --- Effects (using useEffect) ---

  // Store initial scene objects and trigger reset when the scene prop changes
  // DEFINE handleReset BEFORE this effect
  useEffect(() => {
    // Make a fresh deep copy when the scene prop changes
    initialSceneObjects.current = scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : [];
    handleReset(); // Now handleReset is defined when this effect runs
  }, [scene, handleReset]); // Dependencies: scene prop, and the handleReset function (which is stable due to useCallback)


  // Effect to periodically copy data from historyRef to objectHistory state for graphs
  useEffect(() => {
    // Update state at a reasonable interval (~10 times per second)
    const updateStateInterval = setInterval(() => {
      // Create a shallow copy of the historyRef data to trigger state update
      setObjectHistory({ ...historyRef.current });
    }, 100); // Interval in milliseconds

    // Cleanup: Clear the interval when the component unmounts or dependencies change
    return () => clearInterval(updateStateInterval);
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  // --- Event Handlers (can be simple functions if no dependencies or side effects requiring useCallback) ---

  // Handle play/pause (doesn't depend on anything that changes across renders)
  const handlePlayPause = () => {
    setIsPlaying(prev => !prev);
  };

  // --- Render Logic (JSX) ---
  return (
    <div className="visualizer">

      {/* Control Bar at the Top */}
      <div className="controllbar">
        <button onClick={() => alert("2D/3D toggle not implemented yet")}>2D/3D</button>

        {/* Graphs Button with Dropdown */}
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
              {/* Map over available plot types */}
              {[{ label: 'Y vs T', value: 'yvt' }, { label: 'X vs T', value: 'xvt' }, { label: 'Z vs T', value: 'zvt' }, { label: 'Y vs X', value: 'yvx' }].map(plotType => (
                <button
                  key={plotType.value}
                  onClick={() => handleAddGraph(plotType.value)}
                  className="dropdown-item"
                >
                  {plotType.label}
                </button>
              ))}
              {/* Add more graph options here if needed */}
            </div>
          )}
        </div>
        {/* Add other controls here */}
      </div>

      {/* Main 3D Canvas Area */}
      <Canvas
        style={{ height: '100%', width: '100%' }} // Adjust height for top and bottom bars (40px each)
        shadows
        gl={{ logLevel: 'errors' }} // Helps debug R3F/Three.js errors
        camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 20000 }}
      >
        {/* Components that need to be inside Canvas */}
        {/* TimeUpdater updates state in the parent, must be inside Canvas to use useFrame */}
        <TimeUpdater isPlaying={isPlaying} setCurrentTime={setCurrentTime} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[8, 10, 5]}
          intensity={1.0}
          castShadow
          shadow-mapSize-width={1024} // Increase shadow map size for better resolution
          shadow-mapSize-height={1024}
          shadow-camera-far={50} // Set shadow camera far plane
          shadow-camera-left={-10} // Set shadow camera bounds
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Physics World */}
        <Physics
          gravity={gravity}
          defaultContactMaterial={defaultContactMaterial}
          isPaused={!isPlaying} // Pause physics engine when not playing
        >
          <GroundPlane /> {/* Infinite ground plane */}

          {/* Render objects from the scene configuration */}
          {objectsToRender.map((obj, index) => {
            // Ensure object has a unique ID for React keys and API lookup
            const objectId = obj.id !== undefined && obj.id !== null && obj.id !== ''
              ? String(obj.id) // Use provided ID if valid
              : `${obj.type?.toLowerCase() || 'obj'}-${index}`; // Generate fallback ID

            // Create a config object to pass to the child component, ensuring it has the computed ID
            const configWithId = { ...obj, id: objectId };

            // Render object based on type
            switch (configWithId.type) {
              case "Sphere":
                return (
                  <Sphere
                    key={objectId} // Use the unique id as the key
                    config={configWithId} // Pass full config including id
                    id={objectId} // Pass id explicitly
                    onPositionUpdate={handlePositionReport} // Pass handler for position reports
                    setApi={setApi} // Pass handler to receive API
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
              case "Plane": // Scene 'Plane' config is treated as a thin static Box
                return (
                  <SceneBox
                    key={objectId}
                    config={{ ...configWithId, mass: configWithId.mass ?? 0 }} // Ensure mass is explicitly set, default to 0 for static
                    id={objectId}
                    onPositionUpdate={handlePositionReport} // Reporting handled inside SceneBox
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
        <axesHelper args={[5]} /> {/* Shows X (red), Y (green), Z (blue) axes */}
        <SimpleGrid />
        {/* FpsCounter updates state in the parent, must be inside Canvas to use useFrame */}
        <FpsCounter setFps={setFps} />
      </Canvas>

      {/* Time and Playback Controls Bar at the Bottom */}
      <div className="timeControllbar">
        <button onClick={handlePlayPause} style={{ padding: "5px", marginLeft: "5px" }}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} /> {/* Toggle icon */}
        </button>
        <button onClick={handleReset} style={{ padding: "5px", marginRight: "5px" }}>
          <FontAwesomeIcon icon={faRedo} /> {/* Reset icon */}
        </button>
        {/* Display Time */}
        <span className="time-display">Time: {currentTime.toFixed(3)}s</span>
      </div>

      {/* FPS Counter */}
      <div className="fps-counter">
        FPS: {fps}
      </div>

      {/* Render Overlay Graphs */}
      {/* OverlayGraph is a standard React component, rendered outside the Canvas */}
      {openGraphs.map(graphConfig => (
        <OverlayGraph
          key={graphConfig.id} // Unique key for React list rendering
          id={graphConfig.id} // Pass graph ID to component
          initialType={graphConfig.initialType} // Pass initial plot type
          data={objectHistory} // Pass the history state (which updates periodically)
          onClose={handleCloseGraph} // Pass the close handler
        />
      ))}

    </div>
  );
}

export default Visualizer;