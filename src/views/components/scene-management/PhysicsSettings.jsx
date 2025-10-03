import React, { useState, useEffect } from 'react';
import { configManager } from '../../../core/ConfigManager';
import './PhysicsSettings.css';

const PhysicsSettings = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState(configManager.config);

    useEffect(() => {
        if (isOpen) {
            setConfig(configManager.config);
        }
    }, [isOpen]);

    const updateConfig = (path, value) => {
        configManager.set(path, value);
        setConfig({ ...configManager.config });
    };

    const resetToDefaults = () => {
        configManager.reset();
        setConfig({ ...configManager.config });
    };

    const exportConfig = () => {
        const configString = configManager.export();
        const blob = new Blob([configString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'physics-visualizer-config.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importConfig = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const success = configManager.import(e.target.result);
                if (success) {
                    setConfig({ ...configManager.config });
                    alert('Configuration imported successfully!');
                } else {
                    alert('Failed to import configuration. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="physics-settings-overlay">
            <div className="physics-settings-modal">
                <div className="settings-header">
                    <h2>Physics Engine Settings</h2>
                    <button onClick={onClose} className="close-button">×</button>
                </div>

                <div className="settings-content">
                    {/* Physics Settings */}
                    <div className="settings-section">
                        <h3>Physics Engine</h3>

                        <div className="setting-group">
                            <label>Timestep: {config.physics.timestep.toFixed(4)}s</label>
                            <input
                                type="range"
                                min="0.008"
                                max="0.02"
                                step="0.001"
                                value={config.physics.timestep}
                                onChange={(e) => updateConfig('physics.timestep', parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Gravity X: {config.physics.gravity[0]}</label>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="0.1"
                                value={config.physics.gravity[0]}
                                onChange={(e) => {
                                    const newGravity = [...config.physics.gravity];
                                    newGravity[0] = parseFloat(e.target.value);
                                    updateConfig('physics.gravity', newGravity);
                                }}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Gravity Y: {config.physics.gravity[1]}</label>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="0.1"
                                value={config.physics.gravity[1]}
                                onChange={(e) => {
                                    const newGravity = [...config.physics.gravity];
                                    newGravity[1] = parseFloat(e.target.value);
                                    updateConfig('physics.gravity', newGravity);
                                }}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Gravity Z: {config.physics.gravity[2]}</label>
                            <input
                                type="range"
                                min="-20"
                                max="20"
                                step="0.1"
                                value={config.physics.gravity[2]}
                                onChange={(e) => {
                                    const newGravity = [...config.physics.gravity];
                                    newGravity[2] = parseFloat(e.target.value);
                                    updateConfig('physics.gravity', newGravity);
                                }}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Broadphase Algorithm:</label>
                            <select
                                value={config.physics.broadphase}
                                onChange={(e) => updateConfig('physics.broadphase', e.target.value)}
                            >
                                <option value="Naive">Naive</option>
                                <option value="SAP">SAP</option>
                                <option value="Grid">Grid</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <label>Solver Iterations: {config.physics.solver.iterations}</label>
                            <input
                                type="range"
                                min="1"
                                max="50"
                                step="1"
                                value={config.physics.solver.iterations}
                                onChange={(e) => updateConfig('physics.solver.iterations', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Contact Material Settings */}
                    <div className="settings-section">
                        <h3>Contact Material</h3>

                        <div className="setting-group">
                            <label>Friction: {config.physics.contactMaterial.friction.toFixed(2)}</label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.01"
                                value={config.physics.contactMaterial.friction}
                                onChange={(e) => updateConfig('physics.contactMaterial.friction', parseFloat(e.target.value))}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Restitution: {config.physics.contactMaterial.restitution.toFixed(2)}</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={config.physics.contactMaterial.restitution}
                                onChange={(e) => updateConfig('physics.contactMaterial.restitution', parseFloat(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Physics Modules */}
                    <div className="settings-section">
                        <h3>Physics Modules</h3>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.modules.gravitation.enabled}
                                    onChange={(e) => updateConfig('modules.gravitation.enabled', e.target.checked)}
                                />
                                Gravitational Physics
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.modules.electrostatic.enabled}
                                    onChange={(e) => updateConfig('modules.electrostatic.enabled', e.target.checked)}
                                />
                                Electrostatic Physics
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.modules.fluid.enabled}
                                    onChange={(e) => updateConfig('modules.fluid.enabled', e.target.checked)}
                                />
                                Fluid Physics
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.modules.connections.enabled}
                                    onChange={(e) => updateConfig('modules.connections.enabled', e.target.checked)}
                                />
                                Connection Physics
                            </label>
                        </div>
                    </div>

                    {/* Particle Settings */}
                    <div className="settings-section">
                        <h3>Particle System</h3>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config?.particles?.enabled || false}
                                    onChange={(e) => updateConfig('particles.enabled', e.target.checked)}
                                />
                                Enable Particle System
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>Default Particle Radius: {(config?.particles?.radius || 0.1).toFixed(2)}m</label>
                            <input
                                type="range"
                                min="0.01"
                                max="0.5"
                                step="0.01"
                                value={config?.particles?.radius || 0.1}
                                onChange={(e) => {
                                    const newRadius = parseFloat(e.target.value);
                                    updateConfig('particles.radius', newRadius);
                                }}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Default Temperature: {config?.particles?.temperature || 1}</label>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="0.5"
                                value={config?.particles?.temperature || 1}
                                onChange={(e) => {
                                    const newTemp = parseFloat(e.target.value);
                                    updateConfig('particles.temperature', newTemp);
                                }}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Particle Count: {config?.particles?.count || 100}</label>
                            <input
                                type="range"
                                min="10"
                                max="1000"
                                step="10"
                                value={config?.particles?.count || 100}
                                onChange={(e) => {
                                    const newCount = parseInt(e.target.value);
                                    updateConfig('particles.count', newCount);
                                }}
                            />
                        </div>

                        <div className="setting-group">
                            <label>Particle Mass: {(config?.particles?.mass || 0.001).toFixed(4)}kg</label>
                            <input
                                type="range"
                                min="0.0001"
                                max="0.1"
                                step="0.0001"
                                value={config?.particles?.mass || 0.001}
                                onChange={(e) => {
                                    const newMass = parseFloat(e.target.value);
                                    updateConfig('particles.mass', newMass);
                                }}
                            />
                        </div>
                    </div>

                    {/* Performance Settings */}
                    <div className="settings-section">
                        <h3>Performance</h3>

                        <div className="setting-group">
                            <label>Target FPS: {config.performance.targetFps}</label>
                            <input
                                type="range"
                                min="30"
                                max="120"
                                step="5"
                                value={config.performance.targetFps}
                                onChange={(e) => updateConfig('performance.targetFps', parseInt(e.target.value))}
                            />
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.performance.adaptiveQuality}
                                    onChange={(e) => updateConfig('performance.adaptiveQuality', e.target.checked)}
                                />
                                Adaptive Quality
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>Max Objects: {config.performance.maxObjects}</label>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={config.performance.maxObjects}
                                onChange={(e) => updateConfig('performance.maxObjects', parseInt(e.target.value))}
                            />
                        </div>
                    </div>

                    {/* Visualization Settings */}
                    <div className="settings-section">
                        <h3>Visualization</h3>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.visualization.showVelocityVectors}
                                    onChange={(e) => updateConfig('visualization.showVelocityVectors', e.target.checked)}
                                />
                                Show Velocity Vectors
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.visualization.showForceVectors}
                                    onChange={(e) => updateConfig('visualization.showForceVectors', e.target.checked)}
                                />
                                Show Force Vectors
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.visualization.showGrid}
                                    onChange={(e) => updateConfig('visualization.showGrid', e.target.checked)}
                                />
                                Show Grid
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.visualization.showAxes}
                                    onChange={(e) => updateConfig('visualization.showAxes', e.target.checked)}
                                />
                                Show Axes
                            </label>
                        </div>

                        <div className="setting-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.visualization.shadows}
                                    onChange={(e) => updateConfig('visualization.shadows', e.target.checked)}
                                />
                                Enable Shadows
                            </label>
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button onClick={resetToDefaults} className="reset-button">
                        Reset to Defaults
                    </button>
                    <button onClick={exportConfig} className="export-button">
                        Export Config
                    </button>
                    <label className="import-button">
                        Import Config
                        <input
                            type="file"
                            accept=".json"
                            onChange={importConfig}
                            style={{ display: 'none' }}
                        />
                    </label>
                    <button onClick={onClose} className="close-button">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PhysicsSettings;
