import React, { useMemo, useRef, useEffect } from 'react';
import { InstancedRigidBodies } from '@react-three/rapier';
import * as THREE from 'three';

/**
 * ParticleSystem Component - Simple physics-based particle system using native Rapier physics
 * Creates multiple dynamic rigid bodies that interact naturally through the physics engine
 */
export function ParticleSystem({
  config,
  isPlaying,
  onPhysicsDataCalculated,
  simulationTime,
  physicsResetKey,
  particles: externalParticles // Accept an external particles array
}) {
  const instancedRef = useRef(null);

  // Generate particles based on configuration
  const particles = useMemo(() => {
    // If external particles are provided, use them directly
    if (externalParticles && externalParticles.length > 0) {
      return externalParticles;
    }

    // Otherwise, generate particles based on config
    if (!config || !config.enabled) return [];

    const generatedParticles = [];
    const { count = 100, type = 'gas', position = [0, 0, 0], size = [5, 5, 5] } = config;

    // Generate positions within volume
    for (let i = 0; i < count; i++) {
      let particlePos;

      switch (type) {
        case 'gas': // Fill entire volume
          particlePos = [
            position[0] + (Math.random() - 0.5) * size[0],
            position[1] + (Math.random() - 0.5) * size[1],
            position[2] + (Math.random() - 0.5) * size[2]
          ];
          break;
        case 'surface': // Particles constrained to top surface
          particlePos = [
            position[0] + (Math.random() - 0.5) * size[0],
            position[1] + size[1]/2 + Math.random() * 0.1,
            position[2] + (Math.random() - 0.5) * size[2]
          ];
          break;
        case 'cluster': // Concentrated near center
          const radius = Math.random() ** 0.5 * Math.min(...size) * 0.3;
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          particlePos = [
            position[0] + radius * Math.sin(phi) * Math.cos(theta),
            position[1] + radius * Math.sin(phi) * Math.sin(theta),
            position[2] + radius * Math.cos(phi)
          ];
          break;
        case 'layer': // Horizontal layers
          particlePos = [
            position[0] + (Math.random() - 0.5) * size[0],
            position[1] + Math.floor(Math.random() * 5) * (size[1] / 4) - size[1]/2,
            position[2] + (Math.random() - 0.5) * size[2]
          ];
          break;
        default:
          particlePos = [
            position[0] + (Math.random() - 0.5) * size[0],
            position[1] + (Math.random() - 0.5) * size[1],
            position[2] + (Math.random() - 0.5) * size[2]
          ];
      }

      // Generate initial velocity (thermal motion)
      const velocity = [
        (Math.random() - 0.5) * (config.temperature || 1) * 2,
        (Math.random() - 0.5) * (config.temperature || 1) * 2,
        (Math.random() - 0.5) * (config.temperature || 1) * 2
      ];

      generatedParticles.push({
        id: `particle-${i}`,
        position: particlePos,
        velocity,
        type: 'Sphere',
        mass: config.mass || 0.001,
        radius: config.radius || 0.1,
        color: config.color || getParticleColor(type),
        friction: 0.1,
        restitution: config.restitution || 0.9
      });
    }

    return generatedParticles;
  }, [config, physicsResetKey, externalParticles]);

  // Create instances for InstancedRigidBodies - use dynamic bodies for native physics
  const instances = useMemo(() => {
    return particles.map(particle => ({
      key: particle.id,
      position: particle.position,
      linvel: particle.velocity,
      userData: particle.id,
      gravityScale: 1, // Let gravity affect particles naturally
      type: 'dynamic' // Use dynamic bodies for native Rapier physics
    }));
  }, [particles]);

  // Reapply initial velocities and wake bodies whenever simulation starts or resets
  useEffect(() => {
    if (!isPlaying || !instancedRef.current) return;

    particles.forEach((particle, index) => {
      const body = instancedRef.current.at(index);
      if (!body) return;

      const velocity = particle.velocity || [0, 0, 0];
      body.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      body.wakeUp();
    });
  }, [isPlaying, particles, physicsResetKey]);

  if (!config || !config.enabled || particles.length === 0) {
    return null;
  }

  return (
    <InstancedRigidBodies
      key={`instanced-${physicsResetKey}`}
      instances={instances}
      ref={instancedRef}
    >
      <instancedMesh args={[undefined, undefined, particles.length]}>
        <sphereGeometry args={[config.radius || 0.1, 6, 4]} />
        <meshStandardMaterial
          color={config.color || getParticleColor(config.type)}
          opacity={config.opacity || 1.0}
          transparent={config.opacity < 1.0}
        />
      </instancedMesh>
    </InstancedRigidBodies>
  );
}

function getParticleColor(type) {
  switch (type) {
    case 'gas': return '#87CEEB'; // Light blue for gas
    case 'surface': return '#32CD32'; // Green for surface
    case 'cluster': return '#FFD700'; // Gold for cluster
    case 'layer': return '#FF69B4'; // Pink for layers
    default: return '#FFFFFF';
  }
}

/**
 * ParticleSpawner - Spawns particles over time with customizable parameters
 */
export function ParticleSpawner({
  config,
  isPlaying,
  onPhysicsDataCalculated,
  simulationTime,
  physicsResetKey
}) {
  const spawnIntervalRef = useRef(null);
  const [activeParticles, setActiveParticles] = useState([]);

  // Add new particles periodically
  useEffect(() => {
    if (isPlaying && config && config.enabled && config.spawnRate > 0) {
      spawnIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const newParticle = generateParticle(config, activeParticles.length, now);
        setActiveParticles(prev => [...prev, newParticle].slice(-config.maxParticles || 100));
      }, 1000 / config.spawnRate);
    } else {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
    }

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
      }
    };
  }, [isPlaying, config, activeParticles.length]);

  return (
    <ParticleSystem
      config={config} // Pass config directly
      isPlaying={isPlaying}
      onPhysicsDataCalculated={onPhysicsDataCalculated}
      simulationTime={simulationTime}
      physicsResetKey={physicsResetKey}
      particles={activeParticles} // Pass activeParticles to the new prop
    />
  );
}

function generateParticle(config, index, timestamp) {
  const { position = [0, 0, 0], velocity = [0, 0, 0] } = config;

  return {
    id: `spawned-${timestamp}-${index}`,
    position,
    velocity: [
      velocity[0] + (Math.random() - 0.5) * (config.spread || 1),
      velocity[1] + (Math.random() - 0.5) * (config.spread || 1),
      velocity[2] + (Math.random() - 0.5) * (config.spread || 1)
    ],
    type: config.particleType || 'Sphere',
    mass: config.particleMass || 0.001,
    radius: config.particleRadius || 0.1,
    color: config.particleColor || '#FFFFFF',
    friction: config.friction || 0.1,
    restitution: config.restitution || 0.9,
    lifetime: config.lifetime || 30 // seconds
  };
}

export default ParticleSystem;
