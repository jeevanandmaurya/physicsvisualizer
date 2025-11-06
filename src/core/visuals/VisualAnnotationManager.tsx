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
import { calculateWorldPosition } from './utils/CoordinateUtils';

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
  
  // Get physics data directly from store and update every frame
  const [physicsData, setPhysicsData] = useState<{ [objectId: string]: { velocity: number[]; position: number[]; time: number } }>({});
  
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
  });

  // Don't render if disabled
  if (!enabled || !annotations || annotations.length === 0) {
    return null;
  }

  // Create object lookup map
  const objectMap = useMemo(() => {
    const map = new Map();
    sceneObjects.forEach(obj => {
      map.set(obj.id, obj);
    });
    return map;
  }, [sceneObjects]);

  return (
    <>
      {annotations.map((annotation) => {
        // Get object this annotation is attached to
        const objectConfig = objectMap.get(annotation.attachedToObjectId);
        if (!objectConfig) return null;

        // Get physics data for this object
        const objectPhysicsRaw = physicsData[annotation.attachedToObjectId];
        if (!objectPhysicsRaw) return null;

        // Convert to PhysicsData format with computed values
        const objectPhysics: PhysicsData = {
          objectId: annotation.attachedToObjectId,
          position: objectPhysicsRaw.position as [number, number, number],
          velocity: objectPhysicsRaw.velocity as [number, number, number],
          mass: objectConfig.mass,
          time: objectPhysicsRaw.time,
          speed: PhysicsFormatter.magnitude(objectPhysicsRaw.velocity as [number, number, number]),
          kineticEnergy: PhysicsFormatter.kineticEnergy(
            objectConfig.mass || 1,
            objectPhysicsRaw.velocity as [number, number, number]
          ),
          momentum: PhysicsFormatter.momentum(
            objectConfig.mass || 1,
            objectPhysicsRaw.velocity as [number, number, number]
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

        // Render appropriate annotation component
        switch (annotation.type) {
          case 'text':
            return (
              <TextAnnotationComponent
                key={annotation.id}
                annotation={annotation}
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
