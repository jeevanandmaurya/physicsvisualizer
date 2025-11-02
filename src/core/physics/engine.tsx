// Physics Engine using @react-three/rapier
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Physics, RigidBody, CuboidCollider, BallCollider, CylinderCollider, ConeCollider, CapsuleCollider, useRapier } from '@react-three/rapier';
import * as THREE from 'three';
import { GravitationalPhysics } from './gravitation/calculations.js';
import { ConstraintPhysics } from './constraints/calculations.js';
import { FluidPhysics } from './fluid/calculations.js';
import { ParticleSystem } from './ParticleSystem.jsx';
import { NonPhysicsEngine } from './NonPhysicsEngine.js';


// Dummy class to maintain API compatibility - Rapier handles physics automatically
export class PhysicsEngine {
    constructor(scene) {
        this.scene = scene;
    }

    loadScene(scene) {
        this.scene = scene;
    }

    step(deltaTime) {
        // Rapier handles this automatically
    }

    getObjectStates() {
        return {};
    }

    getPerformanceStats() {
        return {
            stepTime: 0,
            averageStepTime: 0,
            stepCount: 0,
            bodyCount: this.scene?.objects?.length || 0,
            constraintCount: 0
        };
    }

    clear() {}
    destroy() {}
}

// Component to handle gravitational forces, must be inside Physics
function GravitationalForces({ scene, isPlaying }) {
    const { rapier, world } = useRapier();
    const gpRef = useRef();

    // Initialize gravitational physics when scene changes
    React.useEffect(() => {
        const gravitationalPhysicsEnabled = scene?.gravitationalPhysics?.enabled;
        if (gravitationalPhysicsEnabled) {
            gpRef.current = new GravitationalPhysics(scene);
        } else {
            gpRef.current = null;
        }
    }, [scene]);

    // Handle gravitational forces
    useFrame(() => {
        if (!isPlaying || !gpRef.current || !world || !scene?.objects) return;

        // Create body map for efficient lookup
        const bodyMap = new Map();
        world.forEachRigidBody((body, handle) => {
            if (body.userData) {
                bodyMap.set(body.userData, body);
            }
        });

        // Update positions in gravitational physics
        scene.objects.forEach(obj => {
            if (obj.mass > 0 && bodyMap.has(obj.id)) {
                const body = bodyMap.get(obj.id);
                const pos = body.translation();
                gpRef.current.updatePosition(obj.id, [pos.x, pos.y, pos.z]);
            }
        });

        // Calculate gravitational forces
        const forces = gpRef.current.calculateGravitationalForces(scene.objects, {});

        // Apply forces to bodies
        Object.keys(forces).forEach(id => {
            if (bodyMap.has(id)) {
                const body = bodyMap.get(id);
                if (!body.isFixed()) {
                    const force = forces[id];
                    body.addForce(new rapier.Vector3(force[0], force[1], force[2]), true);
                }
            }
        });
    });

    return null; // Invisible component
}

// Component to handle physics constraints, must be inside Physics
function Constraints({ scene, isPlaying }) {
    const { rapier, world } = useRapier();
    const cpRef = useRef();

    // Initialize constraint physics when scene changes
    React.useEffect(() => {
        const sceneConstraintsEnabled = scene?.constraints?.enabled;
        const anyObjectHasConstraints = scene?.objects?.some(obj => obj.constraints && Array.isArray(obj.constraints) && obj.constraints.length > 0);
        const hasSceneJoints = scene?.joints && Array.isArray(scene.joints) && scene.joints.length > 0;
        const constraintPhysicsEnabled = sceneConstraintsEnabled || anyObjectHasConstraints || hasSceneJoints;

        if (constraintPhysicsEnabled) {
            cpRef.current = new ConstraintPhysics(scene);
            cpRef.current.setWorld(world, rapier);
        } else {
            if (cpRef.current) {
                cpRef.current.destroy();
            }
            cpRef.current = null;
        }
    }, [scene, world, rapier]);

    // Initialize constraints once bodies are created
    React.useEffect(() => {
        const sceneConstraintsEnabled = scene?.constraints?.enabled;
        const anyObjectHasConstraints = scene?.objects?.some(obj => obj.constraints && Array.isArray(obj.constraints) && obj.constraints.length > 0);
        const hasSceneJoints = scene?.joints && Array.isArray(scene.joints) && scene.joints.length > 0;
        const constraintPhysicsEnabled = sceneConstraintsEnabled || anyObjectHasConstraints || hasSceneJoints;

        if (cpRef.current && world && constraintPhysicsEnabled) {
            // Delay to ensure all bodies are created and registered in physics world
            const timer = setTimeout(() => {
                cpRef.current.initializeConstraints();
            }, 500); // Further increased delay for proper body initialization
            return () => clearTimeout(timer);
        }
    }, [scene, world]);

    // Constraints are initialized once and persist during simulation
    useFrame(() => {
        // Constraints are handled by Rapier automatically once created
        // No per-frame updates needed for basic constraints
    });

    return null; // Invisible component
}

// Component to handle fluid dynamics forces, must be inside Physics
function FluidForces({ scene, isPlaying }) {
    const { rapier, world } = useRapier();
    const fpRef = useRef();

    // Initialize fluid physics when scene changes
    React.useEffect(() => {
        const fluidPhysicsEnabled = scene?.fluid?.enabled;
        if (fluidPhysicsEnabled) {
            fpRef.current = new FluidPhysics(scene);
        } else {
            fpRef.current = null;
        }
    }, [scene]);

    // Handle fluid forces
    useFrame(() => {
        if (!isPlaying || !fpRef.current || !world || !scene?.objects) return;

        // Create body map for efficient lookup
        const bodyMap = new Map();
        const objectStates = {};

        world.forEachRigidBody((body, handle) => {
            if (body.userData) {
                const position = body.translation();
                const velocity = body.linvel();
                bodyMap.set(body.userData, body);
                objectStates[body.userData] = {
                    position: [position.x, position.y, position.z],
                    velocity: [velocity.x, velocity.y, velocity.z]
                };
            }
        });

        // Calculate fluid forces
        const forces = fpRef.current.calculateFluidForces(scene.objects, objectStates);

        // Apply forces to bodies
        Object.keys(forces).forEach(id => {
            if (bodyMap.has(id)) {
                const body = bodyMap.get(id);
                if (!body.isFixed()) {
                    const force = forces[id];
                    body.addForce(new rapier.Vector3(force[0], force[1], force[2]), true);
                }
            }
        });
    });

    return null; // Invisible component
}

// Joints are currently not implemented - placeholder for future implementation
const Joints = React.memo(function Joints({ scene, bodyRefs, physicsResetKey }) {
    // Render placeholder joints visualization (invisible for now)
    // Future implementation would use Rapier's native joint API
    if (scene?.joints && Array.isArray(scene.joints) && scene.joints.length > 0) {
        console.log('🦴 Joints detected in scene but not yet implemented:', scene.joints.length);
    }

    return null; // Invisible component - joints not implemented yet
});

// Global NonPhysicsEngine instance for AI/external access
export const globalNonPhysicsEngine = new NonPhysicsEngine();

// React PhysicsWorld component that uses Physics paused prop for proper state preservation
export function PhysicsWorld({ scene, isPlaying, onPhysicsDataCalculated, resetTrigger, defaultContactMaterial, simulationTime, simulationSpeed = 1 }) {
    const [physicsResetKey, setPhysicsResetKey] = React.useState(0);
    const bodyRefs = useRef({}); // Store body refs for joints
    const nonPhysicsEngineRef = useRef(globalNonPhysicsEngine);

    // Patch scene: ensure bodies referenced by joints/constraints exist
    // Only patch once per scene objects array to avoid re-patching every render
    const patchedScenes = React.useRef(new WeakSet());
    React.useEffect(() => {
        if (!scene) return;
        scene.objects = scene.objects || [];

        // Use the scene.objects array as the key; ensure we only patch each unique array once
        if (patchedScenes.current.has(scene.objects)) return;

        const hasObject = id => scene.objects.some(o => o.id === id);

        // Ensure scene.joints referenced bodies exist
        if (Array.isArray(scene.joints)) {
            scene.joints.forEach(j => {
                if (j && j.bodyA && !hasObject(j.bodyA)) {
                    scene.objects.push({ id: j.bodyA, type: 'Sphere', mass: 0, radius: 0.1, position: j.anchorA || [0,0,0], color: '#888888', isStatic: true });
                }
                if (j && j.bodyB && !hasObject(j.bodyB)) {
                    scene.objects.push({ id: j.bodyB, type: 'Sphere', mass: 0, radius: 0.1, position: j.anchorB || [0,0,0], color: '#888888', isStatic: true });
                }
            });
        }

        // Ensure per-object constraints target bodies exist
        scene.objects.forEach(obj => {
            if (obj.constraints && Array.isArray(obj.constraints)) {
                obj.constraints.forEach(c => {
                    if (c && c.targetId && c.targetId !== 'ground' && !hasObject(c.targetId)) {
                        scene.objects.push({ id: c.targetId, type: 'Sphere', mass: 0, radius: 0.1, position: c.anchorB || [0,0,0], color: '#888888', isStatic: true });
                    }
                });
            }
        });

        patchedScenes.current.add(scene.objects);
    }, [scene]);

    const renderObjects = () => {
        if (!scene?.objects) return null;

        return scene.objects.map((obj, index) => {
            const key = obj.id || `obj-${index}`;

            // Check if object should be non-physics (visual only, no physics simulation)
            if (obj.visualOnly || obj.isVisualOnly || obj.nonPhysics) {
                return <NonPhysicsObject
                    key={key}
                    config={obj}
                    nonPhysicsEngineRef={nonPhysicsEngineRef}
                />;
            }

            return <PhysicsObject
                key={key}
                config={obj}
                isPlaying={isPlaying}
                physicsResetKey={physicsResetKey}
                bodyRefs={bodyRefs}
                onPhysicsDataCalculated={onPhysicsDataCalculated}
                defaultContactMaterial={defaultContactMaterial}
                simulationTime={simulationTime}
            />;
        });
    };

    // Reset physics world when resetTrigger changes (like when scene changes or reset button is pressed)
    React.useEffect(() => {
        if (resetTrigger !== undefined && resetTrigger !== null) {
            console.log('PhysicsWorld: Reset triggered, key:', physicsResetKey + 1);
            setPhysicsResetKey(prev => prev + 1);
            bodyRefs.current = {}; // Clear body refs on physics reset
        }
    }, [resetTrigger]);

    const effectiveGravity = scene?.gravity || [0, -9.81, 0];

    // Use paused prop to control physics simulation - when paused, rigid bodies maintain their state
    // Note: Ground planes are defined as objects in each scene, not automatically added here
    // timeStep controls simulation speed (default: 1/60, multiply by simulationSpeed for slow-mo)
    return (
        <Physics
            key={`physics-${physicsResetKey}`}
            gravity={effectiveGravity}
            paused={!isPlaying}
            timeStep={1/60 * simulationSpeed}
        >
            <NonPhysicsAnimator nonPhysicsEngineRef={nonPhysicsEngineRef} isPlaying={isPlaying} />
            <GravitationalForces scene={scene} isPlaying={isPlaying} />
            <Constraints scene={scene} isPlaying={isPlaying} />
            <FluidForces scene={scene} isPlaying={isPlaying} />
            <Joints scene={scene} bodyRefs={bodyRefs} physicsResetKey={physicsResetKey} />
            <ParticleSystem
                key={`particles-${JSON.stringify(scene.particles || {})}`}
                config={scene.particles}
                isPlaying={isPlaying}
                onPhysicsDataCalculated={onPhysicsDataCalculated}
                simulationTime={simulationTime}
                physicsResetKey={physicsResetKey}
            />
            {renderObjects()}

        </Physics>
    );
}

// NonPhysicsAnimator - Updates all non-physics animations every frame
function NonPhysicsAnimator({ nonPhysicsEngineRef, isPlaying }) {
    const frameCount = React.useRef(0);
    const loggedOnce = React.useRef(false);
    
    useFrame((state, delta) => {
        if (!nonPhysicsEngineRef?.current) return;
        
        if (isPlaying) {
            nonPhysicsEngineRef.current.updateAnimations(delta);
            
            // Log first frame to confirm animator is running
            if (!loggedOnce.current) {
                console.log('🎞️ NonPhysicsAnimator: Started running');
                loggedOnce.current = true;
            }
            
            // Log every 60 frames (once per second at 60fps) for debugging
            frameCount.current++;
            if (frameCount.current % 60 === 0) {
                const animCount = nonPhysicsEngineRef.current.objects.size;
                console.log(`🎬 NonPhysics: ${animCount} total objects, checking animations...`);
                
                // Log which objects have animations
                for (const [id, obj] of nonPhysicsEngineRef.current.objects.entries()) {
                    if (obj.animation) {
                        console.log(`  ✨ "${id}" has animation:`, obj.animation.type || 'custom code');
                    }
                }
            }
        }
    });
    
    return null; // This component doesn't render anything
}

// Non-physics object component (no physics, just rendering)
function NonPhysicsObject({ config, nonPhysicsEngineRef }) {
    const meshRef = useRef();

    // Add object to engine and register mesh
    React.useEffect(() => {
        if (nonPhysicsEngineRef?.current && config.id) {
            // Add object to engine (stores config)
            nonPhysicsEngineRef.current.addObject(config);
            console.log(`🎨 NonPhysicsObject: Added object "${config.id}" to engine`);
        }
    }, [nonPhysicsEngineRef, config.id]);

    // Register mesh with NonPhysicsEngine when mesh is ready
    React.useEffect(() => {
        if (nonPhysicsEngineRef?.current && meshRef.current && config.id) {
            nonPhysicsEngineRef.current.registerMesh(config.id, meshRef);
            console.log(`🔗 NonPhysicsObject: Registered mesh for "${config.id}"`);
            
            // Log if animation exists for this object
            const obj = nonPhysicsEngineRef.current.getObject(config.id);
            if (obj?.animation) {
                console.log(`✨ Animation found for "${config.id}":`, obj.animation);
            }
        }
    }, [nonPhysicsEngineRef, config.id]);

    // Get geometry based on shape type
    const createGeometry = () => {
        switch (config.type) {
            case 'Sphere':
                return <sphereGeometry args={[config.radius || 0.5, 32, 32]} />;
            case 'Box':
                return <boxGeometry args={config.dimensions || [1, 1, 1]} />;
            case 'Cylinder':
                return <cylinderGeometry args={[config.radius || 0.5, config.radius || 0.5, config.height || 1, 16]} />;
            case 'Cone':
                return <coneGeometry args={[config.radius || 0.5, config.height || 1, 8]} />;
            case 'Capsule':
                return <capsuleGeometry args={[config.radius || 0.5, config.height || 1, 4, 8]} />;
            case 'Plane':
                return <planeGeometry args={config.dimensions || [10, 10, 1, 1]} />;
            default:
                return <boxGeometry args={[1, 1, 1]} />;
        }
    };

    return (
        <mesh
            ref={meshRef}
            position={config.position || [0, 0, 0]}
            rotation={config.rotation || [0, 0, 0]}
            castShadow={config.castShadow !== false}
            receiveShadow={config.receiveShadow !== false}
        >
            {createGeometry()}
            <meshStandardMaterial
                color={config.color || "#ffffff"}
                opacity={config.opacity !== undefined ? config.opacity : 1.0}
                transparent={config.opacity !== undefined && config.opacity < 1.0}
                metalness={config.metalness || 0}
                roughness={config.roughness !== undefined ? config.roughness : 0.5}
            />
        </mesh>
    );
}

// Individual physics object component (only rendered when playing)
function PhysicsObject({ config, isPlaying, physicsResetKey, bodyRefs, onPhysicsDataCalculated, defaultContactMaterial, simulationTime }) {
    const bodyRef = useRef();

    // Store body ref for joints when it becomes available
    React.useEffect(() => {
        if (bodyRef.current && config.id) {
            bodyRefs.current[config.id] = bodyRef.current;
        }
    }, [bodyRef.current, config.id]);

    // --- Handle initial velocity when simulation starts ---
    // This fixes Rapier's aggressive sleeping algorithm that ignores linvel when unpausing
    React.useEffect(() => {
        if (isPlaying && bodyRef.current) {
            const velocity = config.velocity || [0, 0, 0];
            // Imperatively set velocity and wake the body
            bodyRef.current.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] });
            bodyRef.current.setAngvel({ x: 0, y: 0, z: 0 });
            bodyRef.current.wakeUp();
        }
    }, [isPlaying, config.velocity, physicsResetKey]); // Dependencies ensure this runs when simulation starts

    // Get collider based on shape type with proper friction and restitution
    const createCollider = () => {
        // Use object-specific values first, then default from scene contactMaterial
        const restitution = config.restitution !== undefined ? config.restitution : 
                           (defaultContactMaterial?.restitution !== undefined ? defaultContactMaterial.restitution : 0.5);
        const friction = config.friction !== undefined ? config.friction : 
                        (defaultContactMaterial?.friction !== undefined ? defaultContactMaterial.friction : 0.5);

        switch (config.type) {
            case 'Sphere':
                return <BallCollider args={[config.radius || 0.5]} restitution={restitution} friction={friction} />;
            case 'Box':
                const dims = config.dimensions || [1, 1, 1];
                return <CuboidCollider args={dims.map(d => d / 2)} restitution={restitution} friction={friction} />;
            case 'Cylinder':
                return <CylinderCollider args={[config.height / 2 || 0.5, config.radius || 0.5]} restitution={restitution} friction={friction} />;
            case 'Cone':
                return <ConeCollider args={[config.height / 2 || 0.5, config.radius || 0.5]} restitution={restitution} friction={friction} />;
            case 'Capsule':
                return <CapsuleCollider args={[config.height / 2 || 0.5, config.radius || 0.5]} restitution={restitution} friction={friction} />;
            case 'ConvexPolyhedron':
                // Use capsule as approximation for complex shapes
                return <CapsuleCollider args={[(config.height || 2) / 2, config.radius || 0.8]} restitution={restitution} friction={friction} />;
            default:
                return <CuboidCollider args={[0.5, 0.5, 0.5]} restitution={restitution} friction={friction} />;
        }
    };

    // Get geometry based on shape type
    const createGeometry = () => {
        switch (config.type) {
            case 'Sphere':
                return <sphereGeometry args={[config.radius || 0.5, 32, 32]} />;
            case 'Box':
                return <boxGeometry args={config.dimensions || [1, 1, 1]} />;
            case 'Cylinder':
                return <cylinderGeometry args={[config.radius || 0.5, config.radius || 0.5, config.height || 1, 16]} />;
            case 'Cone':
                return <coneGeometry args={[config.radius || 0.5, config.height || 1, 8]} />;
            case 'Capsule':
                return <capsuleGeometry args={[config.radius || 0.5, config.height || 1, 4, 8]} />;
            default:
                return <boxGeometry args={[1, 1, 1]} />;
        }
    };

    // Report physics data for visualization and graphing
    useFrame(() => {
        if (bodyRef.current && onPhysicsDataCalculated && isPlaying) {
            try {
                // Get position and velocity from RigidBody
                const pos = bodyRef.current.translation();
                const vel = bodyRef.current.linvel ? bodyRef.current.linvel() : { x: 0, y: 0, z: 0 };
                
                onPhysicsDataCalculated({ 
                    [config.id]: {
                        velocity: [vel.x, vel.y, vel.z],
                        position: [pos.x, pos.y, pos.z],
                        time: simulationTime || 0
                    }
                });
            } catch (error) {
                // Silently handle access errors
            }
        }
    });

    return (
        <RigidBody
            ref={bodyRef}
            userData={config.id}
            type={config.isStatic ? "fixed" : "dynamic"}
            position={config.position || [0, 0, 0]}
            rotation={config.rotation || [0, 0, 0]}
            linvel={config.velocity || [0, 0, 0]}
        >
            {createCollider()}
            <mesh castShadow>
                {createGeometry()}
                <meshStandardMaterial
                    color={config.color || "#ffffff"}
                    opacity={config.opacity || 1.0}
                    transparent={config.opacity < 1.0}
                />
            </mesh>
        </RigidBody>
    );
}

// Static visual mesh component (rendered when paused for dynamic objects)
function PhysicsObjectVisual({ config }) {
    // Get geometry based on shape type
    const createGeometry = () => {
        switch (config.type) {
            case 'Sphere':
                return <sphereGeometry args={[config.radius || 0.5, 32, 32]} />;
            case 'Box':
                return <boxGeometry args={config.dimensions || [1, 1, 1]} />;
            case 'Cylinder':
                return <cylinderGeometry args={[config.radius || 0.5, config.radius || 0.5, config.height || 1, 16]} />;
            case 'Cone':
                return <coneGeometry args={[config.radius || 0.5, config.height || 1, 8]} />;
            case 'Capsule':
                return <capsuleGeometry args={[config.radius || 0.5, config.height || 1, 4, 8]} />;
            default:
                return <boxGeometry args={[1, 1, 1]} />;
        }
    };

    return (
        <mesh
            position={config.position || [0, 0, 0]}
            rotation={config.rotation || [0, 0, 0]}
            castShadow
        >
            {createGeometry()}
            <meshStandardMaterial
                color={config.color || "#ffffff"}
                opacity={config.opacity || 1.0}
                transparent={config.opacity < 1.0}
            />
        </mesh>
    );
}
