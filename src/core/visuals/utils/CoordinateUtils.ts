/**
 * Coordinate Utilities
 * Helper functions for 3D positioning and camera-relative calculations
 */

import * as THREE from 'three';
import { AnchorPosition } from '../types';

/**
 * Calculate world position with offset and anchor
 */
export function calculateWorldPosition(
  objectPosition: [number, number, number],
  offset: [number, number, number] = [0, 0, 0],
  anchor: AnchorPosition = 'top',
  objectSize: [number, number, number] = [1, 1, 1]
): THREE.Vector3 {
  const pos = new THREE.Vector3(...objectPosition);
  
  // Apply anchor offset based on object size
  const anchorOffset = getAnchorOffset(anchor, objectSize);
  pos.add(anchorOffset);
  
  // Apply custom offset
  pos.x += offset[0];
  pos.y += offset[1];
  pos.z += offset[2];
  
  return pos;
}

/**
 * Get anchor offset vector based on anchor position
 */
export function getAnchorOffset(
  anchor: AnchorPosition,
  objectSize: [number, number, number]
): THREE.Vector3 {
  const [width, height] = objectSize;
  const halfW = width / 2;
  const halfH = height / 2;
  
  switch (anchor) {
    case 'top':
      return new THREE.Vector3(0, halfH, 0);
    case 'bottom':
      return new THREE.Vector3(0, -halfH, 0);
    case 'left':
      return new THREE.Vector3(-halfW, 0, 0);
    case 'right':
      return new THREE.Vector3(halfW, 0, 0);
    case 'center':
      return new THREE.Vector3(0, 0, 0);
    case 'top-left':
      return new THREE.Vector3(-halfW, halfH, 0);
    case 'top-right':
      return new THREE.Vector3(halfW, halfH, 0);
    case 'bottom-left':
      return new THREE.Vector3(-halfW, -halfH, 0);
    case 'bottom-right':
      return new THREE.Vector3(halfW, -halfH, 0);
    default:
      return new THREE.Vector3(0, 0, 0);
  }
}

/**
 * Calculate distance-based scale for annotations
 */
export function calculateDistanceScale(
  objectPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3,
  minScale: number = 0.5,
  maxScale: number = 2.0,
  minDistance: number = 5,
  maxDistance: number = 50
): number {
  const distance = objectPosition.distanceTo(cameraPosition);
  
  if (distance <= minDistance) return maxScale;
  if (distance >= maxDistance) return minScale;
  
  // Linear interpolation
  const t = (distance - minDistance) / (maxDistance - minDistance);
  return maxScale - t * (maxScale - minScale);
}

/**
 * Calculate opacity based on distance (for fade effect)
 */
export function calculateDistanceOpacity(
  objectPosition: THREE.Vector3,
  cameraPosition: THREE.Vector3,
  fadeDistance: number = 100,
  fadeRange: number = 20
): number {
  const distance = objectPosition.distanceTo(cameraPosition);
  
  if (distance <= fadeDistance) return 1.0;
  if (distance >= fadeDistance + fadeRange) return 0.0;
  
  // Linear fade
  const t = (distance - fadeDistance) / fadeRange;
  return 1.0 - t;
}

/**
 * Check if annotation should be visible based on object speed
 */
export function shouldShowBasedOnSpeed(
  velocity: [number, number, number],
  minSpeed: number = 0
): boolean {
  const speed = Math.sqrt(
    velocity[0] * velocity[0] +
    velocity[1] * velocity[1] +
    velocity[2] * velocity[2]
  );
  return speed >= minSpeed;
}

/**
 * Get object size from scene object config
 */
export function getObjectSize(objectConfig: any): [number, number, number] {
  switch (objectConfig.type) {
    case 'Sphere':
      const radius = objectConfig.radius || 0.5;
      return [radius * 2, radius * 2, radius * 2];
    
    case 'Box':
      return objectConfig.dimensions || [1, 1, 1];
    
    case 'Cylinder':
    case 'Cone':
    case 'Capsule':
      const r = objectConfig.radius || 0.5;
      const h = objectConfig.height || 1;
      return [r * 2, h, r * 2];
    
    default:
      return [1, 1, 1];
  }
}

/**
 * Create billboard matrix (sprite always faces camera)
 */
export function createBillboardMatrix(
  cameraPosition: THREE.Vector3,
  objectPosition: THREE.Vector3
): THREE.Matrix4 {
  const matrix = new THREE.Matrix4();
  matrix.lookAt(objectPosition, cameraPosition, new THREE.Vector3(0, 1, 0));
  return matrix;
}

/**
 * Convert velocity vector to arrow direction and magnitude
 */
export function velocityToArrow(
  velocity: [number, number, number],
  scale: number = 1.0
): { direction: THREE.Vector3; magnitude: number } {
  const vec = new THREE.Vector3(...velocity);
  const magnitude = vec.length();
  const direction = vec.clone().normalize();
  
  return {
    direction,
    magnitude: magnitude * scale
  };
}

/**
 * Interpolate between two colors based on value
 */
export function interpolateColor(
  color1: string,
  color2: string,
  t: number
): string {
  const c1 = new THREE.Color(color1);
  const c2 = new THREE.Color(color2);
  
  const r = c1.r + (c2.r - c1.r) * t;
  const g = c1.g + (c2.g - c1.g) * t;
  const b = c1.b + (c2.b - c1.b) * t;
  
  return `rgb(${Math.floor(r * 255)}, ${Math.floor(g * 255)}, ${Math.floor(b * 255)})`;
}

/**
 * Map speed to color gradient
 */
export function speedToColor(
  speed: number,
  minSpeed: number = 0,
  maxSpeed: number = 10,
  slowColor: string = '#0000ff',
  fastColor: string = '#ff0000'
): string {
  const t = Math.min(Math.max((speed - minSpeed) / (maxSpeed - minSpeed), 0), 1);
  return interpolateColor(slowColor, fastColor, t);
}

/**
 * Clamp value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}
