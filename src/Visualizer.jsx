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
    material: { restitution: restitution, friction: 1.0 }, // Add friction to ball
  }));

  const startTime = useRef(performance.now() / 1000);

  useFrame(() => {
    api.position.subscribe((pos) => {
      const [x, y, z] = pos;
      const t = (performance.now() / 1000) - startTime.current;
      console.log('Ball position:', { x, y, z, t });
      onPositionUpdate({ x, y, z, t });
    });

    api.velocity.subscribe((vel) => {
      const [vx, vy, vz] = vel;
      console.log('Ball velocity:', { vx, vy, vz }); // Debug velocity
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
    material: { friction: 1.0, restitution: 0.7 }, // Add friction to plane
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
  const { gravity = [0, -9.81, 0] } = scene || {};

  useEffect(() => {
    console.log('Visualizer scene loaded:', scene);
  }, [scene]);

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
          defaultContactMaterial={{ friction: 1.0, restitution: 0.0 }} // No bounce, max friction
          step={1 / 60} // Fixed timestep for consistency
        >
          {scene && scene.objects.map((obj, index) => {
            if (obj.type === "sphere") {
              return (
                <Ball 
                  key={index} 
                  config={obj} 
                  onPositionUpdate={onPositionUpdate}
                />
              );
            }
            return null;
          })}
          <Plane />
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <Stats />
        <FpsCounter setFps={setFps} />
        <gridHelper args={[20, 20]} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '5px',
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