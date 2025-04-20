import React, { useState, useRef, useEffect } from 'react';
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

// --- Sphere Component ---
function Sphere({ config, id, onPositionUpdate }) {
  const { mass, radius, position, velocity, rotation = [0, 0, 0], color = "red", restitution = 0.7 } = config;

  const [ref, api] = useSphere(() => ({
    mass,
    position,
    velocity,
    rotation,
    args: [radius],
    material: { restitution },
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
  }, [position, velocity]);

  return (
    <mesh ref={ref} castShadow>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Box Component ---
function Box({ config, id, onPositionUpdate }) {
  const { mass, dimensions, position, velocity, rotation = [0, 0, 0], color = "green", restitution = 0.7 } = config;
  const [width, height, depth] = dimensions || [1, 1, 1];

  const [ref, api] = useBox(() => ({
    mass,
    position,
    velocity,
    rotation,
    args: [width, height, depth],
    material: { restitution },
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
  }, [position, velocity]);

  return (
    <mesh ref={ref} castShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Cylinder Component ---
function Cylinder({ config, id, onPositionUpdate }) {
  const { mass, radius, height, position, velocity, rotation = [0, 0, 0], color = "blue", restitution = 0.7 } = config;

  const [ref, api] = useCylinder(() => ({
    mass,
    position,
    velocity,
    rotation,
    args: [radius, radius, height, 16],
    material: { restitution },
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
  }, [position, velocity]);

  return (
    <mesh ref={ref} castShadow>
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- SceneBox Component (Replaces ScenePlane) ---
function SceneBox({ config, id, onPositionUpdate }) {
  const {
    mass = 0, // Static by default
    dimensions = [10, 0.2, 10], // Thin box: 10x0.2x10
    position = [0, 0, 0],
    velocity = [0, 0, 0],
    rotation = [0, 0, 0], // Can be rotated for incline
    color = "#88aa88",
    restitution = 0.3,
  } = config;

  const [width, height, depth] = dimensions;

  const [ref, api] = useBox(() => ({
    mass,
    position,
    velocity,
    rotation,
    args: [width, height, depth],
    material: { friction: 0.5, restitution },
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
  }, [position, velocity]);

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
function Visualizer({ scene, onPositionUpdate }) {
  const [fps, setFps] = useState(0);
  const { gravity = [0, -9.81, 0], contactMaterial = {} } = scene || {};
  const objectsToRender = scene?.objects || [];

  const defaultContactMaterial = {
    friction: contactMaterial.friction || 0.5,
    restitution: contactMaterial.restitution || 0.7,
  };

  const handlePosition = (posDataWithId) => {
    onPositionUpdate(posDataWithId);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#d0e0f0' }}>
      <Canvas
        style={{ height: '100%', width: '100%' }}
        shadows
        gl={{ logLevel: 'errors' }}
        camera={{ position: [10, 5, 25], fov: 50, near: 0.1, far: 20000 }}
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
          defaultContactMaterial={defaultContactMaterial}
        >
          <GroundPlane /> {/* Infinite ground plane */}
          {objectsToRender.map((obj, index) => {
            const objectId = obj.id || `${obj.type?.toLowerCase() || 'obj'}-${index}`;
            switch (obj.type) {
              case "Sphere":
                return (
                  <Sphere
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              case "Box":
                return (
                  <Box
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              case "Cylinder":
                return (
                  <Cylinder
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              case "Plane": // Now interpreted as a thin box
                return (
                  <SceneBox
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              default:
                console.warn(`Unsupported object type: ${obj.type}`);
                return null;
            }
          })}
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <SimpleGrid />
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