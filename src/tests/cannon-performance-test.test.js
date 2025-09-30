// Performance test for Cannon.js with 1000 boxes
import { PhysicsEngine } from '../core/physics/engine.jsx';

// Create a scene with 1000 boxes
function create1000BoxesScene() {
    const objects = [];

    // Add ground
    objects.push({
        id: "ground",
        type: "Box",
        mass: 0,
        dimensions: [100, 0.5, 100],
        position: [0, -0.25, 0],
        color: "#666666",
        isStatic: true
    });

    // Generate 1000 boxes in a grid pattern above ground
    const boxesPerRow = 10;
    const rows = 10;
    const layers = 10;
    const spacing = 1.0;
    const startY = 5;

    let boxCount = 0;
    for (let layer = 0; layer < layers; layer++) {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < boxesPerRow; col++) {
                if (boxCount >= 1000) break;

                objects.push({
                    id: `box_${boxCount}`,
                    type: "Box",
                    mass: 0.1,
                    dimensions: [0.5, 0.5, 0.5],
                    position: [
                        (col - boxesPerRow/2) * spacing,
                        startY + layer * spacing * 0.8,
                        (row - rows/2) * spacing
                    ],
                    color: `hsl(${(boxCount % 360)}, 70%, 60%)`,
                    restitution: 0.1
                });
                boxCount++;
            }
        }
    }

    return {
        gravity: [0, -9.81, 0],
        hasGround: true,
        contactMaterial: { friction: 0.5, restitution: 0.1 },
        gravitationalPhysics: { enabled: false },
        simulationScale: "terrestrial",
        objects
    };
}

describe('Cannon.js Performance Test', () => {
    let physicsEngine;

    beforeEach(() => {
        // Create physics engine instance
        const scene = create1000BoxesScene();
        physicsEngine = new PhysicsEngine(scene);
        physicsEngine.loadScene(scene);
    });

    afterEach(() => {
        if (physicsEngine) {
            physicsEngine.destroy();
        }
    });

    test('1000 boxes simulation performance', async () => {
        const testSteps = 100; // Simulate 100 physics steps
        const deltaTime = 1/60; // 60 FPS

        console.log('Starting Cannon.js performance test with 1000 boxes...');

        const startTime = performance.now();
        let totalStepTime = 0;

        for (let i = 0; i < testSteps; i++) {
            const stepStart = performance.now();
            physicsEngine.step(deltaTime);
            const stepEnd = performance.now();
            totalStepTime += (stepEnd - stepStart);
        }

        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const averageStepTime = totalStepTime / testSteps;
        const averageFPS = 1000 / averageStepTime;

        console.log(`Results:
            Total time: ${totalTime.toFixed(2)}ms
            Average step time: ${averageStepTime.toFixed(2)}ms
            Average FPS: ${averageFPS.toFixed(1)}`);

        const stats = physicsEngine.getPerformanceStats();

        expect(stats.bodyCount).toBeGreaterThan(1000); // Should have boxes + ground
        expect(averageStepTime).toBeLessThan(50); // Should maintain reasonable performance
    });

    test('memory usage with 1000 boxes', () => {
        const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

        // Force garbage collection if available
        if (typeof window !== 'undefined' && window.gc) {
            window.gc();
        }

        const stats = physicsEngine.getPerformanceStats();

        if (performance.memory) {
            const finalMemory = performance.memory.usedJSHeapSize;
            const memoryUsed = (finalMemory - initialMemory) / 1024 / 1024; // MB

            console.log(`Memory used: ${memoryUsed.toFixed(2)} MB`);
        }

        console.log(`Bodies: ${stats.bodyCount}, Constraints: ${stats.constraintCount}`);
    });
});
