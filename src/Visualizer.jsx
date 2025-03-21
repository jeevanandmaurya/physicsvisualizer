// src/Visualizer.jsx
import React,{ useState,useRef} from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, useBox, usePlane } from '@react-three/cannon';
import { OrbitControls , Stats} from '@react-three/drei'; // Add controls for debugging
import './Visualizer.css'


// Custom hook to sync physics data
function PhysicsSync({ boxRef, onPhysicsUpdate }) {
  console.log('PhysicsSync rendered');
  const [positionData, setPositionData] = useState([]);

  useFrame(() => {
    console.log('useFrame running, boxRef.current:', boxRef.current);
    if (boxRef.current) {
      const { x, y, z } = boxRef.current.position;
      const time = performance.now() / 1000;
      console.log('Position:', { time, x, y, z }); / // Time in seconds
      setPositionData((prev) => {
        const newData = [...prev, { time, x, y, z }];
        const cappedData = newData.length > 100 ? newData.slice(-100) : newData;
        console.log('Sending data:', cappedData);
        // Pass data to parent every frame
        if (onPhysicsUpdate) {
          onPhysicsUpdate(cappedData);
        }
        return cappedData;
      });
    }
  });

}
function Box({ boxRef }) {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: [0, 5, 0],
  }));
  useFrame(() => {
    console.log('Box useFrame, ref.current:', ref.current);
    if (ref.current && boxRef) {
      boxRef.current = ref.current; // Assign the physics body
      console.log('boxRef assigned:', boxRef.current.position);
    }
  });
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




function Visualizer({ onPhysicsUpdate }) {
  const [fps, setFps] = useState(0);
  const boxRef = useRef();

  return (

    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas
        style={{ height: '100%', width: '100%' }}
        camera={{ position: [0, 5, 10], fov: 50 }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Physics>
          <Box />
          <Plane />
        </Physics>
        <OrbitControls />
        <axesHelper args={[5]} />
        <Stats />
        <PhysicsSync boxRef={boxRef} onPhysicsUpdate={onPhysicsUpdate} />
        <FpsCounter setFps={setFps} />
      </Canvas>
      <div
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          color: 'black',
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