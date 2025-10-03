// Electrostatic Physics Calculations
// Placeholder for electric field and charge calculations

export class ElectrostaticPhysics {
    constructor(scene) {
        this.scene = scene;
        this.k = 8.99e9; // Coulomb's constant
        this.enabled = scene.electrostatic?.enabled !== false;
    }

    calculateElectrostaticForces(objects, objectApis) {
        if (!this.enabled || !objects || objects.length < 2) return {};

        const forces = {};
        const positions = {};
        const charges = {};

        // Extract charged objects
        objects.forEach(obj => {
            if (obj.charge !== undefined && obj.charge !== 0 && objectApis[obj.id]) {
                forces[obj.id] = [0, 0, 0];
                charges[obj.id] = obj.charge;
                positions[obj.id] = obj.position || [0, 0, 0];
            }
        });

        const chargedIds = Object.keys(charges);
        if (chargedIds.length < 2) return {};

        // Calculate electrostatic forces between all charged pairs
        for (let i = 0; i < chargedIds.length; i++) {
            for (let j = i + 1; j < chargedIds.length; j++) {
                const id1 = chargedIds[i], id2 = chargedIds[j];
                const q1 = charges[id1], q2 = charges[id2];
                const pos1 = positions[id1], pos2 = positions[id2];

                const dx = pos2[0] - pos1[0];
                const dy = pos2[1] - pos1[1];
                const dz = pos2[2] - pos1[2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance > 0) {
                    const forceMagnitude = (this.k * Math.abs(q1 * q2)) / (distance * distance);
                    const forceDirection = q1 * q2 > 0 ? -1 : 1; // Like charges repel, opposite attract

                    const fx = forceDirection * forceMagnitude * (dx / distance);
                    const fy = forceDirection * forceMagnitude * (dy / distance);
                    const fz = forceDirection * forceMagnitude * (dz / distance);

                    // Apply equal and opposite forces
                    if (forces[id1]) {
                        forces[id1][0] += fx;
                        forces[id1][1] += fy;
                        forces[id1][2] += fz;
                    }
                    if (forces[id2]) {
                        forces[id2][0] -= fx;
                        forces[id2][1] -= fy;
                        forces[id2][2] -= fz;
                    }
                }
            }
        }

        return forces;
    }
}
