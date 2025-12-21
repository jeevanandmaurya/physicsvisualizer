/**
 * Text Annotation Component
 * Displays dynamic text labels using THREE.js sprites
 */

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TextAnnotation, PhysicsData } from '../types';
import { CanvasSpriteRenderer, PhysicsFormatter } from '../renderers/CanvasSpriteRenderer';
import { calculateWorldPosition, getObjectSize, calculateDistanceScale, calculateDistanceOpacity } from '../utils/CoordinateUtils';

interface TextAnnotationProps {
  annotation: TextAnnotation;
  physicsData: PhysicsData;
  objectConfig: any;
  camera: THREE.Camera;
}

export function TextAnnotationComponent({ 
  annotation, 
  physicsData, 
  objectConfig,
  camera 
}: TextAnnotationProps) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const rendererRef = useRef<CanvasSpriteRenderer>(new CanvasSpriteRenderer());
  const lastUpdateTime = useRef<number>(0);
  const targetPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  const smoothPosition = useRef<THREE.Vector3>(new THREE.Vector3());
  
  // Base scale derived from text dimensions
  const baseScale = useRef<THREE.Vector3>(new THREE.Vector3(1, 1, 1));
  
  // Calculate update interval from frequency
  const updateInterval = useMemo(() => {
    const frequency = annotation.updateFrequency || 30;
    return 1000 / frequency; // Convert Hz to ms
  }, [annotation.updateFrequency]);

  // Initial texture creation
  const initialTexture = useMemo(() => {
    const text = getAnnotationText(annotation, physicsData);
    const result = rendererRef.current.renderText({
      text,
      fontSize: annotation.fontSize || 16,
      fontFamily: annotation.fontFamily || 'Arial',
      color: annotation.color || '#ffffff',
      backgroundColor: annotation.backgroundColor || 'rgba(0, 0, 0, 0.7)',
      padding: annotation.padding || 8,
      borderRadius: annotation.borderRadius || 4,
      opacity: annotation.opacity || 1.0,
      resolutionScale: 4.0 // High resolution for sharpness
    });
    
    // Set initial base scale
    const scale = (annotation.fontSize || 16) / 16;
    baseScale.current.set(result.width / 40 * scale, result.height / 40 * scale, 1);
    
    return result;
  }, []); // Only create once

  // Update text content and position each frame
  useFrame(() => {
    if (!spriteRef.current) return;

    const now = Date.now();
    const sprite = spriteRef.current;

    // Calculate target position
    const objectSize = getObjectSize(objectConfig);
    const worldPos = calculateWorldPosition(
      physicsData.position,
      annotation.offset || [0, 0, 0],
      annotation.anchor || 'top',
      objectSize
    );
    
    // Smooth position interpolation to reduce flickering
    targetPosition.current.copy(worldPos);
    const smoothness = annotation.smoothness || 0.15; // Lower = smoother but more lag
    smoothPosition.current.lerp(targetPosition.current, smoothness);
    sprite.position.copy(smoothPosition.current);

    // Update text content at specified frequency
    if (now - lastUpdateTime.current >= updateInterval) {
      const text = getAnnotationText(annotation, physicsData);
      const result = rendererRef.current.renderText({
        text,
        fontSize: annotation.fontSize || 16,
        fontFamily: annotation.fontFamily || 'Arial',
        color: annotation.color || '#ffffff',
        backgroundColor: annotation.backgroundColor || 'rgba(0, 0, 0, 0.7)',
        padding: annotation.padding || 8,
        borderRadius: annotation.borderRadius || 4,
        opacity: annotation.opacity || 1.0,
        resolutionScale: 4.0
      });
      
      if (sprite.material.map) {
        sprite.material.map.dispose();
      }
      sprite.material.map = result.texture;
      sprite.material.needsUpdate = true;
      
      // Update base scale based on new text dimensions
      const scale = (annotation.fontSize || 16) / 16;
      baseScale.current.set(result.width / 40 * scale, result.height / 40 * scale, 1);
      
      lastUpdateTime.current = now;
    }

    // Calculate distance-based scaling
    const cameraPos = camera.position;
    const distanceScale = calculateDistanceScale(
      worldPos,
      cameraPos,
      annotation.minScale || 0.4,
      annotation.maxScale || 2.5,
      5,  // minDistance
      60  // maxDistance
    );
    
    // Smooth scale interpolation (prevents jittery resizing)
    // We lerp towards (baseScale * distanceScale) for ultra-smooth transitions
    const scaleSmooth = annotation.smoothness || 0.1; // Slower lerp for "not noticeable" transitions
    sprite.scale.x = THREE.MathUtils.lerp(sprite.scale.x, baseScale.current.x * distanceScale, scaleSmooth);
    sprite.scale.y = THREE.MathUtils.lerp(sprite.scale.y, baseScale.current.y * distanceScale, scaleSmooth);
    sprite.scale.z = 1;

    // Distance-based opacity (fade effect)
    if (annotation.fadeDistance) {
      const opacity = calculateDistanceOpacity(
        worldPos,
        cameraPos,
        annotation.fadeDistance,
        20
      );
      sprite.material.opacity = opacity * (annotation.opacity || 1.0);
    }

    // Visibility based on speed
    if (annotation.minSpeed !== undefined) {
      const speed = PhysicsFormatter.magnitude(physicsData.velocity);
      sprite.visible = speed >= annotation.minSpeed;
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      if (spriteRef.current?.material.map) {
        spriteRef.current.material.map.dispose();
      }
      rendererRef.current.dispose();
    };
  }, []);

  return (
    <sprite ref={spriteRef}>
      <spriteMaterial
        map={initialTexture.texture}
        transparent
        opacity={annotation.opacity || 1.0}
        depthTest={true}
        depthWrite={false}
      />
    </sprite>
  );
}

/**
 * Helper function to get text content based on annotation configuration
 */
function getAnnotationText(annotation: TextAnnotation, physicsData: PhysicsData): string {
  let text = '';

  // Get base text
  if (annotation.customText) {
    if (typeof annotation.customText === 'function') {
      text = annotation.customText(physicsData);
    } else {
      text = annotation.customText;
    }
  } else if (annotation.contentType) {
    text = PhysicsFormatter.getFormattedText(
      annotation.contentType,
      physicsData,
      annotation.precision || 2
    );
  }

  // Add prefix and suffix
  if (annotation.prefix) {
    text = annotation.prefix + text;
  }
  if (annotation.suffix) {
    text = text + annotation.suffix;
  }

  return text;
}
