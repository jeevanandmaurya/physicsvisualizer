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
// 'time' from three/tsl seems unused, can be removed if not needed elsewhere

// Define a constant for maximum history points to prevent performance issues
const MAX_HISTORY_POINTS = 2000; // Keep track of up to 2000 points per object

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

// Modify Sphere component to accept the onPhysicsUpdate callback
function Sphere({ config, id, setApi, onPhysicsUpdate }) { // <-- Accept onPhysicsUpdate prop
  const { mass, radius, position: initialPosition, velocity: initialVelocity, rotation = [0, 0, 0], color = "red", restitution = 0.7 } = config;
  const [ref, api] = useSphere(() => ({
    mass,
    position: initialPosition,
    velocity: initialVelocity,
    rotation,
    args: [radius],
    material: { restitution },
  }));

  // Ref to store the latest physics position from the subscription
  const physicsPositionRef = useRef(initialPosition || [0, 0, 0]); // Initialize with initialPosition

  useEffect(() => {
    if (api) {
      setApi(id, api); // Call the original setApi

      // Subscribe to the physics body's position
      const unsubscribe = api.position.subscribe(p => {
        // p is an array [x, y, z]
        physicsPositionRef.current = p;
      });

      // Cleanup subscription on component unmount
      return () => {
        unsubscribe();
      };
    }
  }, [id, api, setApi]); // Dependencies for this effect

  // Modify useFrame to report the physics position and time
  useFrame((state) => { // <-- Get state from useFrame
    // This logs the THREE.Mesh's position. (Optional logging)
    // console.log(`Sphere ${id} (ref.current.position):`, ref.current.position.toArray().map(v => parseFloat(v.toFixed(3))));

    // This logs the position obtained directly from the physics engine via subscription. (Optional logging)
    // console.log(`Sphere ${id} (physicsPositionRef via subscription):`, physicsPositionRef.current.map(v => parseFloat(v.toFixed(3))));

    // Report the real-time physics position and time up to the parent (Visualizer)
    if (onPhysicsUpdate && physicsPositionRef.current) { // <-- Check if callback exists and position is available
        onPhysicsUpdate({
            id: id,
            time: state.clock.elapsedTime, // Get current simulation time from useFrame state
            position: physicsPositionRef.current // Use the position from the subscription ref
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

// Box component (no changes needed for this task as it doesn't report position)
function Box({ config, id, setApi }) {
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

  useFrame(() => {
    // Intentionally doing nothing with position reporting here for the test
  });

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Cylinder component (no changes needed for this task)
function Cylinder({ config, id, setApi }) {
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

  useFrame(() => {
    // Intentionally doing nothing with position reporting here for the test
  });

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// SceneBox component (no changes needed for this task)
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

  useFrame(() => {
    // Intentionally doing nothing with position reporting here for the test
  });

  return (
    <mesh ref={ref} receiveShadow castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// GroundPlane component (no changes needed)
function GroundPlane() {
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

// FpsCounter component (no changes needed)
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

// SimpleGrid component (no changes needed)
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


function Visualizer({ scene, onPositionUpdate: onExternalPositionUpdate, onAddGraph: onExternalAddGraph }) {
  const [fps, setFps] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const objectApis = useRef({});
  const initialSceneObjects = useRef(scene?.objects ? JSON.parse(JSON.stringify(scene.objects)) : []);
  const [openGraphs, setOpenGraphs] = useState([]);
  // historyRef will store the raw data points as they come in
  const historyRef = useRef({});
  // objectHistory will be a state that updates periodically from historyRef to trigger UI re-renders
  const [objectHistory, setObjectHistory] = useState({});
  const [showGraphDropdown, setShowGraphDropdown] = useState(false);

  const { gravity = [0, -9.81, 0], contactMaterial = {} } = scene || {};
  const objectsToRender = scene?.objects || [];

  const defaultContactMaterial = {
    friction: contactMaterial.friction || 0.5,
    restitution: contactMaterial.restitution || 0.7,
  };

  const setApi = useCallback((id, api) => {
    objectApis.current[id] = api;
  }, []);

  // Define the callback to receive physics updates from child components
  const onPhysicsUpdate = useCallback(({ id, time, position }) => {
    // Ensure the object ID exists in historyRef
    if (!historyRef.current[id]) {
      historyRef.current[id] = [];
    }

    // Add the new data point {t, x, y, z}
    historyRef.current[id].push({
      t: time,
      x: position[0],
      y: position[1],
      z: position[2],
    });

    // Optional: Limit the history length to prevent excessive memory usage
    if (historyRef.current[id].length > MAX_HISTORY_POINTS) {
      historyRef.current[id].shift(); // Remove the oldest point
    }

    // You could potentially trigger an external update here if needed
    // if (typeof onExternalPositionUpdate === 'function') {
    //     onExternalPositionUpdate({ id, time, position });
    // }

  }, []); // No dependencies, as historyRef.current is a stable ref

  const handleReset = useCallback(() => {
    // Clear history when resetting
    historyRef.current = {};
    setObjectHistory({}); // Also clear the state used by graphs

    initialSceneObjects.current.forEach((initialConfig, index) => {
      const objectId = initialConfig.id !== undefined && initialConfig.id !== null && initialConfig.id !== ''
        ? String(initialConfig.id)
        : `${initialConfig.type?.toLowerCase() || 'obj'}-${index}`;
      const api = objectApis.current[objectId];
      // console.log(initialConfig.position); // Original console.log from your code
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
      }
    });
    setIsPlaying(false);
    setCurrentTime(0);
  }, [objectApis, initialSceneObjects]);

  // This callback was for external reporting but is not used internally for history
  // const handlePositionReport = useCallback(({ id, x, y, z }) => {
  //   // Intentionally doing nothing with the reported position here for the test
  // }, []);

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
    handleReset();
  }, [scene, handleReset]);

  // Effect to periodically update the state (objectHistory) from the ref (historyRef)
  // This is what triggers re-renders of the OverlayGraph components with new data points.
  useEffect(() => {
    const updateStateInterval = setInterval(() => {
      // Only update if there's data to prevent unnecessary re-renders
      if (Object.keys(historyRef.current).length > 0) {
        setObjectHistory({ ...historyRef.current });
      }
    }, 100); // Update state ~10 times per second (adjust as needed)

    return () => clearInterval(updateStateInterval); // Cleanup the interval
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


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
                  onClick={() => handleAddGraph(plotType.value)} // Calls handleAddGraph
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
        {/* Pass the global time state down */}
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
          isPaused={!isPlaying} // This prop might not work as expected with @react-three/cannon's default setup
        >
          <GroundPlane />
          {objectsToRender.map((obj, index) => {
            const objectId = obj.id !== undefined && obj.id !== null && obj.id !== ''
              ? String(obj.id)
              : `${obj.type?.toLowerCase() || 'obj'}-${index}`;
            const configWithId = { ...obj, id: objectId };
            switch (configWithId.type) {
              case "Sphere":
                // Pass the onPhysicsUpdate callback to the Sphere component
                return <Sphere key={objectId} config={configWithId} id={objectId} setApi={setApi} onPhysicsUpdate={onPhysicsUpdate} />;
              case "Box":
                 // If Boxes should also report position, pass onPhysicsUpdate here too
                return <Box key={objectId} config={configWithId} id={objectId} setApi={setApi} />;
              case "Cylinder":
                 // If Cylinders should also report position, pass onPhysicsUpdate here too
                return <Cylinder key={objectId} config={configWithId} id={objectId} setApi={setApi} />;
              case "Plane": // Assuming SceneBox represents a static Plane or Box
                return <SceneBox key={objectId} config={{ ...configWithId, mass: configWithId.mass ?? 0 }} id={objectId} setApi={setApi} />;
              default:
                console.warn(`Unsupported object type: ${configWithId.type}`);
                return null;
            }
          })}
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <SimpleGrid />
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

      {/* Render the OverlayGraph components based on the openGraphs state */}
      {/* We pass objectHistory as the 'data' prop */}
      {openGraphs.map(graphConfig => (
        <OverlayGraph // Assuming OverlayGraph component exists and handles plotting
          key={graphConfig.id}
          id={graphConfig.id}
          initialType={graphConfig.initialType} // Pass initial graph type
          data={objectHistory} // <-- Pass the accumulated history data
          onClose={handleCloseGraph}
          // OverlayGraph would need props to select which object and which axes to plot
          // You would likely add dropdowns or controls within the OverlayGraph component itself
          // or pass additional state from Visualizer to configure the graph.
        />
      ))}
    </div>
  );
}

export default Visualizer;