import React from 'react';
import './TimestepGuide.css';

/**
 * TimestepGuide - Help component explaining timestep selection for stable simulations
 * Shows recommendations based on simulation type
 */
const TimestepGuide = ({ onClose }) => {
    return (
        <div className="timestep-guide-overlay">
            <div className="timestep-guide-modal">
                <div className="guide-header">
                    <h3>⚙️ Timestep Selection Guide</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                
                <div className="guide-content">
                    <div className="guide-section">
                        <h4>What is Timestep?</h4>
                        <p>
                            The <strong>timestep</strong> (dt) is how frequently the physics engine calculates forces and updates positions.
                            Smaller timesteps = more accurate but slower simulation.
                        </p>
                    </div>

                    <div className="guide-section">
                        <h4>📊 Recommended Timesteps</h4>
                        <table className="timestep-table">
                            <thead>
                                <tr>
                                    <th>Simulation Type</th>
                                    <th>Recommended dt</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>🌍 Orbital Mechanics</td>
                                    <td><code>0.0001 - 0.001s</code></td>
                                </tr>
                                <tr>
                                    <td>🌌 Gravitational N-Body</td>
                                    <td><code>0.0005 - 0.002s</code></td>
                                </tr>
                                <tr>
                                    <td>🚀 High-Speed Projectiles</td>
                                    <td><code>0.001 - 0.005s</code></td>
                                </tr>
                                <tr>
                                    <td>🔗 Pendulums & Springs</td>
                                    <td><code>0.005 - 0.01s</code></td>
                                </tr>
                                <tr>
                                    <td>⚽ General Physics</td>
                                    <td><code>0.01 - 0.0166s</code></td>
                                </tr>
                                <tr>
                                    <td>🏗️ Slow/Static Scenes</td>
                                    <td><code>0.0166 - 0.02s</code></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="guide-section warning-box">
                        <h4>⚠️ Common Issues</h4>
                        <ul>
                            <li><strong>Orbit expands/spirals:</strong> Timestep too large → Reduce to 0.001s</li>
                            <li><strong>Energy not conserved:</strong> Check timestep and initial conditions</li>
                            <li><strong>Unstable at large distances:</strong> Lower velocity (v = √(GM/r)) or reduce dt</li>
                        </ul>
                    </div>

                    <div className="guide-section">
                        <h4>🎯 Quick Formula</h4>
                        <div className="formula-box">
                            <code>dt &lt; T_orbital / 100</code>
                            <p className="formula-desc">
                                Timestep should be much smaller than the orbital period or characteristic timescale of your system.
                            </p>
                        </div>
                    </div>

                    <div className="guide-section">
                        <h4>💡 For Gravitation Scene</h4>
                        <p>
                            The default <strong>Gravitation (Two-Body Orbit)</strong> scene requires:
                        </p>
                        <ul>
                            <li>Timestep: <code>0.001s</code> (not default 0.0166s)</li>
                            <li>Circular velocity: <code>v = √(GM/r)</code></li>
                            <li>For r=15, M=100, G=1 → v ≈ 2.58 m/s</li>
                        </ul>
                    </div>

                    <div className="guide-section">
                        <h4>📖 Full Documentation</h4>
                        <p>
                            See <code>NUMERICAL-STABILITY-GUIDE.md</code> in the project root for comprehensive explanations,
                            scaling strategies, and troubleshooting tips.
                        </p>
                    </div>
                </div>

                <div className="guide-footer">
                    <button className="primary-btn" onClick={onClose}>Got it!</button>
                </div>
            </div>
        </div>
    );
};

export default TimestepGuide;
