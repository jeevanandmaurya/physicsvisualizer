export class ConstraintPhysics {
    constructor(scene, objectApis) {
        this.scene = scene;
        this.objectApis = objectApis;
        this.enabled = scene.constraints?.enabled !== false;
        this.world = null;
        this.rapier = null;
        this.initialized = false;
        this.sceneKey = null;
        this._createdJoints = [];
        this._jointMap = new Map();
    }

    setWorld(world, rapier) {
        // Invalidate constraints if the scene's objects or joints have changed
        const newSceneKey = [
            JSON.stringify(this.scene.objects), 
            JSON.stringify(this.scene.joints)
        ].join('|');
        
        if (this.sceneKey !== newSceneKey) {
            // Clean up existing joints before reinitializing
            this.destroy();
            this.sceneKey = newSceneKey;
        }

        this.world = world;
        this.rapier = rapier;

        if ((this.enabled || this.scene.joints) && !this.initialized) {
            // Defer initialization to ensure all rigid bodies are created
            setTimeout(() => this.initializeConstraints(), 50);
        }
    }

    initializeConstraints() {
        if (!this.enabled || !this.world || !this.rapier || this.initialized) return;

        console.log('ConstraintPhysics: Initializing Rapier constraints');
        this.initialized = true;

        // Create a map of scene object IDs to their corresponding Rapier rigid bodies
        const bodyMap = new Map();
        this.world.forEachRigidBody((body) => {
            if (body.userData && this.scene.objects.find(obj => obj.id === body.userData)) {
                bodyMap.set(body.userData, body);
            }
        });

        console.log(`ConstraintPhysics: Found ${bodyMap.size} rigid bodies with user data.`);

        let jointCount = 0;
        if (this.scene.joints && Array.isArray(this.scene.joints)) {
            this.scene.joints.forEach(jointConfig => {
                if (this.createJointFromSceneConfig(jointConfig, bodyMap)) {
                    jointCount++;
                }
            });
        }

        console.log(`ConstraintPhysics: Successfully created ${jointCount} constraints.`);
    }

    _pairKey(idA, idB) {
        // Create a consistent key for a pair of body IDs, regardless of order
        const [a, b] = [String(idA ?? 'world'), String(idB ?? 'world')].sort();
        return `${a}|${b}`;
    }

    _registerJoint(bodyAId, bodyBId, joint, type) {
        const key = this._pairKey(bodyAId, bodyBId);
        if (this._jointMap.has(key)) {
            console.warn(`ConstraintPhysics: Joint already exists for ${key}`);
            return false;
        }

        const meta = { key, joint, bodyAId, bodyBId, type };
        this._createdJoints.push(meta);
        this._jointMap.set(key, meta);
        return true;
    }

    removeJoint(bodyAId, bodyBId) {
        const key = this._pairKey(bodyAId, bodyBId);
        const meta = this._jointMap.get(key);
        if (!meta) return false;

        try {
            // Use the joint's own reference to remove it from the world
            if (this.world && this.world.removeImpulseJoint) {
                this.world.removeImpulseJoint(meta.joint, true);
            }
        } catch (e) {
            console.error(`ConstraintPhysics: Error removing joint ${key}`, e);
        }

        this._jointMap.delete(key);
        this._createdJoints = this._createdJoints.filter(m => m.key !== key);
        return true;
    }

    createJointFromSceneConfig(jointConfig, bodyMap) {
        if (!jointConfig?.type || !jointConfig.bodyA || !jointConfig.bodyB) {
            console.warn('ConstraintPhysics: Invalid joint config - missing type or body references');
            return false;
        }

        const bodyA = bodyMap.get(jointConfig.bodyA);
        const bodyB = bodyMap.get(jointConfig.bodyB);

        if (!bodyA || !bodyB) {
            console.warn(`ConstraintPhysics: Bodies for joint not found: ${jointConfig.bodyA} or ${jointConfig.bodyB}`);
            return false;
        }
        
        // Check for duplicate BEFORE attempting creation
        const key = this._pairKey(jointConfig.bodyA, jointConfig.bodyB);
        if (this._jointMap.has(key)) {
            console.warn(`ConstraintPhysics: Joint already exists for ${key}`);
            return false;
        }

        const config = this._normalizeConstraintConfig(jointConfig);

        try {
            let joint;
            switch (config.type) {
                case 'rope':
                case 'distance':
                    joint = this.createDistanceConstraint(bodyA, bodyB, config);
                    break;
                case 'revolute':
                case 'hinge':
                    joint = this.createHingeConstraint(bodyA, bodyB, config);
                    break;
                case 'spherical':
                case 'pointToPoint':
                    joint = this.createSphericalConstraint(bodyA, bodyB, config);
                    break;
                case 'prismatic':
                    joint = this.createPrismaticConstraint(bodyA, bodyB, config);
                    break;
                default:
                    console.warn(`ConstraintPhysics: Unknown joint type: ${config.type}`);
                    return false;
            }

            if (joint) {
                return this._registerJoint(jointConfig.bodyA, jointConfig.bodyB, joint, config.type);
            }
        } catch (e) {
            console.error(`ConstraintPhysics: Error creating joint of type ${config.type}`, e);
        }
        return false;
    }

    _normalizeConstraintConfig(config) {
        const normalized = { ...config };

        // Standardize anchor points from various possible property names
        const getAnchor = (p, defaultVal = [0, 0, 0]) => {
            if (!p) return defaultVal;
            if (Array.isArray(p)) return p;
            if (typeof p === 'object' && 'x' in p) return [p.x, p.y || 0, p.z || 0];
            return defaultVal;
        };

        normalized.anchorA = getAnchor(config.pivotA || config.anchorA);
        normalized.anchorB = getAnchor(config.pivotB || config.anchorB);

        // Standardize axes
        const getAxis = (axis, defaultVal = [0, 1, 0]) => {
            if (!axis) return defaultVal;
            if (Array.isArray(axis)) return axis;
            if (typeof axis === 'object' && 'x' in axis) return [axis.x, axis.y || 0, axis.z || 0];
            return defaultVal;
        };

        normalized.axisA = getAxis(config.axisA || config.axis);
        normalized.axisB = getAxis(config.axisB || config.axisA || config.axis);

        return normalized;
    }
    
    // --- Constraint Creation Methods ---

    createDistanceConstraint(bodyA, bodyB, config) {
        const anchorA = { x: config.anchorA[0], y: config.anchorA[1], z: config.anchorA[2] };
        const anchorB = { x: config.anchorB[0], y: config.anchorB[1], z: config.anchorB[2] };
        
        // Calculate distance if not provided
        let distance = config.distance;
        if (distance === undefined || distance === null) {
            const posA = bodyA.translation();
            const posB = bodyB.translation();
            const worldAnchorA = {
                x: posA.x + anchorA.x,
                y: posA.y + anchorA.y,
                z: posA.z + anchorA.z
            };
            const worldAnchorB = {
                x: posB.x + anchorB.x,
                y: posB.y + anchorB.y,
                z: posB.z + anchorB.z
            };
            distance = Math.sqrt(
                Math.pow(worldAnchorB.x - worldAnchorA.x, 2) +
                Math.pow(worldAnchorB.y - worldAnchorA.y, 2) +
                Math.pow(worldAnchorB.z - worldAnchorA.z, 2)
            );
        }
        
        // For fixed distance, use a fixed joint with distance limits
        // Rope joint only constrains maximum distance
        if (config.type === 'rope') {
            const params = this.rapier.JointData.rope(distance, anchorA, anchorB);
            return this.world.createImpulseJoint(params, bodyA, bodyB, true);
        } else {
            // Use spherical joint with distance constraint for true fixed-distance behavior
            const params = this.rapier.JointData.spherical(anchorA, anchorB);
            const joint = this.world.createImpulseJoint(params, bodyA, bodyB, true);
            
            // Note: For true distance constraint, you may need to use a different approach
            // as Rapier doesn't have a built-in fixed-distance joint
            // This implementation provides ball-and-socket behavior
            return joint;
        }
    }
    
    createHingeConstraint(bodyA, bodyB, config) {
        const anchorA = { x: config.anchorA[0], y: config.anchorA[1], z: config.anchorA[2] };
        const anchorB = { x: config.anchorB[0], y: config.anchorB[1], z: config.anchorB[2] };
        const axis = { x: config.axisA[0], y: config.axisA[1], z: config.axisA[2] };

        const params = this.rapier.JointData.revolute(anchorA, anchorB, axis);
        const joint = this.world.createImpulseJoint(params, bodyA, bodyB, true);
        
        // Apply limits if specified
        if (config.limits && Array.isArray(config.limits) && config.limits.length === 2) {
            joint.setLimits(config.limits[0], config.limits[1]);
        }
        
        // Apply motor settings if specified
        if (config.motorEnabled) {
            const targetVel = config.motorTargetVelocity ?? 0;
            const maxForce = config.motorMaxForce ?? 0;
            joint.configureMotorVelocity(targetVel, maxForce);
        }
        
        return joint;
    }

    createSphericalConstraint(bodyA, bodyB, config) {
        // A spherical joint connects two points in the local-space of each body.
        const anchorA = { x: config.anchorA[0], y: config.anchorA[1], z: config.anchorA[2] };
        const anchorB = { x: config.anchorB[0], y: config.anchorB[1], z: config.anchorB[2] };

        const params = this.rapier.JointData.spherical(anchorA, anchorB);
        return this.world.createImpulseJoint(params, bodyA, bodyB, true);
    }

    createPrismaticConstraint(bodyA, bodyB, config) {
        const anchorA = { x: config.anchorA[0], y: config.anchorA[1], z: config.anchorA[2] };
        const anchorB = { x: config.anchorB[0], y: config.anchorB[1], z: config.anchorB[2] };
        const axis = { x: config.axisA[0], y: config.axisA[1], z: config.axisA[2] };

        const params = this.rapier.JointData.prismatic(anchorA, anchorB, axis);
        const joint = this.world.createImpulseJoint(params, bodyA, bodyB, true);
        
        // Apply limits if specified
        if (config.limits && Array.isArray(config.limits) && config.limits.length === 2) {
            joint.setLimits(config.limits[0], config.limits[1]);
        }
        
        return joint;
    }

    destroy() {
        // Create a copy of the array to avoid modification during iteration
        const jointsToRemove = [...this._createdJoints];
        jointsToRemove.forEach(meta => {
            this.removeJoint(meta.bodyAId, meta.bodyBId);
        });
        this._createdJoints = [];
        this._jointMap.clear();
        this.initialized = false;
        this.sceneKey = null;
    }
}