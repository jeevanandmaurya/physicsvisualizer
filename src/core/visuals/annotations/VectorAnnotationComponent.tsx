/**
 * Vector Annotation Component
 * Displays arrows for velocity, force, acceleration, etc.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VectorAnnotation, PhysicsData } from '../types';
import { PhysicsFormatter } from '../renderers/CanvasSpriteRenderer';
import { calculateWorldPosition, getObjectSize } from '../utils/CoordinateUtils';

interface VectorAnnotationProps {
  annotation: VectorAnnotation;
  physicsData: PhysicsData;
  objectConfig: any;
  camera: THREE.Camera;
}

export function VectorAnnotationComponent({ 
  annotation, 
  physicsData, 
  objectConfig
}: VectorAnnotationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  const targetPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const smoothPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Create geometries once
  const geometries = useMemo(() => ({
    shaft: new THREE.CylinderGeometry(1, 1, 1, 8),
    cone: new THREE.ConeGeometry(1, 1, 8)
  }), []);

  // Reusable Three.js objects
  const dir = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);

  // Get vector based on type
  const getVector = (): THREE.Vector3 => {
    let vec: [number, number, number];

    switch (annotation.vectorType) {
      case 'velocity':
        vec = physicsData.velocity;
        break;
      
      case 'momentum':
        if (physicsData.momentum) {
          vec = physicsData.momentum;
        } else {
          vec = PhysicsFormatter.momentum(
            physicsData.mass || 1,
            physicsData.velocity
          );
        }
        break;
      
      case 'acceleration':
        // Would need to calculate from velocity history
        // For now, return zero
        vec = [0, 0, 0];
        break;
      
      case 'force':
        // Would need force data from physics engine
        vec = [0, 0, 0];
        break;
      
      case 'custom':
        if (annotation.customVector) {
          if (typeof annotation.customVector === 'function') {
            vec = annotation.customVector(physicsData);
          } else {
            vec = annotation.customVector;
          }
        } else {
          vec = [0, 0, 0];
        }
        break;
      
      default:
        vec = [0, 0, 0];
    }

    return new THREE.Vector3(...vec);
  };

  // Update arrow each frame
  useFrame(() => {
    const group = groupRef.current;
    const shaft = shaftRef.current;
    const cone = coneRef.current;

    if (!group || !shaft || !cone) return;

    // Get and scale vector
    const vector = getVector();
    const scale = annotation.scale || 1.0;
    vector.multiplyScalar(scale);

    const length = vector.length();

    // Hide if vector is too small
    if (length < 0.01) {
      group.visible = false;
      return;
    }
    group.visible = true;

    // Position arrow at object location with smooth interpolation
    const objectSize = getObjectSize(objectConfig);
    const worldPos = calculateWorldPosition(
      physicsData.position,
      annotation.offset || [0, 0, 0],
      annotation.anchor || 'center',
      objectSize
    );
    
    // Smooth position interpolation to reduce flickering
    targetPosition.current.copy(worldPos);
    const smoothness = annotation.smoothness || 0.15;
    smoothPosition.current.lerp(targetPosition.current, smoothness);
    group.position.copy(smoothPosition.current);

    // Orient arrow
    dir.copy(vector).normalize();
    quaternion.setFromUnitVectors(up, dir);
    group.quaternion.copy(quaternion);

    // Size arrow components
    const headLength = Math.max(length * (annotation.headLength || 0.25), 0.1);
    const headRadius = Math.max(length * (annotation.headRadius || 0.08), 0.03);
    const shaftRadius = Math.max(length * (annotation.shaftRadius || 0.02), 0.01);
    const shaftLength = Math.max(length - headLength, 0.05);

    // Apply scales and positions
    shaft.scale.set(shaftRadius, shaftLength, shaftRadius);
    shaft.position.set(0, shaftLength / 2, 0);

    cone.scale.set(headRadius, headLength, headRadius);
    cone.position.set(0, shaftLength + headLength / 2, 0);

    // Apply visibility based on speed
    if (annotation.minSpeed !== undefined) {
      const speed = PhysicsFormatter.magnitude(physicsData.velocity);
      group.visible = speed >= annotation.minSpeed;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={shaftRef} geometry={geometries.shaft}>
        <meshStandardMaterial color={annotation.color || '#00ff88'} />
      </mesh>
      <mesh ref={coneRef} geometry={geometries.cone}>
        <meshStandardMaterial color={annotation.color || '#00ff88'} />
      </mesh>
    </group>
  );
}
