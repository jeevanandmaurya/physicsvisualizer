import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface CompactSimulationRendererProps {
  sceneId: string;
  isPlaying: boolean;
  onError?: (error: string) => void;
}

export const CompactSimulationRenderer: React.FC<CompactSimulationRendererProps> = ({
  sceneId,
  isPlaying,
  onError
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    // Setup camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Setup controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Load scene JSON
    loadSceneData(sceneId);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (containerRef.current?.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, [sceneId]);

  const loadSceneData = async (id: string) => {
    try {
      // Scene files are in public/scenes/{sceneId}/{sceneId}.json
      // Remove the _v1.0 suffix if present to get folder name, then use full id for file
      const folderName = id.replace(/_v\d+\.\d+$/, '');
      const response = await fetch(`/scenes/${folderName}/${id}.json`);
      if (!response.ok) {
        throw new Error('Scene not found');
      }
      const sceneData = await response.json();
      renderSceneObjects(sceneData);
    } catch (err) {
      const errorMsg = 'Failed to load scene';
      setError(errorMsg);
      onError?.(errorMsg);
      console.error('Error loading scene:', err);
      // Show placeholder
      renderPlaceholder();
    }
  };

  const renderSceneObjects = (sceneData: any) => {
    if (!sceneRef.current) return;

    const objects = sceneData.objects || [];
    
    objects.forEach((obj: any) => {
      let mesh: THREE.Mesh | null = null;
      
      // Parse color
      let color = 0x4f46e5;
      if (obj.color) {
        color = parseInt(obj.color.replace('#', '0x'), 16);
      }
      
      const material = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.3,
        roughness: 0.7
      });

      // Create geometry based on type (case insensitive)
      const type = obj.type?.toLowerCase() || 'sphere';
      
      switch (type) {
        case 'sphere':
          mesh = new THREE.Mesh(
            new THREE.SphereGeometry(obj.radius || 1, 32, 32),
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
              32
            ),
            material
          );
          break;
        default:
          // Default to sphere
          mesh = new THREE.Mesh(
            new THREE.SphereGeometry(obj.radius || 1, 32, 32),
            material
          );
      }

      if (mesh) {
        // Position from array [x, y, z]
        if (Array.isArray(obj.position)) {
          mesh.position.set(
            obj.position[0] || 0,
            obj.position[1] || 0,
            obj.position[2] || 0
          );
        } else if (obj.position) {
          mesh.position.set(
            obj.position.x || 0,
            obj.position.y || 0,
            obj.position.z || 0
          );
        }
        sceneRef.current?.add(mesh);
      }
    });

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    sceneRef.current?.add(gridHelper);
    
    // Adjust camera to see the scene better
    if (cameraRef.current && objects.length > 0) {
      // Find bounding box
      const positions = objects.map((obj: any) => 
        Array.isArray(obj.position) ? obj.position : [obj.position?.x || 0, obj.position?.y || 0, obj.position?.z || 0]
      );
      const avgY = positions.reduce((sum: number, pos: number[]) => sum + pos[1], 0) / positions.length;
      const maxY = Math.max(...positions.map((pos: number[]) => pos[1]));
      
      // Position camera to see the scene
      cameraRef.current.position.set(
        15,
        avgY + 5,
        15
      );
      cameraRef.current.lookAt(0, avgY, 0);
    }
  };

  const renderPlaceholder = () => {
    if (!sceneRef.current) return;
    
    // Add a simple placeholder object
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0x4f46e5 });
    const sphere = new THREE.Mesh(geometry, material);
    sceneRef.current.add(sphere);
    
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
    sceneRef.current.add(gridHelper);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative',
        cursor: 'grab',
        background: '#0a0a0a'
      }}
    >
      {error && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#ff4444',
          fontSize: '12px',
          pointerEvents: 'none',
          textAlign: 'center',
          zIndex: 10
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default CompactSimulationRenderer;
