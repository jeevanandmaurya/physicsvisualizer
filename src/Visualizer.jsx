// Visualizer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import { OrbitControls, Grid } from '@react-three/drei'; // Import Grid from drei
import * as THREE from 'three';
import './Visualizer.css';

// --- Ball Component (Unchanged) ---
function Ball({ config, id, onPositionUpdate }) {
  const { mass, radius, position, velocity, color = "red", restitution = 0.7 } = config;

  const [ref, api] = useSphere(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    args: [radius],
    material: { restitution: restitution },
  }));

  const startTime = useRef(performance.now() / 1000);
  const lastPosition = useRef({ x: position[0], y: position[1], z: position[2] });
  const positionThreshold = 0.05;

  useFrame(() => {
    api.position.subscribe((pos) => {
      const [x, y, z] = pos;
      const t = (performance.now() / 1000) - startTime.current;

      if (
        Math.abs(x - lastPosition.current.x) > positionThreshold ||
        Math.abs(y - lastPosition.current.y) > positionThreshold ||
        Math.abs(z - lastPosition.current.z) > positionThreshold
      ) {
        lastPosition.current = { x, y, z };
        onPositionUpdate({ id, x, y, z, t });
      }
    });
  });

  useEffect(() => {
    startTime.current = performance.now() / 1000;
    lastPosition.current = { x: position[0], y: position[1], z: position[2] };
  }, [position, velocity, api]);

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Ground Plane Component (Unchanged) ---
function Plane(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.5, restitution: 0.3 },
    ...props,
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#88aa88" side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- FpsCounter Component (Unchanged) ---
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
      position={[0, 0.01, 0]} // Slightly above the plane to avoid z-fighting
      args={[100, 100]} // Size: 100 units, Divisions: 100 (1 unit per cell)
      cellColor="#cccccc" // Fine grid lines
      sectionColor="#aaaaaa" // Major grid lines
      sectionSize={10} // Major lines every 10 units
      cellSize={1} // Fine lines every 1 unit
      fadeDistance={200} // Fade out at 80 units
      fadeStrength={1} // Strong fade effect
      infiniteGrid={false} // Finite grid for simplicity
    />
  );
}

// --- Main Visualizer Component ---
function Visualizer({ scene, onPositionUpdate }) {
  const [fps, setFps] = useState(0);
  const { gravity = [0, -9.81, 0] } = scene || {};
  const objectsToRender = scene?.objects || [];

  const handlePosition = (posDataWithId) => {
    onPositionUpdate(posDataWithId);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#d0e0f0' }}>
      <Canvas
        style={{ height: '100%', width: '100%' }}
        shadows
        gl={{ logLevel: 'errors' }}
        camera={{ position: [5, 8, 15], fov: 50, near: 0.1, far: 20000 }}
      >
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
          defaultContactMaterial={{
            friction: 0.5,
            restitution: 0.7,
          }}
        >
          {objectsToRender.map((obj, index) => {
            const objectId = obj.id || `${obj.type?.toLowerCase() || 'obj'}-${index}`;
            if (obj.type === "Sphere") {
              return (
                <Ball
                  key={objectId}
                  config={obj}
                  id={objectId}
                  onPositionUpdate={handlePosition}
                />
              );
            }
            return null;
          })}
          <Plane />
        </Physics>

        <OrbitControls />
        <axesHelper args={[5]} />
        <SimpleGrid /> {/* Replaced ShaderAdaptiveGrid with SimpleGrid */}

        <FpsCounter setFps={setFps} />
      </Canvas>

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
          zIndex: 10,
        }}
      >
        FPS: {fps}
      </div>
    </div>
  );
}

export default Visualizer;