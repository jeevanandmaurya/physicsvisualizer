import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AnimatedPoints() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate points in a 3D grid
  const gridSize = 8; // 17x17x17 = 4913 points
  const spacing = 10;
  const initialPositions = useMemo(() => {
    const positions = [];
    for (let x = -gridSize; x <= gridSize; x++) {
      for (let y = -gridSize; y <= gridSize; y++) {
        for (let z = -gridSize; z <= gridSize; z++) {
          positions.push(x * spacing, y * spacing, z * spacing);
        }
      }
    }
    return new Float32Array(positions);
  }, []);

  const positionsRef = useRef(initialPositions);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Move camera in a static pattern within a cubic boundary
    const range = 40;
    state.camera.position.x = range * Math.sin(time * 0.1);
    state.camera.position.y = range * Math.sin(time * 0.13 + Math.PI / 3);
    state.camera.position.z = range * 0.5 * Math.sin(time * 0.07);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        transparent
        color="#ffffff"
        size={0.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.8}
      />
    </points>
  );
}

interface HeroAnimationProps {
  className?: string;
}

const HeroAnimation: React.FC<HeroAnimationProps> = ({ className }) => {
  return (
    <div className={`hero-animation ${className || ''}`} style={{ filter: 'blur(1px) opacity(0.3)' }}>
      <Canvas
        camera={{ position: [0, 0, 50], fov: 90 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true }}
      >
        <AnimatedPoints />
      </Canvas>
    </div>
  );
};

export default HeroAnimation;