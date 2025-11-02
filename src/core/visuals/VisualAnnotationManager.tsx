/**
 * Visual Annotation Manager Component
 * Main component that renders all visual annotations for a scene
 */

import { useMemo, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { VisualAnnotation, PhysicsData } from './types';
import { TextAnnotationComponent } from './annotations/TextAnnotationComponent';
import { VectorAnnotationComponent } from './annotations/VectorAnnotationComponent';
import { PhysicsFormatter } from './renderers/CanvasSpriteRenderer';
import { physicsDataStore } from '../physics/PhysicsDataStore';

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

          default:
            return null;
        }
      })}
    </>
  );
}

export default VisualAnnotationManager;
