/**
 * ScenePreviewRenderer - Ultra-compact 3D preview for scene cards
 * Renders scene objects without physics, animates camera on hover
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import './ScenePreviewRenderer.css';

interface ScenePreviewRendererProps {
  sceneId: string;
  sceneData?: any;
  isHovered?: boolean;
}

// Camera animation positions (8 positions around circle, at different heights)
const CAMERA_POSITIONS = [
  { angle: 0, height: 0.8 },
  { angle: Math.PI / 4, height: 1.0 },
  { angle: Math.PI / 2, height: 0.9 },
  { angle: (3 * Math.PI) / 4, height: 1.1 },
  { angle: Math.PI, height: 0.8 },
  { angle: (5 * Math.PI) / 4, height: 1.0 },
  { angle: (3 * Math.PI) / 2, height: 0.9 },
  { angle: (7 * Math.PI) / 4, height: 1.1 },
];

const CAMERA_RADIUS = 15;
const CAMERA_UPDATE_INTERVAL = 400; // ms between camera position updates (very low fps ~2.5)

export const ScenePreviewRenderer: React.FC<ScenePreviewRendererProps> = ({
  sceneId,
  sceneData: initialSceneData,
  isHovered = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraPositionIndexRef = useRef(0);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sceneDataRef = useRef<any>(null);
  const sceneCenterRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isInitializedRef = useRef(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Calculate scene bounds and center
  const calculateSceneBounds = useCallback((objects: any[]) => {
    if (!objects || objects.length === 0) {
      return { center: new THREE.Vector3(0, 0, 0), radius: 10 };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    objects.forEach((obj: any) => {
      const pos = Array.isArray(obj.position) 
        ? obj.position 
        : [obj.position?.x || 0, obj.position?.y || 0, obj.position?.z || 0];
      
      const size = Math.max(
        obj.radius || 0,
        obj.width || obj.halfExtents?.[0] * 2 || 0,
        obj.height || obj.halfExtents?.[1] * 2 || 0,
        obj.depth || obj.halfExtents?.[2] * 2 || 0,
        1
      );

      minX = Math.min(minX, pos[0] - size);
      maxX = Math.max(maxX, pos[0] + size);
      minY = Math.min(minY, pos[1] - size);
      maxY = Math.max(maxY, pos[1] + size);
      minZ = Math.min(minZ, pos[2] - size);
      maxZ = Math.max(maxZ, pos[2] + size);
    });

    const center = new THREE.Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );

    const radius = Math.max(
      maxX - minX,
      maxY - minY,
      maxZ - minZ
    ) * 0.8;

    return { center, radius: Math.max(radius, 5) };
  }, []);

  // Create 3D mesh from object config
  const createObjectMesh = useCallback((obj: any): THREE.Mesh | THREE.Group | null => {
    let color = 0x4f46e5;
    if (obj.color) {
      color = parseInt(obj.color.replace('#', '0x'), 16);
    }

    const material = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.2,
      roughness: 0.8,
    });

    let mesh: THREE.Mesh | null = null;
    const type = (obj.type || 'sphere').toLowerCase();

    switch (type) {
      case 'sphere':
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(obj.radius || 1, 16, 16),
          material
        );
        break;
      case 'box':
      case 'cuboid':
        mesh = new THREE.Mesh(
          new THREE.BoxGeometry(
            obj.width || obj.halfExtents?.[0] * 2 || 1,
            obj.height || obj.halfExtents?.[1] * 2 || 1,
            obj.depth || obj.halfExtents?.[2] * 2 || 1
          ),
          material
        );
        break;
      case 'cylinder':
        mesh = new THREE.Mesh(
          new THREE.CylinderGeometry(
            obj.radiusTop || obj.radius || 1,
            obj.radiusBottom || obj.radius || 1,
            obj.height || 2,
            16
          ),
          material
        );
        break;
      case 'cone':
        mesh = new THREE.Mesh(
          new THREE.ConeGeometry(obj.radius || 1, obj.height || 2, 16),
          material
        );
        break;
      case 'capsule':
        mesh = new THREE.Mesh(
          new THREE.CapsuleGeometry(obj.radius || 0.5, obj.height || 2, 8, 16),
          material
        );
        break;
      case 'torus':
        mesh = new THREE.Mesh(
          new THREE.TorusGeometry(obj.radius || 1, obj.tube || 0.4, 8, 24),
          material
        );
        break;
      case 'plane':
        mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(obj.width || 10, obj.height || 10),
          material
        );
        break;
      default:
        // Default to sphere for unknown types
        mesh = new THREE.Mesh(
          new THREE.SphereGeometry(obj.radius || 1, 16, 16),
          material
        );
    }

    if (mesh) {
      // Position
      if (Array.isArray(obj.position)) {
        mesh.position.set(obj.position[0] || 0, obj.position[1] || 0, obj.position[2] || 0);
      } else if (obj.position) {
        mesh.position.set(obj.position.x || 0, obj.position.y || 0, obj.position.z || 0);
      }

      // Rotation (if specified)
      if (Array.isArray(obj.rotation)) {
        mesh.rotation.set(obj.rotation[0] || 0, obj.rotation[1] || 0, obj.rotation[2] || 0);
      }

      // Scale (if specified)
      if (Array.isArray(obj.scale)) {
        mesh.scale.set(obj.scale[0] || 1, obj.scale[1] || 1, obj.scale[2] || 1);
      }
    }

    return mesh;
  }, []);

  // Load and render scene
  const loadAndRenderScene = useCallback(async () => {
    if (!sceneRef.current) return;

    try {
      let sceneData = initialSceneData;

      // If no initial data, try to load from file
      if (!sceneData && sceneId) {
        const folderName = sceneId.replace(/_v\d+\.\d+$/, '');
        const response = await fetch(`/scenes/${folderName}/${sceneId}.json`);
        if (!response.ok) {
          throw new Error('Scene not found');
        }
        sceneData = await response.json();
      }

      if (!sceneData) {
        throw new Error('No scene data available');
      }

      sceneDataRef.current = sceneData;

      // Clear existing objects (keep lights)
      const objectsToRemove: THREE.Object3D[] = [];
      sceneRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.GridHelper) {
          objectsToRemove.push(child);
        }
      });
      objectsToRemove.forEach((obj) => {
        sceneRef.current?.remove(obj);
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      // Render objects
      const objects = sceneData.objects || [];
      objects.forEach((obj: any) => {
        const mesh = createObjectMesh(obj);
        if (mesh) {
          sceneRef.current?.add(mesh);
        }
      });

      // Add subtle grid
      const gridHelper = new THREE.GridHelper(30, 30, 0x333333, 0x1a1a1a);
      gridHelper.position.y = -0.01;
      sceneRef.current.add(gridHelper);

      // Calculate scene bounds for camera positioning
      const { center, radius } = calculateSceneBounds(objects);
      sceneCenterRef.current = center;

      // Initial camera position
      if (cameraRef.current) {
        const pos = CAMERA_POSITIONS[0];
        const cameraRadius = radius * 1.5;
        cameraRef.current.position.set(
          center.x + Math.cos(pos.angle) * cameraRadius,
          center.y + pos.height * radius,
          center.z + Math.sin(pos.angle) * cameraRadius
        );
        cameraRef.current.lookAt(center);
      }

      // Render once
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error loading scene preview:', err);
      setError('Preview unavailable');
      setIsLoading(false);
    }
  }, [sceneId, initialSceneData, createObjectMesh, calculateSceneBounds]);

  // Initialize THREE.js scene
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    isInitializedRef.current = true;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d0d0d);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 8, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Setup renderer with minimal settings for performance
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // Disable for performance
      alpha: false,
      powerPreference: 'low-power',
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(1); // Use 1 for better performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Load scene data
    loadAndRenderScene();

    // Cleanup
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
      isInitializedRef.current = false;
    };
  }, [loadAndRenderScene]);

  // Handle camera animation on hover
  useEffect(() => {
    if (isHovered && sceneRef.current && cameraRef.current && rendererRef.current && !error) {
      // Start camera animation at low FPS
      animationIntervalRef.current = setInterval(() => {
        cameraPositionIndexRef.current = (cameraPositionIndexRef.current + 1) % CAMERA_POSITIONS.length;
        const pos = CAMERA_POSITIONS[cameraPositionIndexRef.current];
        
        const objects = sceneDataRef.current?.objects || [];
        const { center, radius } = calculateSceneBounds(objects);
        const cameraRadius = radius * 1.5;

        if (cameraRef.current) {
          cameraRef.current.position.set(
            center.x + Math.cos(pos.angle) * cameraRadius,
            center.y + pos.height * radius,
            center.z + Math.sin(pos.angle) * cameraRadius
          );
          cameraRef.current.lookAt(center);
        }

        // Render frame
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }, CAMERA_UPDATE_INTERVAL);
    } else {
      // Stop animation when not hovered
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      
      // Reset to initial position and render once
      if (cameraRef.current && sceneRef.current && rendererRef.current && !error) {
        cameraPositionIndexRef.current = 0;
        const pos = CAMERA_POSITIONS[0];
        const objects = sceneDataRef.current?.objects || [];
        const { center, radius } = calculateSceneBounds(objects);
        const cameraRadius = radius * 1.5;

        cameraRef.current.position.set(
          center.x + Math.cos(pos.angle) * cameraRadius,
          center.y + pos.height * radius,
          center.z + Math.sin(pos.angle) * cameraRadius
        );
        cameraRef.current.lookAt(center);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [isHovered, error, calculateSceneBounds]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
      
      // Re-render after resize
      if (sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="scene-preview-renderer" ref={containerRef}>
      {isLoading && (
        <div className="scene-preview-loading">
          <div className="scene-preview-spinner" />
        </div>
      )}
      {error && (
        <div className="scene-preview-error">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ScenePreviewRenderer;
