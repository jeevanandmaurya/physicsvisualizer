// NonPhysicsEngine - Manages visual-only objects without physics simulation
export class NonPhysicsEngine {
    objects: Map<string, any>;
    meshRefs: Map<string, any>;

    constructor() {
        this.objects = new Map(); // id -> object data
        this.meshRefs = new Map(); // id -> Three.js mesh ref
    }

    // Add a non-physics object
    addObject(config: any) {
        const existing = this.objects.get(config.id);
        
        // If object already exists (e.g., animation was set first), merge with existing
        if (existing) {
            console.log(`🔄 Merging config for existing object "${config.id}"`);
            this.objects.set(config.id, { ...existing, ...config });
        } else {
            this.objects.set(config.id, { ...config });
        }
        return config.id;
    }

    // Update object transform
    updateTransform(objectId: string, updates: any) {
        const obj = this.objects.get(objectId);
        if (!obj) return false;

        // Update internal state
        if (updates.position) obj.position = updates.position;
        if (updates.rotation) obj.rotation = updates.rotation;
        if (updates.scale) obj.scale = updates.scale;

        // Update Three.js mesh if available
        const meshRef = this.meshRefs.get(objectId);
        if (meshRef?.current) {
            if (updates.position) {
                meshRef.current.position.set(...updates.position);
            }
            if (updates.rotation) {
                meshRef.current.rotation.set(...updates.rotation);
            }
            if (updates.scale) {
                const scale = Array.isArray(updates.scale) ? updates.scale : [updates.scale, updates.scale, updates.scale];
                meshRef.current.scale.set(...scale);
            }
        }

        return true;
    }

    // Update object material properties
    updateMaterial(objectId: string, updates: any) {
        const obj = this.objects.get(objectId);
        if (!obj) return false;

        if (updates.color) obj.color = updates.color;
        if (updates.opacity !== undefined) obj.opacity = updates.opacity;
        if (updates.metalness !== undefined) obj.metalness = updates.metalness;
        if (updates.roughness !== undefined) obj.roughness = updates.roughness;

        const meshRef = this.meshRefs.get(objectId);
        if (meshRef?.current?.material) {
            const mat = meshRef.current.material;
            if (updates.color) mat.color.set(updates.color);
            if (updates.opacity !== undefined) {
                mat.opacity = updates.opacity;
                mat.transparent = updates.opacity < 1.0;
            }
            if (updates.metalness !== undefined) mat.metalness = updates.metalness;
            if (updates.roughness !== undefined) mat.roughness = updates.roughness;
        }

        return true;
    }

    // Animate object (continuous movement)
    animateObject(objectId: string, animationConfig: any) {
        let obj = this.objects.get(objectId);
        
        // If object doesn't exist yet, create a placeholder
        if (!obj) {
            console.log(`⏳ Animation set for "${objectId}" before object exists, creating placeholder`);
            obj = { id: objectId, position: [0, 0, 0] };
            this.objects.set(objectId, obj);
        }

        obj.animation = animationConfig;
        console.log(`✨ Animation set for "${objectId}":`, animationConfig.type || 'custom code');
        return true;
    }

    // Register mesh ref for direct manipulation
    registerMesh(objectId: string, meshRef: any) {
        this.meshRefs.set(objectId, meshRef);
    }

    // Get object state
    getObject(objectId: string) {
        return this.objects.get(objectId);
    }

    // Remove object
    removeObject(objectId: string) {
        this.objects.delete(objectId);
        this.meshRefs.delete(objectId);
    }

    // Update animations (call from useFrame)
    updateAnimations(deltaTime: number) {
        for (const [id, obj] of this.objects.entries()) {
            if (!obj.animation) continue;

            const anim = obj.animation;
            const meshRef = this.meshRefs.get(id);
            if (!meshRef?.current) continue;

            const mesh = meshRef.current;
            const time = Date.now() * 0.001; // Current time in seconds
            const t = (time * (anim.speed || 1)) % (2 * Math.PI);

            // If animation has custom JavaScript code, execute it
            if (anim.code) {
                try {
                    // Create function with access to: mesh, obj, time, t, Math, deltaTime
                    const animFunc = new Function(
                        'mesh', 'obj', 'time', 't', 'Math', 'deltaTime',
                        anim.code
                    );
                    animFunc(mesh, obj, time, t, Math, deltaTime);
                    
                    // Log once to confirm execution
                    if (!obj._animLoggedOnce) {
                        console.log(`🎭 Executing custom animation for "${id}"`, {
                            time: time.toFixed(2),
                            meshPos: [mesh.position.x.toFixed(2), mesh.position.y.toFixed(2), mesh.position.z.toFixed(2)]
                        });
                        obj._animLoggedOnce = true;
                    }
                } catch (error) {
                    console.error(`❌ Animation error for ${id}:`, error);
                    // Remove broken animation
                    delete obj.animation;
                }
                continue;
            }

            // Fallback to built-in animation types (for backward compatibility)
            switch (anim.type) {
                case 'rotate':
                    if (anim.axis === 'x') mesh.rotation.x = t;
                    else if (anim.axis === 'y') mesh.rotation.y = t;
                    else if (anim.axis === 'z') mesh.rotation.z = t;
                    break;

                case 'oscillate':
                    const amp = anim.amplitude || 1;
                    if (anim.axis === 'x') mesh.position.x = obj.position[0] + Math.sin(t) * amp;
                    else if (anim.axis === 'y') mesh.position.y = obj.position[1] + Math.sin(t) * amp;
                    else if (anim.axis === 'z') mesh.position.z = obj.position[2] + Math.sin(t) * amp;
                    break;

                case 'orbit':
                    const radius = anim.radius || 5;
                    mesh.position.x = obj.position[0] + Math.cos(t) * radius;
                    mesh.position.z = obj.position[2] + Math.sin(t) * radius;
                    break;
            }
        }
    }

    clear() {
        this.objects.clear();
        this.meshRefs.clear();
    }
}
