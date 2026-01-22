/**
 * Visual Annotation Manager Component
 * Main component that renders all visual annotations for a scene
 */

import { useMemo, useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VisualAnnotation, PhysicsData, CustomAnnotation } from './types';
import { TextAnnotationComponent } from './annotations/TextAnnotationComponent';
import { VectorAnnotationComponent } from './annotations/VectorAnnotationComponent';
import { PhysicsFormatter } from './renderers/CanvasSpriteRenderer';
import { physicsDataStore } from '../physics/PhysicsDataStore';
import { calculateWorldPosition, getObjectSize } from './utils/CoordinateUtils';

/**
 * Annotation position data for repulsion calculations
 */
interface AnnotationPositionData {
  id: string;
  basePosition: THREE.Vector3;
  adjustedOffset: [number, number, number];
  width: number;
  height: number;
}

/**
 * Repulsion system to prevent annotation overlap
 */
class AnnotationRepulsionSystem {
  private positions: Map<string, AnnotationPositionData> = new Map();
  private originalOffsets: Map<string, [number, number, number]> = new Map();

  /**
   * Register an annotation's position
   */
  registerPosition(
    id: string, 
    basePosition: THREE.Vector3, 
    originalOffset: [number, number, number],
    width: number = 2,
    height: number = 1
  ) {
    // Store original offset if not already stored
    if (!this.originalOffsets.has(id)) {
      this.originalOffsets.set(id, [...originalOffset]);
    }
    
    const existing = this.positions.get(id);
    const original = this.originalOffsets.get(id)!;
    
    // Gradually return to original offset when not overlapping
    const currentOffset = existing?.adjustedOffset || [...originalOffset];
    currentOffset[0] = currentOffset[0] * 0.92 + original[0] * 0.08;
    currentOffset[1] = currentOffset[1] * 0.92 + original[1] * 0.08;
    currentOffset[2] = currentOffset[2] * 0.92 + original[2] * 0.08;
    
    this.positions.set(id, {
      id,
      basePosition: basePosition.clone(),
      adjustedOffset: currentOffset as [number, number, number],
      width,
      height
    });
  }

  /**
   * Get adjusted offset for an annotation after repulsion
   */
  getAdjustedOffset(id: string): [number, number, number] | null {
    return this.positions.get(id)?.adjustedOffset || null;
  }

  /**
   * Calculate repulsion between all annotations
   */
  calculateRepulsion(_camera: THREE.Camera) {
    const annotationList = Array.from(this.positions.values());
    if (annotationList.length < 2) return;

    // Calculate world positions with current offsets
    const worldPositions: Map<string, THREE.Vector3> = new Map();
    
    annotationList.forEach(ann => {
      const worldPos = ann.basePosition.clone();
      worldPos.x += ann.adjustedOffset[0];
      worldPos.y += ann.adjustedOffset[1];
      worldPos.z += ann.adjustedOffset[2];
      worldPositions.set(ann.id, worldPos);
    });

    // Check each pair for overlap in world space
    for (let i = 0; i < annotationList.length; i++) {
      for (let j = i + 1; j < annotationList.length; j++) {
        const a = annotationList[i];
        const b = annotationList[j];

        const posA = worldPositions.get(a.id)!;
        const posB = worldPositions.get(b.id)!;

        // Calculate world-space distance
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dz = posB.z - posA.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Overlap threshold based on estimated annotation sizes in world units
        // fontSize of 40 roughly translates to ~2-3 world units width
        const sizeA = (a.width + a.height) * 0.5;
        const sizeB = (b.width + b.height) * 0.5;
        const overlapThreshold = sizeA + sizeB + 1.5; // Add some padding

        if (distance < overlapThreshold && distance > 0.01) {
          // Calculate separation needed
          const overlap = overlapThreshold - distance;
          const separationForce = overlap * 0.25; // Gentle force
          
          // Normalize direction
          const nx = dx / distance;
          const ny = dy / distance;

          // Push apart - prefer horizontal (X) separation, then vertical (Y)
          // This keeps labels readable and not too far from their objects
          const xPush = Math.abs(nx) > 0.1 ? nx * separationForce * 0.6 : (Math.random() - 0.5) * separationForce * 0.3;
          const yPush = ny * separationForce * 0.4;
          
          a.adjustedOffset[0] -= xPush;
          a.adjustedOffset[1] -= yPush;
          b.adjustedOffset[0] += xPush;
          b.adjustedOffset[1] += yPush;
        }
      }
    }
  }

  /**
   * Clear all positions
   */
  clear() {
    this.positions.clear();
  }
}

// Global repulsion system instance
const repulsionSystem = new AnnotationRepulsionSystem();

interface VisualAnnotationManagerProps {
  annotations: VisualAnnotation[];
  physicsData: { [objectId: string]: { velocity: number[]; position: number[]; time: number } };
  sceneObjects: any[];
  isPlaying: boolean;
  enabled?: boolean;
}

export function VisualAnnotationManager({
  annotations,
  physicsData: _physicsData, // Not used anymore, we get data from store
  sceneObjects,
  isPlaying,
  enabled = true
}: VisualAnnotationManagerProps) {
  const { camera } = useThree();
  const frameCount = useRef(0);
  
  // Get physics data directly from store and update every frame
  const [physicsData, setPhysicsData] = useState<{ [objectId: string]: { velocity: number[]; position: number[]; time: number } }>({});
  
  // Create object lookup map
  const objectMap = useMemo(() => {
    const map = new Map();
    sceneObjects.forEach(obj => {
      map.set(obj.id, obj);
    });
    return map;
  }, [sceneObjects]);

  useFrame(() => {
    // Update physics data from store every frame for smooth annotations
    const snapshot = physicsDataStore.getSnapshot();
    const combined: { [objectId: string]: { velocity: number[]; position: number[]; time: number } } = {};
    Object.keys(snapshot.velocities || {}).forEach(id => {
      combined[id] = {
        velocity: snapshot.velocities[id] || [0, 0, 0],
        position: snapshot.positions[id] || [0, 0, 0],
        time: performance.now() / 1000 // Convert to seconds
      };
    });
    setPhysicsData(combined);

    // Run repulsion calculation every 3 frames for performance
    frameCount.current++;
    if (frameCount.current % 3 === 0 && annotations && annotations.length > 1) {
      // Register all annotation positions
      annotations.forEach(annotation => {
        if (annotation.type !== 'text' || annotation.visible === false) return;
        
        const objectConfig = objectMap.get(annotation.attachedToObjectId);
        const objectPhysicsRaw = combined[annotation.attachedToObjectId];
        if (!objectConfig || !objectPhysicsRaw) return;

        // Better size estimate: fontSize 40 ≈ 3 world units, text length matters
        const fontSize = (annotation as any).fontSize || 14;
        const estimatedWidth = fontSize * 0.08; // ~3.2 units for fontSize 40
        const estimatedHeight = fontSize * 0.04; // ~1.6 units for fontSize 40

        // basePosition = object's physics position (center of the object)
        // originalOffset = annotation's configured offset from the object center
        // adjustedOffset will be modified by repulsion from originalOffset
        const basePos = new THREE.Vector3(...(objectPhysicsRaw.position as [number, number, number]));
        
        repulsionSystem.registerPosition(
          annotation.id,
          basePos,
          (annotation.offset as [number, number, number]) || [0, 0, 0],
          estimatedWidth,
          estimatedHeight
        );
      });

      // Calculate repulsion
      repulsionSystem.calculateRepulsion(camera);
    }
  });

  // Don't render if disabled
  if (!enabled || !annotations || annotations.length === 0) {
    return null;
  }

  return (
    <>
      {annotations.map((annotation) => {
        // Get object this annotation is attached to
        const objectConfig = objectMap.get(annotation.attachedToObjectId);
        if (!objectConfig) return null;

        // Get physics data for this object
        const objectPhysicsRaw = physicsData[annotation.attachedToObjectId];
        if (!objectPhysicsRaw) return null;

        // Safely extract velocity and position with defaults
        const velocity: [number, number, number] = objectPhysicsRaw.velocity 
          ? [objectPhysicsRaw.velocity[0] || 0, objectPhysicsRaw.velocity[1] || 0, objectPhysicsRaw.velocity[2] || 0]
          : [0, 0, 0];
        const position: [number, number, number] = objectPhysicsRaw.position
          ? [objectPhysicsRaw.position[0] || 0, objectPhysicsRaw.position[1] || 0, objectPhysicsRaw.position[2] || 0]
          : [0, 0, 0];

        // Convert to PhysicsData format with computed values
        const objectPhysics: PhysicsData = {
          objectId: annotation.attachedToObjectId,
          position: position,
          velocity: velocity,
          mass: objectConfig.mass,
          time: objectPhysicsRaw.time,
          speed: PhysicsFormatter.magnitude(velocity),
          kineticEnergy: PhysicsFormatter.kineticEnergy(
            objectConfig.mass || 1,
            velocity
          ),
          momentum: PhysicsFormatter.momentum(
            objectConfig.mass || 1,
            velocity
          )
        };

        // Check visibility conditions
        if (annotation.showWhenPlaying !== undefined && annotation.showWhenPlaying !== isPlaying) {
          return null;
        }
        if (annotation.showWhenPaused !== undefined && annotation.showWhenPaused === isPlaying) {
          return null;
        }
        if (annotation.visible === false) {
          return null;
        }

        // Get adjusted offset from repulsion system (for text annotations)
        const adjustedOffset = annotation.type === 'text' 
          ? repulsionSystem.getAdjustedOffset(annotation.id) 
          : null;

        // Render appropriate annotation component
        switch (annotation.type) {
          case 'text':
            return (
              <TextAnnotationComponent
                key={annotation.id}
                annotation={{
                  ...annotation,
                  offset: adjustedOffset || annotation.offset
                }}
                physicsData={objectPhysics}
                objectConfig={objectConfig}
                camera={camera}
              />
            );

          case 'vector':
            return (
              <VectorAnnotationComponent
                key={annotation.id}
                annotation={annotation}
                physicsData={objectPhysics}
                objectConfig={objectConfig}
                camera={camera}
              />
            );

          case 'trail':
            // TODO: Implement TrailAnnotationComponent
            return null;

          case 'symbol':
            // TODO: Implement SymbolAnnotationComponent
            return null;

          case 'effect':
            // TODO: Implement EffectAnnotationComponent
            return null;

          case 'custom':
            return (
              <CustomAnnotationRenderer
                key={annotation.id}
                annotation={annotation as CustomAnnotation}
                physicsData={objectPhysics}
                objectConfig={objectConfig}
                camera={camera}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

/**
 * Custom Annotation Renderer - Inline component for executing custom code
 */
function CustomAnnotationRenderer({ 
  annotation, 
  physicsData, 
  objectConfig,
  camera
}: {
  annotation: CustomAnnotation;
  physicsData: PhysicsData;
  objectConfig: any;
  camera: THREE.Camera;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const customObjectRef = useRef<THREE.Object3D | null>(null);
  const { scene } = useThree();
  const timeRef = useRef(0);

  // Parse and compile functions once
  const { createObjectFn, renderCodeFn } = useMemo(() => {
    const parseFunction = (code: string | Function | undefined) => {
      if (!code) return null;
      
      try {
        if (typeof code === 'function') {
          return code;
        }
        
        // Parse string as function
        const fnStr = code.trim();
        if (fnStr.startsWith('(') || fnStr.startsWith('function')) {
          // eslint-disable-next-line no-new-func
          return new Function('return ' + fnStr)();
        } else {
          // Assume it's a function body
          // eslint-disable-next-line no-new-func
          return new Function('context', fnStr);
        }
      } catch (error) {
        console.error('Error parsing function:', error);
        return null;
      }
    };

    return {
      createObjectFn: parseFunction(annotation.createObject),
      renderCodeFn: parseFunction(annotation.renderCode)
    };
  }, [annotation.createObject, annotation.renderCode]);

  // Create initial custom object
  useMemo(() => {
    if (!groupRef.current || !createObjectFn || customObjectRef.current) return;

    try {
      // Create context with THREE available
      const context = {
        physicsData,
        objectConfig,
        THREE, // Make THREE.js available
      };

      // Call function with both context and THREE as separate parameter for string-based functions
      const customObject = typeof createObjectFn === 'function' 
        ? createObjectFn.length === 2 ? createObjectFn(context, THREE) : createObjectFn(context)
        : null;
      
      if (customObject && customObject.isObject3D) {
        customObjectRef.current = customObject;
        if (groupRef.current) {
          groupRef.current.add(customObject);
        }
      }
    } catch (error) {
      console.error('Error executing createObject:', error);
    }
  }, [createObjectFn, physicsData, objectConfig]);

  // Update position and execute render code each frame
  useFrame((_state, delta) => {
    if (!groupRef.current || !annotation.visible) return;

    const group = groupRef.current;
    timeRef.current += delta;

    // Update position to follow object
    const worldPos = calculateWorldPosition(
      physicsData.position,
      annotation.offset || [0, 0, 0],
      annotation.anchor || 'center',
      [1, 1, 1]
    );
    group.position.copy(worldPos);

    // Execute render code
    if (renderCodeFn && customObjectRef.current) {
      try {
        const context = {
          physicsData,
          objectConfig,
          time: timeRef.current,
          mesh: customObjectRef.current,
          scene,
          camera,
          THREE,
        };

        renderCodeFn(context);
      } catch (error) {
        console.error('Error executing renderCode:', error);
      }
    }
  });

  if (!annotation.visible) return null;

  return <group ref={groupRef} />;
}

export default VisualAnnotationManager;
