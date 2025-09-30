// Core Physics Engine - Extracted from Visualizer.jsx
export class GravitationalPhysics {
    constructor(scene) {
        this.scene = scene;
        this.G = scene.gravitationalPhysics?.gravitationalConstant || 6.67430e-11;
        this.minDistance = scene.gravitationalPhysics?.minDistance || 1e-6;
        this.softening = scene.gravitationalPhysics?.softening || 0;
        this.enabled = scene.gravitationalPhysics?.enabled !== false;
        this.simulationScale = scene.simulationScale || 'terrestrial';
        if (this.simulationScale === 'terrestrial' && this.G === 6.67430e-11) {
            this.G = 6.67430e-8;
        }
        this.currentPositions = {};
        this.currentVelocities = {};
    }

    calculateGravitationalForces(objects, objectApis) {
        if (!this.enabled || !objects || objects.length < 2) return {};
        const forces = {};
        const positions = {};
        const masses = {};

        objects.forEach(obj => {
            if (obj.mass > 0) {
                forces[obj.id] = [0, 0, 0];
                masses[obj.id] = obj.gravitationalMass || obj.mass;
                positions[obj.id] = this.currentPositions[obj.id] || obj.position || [0, 0, 0];
            }
        });

        const objectIds = Object.keys(positions);
        for (let i = 0; i < objectIds.length; i++) {
            for (let j = i + 1; j < objectIds.length; j++) {
                const id1 = objectIds[i], id2 = objectIds[j];
                const obj1 = objects.find(o => o.id === id1), obj2 = objects.find(o => o.id === id2);
                if (!obj1 || !obj2) continue;

                const pos1 = positions[id1], pos2 = positions[id2];
                const m1 = masses[id1], m2 = masses[id2];
                const dx = pos2[0] - pos1[0], dy = pos2[1] - pos1[1], dz = pos2[2] - pos1[2];
                const distSq = dx * dx + dy * dy + dz * dz + this.softening * this.softening;
                const dist = Math.sqrt(distSq);
                const effectiveDistSq = Math.max(distSq, this.minDistance * this.minDistance);
                const forceMag = (this.G * m1 * m2) / effectiveDistSq;

                if (dist > 0) {
                    const unitX = dx / dist, unitY = dy / dist, unitZ = dz / dist;
                    const fX = forceMag * unitX, fY = forceMag * unitY, fZ = forceMag * unitZ;
                    if (!obj1.isStatic && forces[id1]) {
                        forces[id1][0] += fX;
                        forces[id1][1] += fY;
                        forces[id1][2] += fZ;
                    }
                    if (!obj2.isStatic && forces[id2]) {
                        forces[id2][0] -= fX;
                        forces[id2][1] -= fY;
                        forces[id2][2] -= fZ;
                    }
                }
            }
        }
        return forces;
    }

    updatePosition(id, p) { this.currentPositions[id] = [...p]; }
    updateVelocity(id, v) { this.currentVelocities[id] = [...v]; }
}
