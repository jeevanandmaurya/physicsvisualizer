/**
 * ScenePreviewRenderer - Ultra-compact 3D preview for scene cards
 * Renders scene objects without physics, animates camera on hover
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { functionCallSystem } from '../../../core/sandbox';
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

const CAMERA_UPDATE_INTERVAL = 800; // ms between camera position updates (slower rotation)

// --- Active Context Manager ---
// Limits the number of active WebGL contexts to prevent browser crashes
const MAX_ACTIVE_CONTEXTS = 8; // Conservative limit (browsers usually allow ~16)

class ContextScheduler {
  private activeIds = new Set<string>();
  private queue: Array<{ id: string, resolve: () => void }> = [];

  requestAccess(id: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.activeIds.has(id)) {
        resolve();
        return;
      }

      if (this.activeIds.size < MAX_ACTIVE_CONTEXTS) {
        this.activeIds.add(id);
        resolve();
      } else {
        // Queue the request
        this.queue.push({ id, resolve });
      }
    });
  }

  releaseAccess(id: string) {
    if (this.activeIds.delete(id)) {
      // Slot freed, let next in queue enter
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) {
          this.activeIds.add(next.id);
          next.resolve();
        }
      }
    } else {
      // Remove from queue if it was waiting
      this.queue = this.queue.filter(item => item.id !== id);
    }
  }
}

// --- Global Snapshot Cache ---
// Stores an array of data URLs (frames) for each scene
const snapshotCache = new Map<string, string[]>();
const contextScheduler = new ContextScheduler();

export const ScenePreviewRenderer: React.FC<ScenePreviewRendererProps> = ({
  sceneId,
  sceneData: initialSceneData,
  isHovered = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // Unique instance ID for the scheduler
  const instanceIdRef = useRef(`preview-${Math.random().toString(36).substr(2, 9)}`);
  const [shouldRender, setShouldRender] = useState(false);
  const [snapshots, setSnapshots] = useState<string[] | null>(snapshotCache.get(sceneId) || null);
  const [currentFrame, setCurrentFrame] = useState(0);
  
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cameraPositionIndexRef = useRef(0);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sceneDataRef = useRef<any>(null);
  const sceneCenterRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const isInitializedRef = useRef(false);
  const loadTokenRef = useRef(0);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(!snapshots); // Not loading if we have snapshots

  // Manage WebGL context availability based on visibility (only for generation)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let isMounted = true;
    const id = instanceIdRef.current;

    const updateContextRequest = () => {
        // We need a context ONLY if we don't have snapshots yet AND we are visible
        // Hovering doesn't require context anymore (we loop images)
        const needsGeneration = !snapshots && isVisibleRef.current;

        if (needsGeneration) {
            contextScheduler.requestAccess(id).then(() => {
                if (isMounted) setShouldRender(true);
            });
        } else {
            // Context not needed
            setShouldRender(false);
            contextScheduler.releaseAccess(id);
        }
    };

    // Track visibility internally to avoid re-running effect on every scroll
    const isVisibleRef = { current: false };

    const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        isVisibleRef.current = entry.isIntersecting;
        updateContextRequest();
    }, { rootMargin: '100px' });

    observer.observe(el);

    // Also update request when snapshot state changes
    updateContextRequest();

    return () => {
        isMounted = false;
        observer.disconnect();
        setShouldRender(false);
        contextScheduler.releaseAccess(id);
    };
  }, [snapshots]); // Re-run only when we get snapshots (to release context)

  // Handle Image Cycling on Hover
  useEffect(() => {
    if (isHovered && snapshots && snapshots.length > 0) {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % snapshots.length);
        }, CAMERA_UPDATE_INTERVAL);
        return () => clearInterval(interval);
    } else if (!isHovered) {
        // Reset to first frame when not hovered
        setCurrentFrame(0);
    }
  }, [isHovered, snapshots]);

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

      const scale = Array.isArray(obj.scale) ? obj.scale : [1, 1, 1];
      const type = String(obj.type || 'sphere').toLowerCase();
      const dims = Array.isArray(obj.dimensions) ? obj.dimensions : null;

      // Approximate local half-extents for bounds/framing
      let hx = 0.5;
      let hy = 0.5;
      let hz = 0.5;

      if (type === 'sphere') {
        const r = obj.radius ?? 1;
        hx = r;
        hy = r;
        hz = r;
      } else if (type === 'box' || type === 'cuboid') {
        const w = obj.width ?? dims?.[0] ?? (obj.halfExtents?.[0] != null ? obj.halfExtents[0] * 2 : undefined) ?? 1;
        const h = obj.height ?? dims?.[1] ?? (obj.halfExtents?.[1] != null ? obj.halfExtents[1] * 2 : undefined) ?? 1;
        const d = obj.depth ?? dims?.[2] ?? (obj.halfExtents?.[2] != null ? obj.halfExtents[2] * 2 : undefined) ?? 1;
        hx = w / 2;
        hy = h / 2;
        hz = d / 2;
      } else if (type === 'plane') {
        const w = obj.width ?? dims?.[0] ?? 10;
        const h = obj.height ?? dims?.[1] ?? 10;
        hx = w / 2;
        hy = h / 2;
        hz = 0.01;
      } else if (type === 'cylinder') {
        const rTop = obj.radiusTop ?? obj.radius ?? 1;
        const rBottom = obj.radiusBottom ?? obj.radius ?? 1;
        const r = Math.max(rTop, rBottom);
        const h = obj.height ?? 2;
        hx = r;
        hy = h / 2;
        hz = r;
      } else if (type === 'cone') {
        const r = obj.radius ?? 1;
        const h = obj.height ?? 2;
        hx = r;
        hy = h / 2;
        hz = r;
      } else if (type === 'capsule') {
        const r = obj.radius ?? 0.5;
        const h = obj.height ?? 2;
        hx = r;
        hy = h / 2 + r;
        hz = r;
      } else if (type === 'torus') {
        const R = obj.radius ?? 1;
        const tube = obj.tube ?? 0.4;
        hx = R + tube;
        hy = tube;
        hz = R + tube;
      }

      hx *= scale[0] ?? 1;
      hy *= scale[1] ?? 1;
      hz *= scale[2] ?? 1;

      // Avoid degenerate bounds
      hx = Math.max(0.01, Math.abs(hx));
      hy = Math.max(0.01, Math.abs(hy));
      hz = Math.max(0.01, Math.abs(hz));

      minX = Math.min(minX, pos[0] - hx);
      maxX = Math.max(maxX, pos[0] + hx);
      minY = Math.min(minY, pos[1] - hy);
      maxY = Math.max(maxY, pos[1] + hy);
      minZ = Math.min(minZ, pos[2] - hz);
      maxZ = Math.max(maxZ, pos[2] + hz);
    });

    const center = new THREE.Vector3(
      (minX + maxX) / 2,
      (minY + maxY) / 2,
      (minZ + maxZ) / 2
    );

    const dx = maxX - minX;
    const dy = maxY - minY;
    const dz = maxZ - minZ;

    // Bounding sphere radius from AABB diagonal
    const radius = 0.5 * Math.sqrt(dx * dx + dy * dy + dz * dz);

    return { center, radius: Math.max(radius, 0.25) };
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
    const dims = Array.isArray(obj.dimensions) ? obj.dimensions : null;

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
            obj.width || dims?.[0] || obj.halfExtents?.[0] * 2 || 1,
            obj.height || dims?.[1] || obj.halfExtents?.[1] * 2 || 1,
            obj.depth || dims?.[2] || obj.halfExtents?.[2] * 2 || 1
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
          new THREE.PlaneGeometry(obj.width || dims?.[0] || 10, obj.height || dims?.[1] || 10),
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

    // Token prevents stale async loads from overwriting newer renders
    const token = ++loadTokenRef.current;

    try {
      let sceneData = initialSceneData;

      // If no initial data provided, try to load from file (example scenes only)
      if (!sceneData && sceneId) {
        // Extract folder name by removing version suffix and converting hyphens to underscores
        // e.g., "projectile-motion" -> "projectile_motion"
        // e.g., "projectile_motion_v1.0" -> "projectile_motion"
        let baseFolder = sceneId
          .replace(/_v\d+\.\d+$/, '')  // Remove version suffix
          .replace(/-/g, '_');            // Convert hyphens to underscores

        // Try to consult a scenes manifest for an authoritative folder mapping
        try {
          const manifestResp = await fetch('/scenes/manifest.json');
          if (token !== loadTokenRef.current) return;
          if (manifestResp.ok) {
            const manifest = await manifestResp.json();
            if (token !== loadTokenRef.current) return;
            const match = (manifest.scenes || []).find((s: any) => (
              s.id === sceneId || s.folderName === baseFolder || (s.id && s.id.replace(/-/g, '_') === baseFolder)
            ));
            if (match && match.folderName) {
              baseFolder = match.folderName;
            }
          }
        } catch (e) {
          // ignore manifest lookup errors and fall back to heuristic
        }

        // Build candidate folder names by progressively removing trailing segments
        const folderCandidates = [baseFolder];
        let truncated = baseFolder;
        while (truncated.includes('_')) {
          truncated = truncated.replace(/_[^_]+$/, '');
          if (!folderCandidates.includes(truncated)) folderCandidates.push(truncated);
        }

        let loadedData: any = null;
        // Try multiple possible paths for each candidate folder until we find JSON
        for (const folder of folderCandidates) {
          const possiblePaths = [
            `/scenes/${folder}/${folder}_v1.0.json`,
            `/scenes/${folder}/${sceneId}.json`,
            `/scenes/${folder}/${folder}.json`,
          ];

          for (const path of possiblePaths) {
            try {
              const response = await fetch(path);
              if (token !== loadTokenRef.current) return;
              if (response.ok) {
                const contentType = response.headers.get('content-type');
                // Make sure we got JSON, not HTML
                if (contentType && contentType.includes('application/json')) {
                  loadedData = await response.json();
                  if (token !== loadTokenRef.current) return;
                  break;
                }
                // Try to parse anyway if content-type is missing
                const text = await response.text();
                if (token !== loadTokenRef.current) return;
                if (text.trim().startsWith('{')) {
                  loadedData = JSON.parse(text);
                  break;
                }
              }
            } catch (e) {
              // Try next path
              continue;
            }
          }

          if (loadedData) break;
        }
        
        sceneData = loadedData;
      }

      if (!sceneData) {
        // If we still can't find data, create a simple default scene instead of erring
        sceneData = { objects: [] };
        console.warn(`Scene data unavailable for ${sceneId}, showing empty scene`);
      }

      // Process procedural functions if any (e.g. "functionCalls" property)
      if (sceneData) {
        try {
            // Process named functions and inline code to generate objects (ASYNC)
            sceneData = await functionCallSystem.processSceneFunctions(sceneData);
            if (token !== loadTokenRef.current) return;
        } catch (e) {
            console.warn(`Failed to process scene functions for ${sceneId}`, e);
        }
      }

      sceneDataRef.current = sceneData;

      // If the component was unmounted or the scene disposed while we were
      // awaiting fetches, bail out to avoid dereferencing null refs.
      if (!sceneRef.current) {
        return;
      }

      if (token !== loadTokenRef.current) {
        return;
      }

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
        const fovRad = THREE.MathUtils.degToRad(cameraRef.current.fov);
        const fitDistance = radius / Math.max(0.001, Math.sin(fovRad / 2));
        const cameraRadius = Math.max(fitDistance * 1.15, radius * 1.15);
        cameraRef.current.position.set(
          center.x + Math.cos(pos.angle) * cameraRadius,
          center.y + pos.height * radius,
          center.z + Math.sin(pos.angle) * cameraRadius
        );
        cameraRef.current.lookAt(center);
      }

      // Render generation sequence
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        // If we don't have snapshots yet, generate them all now
        if (!snapshots) {
            try {
                const frames: string[] = [];
                const objects = sceneData.objects || [];
                const { center, radius } = calculateSceneBounds(objects);
                const fovRad = THREE.MathUtils.degToRad(cameraRef.current.fov);
                const fitDistance = radius / Math.max(0.001, Math.sin(fovRad / 2));
                const cameraRadius = Math.max(fitDistance * 1.15, radius * 1.15);

                // Capture all defined camera positions
                for (const pos of CAMERA_POSITIONS) {
              if (token !== loadTokenRef.current) return;
                    cameraRef.current.position.set(
                        center.x + Math.cos(pos.angle) * cameraRadius,
                        center.y + pos.height * radius,
                        center.z + Math.sin(pos.angle) * cameraRadius
                    );
                    cameraRef.current.lookAt(center);
                    
                    // Force render
                    rendererRef.current.render(sceneRef.current, cameraRef.current);
                    
                    // Capture
                    frames.push(rendererRef.current.domElement.toDataURL('image/jpeg', 0.8));
                }

                snapshotCache.set(sceneId, frames);
                setSnapshots(frames);
                // The useEffect hook will see the new snapshots state and automatically release the context
            } catch (e) {
                console.warn('Failed to capture snapshots for scene', sceneId, e);
            }
        }
      }

      if (token === loadTokenRef.current) {
        setIsLoading(false);
        setError(null);
      }
    } catch (err) {
      console.error('Error loading scene preview:', err);
      if (token === loadTokenRef.current) {
        setError('Preview unavailable');
        setIsLoading(false);
      }
    }
  }, [sceneId, initialSceneData, createObjectMesh, calculateSceneBounds]);

  // Create a stable placeholder color based on sceneId
  const placeholderColor = React.useMemo(() => {
    let hash = 0;
    const str = sceneId || 'default';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 20%)`;
  }, [sceneId]);

  // Initialize THREE.js scene
  useEffect(() => {
    // Only initialize if scheduler allowed it (shouldRender is true) and container exists
    if (!shouldRender || !containerRef.current) return;
    
    // If already initialized
    if (isInitializedRef.current) return;

    isInitializedRef.current = true;
    setIsLoading(true);

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
      antialias: true, // Enable for better snapshot quality
      alpha: false,
      preserveDrawingBuffer: true, // REQUIRED strictly for toDataURL() support
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
      // Invalidate any in-flight loadAndRenderScene async work
      loadTokenRef.current++;

      // Clear interval
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
        animationIntervalRef.current = null;
      }
      
      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }
      
      // Clear refs
      sceneRef.current = null;
      cameraRef.current = null;
      isInitializedRef.current = false;
    };
  }, [shouldRender, loadAndRenderScene]);

  // Reload scene when sceneId or sceneData changes after initial mount
  useEffect(() => {
    if (isInitializedRef.current && sceneRef.current) {
      loadAndRenderScene();
    }
  }, [sceneId, initialSceneData, loadAndRenderScene]);

  // Handle camera animation (REMOVED - now handled by image cycling)
  /* 
  useEffect(() => { ... })  <- Old WebGL animation effect logic removed
  */

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
    <div className="scene-preview-renderer" ref={containerRef} style={{ position: 'relative', overflow: 'hidden' }}>
      {!shouldRender && snapshots && snapshots.length > 0 && (
        <div className="scene-preview-snapshot" style={{
            width: '100%', 
            height: '100%', 
            backgroundImage: `url(${snapshots[currentFrame]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'background-image 0.1s step-end' // Snappy frame transition
        }} />
      )}

      {/* Show placeholder if no snapshot and no render context yet */}
      {!shouldRender && !snapshots && (
        <div className="scene-preview-placeholder" style={{
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '24px',
            background: `linear-gradient(135deg, ${placeholderColor} 0%, #1a1a1a 100%)`
        }}>
           {/* <div style={{ transform: 'scale(1.5)', opacity: 0.5 }}>⚛️</div> */}
        </div>
      )}
      
      {shouldRender && isLoading && (
        <div className="scene-preview-loading">
          <div className="scene-preview-spinner" />
        </div>
      )}
      {error && shouldRender && (
        <div className="scene-preview-error">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ScenePreviewRenderer;
