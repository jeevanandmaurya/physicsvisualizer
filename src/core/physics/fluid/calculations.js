// Fluid Dynamics Physics Calculations
// Implements buoyancy, viscous drag, pressure drag, and fluid dynamics

export class FluidPhysics {
    constructor(scene) {
        this.scene = scene;
        this.density = scene.fluid?.density || 1000; // kg/m³ (water = 1000)
        this.viscosity = scene.fluid?.viscosity || 0.001; // Pa·s (water = 0.001)
        this.surfaceLevel = scene.fluid?.surfaceLevel || 0; // World Y coordinate of fluid surface
        this.fluidHeight = scene.fluid?.fluidHeight || 10; // Total fluid depth
        this.dragCoefficient = scene.fluid?.dragCoefficient || 0.47; // Drag coefficient (~0.47 for spheres)
        this.enabled = scene.fluid?.enabled !== false;
        this.gravity = scene.gravity?.[1] || -9.81;

        // Cache for object states to track submersion
        this.objectStates = new Map();
    }

    // Calculate the submersion fraction of an object (0 = fully above water, 1 = fully submerged)
    calculateSubmersion(object, position) {
        const objY = position[1];
        const radius = object.radius || Math.max(...(object.dimensions || [1,1,1]).map(d => d/2));
        const objBottom = objY - radius;
        const objTop = objY + radius;

        const fluidBottom = this.surfaceLevel - this.fluidHeight;
        const fluidTop = this.surfaceLevel;

        // Object is completely above fluid
        if (objBottom >= fluidTop) return 0;

        // Object is completely below fluid
        if (objTop <= fluidBottom) return 1;

        // Object is partially submerged
        let submergedVolume = 0;

        if (objTop <= fluidTop && objBottom >= fluidBottom) {
            // Object center is below surface but bottom is above fluid bottom
            const submergedHeight = objTop - Math.max(objBottom, fluidBottom);
            submergedVolume = submergedHeight / (2 * radius);
        } else if (objBottom < fluidBottom && objTop > fluidBottom) {
            // Object spans the fluid bottom boundary
            const submergedHeight = Math.min(objTop, fluidTop) - fluidBottom;
            submergedVolume = submergedHeight / (2 * radius);
        }

        return Math.max(0, Math.min(1, submergedVolume));
    }

    // Calculate buoyancy force (upward force equal to weight of displaced fluid)
    calculateBuoyancyForce(object, submersion) {
        let volume;

        // Calculate object volume based on type
        switch (object.type) {
            case 'Sphere':
                const radius = object.radius || 0.5;
                volume = (4/3) * Math.PI * Math.pow(radius, 3);
                break;
            case 'Box':
                const dims = object.dimensions || [1, 1, 1];
                volume = dims[0] * dims[1] * dims[2];
                break;
            case 'Cylinder':
                const cylRadius = object.radius || 0.5;
                const height = object.height || 1;
                volume = Math.PI * cylRadius * cylRadius * height;
                break;
            case 'Cone':
                const coneRadius = object.radius || 0.5;
                const coneHeight = object.height || 1;
                volume = (1/3) * Math.PI * coneRadius * coneRadius * coneHeight;
                break;
            case 'Capsule':
                const capRadius = object.radius || 0.5;
                const capHeight = object.height || 1;
                const sphereVol = (4/3) * Math.PI * Math.pow(capRadius, 3);
                const cylinderVol = Math.PI * capRadius * capRadius * capHeight;
                volume = sphereVol + cylinderVol;
                break;
            default:
                volume = object.volume || 1; // fallback
        }

        // Buoyancy force = fluid density * gravity * displaced volume
        const buoyancyMagnitude = this.density * Math.abs(this.gravity) * volume * submersion;
        return [0, buoyancyMagnitude, 0];
    }

    // Calculate drag force (viscous + pressure drag)
    calculateDragForce(object, velocity, submersion) {
        if (submersion === 0) return [0, 0, 0];

        const speed = Math.sqrt(velocity[0]**2 + velocity[1]**2 + velocity[2]**2);
        if (speed === 0) return [0, 0, 0];

        // Cross-sectional area (approximation)
        let crossSectionArea;
        switch (object.type) {
            case 'Sphere':
                const radius = object.radius || 0.5;
                crossSectionArea = Math.PI * radius * radius;
                break;
            case 'Box':
                const dims = object.dimensions || [1, 1, 1];
                crossSectionArea = dims[0] * dims[2]; // Frontal area
                break;
            case 'Cylinder':
            case 'Cone':
            case 'Capsule':
                const cylRadius = object.radius || 0.5;
                crossSectionArea = Math.PI * cylRadius * cylRadius;
                break;
            default:
                crossSectionArea = Math.PI * 0.25; // fallback
        }

        // Drag force magnitude = 0.5 * dragCoeff * density * speed² * area
        const dragMagnitude = 0.5 * this.dragCoefficient * this.density * speed * speed * crossSectionArea * submersion;

        // Drag force opposes velocity direction
        const dragForce = [
            -dragMagnitude * velocity[0] / speed,
            -dragMagnitude * velocity[1] / speed,
            -dragMagnitude * velocity[2] / speed
        ];

        return dragForce;
    }

    // Calculate fluid forces for all objects
    calculateFluidForces(objects, objectStates) {
        if (!this.enabled || !objects) return {};

        const forces = {};

        objects.forEach(obj => {
            if (!obj.id || obj.isStatic) return;

            // Get current position and velocity from physics engine
            const currentState = objectStates[obj.id];
            if (!currentState) return;

            const position = currentState.position || obj.position || [0, 0, 0];
            const velocity = currentState.velocity || obj.velocity || [0, 0, 0];

            // Calculate submersion
            const submersion = this.calculateSubmersion(obj, position);

            // Initialize force
            forces[obj.id] = [0, 0, 0];

            if (submersion > 0) {
                // Add buoyancy force
                const buoyancyForce = this.calculateBuoyancyForce(obj, submersion);
                forces[obj.id][0] += buoyancyForce[0];
                forces[obj.id][1] += buoyancyForce[1];
                forces[obj.id][2] += buoyancyForce[2];

                // Add drag force
                const dragForce = this.calculateDragForce(obj, velocity, submersion);
                forces[obj.id][0] += dragForce[0];
                forces[obj.id][1] += dragForce[1];
                forces[obj.id][2] += dragForce[2];
            }

            // Store state for next frame
            this.objectStates.set(obj.id, {
                position: [...position],
                velocity: [...velocity],
                submersion: submersion,
                lastUpdate: Date.now()
            });
        });

        return forces;
    }

    // Update fluid surface (could be modified by wave simulation)
    updateFluidSurface(deltaTime) {
        // Basic implementation - fluid surface stays constant
        // Could be extended for wave dynamics, ripple effects, etc.
        return this.surfaceLevel;
    }

    // Reset object states (called when scene resets)
    reset() {
        this.objectStates.clear();
    }
}
