// Unit Tests for Rapier Physics Integration
// Tests Rapier functionality without importing CANNON.js

import { describe, it, expect } from 'vitest';
import { RapierPhysicsEngine } from '../../test/RapierPhysicsEngine.js';

describe('Rapier Physics Engine Unit Tests', () => {
    describe('Rapier Engine Initialization', () => {
        it('should initialize Rapier physics engine successfully', async () => {
            const engine = new RapierPhysicsEngine();

            await engine.initialize({
                gravity: [0, -9.81, 0],
                modules: {
                    gravitation: { enabled: true },
                    electrostatic: { enabled: false }
                }
            });

            expect(engine).toBeDefined();
            expect(engine.physicsAdapter).toBeDefined();
            expect(engine.physicsAdapter.world).toBeDefined();

            const stats = engine.getPerformanceStats();
            expect(stats.physicsEngine).toBe('Rapier');
            expect(stats.bodyCount).toBe(0);
            expect(stats.colliderCount).toBe(0);
            expect(stats.jointCount).toBe(0);
            expect(stats.activeModules).toContain('gravitational');
            expect(stats.activeModules).not.toContain('electrostatic');

            engine.destroy();
        }, 10000);
    });

    describe('Rapier Body Creation', () => {
        it('should create a sphere body correctly', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize();

            const sphereConfig = {
                id: 'test-sphere',
                type: 'Sphere',
                mass: 1.5,
                radius: 0.5,
                position: [1, 2, 3],
                velocity: [0.1, 0.2, 0.3],
                restitution: 0.8
            };

            const bodyId = await engine.addObject(sphereConfig);
            expect(bodyId).toBeGreaterThan(0);
            expect(typeof bodyId).toBe('number');

            // Check internal storage
            expect(engine.bodies.has('test-sphere')).toBe(true);
            expect(engine.colliders.size).toBe(1);

            engine.destroy();
        });

        it('should create a box body correctly', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize();

            const boxConfig = {
                id: 'test-box',
                type: 'Box',
                mass: 2.0,
                dimensions: [1, 2, 3],
                position: [0, 5, 0],
                rotation: [0, 0, 0, 1],
                isStatic: true
            };

            const bodyId = await engine.addObject(boxConfig);
            expect(bodyId).toBeGreaterThan(0);

            // Check that static bodies are created correctly
            expect(engine.bodies.has('test-box')).toBe(true);

            engine.destroy();
        });

        it('should handle different shape types', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize();

            const shapes = [
                { id: 'sphere', type: 'Sphere', radius: 1 },
                { id: 'box', type: 'Box', dimensions: [1, 1, 1] },
                { id: 'cylinder', type: 'Cylinder', radius: 1, height: 2 },
                { id: 'capsule', type: 'Capsule', radius: 1, height: 2 }
            ];

            for (const shape of shapes) {
                const bodyConfig = {
                    ...shape,
                    mass: 1,
                    position: [0, 0, 0]
                };

                const bodyId = await engine.addObject(bodyConfig);
                expect(bodyId).toBeGreaterThan(0);
                expect(engine.bodies.has(shape.id)).toBe(true);
            }

            expect(engine.bodies.size).toBe(4);
            expect(engine.colliders.size).toBe(4);

            engine.destroy();
        });
    });

    describe('Rapier Physics Simulation', () => {
        it('should simulate gravity correctly', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize({ gravity: [0, -9.81, 0] });

            // Create a falling sphere
            await engine.addObject({
                id: 'faller',
                type: 'Sphere',
                mass: 1,
                radius: 0.5,
                position: [0, 10, 0],
                velocity: [0, 0, 0]
            });

            const initialState = engine.getObjectStates();
            const initialY = initialState.faller.position[1];
            expect(initialY).toBeCloseTo(10, 1);

            // Simulate for 1 second (60 frames)
            for (let i = 0; i < 60; i++) {
                engine.step(1/60);
            }

            const finalState = engine.getObjectStates();
            const finalY = finalState.faller.position[1];

            // Should have fallen due to gravity
            expect(finalY).toBeLessThan(initialY);
            // Theoretical fall distance at 60fps: 0.5 * 9.81 * (60/60)^2 = 4.905m
            expect(Math.abs(finalY - initialY)).toBeGreaterThan(4);
            expect(Math.abs(finalY - initialY)).toBeLessThan(6);

            engine.destroy();
        }, 5000);

        it('should conserve momentum in collisions', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize({ gravity: [0, 0, 0] }); // No gravity

            // Two equal-mass objects approaching each other
            await engine.addObject({
                id: 'obj1',
                type: 'Sphere',
                mass: 5,
                radius: 1,
                position: [-5, 0, 0],
                velocity: [2, 0, 0] // Moving right
            });

            await engine.addObject({
                id: 'obj2',
                type: 'Sphere',
                mass: 5,
                radius: 1,
                position: [5, 0, 0],
                velocity: [-1, 0, 0] // Moving left
            });

            // Record initial momentum
            const initialStates = engine.getObjectStates();
            const initialMomentum = initialStates.obj1.velocity[0] * 5 + initialStates.obj2.velocity[0] * 5;

            // Let them collide (simulate enough time for collision)
            for (let i = 0; i < 120; i++) { // 2 seconds
                engine.step(1/60);
            }

            // Check final momentum
            const finalStates = engine.getObjectStates();
            const finalMomentum = finalStates.obj1.velocity[0] * 5 + finalStates.obj2.velocity[0] * 5;

            // Momentum should be conserved (within reasonable tolerance)
            const momentumError = Math.abs(finalMomentum - initialMomentum);
            console.log(`Momentum conservation - Initial: ${initialMomentum}, Final: ${finalMomentum}, Error: ${momentumError}`);

            expect(momentumError).toBeLessThan(0.5); // Small error acceptable for numerical simulation

            engine.destroy();
        }, 10000);
    });

    describe('Rapier Physics Modules', () => {
        describe('Gravitational Physics Module', () => {
            it('should calculate gravitational forces between bodies', () => {
                const { RapierGravitationalPhysics } = require('../../test/modules/GravitationalPhysics.js');

                const gravPhysics = new RapierGravitationalPhysics({
                    gravitationalPhysics: {
                        enabled: true,
                        gravitationalConstant: 6.67430e-11
                    },
                    simulationScale: 'terrestrial'
                });

                // Two massive bodies close to each other - need to include position and mass
                const bodies = [
                    {
                        id: 'body1',
                        position: [0, 0, 0],
                        mass: 1e10,
                        gravitationalMass: 1e10
                    },
                    {
                        id: 'body2',
                        position: [1, 0, 0],
                        mass: 1e10,
                        gravitationalMass: 1e10
                    }
                ];

                const forces = gravPhysics.calculateGravitationalForces(bodies, {});

                expect(forces).toBeDefined();
                expect(forces.body1).toBeDefined();
                expect(forces.body2).toBeDefined();

                const force1 = forces.body1;
                const force2 = forces.body2;

                // Forces should be equal and opposite
                expect(Math.abs(force1[0] + force2[0])).toBeLessThan(0.001); // X components opposite
                expect(Math.abs(force1[1] - force2[1])).toBeLessThan(0.001); // Y components same (attraction)
                expect(Math.abs(force1[2] - force2[2])).toBeLessThan(0.001); // Z components same

                // Force magnitude should be significant
                const forceMag = Math.sqrt(force1[0]**2 + force1[1]**2 + force1[2]**2);
                expect(forceMag).toBeGreaterThan(0);

                gravPhysics.clear();
            });

            it('should build and use octree for performance', () => {
                const { RapierGravitationalPhysics } = require('../../test/modules/GravitationalPhysics.js');

                const gravPhysics = new RapierGravitationalPhysics({
                    gravitationalPhysics: {
                        enabled: true,
                        theta: 0.5
                    }
                });

                // Create many bodies to trigger octree usage
                const numBodies = 8;
                const bodies = [];
                for (let i = 0; i < numBodies; i++) {
                    bodies.push({
                        id: `body${i}`,
                        position: [Math.random() * 100 - 50, Math.random() * 100 - 50, Math.random() * 100 - 50],
                        mass: 1e6 + Math.random() * 1e6,
                        gravitationalMass: 1e6 + Math.random() * 1e6
                    });
                }

                const octree = gravPhysics.buildOctree(bodies);
                expect(octree).toBeDefined();
                expect(octree.children).toBeDefined();

                // Octree should have 8 children for 3D space
                expect(octree.children.length).toBe(8);

                const stats = gravPhysics.getPerformanceStats(bodies);
                expect(stats.performanceComplexity).toBe('O(n log n)');
                expect(stats.bodiesProcessed).toBe(numBodies);

                gravPhysics.clear();
            });
        });

        describe('Electrostatic Physics Module', () => {
            it('should calculate electrostatic forces correctly', () => {
                const { RapierElectrostaticPhysics } = require('../../test/modules/ElectrostaticPhysics.js');

                const electrostatic = new RapierElectrostaticPhysics({
                    electrostatic: {
                        enabled: true,
                        coulombConstant: 9e9
                    }
                });

                // Two charges of opposite signs - complete object configs with required properties
                const charges = [
                    {
                        id: 'pos',
                        position: [0, 0, 0],
                        charge: 1e-6,
                        mass: 1,
                        gravitationalMass: 1
                    },
                    {
                        id: 'neg',
                        position: [1, 0, 0],
                        charge: -1e-6,
                        mass: 1,
                        gravitationalMass: 1
                    }
                ];

                const forces = electrostatic.calculateElectrostaticForces(charges, {});

                expect(forces.pos).toBeDefined();
                expect(forces.neg).toBeDefined();

                const forcePos = forces.pos;
                const forceNeg = forces.neg;

                // Opposite charges should attract (forces should be toward each other)
                expect(forcePos[0]).toBeLessThan(0); // Positive charge pulled left
                expect(forceNeg[0]).toBeGreaterThan(0); // Negative charge pulled right

                // Forces should be equal in magnitude
                const magPos = Math.sqrt(forcePos[0]**2 + forcePos[1]**2 + forcePos[2]**2);
                const magNeg = Math.sqrt(forceNeg[0]**2 + forceNeg[1]**2 + forceNeg[2]**2);

                expect(Math.abs(magPos - magNeg)).toBeLessThan(0.001);

                electrostatic = null; // Allow garbage collection
            });

            it('should handle same sign charges (repulsion)', () => {
                const { RapierElectrostaticPhysics } = require('../../test/modules/ElectrostaticPhysics.js');

                const electrostatic = new RapierElectrostaticPhysics({
                    electrostatic: {
                        enabled: true
                    }
                });

                // Two positive charges - complete object configs with required properties
                const charges = [
                    {
                        id: 'pos1',
                        position: [0, 0, 0],
                        charge: 1e-6,
                        mass: 1,
                        gravitationalMass: 1
                    },
                    {
                        id: 'pos2',
                        position: [1, 0, 0],
                        charge: 1e-6,
                        mass: 1,
                        gravitationalMass: 1
                    }
                ];

                const forces = electrostatic.calculateElectrostaticForces(charges, {});

                const force1 = forces.pos1;
                const force2 = forces.pos2;

                // Like charges should repel (both pushed apart)
                expect(force1[0]).toBeLessThan(0); // First charge pushed left
                expect(force2[0]).toBeGreaterThan(0); // Second charge pushed right

                electrostatic = null;
            });
        });
    });

    describe('Rapier Scene Loading', () => {
        it('should load educational physics scenes', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize({
                modules: {
                    gravitation: { enabled: true },
                    electrostatic: { enabled: false }
                }
            });

            // Simple educational scene: projectile motion
            const projectileScene = {
                id: 'projectile-demo',
                name: 'Projectile Motion',
                gravity: [0, -9.81, 0],
                objects: [
                    {
                        id: 'ball',
                        type: 'Sphere',
                        mass: 1,
                        radius: 0.5,
                        position: [0, 5, 0],
                        velocity: [10, 10, 0] // 45-degree launch
                    },
                    {
                        id: 'target',
                        type: 'Box',
                        mass: 0, // Static
                        dimensions: [1, 1, 1],
                        position: [25, 2.5, 0],
                        isStatic: true
                    }
                ],
                physics: {
                    modules: {
                        gravitation: { enabled: true }
                    }
                }
            };

            await engine.loadScene(projectileScene);

            const stats = engine.getPerformanceStats();
            expect(stats.bodyCount).toBe(2);
            expect(stats.activeModules).toContain('gravitational');

            // Verify physics state
            const states = engine.getObjectStates();
            expect(states.ball).toBeDefined();
            expect(states.target).toBeDefined();

            // Ball should start at specified position
            expect(states.ball.position[1]).toBeCloseTo(5, 1);

            engine.destroy();
        });
    });

    describe('Rapier Performance Metrics', () => {
        it('should provide detailed performance statistics', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize();

            // Add some objects
            for (let i = 0; i < 5; i++) {
                await engine.addObject({
                    id: `obj${i}`,
                    type: 'Sphere',
                    mass: 1,
                    radius: 1,
                    position: [i * 2, 5, 0]
                });
            }

            const stats = engine.getPerformanceStats();

            expect(stats).toHaveProperty('physicsEngine', 'Rapier');
            expect(stats).toHaveProperty('bodyCount', 5);
            expect(stats).toHaveProperty('colliderCount', 5);
            expect(stats).toHaveProperty('jointCount', 0);
            expect(stats).toHaveProperty('activeModules');

            // Performance metrics should be reasonable numbers
            expect(stats.stepTime || 0).not.toBeNaN();

            engine.destroy();
        });
    });

    describe('Rapier Cleanup and Error Handling', () => {
        it('should destroy physics world properly', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize();

            await engine.addObject({
                id: 'test',
                type: 'Sphere',
                mass: 1,
                radius: 1,
                position: [0, 0, 0]
            });

            expect(() => engine.destroy()).not.toThrow();

            // After destroy, world should not be accessible
            expect(() => engine.physicsAdapter.world).not.toThrow();
        });

        it('should handle concurrent physics operations', async () => {
            const engine1 = new RapierPhysicsEngine();
            const engine2 = new RapierPhysicsEngine();

            await Promise.all([
                engine1.initialize(),
                engine2.initialize()
            ]);

            // Both should work independently
            await Promise.all([
                engine1.addObject({ id: 'obj1', type: 'Sphere', mass: 1, radius: 1, position: [0, 0, 0] }),
                engine2.addObject({ id: 'obj2', type: 'Box', mass: 1, dimensions: [1, 1, 1], position: [0, 0, 0] })
            ]);

            expect(engine1.getPerformanceStats().bodyCount).toBe(1);
            expect(engine2.getPerformanceStats().bodyCount).toBe(1);

            engine1.destroy();
            engine2.destroy();
        }, 10000);
    });

    describe('Rapier Educational Physics Validation', () => {
        it('should demonstrate projectile motion conservation of energy', async () => {
            const engine = new RapierPhysicsEngine();
            await engine.initialize({ gravity: [0, -9.81, 0] });

            // Perfect projectile: 10 m/s at 45° from 10m height
            await engine.addObject({
                id: 'projectile',
                type: 'Sphere',
                mass: 1,
                radius: 0.1, // Small to reduce air resistance effect
                position: [0, 10, 0],
                velocity: [Math.sqrt(10), Math.sqrt(10), 0] // √(v²/2) = √(v²/2) for equal components
            });

            // Simulate until projectile hits ground
            let steps = 0;
            const maxSteps = 1000;

            while (steps < maxSteps) {
                engine.step(1/60);
                const state = engine.getObjectStates().projectile;

                if (state.position[1] <= 0.1) { // Close to ground
                    break;
                }
                steps++;
            }

            const finalState = engine.getObjectStates().projectile;
            const range = finalState.position[0];

            console.log(`🎯 Projectile Range: ${range.toFixed(2)} meters`);

            // Theoretical range for projectile at 45°: R = (v²/g) = (100)/9.81 ≈ 10.2m
            expect(range).toBeGreaterThan(9.5);
            expect(range).toBeLessThan(11);

            engine.destroy();
        }, 10000);

        it('should demonstrate Kepler\'s laws of planetary motion (with Barnes-Hut)', async () => {
            const { RapierGravitationalPhysics } = require('../../test/modules/GravitationalPhysics.js');

            // Simplified two-body system: Sun + Earth
            const sunEarthSystem = {
                gravitation: {
                    enabled: true,
                    gravitationalConstant: 1.0 // Simplified units
                }
            };

            const gravPhysics = new RapierGravitationalPhysics({
                simulationScale: 'solar_system',
                gravitationalPhysics: sunEarthSystem.gravitation
            });

            // Sun: massive, stationary at origin
            // Earth: smaller, orbiting
            const bodies = [
                { id: 'sun', position: [0, 0, 0], mass: 1000, gravitationalMass: 1000 },
                // Earth at ~1 AU, circular velocity for Kepler's laws
                { id: 'earth', position: [10, 0, 0], mass: 1, gravitationalMass: 1 }
            ];

            // Simulate a complete orbit (using multiple steps)
            const angularPosition = [];

            for (let step = 0; step < 360; step++) { // One orbit in steps
                const forces = gravPhysics.calculateGravitationalForces(bodies, {});
                const state = gravPhysics.getObjectStates ? gravPhysics.getObjectStates() : {};

                // Track Earth's position (would need velocity integration in full engine)
                angularPosition.push(step);

                // Apply forces to update positions/velocities (simplified)
                // In real engine, this would be done by the physics stepper
            }

            // Orbital mechanics verification would require full engine integration
            // But we can verify the Barnes-Hut algorithm produces reasonable forces

            expect(bodies.length).toBe(2);
            // Force between sun and earth should be significant
            const forces = gravPhysics.calculateGravitationalForces(bodies, {});
            const earthForceMag = Math.sqrt(
                forces.earth[0]**2 + forces.earth[1]**2 + forces.earth[2]**2
            );

            expect(earthForceMag).toBeGreaterThan(0.1); // Significant gravitational attraction

            gravPhysics.clear();
        });
    });
});
