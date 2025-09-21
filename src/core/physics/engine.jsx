// Physics Forces and Components - Extracted from Visualizer.jsx
import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere, useBox, useCylinder, usePlane } from '@react-three/cannon';
import * as THREE from 'three';

// Physics Force Application Component
export function PhysicsForceApplier({ scene, objectApis, gravitationalPhysics, isPlaying, onPhysicsDataCalculated }) {
    useFrame(() => {
        if (!isPlaying || !scene?.objects) return;
        const forces = gravitationalPhysics.current.enabled ? gravitationalPhysics.current.calculateGravitationalForces(scene.objects, objectApis.current) : {};
        const velocities = {};
        scene.objects.forEach(obj => {
            const id = obj.id;
            if (objectApis.current[id] && !obj.isStatic) {
                velocities[id] = gravitationalPhysics.current.currentVelocities[id] || [0, 0, 0];
            }
        });
        onPhysicsDataCalculated({ velocities });
        Object.entries(forces).forEach(([objectId, force]) => {
            const api = objectApis.current[objectId];
            if (api && force && force.some(f => f !== 0)) {
                try { api.applyForce(force, [0, 0, 0]); } catch (e) { console.warn(`Failed to apply force to ${objectId}:`, e); }
            }
        });
    });
    return null;
}

// Base Object Component for Physics Objects
export function ObjectComponent({ usePhysicsHook, config, id, setApi, onPhysicsUpdate, gravitationalPhysics, isPlaying, children, args }) {
  const { mass, position, velocity, rotation = [0, 0, 0], restitution = 0.7, isStatic = false } = config;
  const [ref, api] = usePhysicsHook(() => ({
    mass: isStatic ? 0 : mass,
    position,
    velocity,
    rotation,
    args,
    material: { restitution },
    type: isStatic ? 'Static' : 'Dynamic'
  }));

  const posRef = useRef(position || [0, 0, 0]);
  const velRef = useRef(velocity || [0, 0, 0]);

  useEffect(() => {
    if (api) {
      setApi(id, api);
      const unsubPos = api.position.subscribe(p => {
        posRef.current = [...p];
        gravitationalPhysics.current?.updatePosition(id, p);
      });
      const unsubVel = api.velocity.subscribe(v => {
        velRef.current = [...v];
        gravitationalPhysics.current?.updateVelocity(id, v);
      });

      // Apply initial velocity if provided
      if (velocity && velocity.some(v => v !== 0)) {
        api.velocity.set(...velocity);
      }

      return () => { unsubPos(); unsubVel(); };
    }
  }, [id, api, setApi, gravitationalPhysics]);

  // Update velocity when config changes
  useEffect(() => {
    if (api && velocity) {
      const currentVel = velRef.current;
      const newVel = velocity;

      // Check if velocity actually changed
      const hasChanged = !currentVel || currentVel.some((v, i) => Math.abs(v - newVel[i]) > 0.001);

      if (hasChanged) {
        api.velocity.set(...newVel);
        velRef.current = [...newVel];
        gravitationalPhysics.current?.updateVelocity(id, newVel);
      }
    }
  }, [velocity, api, id, gravitationalPhysics]);

  useFrame((state) => {
    if (isPlaying) onPhysicsUpdate({ id, time: state.clock.elapsedTime, position: posRef.current });
  });

  return (
    <mesh ref={ref} castShadow>
      {children}
      <meshStandardMaterial
        color={config.color}
        opacity={config.opacity || 1.0}
        transparent={(config.opacity || 1.0) < 1.0}
      />
    </mesh>
  );
}

// Physics Object Components
export function Sphere(props) {
    return (
        <ObjectComponent {...props} usePhysicsHook={useSphere} args={[props.config.radius]}>
            <sphereGeometry args={[props.config.radius, 32, 32]} />
        </ObjectComponent>
    );
}

export function Box(props) {
    return (
        <ObjectComponent {...props} usePhysicsHook={useBox} args={props.config.dimensions || [1, 1, 1]}>
            <boxGeometry args={props.config.dimensions || [1, 1, 1]} />
        </ObjectComponent>
    );
}

export function Cylinder(props) {
    return (
        <ObjectComponent {...props} usePhysicsHook={useCylinder} args={[props.config.radius, props.config.radius, props.config.height, 16]}>
            <cylinderGeometry args={[props.config.radius, props.config.radius, props.config.height, 16]} />
        </ObjectComponent>
    );
}

// Scene Elements
export function SceneBox({ config, id, setApi }) {
    const { mass = 0, dimensions = [10, 0.2, 10], position = [0, 0, 0], velocity = [0, 0, 0], rotation = [0, 0, 0], color = "#88aa88", restitution = 0.3, opacity = 1.0 } = config;
    const [ref, api] = useBox(() => ({ mass, position, velocity, rotation, args: dimensions, material: { friction: 0.5, restitution } }));
    useEffect(() => { if (api) { setApi(id, api); } }, [id, api, setApi]);
    return (
        <mesh ref={ref} receiveShadow castShadow>
            <boxGeometry args={dimensions} />
            <meshStandardMaterial color={color} opacity={opacity} transparent={opacity < 1.0} />
        </mesh>
    );
}

export function GroundPlane() {
    const [ref] = usePlane(() => ({ mass: 0, rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0], material: { friction: 0.5, restitution: 0.3 } }));
    return (
        <mesh ref={ref} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#ffffff" side={THREE.DoubleSide} />
        </mesh>
    );
}
