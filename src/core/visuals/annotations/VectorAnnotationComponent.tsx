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
  objectConfig,
  camera
}: VectorAnnotationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const shaftRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);
  
  // Smooth vector for length and direction transitions
  const smoothVector = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetVector = useRef<THREE.Vector3>(new THREE.Vector3());
  
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
    targetVector.current.copy(vector).multiplyScalar(scale);
    
    // Smoothly interpolate the vector itself (handles both length and direction)
    const smoothness = annotation.smoothness || 0.15;
    smoothVector.current.lerp(targetVector.current, smoothness);

    const length = smoothVector.current.length();

    // Limit maximum vector length to prevent overly long arrows
    const maxLength = annotation.maxLength || 5.0; // Default max length of 5 units
    if (length > maxLength) {
      smoothVector.current.normalize().multiplyScalar(maxLength);
    }

    const finalLength = smoothVector.current.length();

    // Hide if vector is too small
    if (finalLength < 0.01) {
      group.visible = false;
      return;
    }
    group.visible = true;

    // Position arrow at object location
    const objectSize = getObjectSize(objectConfig);
    const worldPos = calculateWorldPosition(
      physicsData.position,
      annotation.offset || [0, 0, 0],
      annotation.anchor || 'center',
      objectSize
    );
    
    group.position.copy(worldPos);

    // Orient arrow using the smoothed vector
    dir.copy(smoothVector.current).normalize();
    quaternion.setFromUnitVectors(up, dir);
    group.quaternion.copy(quaternion);

    // Calculate screen-constant scale based on camera distance
    const cameraPos = camera.position;
    const distance = worldPos.distanceTo(cameraPos);
    const referenceDistance = 75;
    const screenConstantScale = distance / referenceDistance;

    // Size arrow components based on smoothed length, scaled for constant screen size
    // Smaller default multipliers and minimum caps for more compact vectors
    const headLength = Math.max(finalLength * (annotation.headLength || 0.18), 0.06) * screenConstantScale;
    const headRadius = Math.max(finalLength * (annotation.headRadius || 0.06), 0.02) * screenConstantScale;
    const shaftRadius = Math.max(finalLength * (annotation.shaftRadius || 0.012), 0.005) * screenConstantScale;
    const shaftLength = Math.max(finalLength - headLength / screenConstantScale, 0.03) * screenConstantScale;

    // Clamp radii so arrows never become excessively thick
    // Reduced maximum radii to keep arrows slim and added configurable limits
    const maxHeadRadius = Math.min(annotation.maxHeadRadius || 0.5, Math.max(0.06 * screenConstantScale, finalLength * 0.3 * screenConstantScale));
    const maxShaftRadius = Math.min(annotation.maxShaftRadius || 0.2, Math.max(0.03 * screenConstantScale, finalLength * 0.15 * screenConstantScale));
    const finalHeadRadius = Math.min(headRadius, maxHeadRadius);
    const finalShaftRadius = Math.min(shaftRadius, maxShaftRadius);

    // Apply scales and positions
    shaft.scale.set(finalShaftRadius, shaftLength, finalShaftRadius);
    shaft.position.set(0, shaftLength / 2, 0);

    cone.scale.set(finalHeadRadius, headLength, finalHeadRadius);
    cone.position.set(0, shaftLength + headLength / 2, 0);

    // Apply visibility based on speed
    if (annotation.minSpeed !== undefined) {
      const speed = PhysicsFormatter.magnitude(physicsData.velocity);
      group.visible = speed >= annotation.minSpeed;
    }

    // Apply visibility based on distance (default max distance of 100 units)
    const maxDistance = annotation.maxDistance ?? 100;
    const cameraDistance = worldPos.distanceTo(cameraPos);
    group.visible = group.visible && (cameraDistance <= maxDistance);
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
