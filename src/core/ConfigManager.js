// ConfigManager - Centralized configuration management system
// Handles physics engine settings, performance options, and system configuration

export class ConfigManager {
    constructor() {
        this.config = this.getDefaultConfig();
        this.listeners = new Map();
        this.loadConfig();
    }

    getDefaultConfig() {
        return {
            // Physics Engine Settings
            physics: {
                timestep: 1/60, // Fixed timestep for physics simulation
                maxSubSteps: 10, // Maximum substeps per frame
                gravity: [0, -9.81, 0], // Default gravity vector
                broadphase: 'SAP', // Broadphase algorithm: 'Naive', 'SAP', 'Grid'
                solver: {
                    iterations: 10, // Constraint solver iterations
                    tolerance: 1e-7, // Solver tolerance
                    stiffness: 1e6, // Default stiffness for constraints
                    relaxation: 3, // Relaxation parameter
                },
                contactMaterial: {
                    friction: 0.5,
                    restitution: 0.7,
                    contactEquationStiffness: 1e8,
                    contactEquationRelaxation: 3,
                    frictionEquationStiffness: 1e8,
                    frictionEquationRelaxation: 3,
                },
                sleep: {
                    enabled: true,
                    speedLimit: 0.1,
                    timeLimit: 1,
                },
            },

            // Performance Settings
            performance: {
                targetFps: 60,
                adaptiveQuality: true,
                maxObjects: 100,
                physicsWorker: false, // Enable Web Worker for physics
                renderWorker: false, // Enable Web Worker for rendering
                memoryPoolSize: 1000, // Object pool size
                lodLevels: 3, // Level of detail levels
                cullingDistance: 1000, // Frustum culling distance
            },

            // Accuracy Settings
            accuracy: {
                continuousCollisionDetection: false,
                ccdSpeedThreshold: 1.0,
                ccdThickness: 0.01,
                positionIterations: 3,
                velocityIterations: 2,
                warmStarting: true,
                baumgarte: 0.1,
            },

            // Physics Modules
            modules: {
                gravitation: {
                    enabled: false,
                    gravitationalConstant: 6.67430e-11,
                    minDistance: 1e-6,
                    softening: 0,
                    simulationScale: 'terrestrial', // 'terrestrial', 'astronomical', 'subatomic'
                },
                electrostatic: {
                    enabled: false,
                    coulombConstant: 8.99e9,
                    minDistance: 1e-6,
                },
                fluid: {
                    enabled: false,
                    density: 1000, // kg/m³
                    viscosity: 0.001, // Pa·s
                    surfaceTension: 0.072, // N/m
                },
                constraints: {
                    enabled: true,
                    maxForce: 1e6,
                    stabilization: true,
                },
                connections: {
                    enabled: false,
                    chainStiffness: 1000,
                    ropeSegments: 10,
                },
            },

            // Visualization Settings
            visualization: {
                showVelocityVectors: false,
                velocityScale: 1.0,
                showForceVectors: false,
                forceScale: 1.0,
                showTrails: false,
                trailLength: 100,
                showGrid: true,
                gridSize: 100,
                showAxes: true,
                axesSize: 5,
                shadows: true,
                lighting: {
                    ambientIntensity: 0.6,
                    directionalIntensity: 1.0,
                    shadowMapSize: 1024,
                },
            },

            // Educational Features
            education: {
                enabled: true,
                showMeasurements: true,
                showFormulas: false,
                adaptiveHints: true,
                learningAnalytics: false,
                conceptDetection: true,
            },

            // System Settings
            system: {
                debug: false,
                logging: {
                    physics: false,
                    performance: false,
                    errors: true,
                },
                saveInterval: 30000, // Auto-save interval in ms
                maxHistorySize: 1000, // Maximum undo/redo history
            },
        };
    }

    // Load configuration from localStorage
    loadConfig() {
        try {
            const saved = localStorage.getItem('physicsVisualizerConfig');
            if (saved) {
                const parsedConfig = JSON.parse(saved);
                this.config = this.deepMerge(this.config, parsedConfig);
            }
        } catch (error) {
            console.warn('Failed to load config from localStorage:', error);
        }
    }

    // Save configuration to localStorage
    saveConfig() {
        try {
            localStorage.setItem('physicsVisualizerConfig', JSON.stringify(this.config));
        } catch (error) {
            console.warn('Failed to save config to localStorage:', error);
        }
    }

    // Get configuration value by path
    get(path, defaultValue = null) {
        const keys = path.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    // Set configuration value by path
    set(path, value) {
        const keys = path.split('.');
        let obj = this.config;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in obj) || typeof obj[key] !== 'object') {
                obj[key] = {};
            }
            obj = obj[key];
        }

        const lastKey = keys[keys.length - 1];
        obj[lastKey] = value;

        this.saveConfig();
        this.notifyListeners(path, value);
    }

    // Update multiple configuration values
    update(updates) {
        const flattenUpdates = (obj, prefix = '') => {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    Object.assign(result, flattenUpdates(value, newKey));
                } else {
                    result[newKey] = value;
                }
            }
            return result;
        };

        const flatUpdates = flattenUpdates(updates);
        for (const [path, value] of Object.entries(flatUpdates)) {
            this.set(path, value);
        }
    }

    // Subscribe to configuration changes
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);

        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(path);
            if (listeners) {
                listeners.delete(callback);
                if (listeners.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    // Notify listeners of configuration changes
    notifyListeners(path, value) {
        const listeners = this.listeners.get(path);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(value, path);
                } catch (error) {
                    console.error('Error in config listener:', error);
                }
            });
        }
    }

    // Reset configuration to defaults
    reset() {
        this.config = this.getDefaultConfig();
        this.saveConfig();
        // Notify all listeners
        for (const path of this.listeners.keys()) {
            const value = this.get(path);
            this.notifyListeners(path, value);
        }
    }

    // Export configuration
    export() {
        return JSON.stringify(this.config, null, 2);
    }

    // Import configuration
    import(configString) {
        try {
            const importedConfig = JSON.parse(configString);
            this.config = this.deepMerge(this.config, importedConfig);
            this.saveConfig();
            // Notify all listeners
            for (const path of this.listeners.keys()) {
                const value = this.get(path);
                this.notifyListeners(path, value);
            }
            return true;
        } catch (error) {
            console.error('Failed to import config:', error);
            return false;
        }
    }

    // Deep merge utility
    deepMerge(target, source) {
        const result = { ...target };

        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }

        return result;
    }

    // Get physics configuration for engine initialization
    getPhysicsConfig() {
        return {
            gravity: this.config.physics.gravity,
            timestep: this.config.physics.timestep,
            maxSubSteps: this.config.physics.maxSubSteps,
            broadphase: this.config.physics.broadphase,
            solver: this.config.physics.solver,
            contactMaterial: this.config.physics.contactMaterial,
            sleep: this.config.physics.sleep,
            accuracy: this.config.accuracy,
            modules: this.config.modules,
        };
    }

    // Get performance configuration
    getPerformanceConfig() {
        return {
            targetFps: this.config.performance.targetFps,
            adaptiveQuality: this.config.performance.adaptiveQuality,
            maxObjects: this.config.performance.maxObjects,
            physicsWorker: this.config.performance.physicsWorker,
            renderWorker: this.config.performance.renderWorker,
            memoryPoolSize: this.config.performance.memoryPoolSize,
            lodLevels: this.config.performance.lodLevels,
            cullingDistance: this.config.performance.cullingDistance,
        };
    }

    // Get visualization configuration
    getVisualizationConfig() {
        return {
            showVelocityVectors: this.config.visualization.showVelocityVectors,
            velocityScale: this.config.visualization.velocityScale,
            showForceVectors: this.config.visualization.showForceVectors,
            forceScale: this.config.visualization.forceScale,
            showTrails: this.config.visualization.showTrails,
            trailLength: this.config.visualization.trailLength,
            showGrid: this.config.visualization.showGrid,
            gridSize: this.config.visualization.gridSize,
            showAxes: this.config.visualization.showAxes,
            axesSize: this.config.visualization.axesSize,
            shadows: this.config.visualization.shadows,
            lighting: this.config.visualization.lighting,
        };
    }
}

// Singleton instance
export const configManager = new ConfigManager();