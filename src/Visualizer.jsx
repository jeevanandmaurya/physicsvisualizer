import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Physics,
  useSphere,
  useBox,
  useCylinder,
  usePlane,
  useConvexPolyhedron,
  useTrimesh,
  useCompoundBody,
} from '@react-three/cannon';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import './Visualizer.css';

// --- Sphere Component ---
function Sphere({ config, id, onPositionUpdate }) {
  const { mass, radius, position, velocity, rotation = [0, 0, 0], color = "red", restitution = 0.7 } = config;

  const [ref, api] = useSphere(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    rotation: rotation,
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

// --- Box Component ---
function Box({ config, id, onPositionUpdate }) {
  const { mass, dimensions, position, velocity, rotation = [0, 0, 0], color = "green", restitution = 0.7 } = config;
  const [width, height, depth] = dimensions || [1, 1, 1];

  const [ref, api] = useBox(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    rotation: rotation,
    args: [width, height, depth],
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
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Cylinder Component ---
function Cylinder({ config, id, onPositionUpdate }) {
  const { mass, radius, height, position, velocity, rotation = [0, 0, 0], color = "blue", restitution = 0.7 } = config;

  const [ref, api] = useCylinder(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    rotation: rotation,
    args: [radius, radius, height, 16],
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
      <cylinderGeometry args={[radius, radius, height, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- ConvexPolyhedron Component (Simplified) ---
function ConvexPolyhedron({ config, id, onPositionUpdate }) {
  const { mass, vertices, faces, position, velocity, rotation = [0, 0, 0], color = "purple", restitution = 0.7 } = config;

  const [ref, api] = useConvexPolyhedron(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    rotation: rotation,
    args: [
      vertices.map(v => new THREE.Vector3(...v)),
      faces,
    ],
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
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Trimesh Component ---
function Trimesh({ config, id, onPositionUpdate }) {
  const { mass, vertices, indices, position, velocity, rotation = [0, 0, 0], color = "orange", restitution = 0.7 } = config;

  const [ref, api] = useTrimesh(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    rotation: rotation,
    args: [vertices.map(v => new THREE.Vector3(...v)), indices],
    material: { restitution: restitution },
  }));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3));
  geometry.setIndex(indices);

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
      <bufferGeometry {...geometry} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

// --- Compound Component ---
function Compound({ config, id, onPositionUpdate }) {
  const { mass, shapes, position, velocity, rotation = [0, 0, 0], color = "gray", restitution = 0.7 } = config;

  const [ref, api] = useCompoundBody(() => ({
    mass: mass,
    position: position,
    velocity: velocity,
    rotation: rotation,
    shapes: shapes.map(shape => ({
      type: shape.type.toLowerCase(),
      args: shape.args,
      position: shape.offset || [0, 0, 0],
    })),
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
      {shapes.map((shape, index) => {
        let geometry;
        switch (shape.type.toLowerCase()) {
          case "sphere":
            geometry = <sphereGeometry args={shape.args} />;
            break;
          case "box":
            geometry = <boxGeometry args={shape.args} />;
            break;
          case "cylinder":
            geometry = <cylinderGeometry args={[shape.args[0], shape.args[0], shape.args[1], 16]} />;
            break;
          default:
            return null;
        }
        return (
          <mesh key={index} position={shape.offset || [0, 0, 0]}>
            {geometry}
            <meshStandardMaterial color={color} />
          </mesh>
        );
      })}
    </mesh>
  );
}

// --- Scene Plane Component ---
function ScenePlane({ config, id }) {
  const { mass, rotation = [0, 0, 0], position = [0, 0, 0] } = config;

  const [ref] = usePlane(() => ({
    mass: mass || 0,
    rotation: rotation,
    position: position,
    material: { friction: 0.5, restitution: 0.3 },
  }));

  return (
    <mesh ref={ref} receiveShadow rotation={rotation}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="#88aa88" side={THREE.DoubleSide} />
    </mesh>
  );
}

// --- Ground Plane Component ---
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
      position={[0, 0.01, 0]} // Just above the ground plane
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
        camera={{ position: [10, 5, 25], fov: 80, near: 0.1, far: 20000 }} // Adjusted camera for better view
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
              case "ConvexPolyhedron":
                return (
                  <ConvexPolyhedron
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              case "Trimesh":
                return (
                  <Trimesh
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              case "Compound":
                return (
                  <Compound
                    key={objectId}
                    config={obj}
                    id={objectId}
                    onPositionUpdate={handlePosition}
                  />
                );
              case "Plane":
                return (
                  <ScenePlane
                    key={objectId}
                    config={obj}
                    id={objectId}
                  />
                );
              default:
                console.warn(`Unsupported object type: ${obj.type}`);
                return null;
            }
          })}
        <Plane />
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <SimpleGrid /> {/* Always render the grid above the ground plane */}
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