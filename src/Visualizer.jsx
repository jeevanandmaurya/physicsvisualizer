import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import { OrbitControls, Stats } from '@react-three/drei';
import './Visualizer.css'; // Assuming you have this CSS file

// Ball component now receives and uses 'id'
function Ball({ config, id, onPositionUpdate }) {
  const { mass, radius, position, velocity, color = "red", restitution = 0.7 } = config;

  const [ref, api] = useSphere(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    args: [radius],
    material: { restitution: restitution }, // Use restitution from config
  }));

  // Ref to store the start time when the component mounts (simulation starts)
  const startTime = useRef(performance.now() / 1000);
  // Ref to store the last reported position to implement throttling
  const lastPosition = useRef({ x: position[0], y: position[1], z: position[2] });
  // Throttling threshold - adjust as needed
  const positionThreshold = 0.05;

  useFrame(() => {
    // Subscribe to physics changes for this specific sphere
    api.position.subscribe((pos) => {
      const [x, y, z] = pos;
      // Calculate time elapsed since this simulation instance started
      const t = (performance.now() / 1000) - startTime.current;

      // Throttle updates: only report if position changed significantly
      if (
        Math.abs(x - lastPosition.current.x) > positionThreshold ||
        Math.abs(y - lastPosition.current.y) > positionThreshold ||
        Math.abs(z - lastPosition.current.z) > positionThreshold
      ) {
        lastPosition.current = { x, y, z };
        // Call the callback with position data AND the object's unique ID
        onPositionUpdate({ id, x, y, z, t });
      }
    });
  });

  // Reset startTime and lastPosition if the initial position config changes
  // This happens when App switches scenes and Visualizer gets a new `scene` prop
  useEffect(() => {
      startTime.current = performance.now() / 1000;
      lastPosition.current = { x: position[0], y: position[1], z: position[2] };
      // Optional: Teleport physics body to new start position if needed,
      // though remounting via key in App.jsx handles this usually.
      // api.position.set(position[0], position[1], position[2]);
      // api.velocity.set(velocity[0], velocity[1], velocity[2]);
  }, [position, velocity, api]); // Depend on initial config props

  return (
    <mesh ref={ref} castShadow> {/* Added castShadow */}
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// Ground Plane component
function Plane(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0], // Position at Y=0
    material: { friction: 0.5, restitution: 0.3 }, // Give ground some properties
    ...props,
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      {/* Make ground slightly green */}
      <meshStandardMaterial color="#88aa88" />
    </mesh>
  );
}

// FPS Counter component (calculates FPS)
function FpsCounter({ setFps }) {
  const lastTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useFrame(() => {
    const now = performance.now();
    frameCountRef.current += 1;
    const delta = now - lastTimeRef.current;

    if (delta >= 1000) { // Update FPS display every second
      setFps(Math.round((frameCountRef.current * 1000) / delta));
      frameCountRef.current = 0;
      lastTimeRef.current = now;
    }
  });

  return null; // This component doesn't render anything itself
}

// Main Visualizer component
function Visualizer({ scene, onPositionUpdate }) {
  const [fps, setFps] = useState(0);
  // Removed local position state as it's not representative for multiple objects
  // const [position, setPosition] = useState({ x: 0, y: 0, z: 0, t: 0 });
  const { gravity = [0, -9.81, 0] } = scene || {}; // Default gravity if not specified

  // This function now just passes the data (including id) up to App.jsx
  const handlePosition = (posDataWithId) => {
    // setPosition(posDataWithId); // Can still keep this if overlay needs last reported pos
    onPositionUpdate(posDataWithId);
  };

  // Check if scene data is available before rendering physics objects
  const objectsToRender = scene?.objects || [];

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#d0e0f0' }}>
      <Canvas
        style={{ height: '100%', width: '100%' }}
        shadows // Enable shadows
        camera={{ position: [5, 8, 15], fov: 50 }} // Adjusted camera position
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
            position={[8, 10, 5]}
            intensity={1.0}
            castShadow
            shadow-mapSize-width={1024} // Improve shadow quality
            shadow-mapSize-height={1024}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.3} />

        {/* Physics World */}
        <Physics
          gravity={gravity}
          defaultContactMaterial={{
            friction: 0.5, // Default friction
            restitution: 0.7, // Default restitution (bounce)
          }}
        >
          {/* Render each object from the scene config */}
          {objectsToRender.map((obj, index) => {
            // Ensure each object gets a unique ID
            const objectId = obj.id || `${obj.type.toLowerCase()}-${index}`;
            if (obj.type === "Sphere") {
              return (
                <Ball
                  key={objectId} // Use unique ID as the React key
                  config={obj}
                  id={objectId} // Pass the unique ID to the Ball component
                  onPositionUpdate={handlePosition}
                />
              );
            }
            // Add rendering for other object types here (e.g., Box, Plane) if needed
            // else if (obj.type === "Box") { ... }
            return null; // Skip unknown types
          })}
          {/* Ground Plane */}
          <Plane />
        </Physics>

        {/* Scene Helpers */}
        <OrbitControls /> {/* Allows camera control */}
        <axesHelper args={[5]} /> {/* Shows X, Y, Z axes */}
        <gridHelper args={[100, 100, '#aaa', '#ccc']} /> {/* Finer grid */}
        {/* <Stats /> */} {/* drei's Stats component (alternative to custom FPS) */}
        <FpsCounter setFps={setFps} /> {/* Component to calculate FPS */}
      </Canvas>

      {/* FPS Display Overlay */}
      <div
        className="fps-counter"
        style={{
          position: 'absolute',
          fontSize: '12px',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
          padding: '5px 8px',
          borderRadius: '4px',
          zIndex: 10, // Ensure it's above the canvas
        }}
      >
        FPS: {fps}
      </div>
       {/* Removed the position display overlay as it only showed the last reported object */}
    </div>
  );
}

export default Visualizer;