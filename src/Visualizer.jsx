// Visualizer.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useSphere, usePlane } from '@react-three/cannon';
import { OrbitControls, Stats } from '@react-three/drei';
import './Visualizer.css';

function Ball({ config, onPositionUpdate }) {
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
  
  useFrame(() => {
    api.position.subscribe((pos) => {
      const [x, y, z] = pos;
      const t = (performance.now() / 1000) - startTime.current;
      
      if (
        Math.abs(x - lastPosition.current.x) > 0.1 ||
        Math.abs(y - lastPosition.current.y) > 0.1 ||
        Math.abs(z - lastPosition.current.z) > 0.1
      ) {
        lastPosition.current = { x, y, z };
        onPositionUpdate({ x, y, z, t });
      }
    });
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Plane(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    ...props,
  }));
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

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

function Visualizer({ scene, onPositionUpdate }) {
  const [fps, setFps] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, t: 0 });
  const { gravity = [0, -9.81, 0] } = scene || {};

  const handlePosition = (pos) => {
    setPosition(pos);
    onPositionUpdate(pos);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        style={{ height: '100%', width: '100%' }}
        shadows
        camera={{ position: [10, 10, 10], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} castShadow />
        <Physics 
          gravity={gravity} 
          defaultContactMaterial={{
            friction: 0.5,
            restitution: 0.7,
          }}
        >
          {scene && scene.objects.map((obj, index) => {
            if (obj.type === "Sphere") {
              return (
                <Ball 
                  key={index} 
                  config={obj} 
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
        {/* <Stats /> */}
        <FpsCounter setFps={setFps} />
        <gridHelper args={[20, 20]} />
      </Canvas>
      <div
        className="position-display"
        style={{
          position: 'absolute',
          fontSize: '10px',
          top: '40px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '4px',
          borderRadius: '4px',
          zIndex: 10,
        }}
      >
        <div>Position:</div>
        <div>X: {position.x.toFixed(2)} m</div>
        <div>Y: {position.y.toFixed(2)} m</div>
        <div>t: {position.t.toFixed(2)} s</div>
      </div>
      <div
        className="fps-counter"
        style={{
          position: 'absolute',
          fontSize: '12px',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '4px',
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