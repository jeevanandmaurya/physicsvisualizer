import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Import physics calculations and engine components
import { PhysicsWorld } from '../../core/physics/engine.jsx';

// Import visual annotation system
import { VisualAnnotationManager } from '../../core/visuals';



// Import assets
import backgroundTexture from '../../assets/background.svg';
import spaceTexture from '../../assets/space.svg';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import { useSimulation } from '../../contexts/SimulationContext';
import SceneDetailsUI from '../../views/components/scene-management/SceneDetailsUI';
import { functionCallSystem } from '../../core/sandbox';
import { physicsDataStore } from '../../core/physics/PhysicsDataStore';
import ScenePatcher from '../../core/scene/patcher';
import { AgentLoopRunner } from '../../core/agent/AgentLoopRunner';

type SceneLike = any;
type SceneUpdateFn = (updatedScene: SceneLike) => void;

type InputStateRef = React.MutableRefObject<{ keysDown: Record<string, boolean> }>;
type PlayerPositionRef = React.MutableRefObject<[number, number, number]>;

// --- Visualizer-specific helper components ---
function TimeUpdater({ isPlaying, updateSimulationTime }) {
  useFrame((state, delta) => {
    // Update simulation time only when playing (world time stops when paused)
    if (isPlaying) {
      updateSimulationTime(prevTime => prevTime + delta);
    }
  });
  return null;
}

function ShootingHandler({ onShoot }) {
  const { camera, gl } = useThree();
  const [fKeyHeld, setFKeyHeld] = useState(false);
  const [isCanvasFocused, setIsCanvasFocused] = useState(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleFocus = () => setIsCanvasFocused(true);
    const handleBlur = () => setIsCanvasFocused(false);
    const handleMouseEnter = () => setIsCanvasFocused(true);
    const handleMouseLeave = () => setIsCanvasFocused(false);

    canvas.addEventListener('focus', handleFocus);
    canvas.addEventListener('blur', handleBlur);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('focus', handleFocus);
      canvas.removeEventListener('blur', handleBlur);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gl]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle shooting if canvas is focused or mouse is over it
      if (!isCanvasFocused && document.activeElement !== gl.domElement) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        setFKeyHeld(true);
        // If 'f' is pressed alone (not held), shoot default sphere
        setTimeout(() => {
          if (fKeyHeld) return; // Don't shoot if still held (waiting for number)
          shootObject('Sphere');
        }, 200); // Small delay to detect if number key follows
      } else if (fKeyHeld && ['1', '2', '3', '4', '5'].includes(event.key)) {
        // Shoot different geometry based on number key
        const geometryTypes = {
          '1': 'Sphere',
          '2': 'Box', 
          '3': 'Cylinder',
          '4': 'Cone',
          '5': 'Capsule'
        };
        shootObject(geometryTypes[event.key]);
        setFKeyHeld(false);
      }
    };

    const handleKeyUp = (event) => {
      // Only handle key up if canvas is focused or mouse is over it
      if (!isCanvasFocused && document.activeElement !== gl.domElement) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        setFKeyHeld(false);
      }
    };

    const shootObject = (type) => {
      // Calculate direction from camera
      const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      const position = camera.position.clone().add(direction.clone().multiplyScalar(2));
      const velocity = direction.clone().multiplyScalar(20);
      
      onShoot({
        position: position.toArray(),
        velocity: velocity.toArray(),
        type: type
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [camera, onShoot, fKeyHeld, isCanvasFocused, gl]);

  return null;
}
function FpsCounter({ updateFps }) { 
  const lastTimeRef = useRef(performance.now()); 
  const frameCountRef = useRef(0); 
  useFrame(() => { 
    const now = performance.now(); 
    frameCountRef.current += 1; 
    const delta = now - lastTimeRef.current; 
    if (delta >= 1000) { 
      updateFps(Math.round((frameCountRef.current * 1000) / delta)); 
      frameCountRef.current = 0; 
      lastTimeRef.current = now; 
    } 
  }); 
  return null; 
}

type WasdControllerProps = {
  enabled?: boolean;
  moveSpeed?: number;
  verticalSpeed?: number;
  inputStateRef: InputStateRef;
  playerPositionRef: PlayerPositionRef;
  controlsRef?: React.MutableRefObject<any>;
};

function WasdController({
  enabled = true,
  moveSpeed = 12,
  verticalSpeed = 10,
  inputStateRef,
  playerPositionRef,
  controlsRef,
}: WasdControllerProps) {
  const { camera, gl } = useThree();
  const keysDownRef = useRef<Record<string, boolean>>({});
  const [isCanvasFocused, setIsCanvasFocused] = useState(false);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleFocus = () => setIsCanvasFocused(true);
    const handleBlur = () => setIsCanvasFocused(false);
    const handleMouseEnter = () => setIsCanvasFocused(true);
    const handleMouseLeave = () => setIsCanvasFocused(false);

    canvas.addEventListener('focus', handleFocus);
    canvas.addEventListener('blur', handleBlur);
    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('focus', handleFocus);
      canvas.removeEventListener('blur', handleBlur);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gl]);

  useEffect(() => {
    const shouldIgnore = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return false;
      return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (shouldIgnore(event)) return;
      if (!isCanvasFocused && document.activeElement !== gl.domElement) return;

      const key = event.key.toLowerCase();
      keysDownRef.current[key] = true;
      inputStateRef.current.keysDown = { ...keysDownRef.current };
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (shouldIgnore(event)) return;
      if (!isCanvasFocused && document.activeElement !== gl.domElement) return;

      const key = event.key.toLowerCase();
      keysDownRef.current[key] = false;
      inputStateRef.current.keysDown = { ...keysDownRef.current };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gl, isCanvasFocused, inputStateRef]);

  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const forward = useMemo(() => new THREE.Vector3(), []);
  const right = useMemo(() => new THREE.Vector3(), []);
  const move = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    if (!enabled) return;

    const keys = keysDownRef.current;
    const wantsMove =
      keys['w'] || keys['a'] || keys['s'] || keys['d'] || keys[' '] || keys['space'] || keys['shift'];
    if (!wantsMove) {
      playerPositionRef.current = [camera.position.x, camera.position.y, camera.position.z];
      return;
    }

    camera.getWorldDirection(forward);
    forward.y = 0;
    if (forward.lengthSq() < 1e-8) return;
    forward.normalize();
    right.crossVectors(forward, up).normalize();

    move.set(0, 0, 0);

    if (keys['w']) move.add(forward);
    if (keys['s']) move.sub(forward);
    if (keys['d']) move.add(right);
    if (keys['a']) move.sub(right);
    if (keys[' '] || keys['space']) move.y += 1;
    if (keys['shift']) move.y -= 1;

    if (move.lengthSq() < 1e-8) return;
    move.normalize();

    const speed = move.y !== 0 ? verticalSpeed : moveSpeed;
    move.multiplyScalar(speed * delta);

    camera.position.add(move);

    // Keep OrbitControls target moving with the camera (Minecraft-like free move)
    if (controlsRef?.current?.target) {
      controlsRef.current.target.add(move);
      controlsRef.current.update?.();
    }

    playerPositionRef.current = [camera.position.x, camera.position.y, camera.position.z];
  });

  return null;
}

type AgentLoopBridgeProps = {
  enabled: boolean;
  isPlaying: boolean;
  config?: any;
  scene: SceneLike;
  onSceneUpdate?: SceneUpdateFn;
  inputStateRef: InputStateRef;
  playerPositionRef: PlayerPositionRef;
  onApplyPhysics?: (data: { forces?: any; impulses?: any }) => void;
};

function AgentLoopBridge({
  enabled,
  isPlaying,
  config,
  scene,
  onSceneUpdate,
  inputStateRef,
  playerPositionRef,
  onApplyPhysics,
}: AgentLoopBridgeProps) {
  const sceneRef = useRef(scene);
  const onSceneUpdateRef = useRef(onSceneUpdate);
  const onApplyPhysicsRef = useRef(onApplyPhysics);
  const runnerRef = useRef<AgentLoopRunner | null>(null);
  const patcherRef = useRef<ScenePatcher | null>(null);
  const lastSceneIdRef = useRef<string | undefined>(scene?.id);
  const debugOnceRef = useRef<{ logged: Record<string, boolean>; lastAtMs: number }>({ logged: {}, lastAtMs: 0 });

  if (!runnerRef.current) runnerRef.current = new AgentLoopRunner();
  if (!patcherRef.current) patcherRef.current = new ScenePatcher();

  useEffect(() => {
    sceneRef.current = scene;
  }, [scene]);

  useEffect(() => {
    onSceneUpdateRef.current = onSceneUpdate;
  }, [onSceneUpdate]);

  useEffect(() => {
    const currentId = scene?.id;
    if (currentId !== lastSceneIdRef.current) {
      runnerRef.current?.reset();
      lastSceneIdRef.current = currentId;
    }
  }, [scene?.id]);

  useFrame((state, delta) => {
    const debugEnabled = !!config?.debug;

    if (!enabled) {
      if (debugEnabled && !debugOnceRef.current.logged['disabled']) {
        console.log('[jsLoop] AgentLoopBridge disabled (enabled=false)');
        debugOnceRef.current.logged['disabled'] = true;
      }
      return;
    }

    if (!isPlaying) {
      // Paused - don't run jsLoop
      return;
    }

    if (!config?.code) {
      if (debugEnabled && !debugOnceRef.current.logged['no_code']) {
        console.warn('[jsLoop] enabled but config.code is missing/empty');
        debugOnceRef.current.logged['no_code'] = true;
      }
      return;
    }

    if (!onSceneUpdateRef.current) {
      if (debugEnabled && !debugOnceRef.current.logged['no_onSceneUpdate']) {
        console.warn('[jsLoop] enabled but onSceneUpdate is missing (cannot apply changes)');
        debugOnceRef.current.logged['no_onSceneUpdate'] = true;
      }
      return;
    }

    if (!sceneRef.current) {
      if (debugEnabled && !debugOnceRef.current.logged['no_scene']) {
        console.warn('[jsLoop] enabled but scene is missing');
        debugOnceRef.current.logged['no_scene'] = true;
      }
      return;
    }

    const now = state.clock.getElapsedTime();
    const keysDown = inputStateRef?.current?.keysDown || {};
    const pos = playerPositionRef?.current || [0, 0, 0];

    // Fire-and-forget async tick; AgentLoopRunner self-throttles and avoids overlap.
    void (async () => {
      const tickResult = await runnerRef.current!.tick({
        config,
        scene: sceneRef.current,
        ctx: {
          time: now,
          dt: delta,
          input: { keysDown },
          player: { position: pos },
        },
      });

      if (debugEnabled) {
        const nowMs = Date.now();
        if (nowMs - debugOnceRef.current.lastAtMs > 1500) {
          console.log('[jsLoop] tickResult', tickResult);
          debugOnceRef.current.lastAtMs = nowMs;
        }
      }

      if (!tickResult) return;

      if (tickResult.forces || tickResult.impulses) {
        onApplyPhysicsRef.current?.({ forces: tickResult.forces, impulses: tickResult.impulses });
      }

      let updatedScene: any = sceneRef.current;

      // Apply patches first
      if (Array.isArray(tickResult.patches) && tickResult.patches.length > 0) {
        const res = patcherRef.current!.applyPatches(updatedScene, tickResult.patches);
        if (res?.success && res.scene) {
          updatedScene = res.scene;
        }
      }

      // Remove objects
      if (Array.isArray(tickResult.removeObjectIds) && tickResult.removeObjectIds.length > 0) {
        const remove = new Set(tickResult.removeObjectIds);
        const objs = Array.isArray(updatedScene.objects) ? updatedScene.objects : [];
        updatedScene = {
          ...updatedScene,
          objects: objs.filter((o: any) => !remove.has(o?.id)),
        };
      }

      const toAdd =
        (Array.isArray(tickResult.addObjects) ? tickResult.addObjects : []).concat(
          Array.isArray(tickResult.objects) ? tickResult.objects : []
        );

      if (toAdd.length > 0) {
        const objs = Array.isArray(updatedScene.objects) ? updatedScene.objects : [];
        // Create a Set of existing IDs for fast lookup and deduplication
        const existingIds = new Set(objs.map((o: any) => o?.id).filter(Boolean));
        // Only add objects that don't already exist in the scene
        const uniqueNewObjects = toAdd.filter((o: any) => o?.id && !existingIds.has(o.id));
        if (uniqueNewObjects.length > 0) {
          updatedScene = {
            ...updatedScene,
            objects: [...objs, ...uniqueNewObjects],
          };
        }
      }

      // If nothing changed structurally, skip update.
      if (updatedScene === sceneRef.current) return;

      updatedScene = {
        ...updatedScene,
        _agentLoopUpdate: true,
        _version: (sceneRef.current._version || 0) + 1,
      };

      onSceneUpdateRef.current?.(updatedScene);
    })();
  });

  return null;
}
function SimpleGrid({ show }: { show: boolean }) { 
  if (!show) return null; 
  return (
    <gridHelper args={[30, 30, 0x333333, 0x1a1a1a]} position={[0, -0.01, 0]} />
  ); 
}
function LabeledAxesHelper({ size = 5, visible = true }) { 
  if (!visible) return null;
  const textProps = { fontSize: 0.5, anchorX: 'center' as const, anchorY: 'middle' as const }; 
  return (<group renderOrder={10}><axesHelper args={[size]} /><Text color="red" position={[size * 1.1, 0, 0]} {...textProps}>X</Text><Text color="green" position={[0, size * 1.1, 0]} {...textProps}>Y</Text><Text color="blue" position={[0, 0, size * 1.1]} {...textProps}>Z</Text></group>); 
}

function GroundPlane({ show }) { 
  if (!show) return null; 
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.002, 0]} receiveShadow>
      <planeGeometry args={[2000, 2000]} />
      <meshStandardMaterial 
        color="#111111" 
        opacity={0.4} 
        transparent 
        polygonOffset 
        polygonOffsetFactor={1} 
        polygonOffsetUnits={1}
      />
    </mesh>
  ); 
}
// OLD VELOCITY VECTOR SYSTEM - Replaced by Visual Annotation System
// Use visualAnnotations in scene JSON instead
// Example: { "type": "vector", "vectorType": "velocity", ... }

function Skybox({ texturePath, backgroundType = 'normal' }) {
  if (backgroundType === 'normal') {
    // Default Clean Dark Theme (matches ScenePreviewRenderer)
    return <color attach="background" args={['#0d0d0d']} />;
  }

  if (backgroundType === 'black') {
    return (
      <mesh key="skybox-black">
        <sphereGeometry args={[100000, 60, 40]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>
    );
  }

  if (backgroundType === 'white') {
    return (
      <mesh key="skybox-white">
        <sphereGeometry args={[100000, 60, 40]} />
        <meshBasicMaterial color="#ffffff" side={THREE.BackSide} />
      </mesh>
    );
  }

  // For 'space' use texture
  const texturePathToUse = backgroundType === 'space' ? spaceTexture :
                           texturePath ? texturePath : backgroundTexture;

  const texture = useTexture(texturePathToUse);
  return (
    <mesh key={`skybox-${backgroundType}`}>
      <sphereGeometry args={[100000, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Visualizer({ scene, showSceneDetails, onToggleSceneDetails, onSceneUpdate }) {
    // Simulation state from SimulationContext
    const { 
        isPlaying, 
        simulationTime, 
        resetTrigger, 
        loopMode, 
        setIsPlaying, 
        dataTimeStep, 
        simulationSpeed, 
        showGrid, 
        showAxes, 
        setShowGrid, 
        setShowAxes, 
        zenMode, 
        setZenMode,
        setObjectHistory,
        updateSimulationTime,
        updateFps,
        loopReset
    } = useSimulation();

    // Skybox state - cycles through: normal, space, black, white
    const [skyboxType, setSkyboxType] = useState('normal');

    const [externalForces, setExternalForces] = useState({});
    const [externalImpulses, setExternalImpulses] = useState({});

    // Reset external physics every frame after applying? No, better to let them be applied once and cleared.
    // However, jsLoop runs at a specific tick Hz. We should apply until the next tick?
    // Actually, Applying every frame is fine if jsLoop returns them every tick.
    const handleApplyPhysics = useCallback((data: { forces?: any; impulses?: any }) => {
        if (data.forces) setExternalForces(data.forces);
        if (data.impulses) setExternalImpulses(data.impulses);
    }, []);

    // PhysicsForceManager component to handle clearing forces in the R3F loop
    const PhysicsForceManager = () => {
        useFrame(() => {
            if (Object.keys(externalForces).length > 0) setExternalForces({});
            if (Object.keys(externalImpulses).length > 0) setExternalImpulses({});
        });
        return null;
    };

    // Debug: Log scene changes
    useEffect(() => {
        console.log('Visualizer: Scene updated:', scene?.id, scene?.gravity, scene?.objects?.map(o => ({ id: o.id, mass: o.mass })));
        // Extra debug for jsLoop scenes
        if (scene) {
            console.log('[jsLoop debug] scene.jsLoop exists?', !!(scene as any)?.jsLoop, 'objects count:', scene?.objects?.length);
        }
    }, [scene]);

    const historyRef = useRef({});
    const lastRecordTimeRef = useRef({}); // Track last recorded time for each object
    const [canvasError, setCanvasError] = useState(false);
    const r3fCanvasRef = useRef(null);
    const [processedScene, setProcessedScene] = useState(null);
    const shotTimersRef = useRef<Record<string, any>>({}); // Track removal timers for shot objects

    // Player/input refs for WASD + agent loop
    const orbitControlsRef = useRef<any>(null);
    const playerPositionRef = useRef<[number, number, number]>([10, 5, 25]);
    const inputStateRef = useRef<{ keysDown: Record<string, boolean> }>({ keysDown: {} });

    // Scene-driven loops/config
    const jsLoopConfig = useMemo(() => {
      const raw = (scene as any)?.jsLoop;
      if (!raw) return null;
      if (typeof raw === 'string') {
        return { enabled: true, code: raw };
      }
      if (typeof raw === 'object') {
        return raw;
      }
      return null;
    }, [scene]);

    // Process scene function calls when scene changes
    // Use scene._version to force re-processing when scene is updated via patches
    useEffect(() => {
        if (!scene) {
            console.log('🎬 No scene to process');
            setProcessedScene(null);
            return;
        }
        
        let cancelled = false;
        
        (async () => {
            console.log('🎬 Visualizer: Processing scene functions for:', scene.id, 'version:', scene._version || 0);
            console.log('🎬 Scene before processing:', { objects: scene.objects?.length || 0, functionCalls: scene.functionCalls?.length || 0 });
            
            const processed = await functionCallSystem.processSceneFunctions(scene);
            
            if (cancelled) return; // Component unmounted or scene changed
            
            // Log any errors that occurred during processing
            if (processed.errors && processed.errors.length > 0) {
                console.error('❌ Scene processing errors:', processed.errors);
                console.error('❌ Failed scene details:', { id: scene.id, functionCalls: scene.functionCalls });
            } else {
                console.log('✅ Scene processed successfully');
            }

            console.log(`✅ Scene processed: ${scene.objects?.length || 0} → ${processed.objects?.length || 0} objects`);
            console.log('✅ Processed scene details:', { objects: processed.objects?.length || 0, joints: processed.joints?.length || 0, errors: processed.errors?.length || 0 });
            
            setProcessedScene(processed);
        })();
        
        return () => { cancelled = true; };
    }, [scene, scene?._version]);

    const activeScene = processedScene || scene;
    const { gravity = [0, -9.81, 0], contactMaterial = {}, hasGround = true } = activeScene || {};
    const objectsToRender = activeScene?.objects || [];

    const defaultContactMaterial = {
        friction: contactMaterial.friction || 0.5,
        restitution: contactMaterial.restitution || 0.7
    };

    const MAX_HISTORY_POINTS = 2000;

  const handlePhysicsDataCalculated = useCallback((data: Record<string, any>) => {
    // NEW: Use PhysicsDataStore - bypasses React entirely!
    // This is now the fastest possible path - direct memory write
    Object.entries(data).forEach(([id, info]: [string, any]) => {
      if (info && info.velocity && info.position && info.time !== undefined) {
        // Store handles all throttling, history management, and notifications
        physicsDataStore.updatePhysicsData(
          id,
          info.velocity,
          info.position,
          info.time
        );

        // Check boundary for shot objects
        if (id.startsWith('__physics_visualizer_shot_')) {
          const distance = Math.sqrt(
            info.position[0] * info.position[0] + 
            info.position[1] * info.position[1] + 
            info.position[2] * info.position[2]
          );
          
          // Remove shot objects that exceed boundary (50 units from origin)
          if (distance > 50) {
            console.log(`🗑️ Removing shot object ${id} - exceeded boundary (distance: ${distance.toFixed(2)})`);
            
            // Remove from scene immediately - use original scene state
            const currentScene = scene;
            const sceneWithoutObject = {
              ...currentScene,
              objects: (currentScene.objects || [])
                .filter((obj: any) => obj.id !== id)
                .map((obj: any) => ({ ...obj })), // Deep copy remaining objects
              _isShootingUpdate: true,
              _version: (currentScene._version || 0) + 1
            };
            
            if (onSceneUpdate) {
              onSceneUpdate(sceneWithoutObject);
            }

            // Clear the timeout for this shot since it's being removed by boundary
            if (shotTimersRef.current[id]) {
              clearTimeout(shotTimersRef.current[id]);
              delete shotTimersRef.current[id];
            }
          }
        }
      }
    });
    
    // No more React state updates here! 
    // Subscribers (graphs, UI) get updates via event system at their own rate
  }, [onSceneUpdate, scene]);

  const handleShoot = useCallback((shotData) => {
    if (!onSceneUpdate) return;

    // Create a unique ID for the shot object - make it extremely unique to avoid collisions
    const shotId = `__physics_visualizer_shot_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Default to sphere if no type specified
    const objectType = shotData.type || 'Sphere';
    
    // Create object based on type using existing geometry definitions
    let ballObject;
    
    switch (objectType) {
      case 'Sphere':
        ballObject = {
          id: shotId,
          type: 'Sphere',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          mass: 0.2,
          material: {
            color: '#ff4444',
            friction: 0.5,
            restitution: 0.8
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Box':
        ballObject = {
          id: shotId,
          type: 'Box',
          position: shotData.position,
          velocity: shotData.velocity,
          dimensions: [0.4, 0.4, 0.4],
          mass: 0.3,
          material: {
            color: '#44ff44',
            friction: 0.6,
            restitution: 0.6
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Cylinder':
        ballObject = {
          id: shotId,
          type: 'Cylinder',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          height: 0.6,
          mass: 0.25,
          material: {
            color: '#4444ff',
            friction: 0.5,
            restitution: 0.7
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Cone':
        ballObject = {
          id: shotId,
          type: 'Cone',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          height: 0.6,
          mass: 0.2,
          material: {
            color: '#ff44ff',
            friction: 0.5,
            restitution: 0.8
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      case 'Capsule':
        ballObject = {
          id: shotId,
          type: 'Capsule',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.15,
          height: 0.6,
          mass: 0.25,
          material: {
            color: '#ffff44',
            friction: 0.5,
            restitution: 0.7
          },
          physics: {
            type: 'dynamic'
          }
        };
        break;
        
      default:
        // Default to sphere
        ballObject = {
          id: shotId,
          type: 'Sphere',
          position: shotData.position,
          velocity: shotData.velocity,
          radius: 0.2,
          mass: 0.2,
          material: {
            color: '#ff4444',
            friction: 0.5,
            restitution: 0.8
          },
          physics: {
            type: 'dynamic'
          }
        };
    }

    // Add the object to the scene - update the original scene, not the processed one
    const updatedScene = {
      ...scene, // Use original scene, not activeScene (processed)
      objects: [
        ...(scene.objects || []).map(obj => ({ ...obj })), // Deep copy original scene objects
        { ...ballObject } // Fresh copy of new object
      ],
      _isShootingUpdate: true, // Flag to indicate this update is from shooting
      _version: (scene._version || 0) + 1 // Increment version for proper memoization
    };

    onSceneUpdate(updatedScene);

    // Remove the object after 8 seconds (longer than before for more fun)
    // Capture the current scene state for this specific shot
    const sceneSnapshot = { ...scene };
    const timerId = setTimeout(() => {
      if (onSceneUpdate) {
        // Use the captured scene snapshot instead of the current scene
        const sceneWithoutObject = {
          ...sceneSnapshot,
          objects: (sceneSnapshot.objects || [])
            .filter(obj => obj.id !== shotId)
            .map(obj => ({ ...obj })), // Deep copy remaining objects
          _isShootingUpdate: true, // Flag to indicate this update is from shooting cleanup
          _version: (sceneSnapshot._version || 0) + 1 // Increment version for proper memoization
        };
        onSceneUpdate(sceneWithoutObject);
        
        // Clean up the timer reference
        delete shotTimersRef.current[shotId];
      }
    }, 8000);
    
    // Store the timer reference for this shot
    shotTimersRef.current[shotId] = timerId;
  }, [onSceneUpdate, scene]);

    useEffect(() => {
        // Clear PhysicsDataStore on scene change
        // Don't pause simulation if this is a shooting update or agent loop update
        if (!scene?._isShootingUpdate && !scene?._agentLoopUpdate) {
            physicsDataStore.clear();
            physicsDataStore.setUpdateRates(100, 500, dataTimeStep);
            historyRef.current = {};
            lastRecordTimeRef.current = {};
            setObjectHistory({});
            setIsPlaying(false);
        } else {
            // For shooting/agent loop updates, just update the data rates
            physicsDataStore.setUpdateRates(100, 500, dataTimeStep);
        }
    }, [scene, setIsPlaying, dataTimeStep]);

    // Reset data when reset button is pressed (resetTrigger changes)
    useEffect(() => {
        if (resetTrigger) {
            physicsDataStore.clear();
            historyRef.current = {};
            lastRecordTimeRef.current = {};
            setObjectHistory({});
        }
    }, [resetTrigger, setObjectHistory]);

    // Clean up shot timers when scene changes (not shooting updates)
    useEffect(() => {
        if (!scene?._isShootingUpdate) {
            // Clear all active shot timers when scene changes
            Object.values(shotTimersRef.current).forEach(timerId => {
                clearTimeout(timerId);
            });
            shotTimersRef.current = {};
        }
    }, [scene]);

    useEffect(() => {
        const i = setInterval(() => {
            if (Object.keys(historyRef.current).length) setObjectHistory({ ...historyRef.current });
        }, 200);
        return () => clearInterval(i);
    }, [setObjectHistory]);

    // Handle WebGL context loss
    useEffect(() => {
        const handleContextLoss = (event) => {
            console.log('WebGL context lost, preventing default behavior');
            event.preventDefault();
            setCanvasError(true);
        };

        const canvas = document.querySelector('canvas');
        if (canvas) {
            canvas.addEventListener('webglcontextlost', handleContextLoss);
            return () => canvas.removeEventListener('webglcontextlost', handleContextLoss);
        }
    }, []);

    // Handle loop reset
    useEffect(() => {
        if (loopMode !== 'none' && isPlaying) {
            const interval = loopMode === '5sec' ? 5 : 10;
            if (simulationTime >= interval) {
                // loopReset() will trigger resetTrigger effect which clears the data
                loopReset();
            }
        }
    }, [loopMode, isPlaying, simulationTime, loopReset]);

    // Clean up shot timers on unmount
    useEffect(() => {
        return () => {
            Object.values(shotTimersRef.current).forEach(timerId => {
                clearTimeout(timerId);
            });
            shotTimersRef.current = {};
        };
    }, []);

    return (
        <div className="visualizer-container">
            {showSceneDetails && (
                <div className="scene-details-panel">
                    <SceneDetailsUI
                        scene={scene}
                        onToggleSceneDetails={onToggleSceneDetails}
                    />
                </div>
            )}
            <div className="main-content">
                {canvasError ? (
                    <div className="canvas-fallback">
                        <div className="fallback-content">
                            <FontAwesomeIcon icon={faCube} size="3x" style={{ color: '#666', marginBottom: '20px' }} />
                            <h3>3D Visualizer Unavailable</h3>
                            <p>
                                WebGL context lost. Please refresh the page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: '#007acc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginTop: '15px'
                                }}
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                ) : (
                    <Canvas
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
                        shadows
                        frameloop="always"
                        dpr={Math.min(window.devicePixelRatio, 2)}
                        performance={{ min: 0.5 }}
                        gl={{ 
                            logLevel: 'errors', 
                            preserveDrawingBuffer: false,
                            antialias: true,
                            powerPreference: 'high-performance',
                            alpha: false,
                            stencil: false,
                            depth: true
                        }}
                        camera={{ 
                            position: activeScene?.camera?.position || [10, 5, 25], 
                            fov: activeScene?.camera?.fov || 50, 
                            near: 0.1, 
                            far: 200000 
                        }}
                        onError={() => setCanvasError(true)}
                        onCreated={({ gl }) => {
                            window._webglContext = gl;
                            // Ensure crisp rendering
                            gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                            try {
                                r3fCanvasRef.current = gl.domElement;
                                if (r3fCanvasRef.current) r3fCanvasRef.current.dataset.engine = 'three.js';
                            } catch (e) {
                                console.warn('Could not set r3fCanvasRef:', e);
                            }
                        }}
                    >
                        <TimeUpdater isPlaying={isPlaying} updateSimulationTime={updateSimulationTime} />
                        <PhysicsForceManager />
                        <ShootingHandler onShoot={handleShoot} />
                        <WasdController
                          enabled={true}
                          moveSpeed={scene?.controls?.moveSpeed || 12}
                          verticalSpeed={scene?.controls?.verticalSpeed || 10}
                          inputStateRef={inputStateRef}
                          playerPositionRef={playerPositionRef}
                          controlsRef={orbitControlsRef}
                        />
                        <AgentLoopBridge
                          enabled={!!jsLoopConfig && jsLoopConfig.enabled !== false}
                          isPlaying={isPlaying}
                          config={jsLoopConfig}
                          scene={scene}
                          onSceneUpdate={onSceneUpdate}
                          inputStateRef={inputStateRef}
                          playerPositionRef={playerPositionRef}
                          onApplyPhysics={handleApplyPhysics}
                        />
                        <ambientLight intensity={1.0} />
                        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                        <PhysicsWorld
                            scene={activeScene}
                            isPlaying={isPlaying}
                            onPhysicsDataCalculated={handlePhysicsDataCalculated}
                            resetTrigger={resetTrigger}
                            defaultContactMaterial={defaultContactMaterial}
                            simulationTime={simulationTime}
                            simulationSpeed={simulationSpeed}
                            externalForces={externalForces}
                            externalImpulses={externalImpulses}
                        />
                        {/* Visual Annotation System - Gets data directly from PhysicsDataStore */}
                        {activeScene?.visualAnnotations && activeScene.visualAnnotations.length > 0 && (
                            <VisualAnnotationManager
                                annotations={activeScene.visualAnnotations}
                                physicsData={{}} // Not used - component gets data from PhysicsDataStore
                                sceneObjects={objectsToRender}
                                isPlaying={isPlaying}
                                enabled={true}
                            />
                        )}
                        <OrbitControls 
                            ref={orbitControlsRef} 
                            target={activeScene?.camera?.target || [0, 0, 0]} 
                        />
                        <LabeledAxesHelper size={5} visible={showAxes} />
                        <SimpleGrid show={showGrid} />
                        <GroundPlane show={hasGround} />
                        <FpsCounter updateFps={updateFps} />
                        <Skybox texturePath={backgroundTexture} backgroundType={skyboxType} />
                    </Canvas>
                )}
                
                {/* Visualizer Controls */}
                <div className="visualizer-controls-top-right">
                    {/* Skybox Switch Button */}
                    <button 
                        className="visualizer-control-btn skybox-switch-btn"
                        onClick={() => {
                            const types = ['normal', 'space', 'black', 'white'];
                            const currentIndex = types.indexOf(skyboxType);
                            const nextIndex = (currentIndex + 1) % types.length;
                            setSkyboxType(types[nextIndex]);
                        }}
                        title={`Theme: ${skyboxType}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    </button>

                    {/* Grid Toggle Button */}
                    <button 
                        className={`visualizer-control-btn grid-toggle-btn ${showGrid ? 'active' : ''}`}
                        onClick={() => setShowGrid(!showGrid)}
                        title="Toggle Grid"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
                        </svg>
                    </button>

                    {/* Axes Toggle Button */}
                    <button 
                        className={`visualizer-control-btn axes-toggle-btn ${showAxes ? 'active' : ''}`}
                        onClick={() => setShowAxes(!showAxes)}
                        title="Toggle Axes"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="12" x2="20" y2="12" stroke="red" />
                            <line x1="12" y1="12" x2="12" y2="4" stroke="green" />
                            <line x1="12" y1="12" x2="8" y2="16" stroke="blue" />
                            <circle cx="12" cy="12" r="1" fill="white" />
                        </svg>
                    </button>

                    {/* Zen Mode Toggle Button */}
                    <button 
                        className={`visualizer-control-btn zen-toggle-btn ${zenMode ? 'active' : ''}`}
                        onClick={() => setZenMode(!zenMode)}
                        title={zenMode ? "Exit Full Window" : "Full Window (Zen Mode)"}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {zenMode ? (
                                <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
                            ) : (
                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                            )}
                        </svg>
                    </button>
                </div>


            </div>
        </div>
    );
}

export default Visualizer;
