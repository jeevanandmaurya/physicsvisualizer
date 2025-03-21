// src/Visualizer.jsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { OrbitControls } from '@react-three/drei'; // Add controls for debugging
import './Visualizer.css'

function Box(props) {
  const [ref] = useBox(() => ({
    mass: 1,
    position: [0, 5, 0],
    ...props,
  }));
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

function Plane(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0], // Flat, facing up
    position: [0, 0, 0], // At origin
    ...props,
  }));
  return (
    <mesh ref={ref}>
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function Visualizer() {
  return (
    <Canvas
      style={{ height: '100%', width: '100%' }}
      camera={{ position: [0, 5, 10], fov: 50 }} // Adjust camera
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Physics>
        <Box />
        <Plane />
      </Physics>
      <OrbitControls /> {/* Add controls to pan/zoom */}
    </Canvas>
  );
}

export default Visualizer;