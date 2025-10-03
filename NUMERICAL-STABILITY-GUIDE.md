# Numerical Stability Guide for Physics Visualizer

## Understanding Timestep and Integration Stability

### What is Timestep?

The **timestep** (dt) is the discrete time interval used to advance the physics simulation. At each timestep, the engine calculates forces, updates velocities, and moves objects to new positions.

### The Stability Problem

Numerical integration errors accumulate when:
- **Timestep is too large** relative to the dynamics of the system
- **Velocities are very high** (e.g., 1000s of m/s)
- **Forces change rapidly** (e.g., close gravitational encounters)
- **Orbital periods are short** relative to timestep

## Timestep Selection Guidelines

### General Formula
```
dt < T_characteristic / 100
```
where `T_characteristic` is the shortest timescale in your system (e.g., orbital period, oscillation period, collision duration).

### Recommended Timesteps by Simulation Type

| Simulation Type | Recommended dt | Notes |
|----------------|---------------|-------|
| **Orbital Mechanics** | 0.0001 - 0.001s | Critical for stable orbits |
| **Gravitational N-Body** | 0.0005 - 0.002s | Depends on closest approach |
| **High-Speed Projectiles** | 0.001 - 0.005s | Fast-moving objects need small dt |
| **Pendulums & Springs** | 0.005 - 0.01s | Oscillatory systems |
| **General Collisions** | 0.005 - 0.01s | Standard terrestrial physics |
| **Slow Motion/Static** | 0.0166s (1/60) | Default - works for most scenes |
| **Large Structures** | 0.01 - 0.02s | Buildings, slow dynamics |

### Specific Examples

#### Circular Orbit (Gravitation Scene)
For a circular orbit with:
- Central mass M = 100
- Orbital radius r = 15
- G = 1
- Orbital velocity v = √(GM/r) ≈ 2.58 m/s
- Orbital period T = 2πr/v ≈ 36.5 seconds

**Recommended timestep**: `dt < 36.5/100 = 0.365s`

However, due to compounding errors in gravitational force calculations at close distances, use:
- **dt = 0.001s** for perfect circular orbits (1000 steps per orbit)
- **dt = 0.005s** for acceptable elliptical drift
- **dt = 0.0166s** (default) will show significant drift/instability

#### Three-Body Problem
For chaotic three-body systems:
- **dt = 0.0001 - 0.0005s** required for accuracy
- Softening parameter helps reduce force singularities
- Energy conservation should be monitored

## Scaling Physics for Large Distances

### Problem: Numerical Instability at Large Scales

When using large distances (e.g., 100,000m orbital radius with default dt):
- Position updates per step become very large
- Velocity changes are abrupt
- Integration errors compound exponentially

### Solution 1: Reduce Timestep Proportionally

If you increase orbital radius by 10×:
```
r_new = 10 × r_old
dt_new = dt_old / √10 ≈ dt_old / 3.16
```

**Example**:
- Original: r = 20m, dt = 0.001s
- Scaled: r = 200m, dt = 0.0003s

### Solution 2: Scale Velocities Correctly

For circular orbits:
```
v_circular = √(GM / r)
```

As r increases, v **decreases** (Kepler's laws):
- r = 15m, M = 100, G = 1 → v ≈ 2.58 m/s
- r = 150m, M = 100, G = 1 → v ≈ 0.816 m/s
- r = 1500m, M = 100, G = 1 → v ≈ 0.258 m/s

**DO NOT** use high velocities (7+ m/s) with large radii - this creates hyperbolic/parabolic trajectories that diverge.

### Solution 3: Adjust Gravitational Constant and Mass

To maintain stable orbits at large distances with reasonable timesteps:

```
G × M = constant (for same orbital velocity at given radius)
```

**Example**:
- Target: r = 100,000m, v = 3 m/s, dt = 0.001s
- Required: GM = v²r = 9 × 100,000 = 900,000
- If G = 1: M = 900,000
- If M = 1000: G = 900

## Energy Conservation Check

A stable simulation should conserve total energy:
```
E_total = E_kinetic + E_potential = constant
E_kinetic = ½mv²
E_potential = -GMm/r
```

### How to Check:
1. Enable Graph Overlay in visualizer
2. Plot "Total Energy" over time
3. Check for drift:
   - **Good**: Energy oscillates < 1% (numerical noise)
   - **Acceptable**: Energy drifts < 5% over full orbit
   - **Bad**: Energy increases/decreases monotonically > 10%

If energy drifts significantly:
- **Reduce timestep** (most effective)
- Increase softening parameter (reduces singularities)
- Check initial conditions (velocity should match circular/elliptical orbit formula)

## Practical Workflow

### For Existing Unstable Simulation:

1. **Identify the Issue**:
   - Data shows expanding/contracting orbit
   - Velocities increase when they should decrease (or vice versa)
   - Energy not conserved

2. **Reduce Timestep**:
   - Go to Settings → Physics Settings
   - Set Timestep slider to **0.001s** (or lower)
   - Restart simulation

3. **Adjust Scene Parameters**:
   - Lower gravitational constant G (0.1 - 1.0)
   - Reduce masses (central: 50-200, planet: 1-5)
   - Use moderate orbital radii (10-30m)
   - Set correct circular velocity: v = √(GM/r)

4. **Verify Stability**:
   - Run simulation for 5-10 orbits
   - Check that orbit closes (returns to starting position)
   - Monitor energy conservation in graphs

### For New Large-Scale Simulation:

1. **Start Small**:
   - Test with r = 15m, M = 100, G = 1, v = 2.58 m/s, dt = 0.001s
   - Verify orbit is stable and circular

2. **Scale Up Gradually**:
   - Increase radius by 2×
   - Decrease velocity by √2
   - Decrease timestep by √2
   - Test stability again

3. **Alternative Approach** (keep dt constant):
   - Increase radius to target (e.g., 100,000m)
   - Calculate new velocity: v = √(GM/r) with large M
   - Use M = 10⁶ - 10⁹ (very massive central body)
   - Keep G = 1, dt = 0.001s

## Advanced: Softening Parameter

The **softening parameter** (ε) prevents gravitational force from becoming infinite at small distances:

```
F = GMm / (r² + ε²)
```

### When to Use:
- Close approaches in N-body systems
- Prevent numerical explosions at r ≈ 0
- Three-body or chaotic systems

### Recommended Values:
- **0** (no softening): Only for well-separated bodies
- **0.5 - 1.0**: Moderate softening for binary systems
- **1.5 - 3.0**: Heavy softening for chaotic N-body

**Trade-off**: Softening reduces accuracy at small distances but improves stability.

## Common Mistakes

### ❌ Wrong: High Velocity + Large Radius
```javascript
// This creates a hyperbolic orbit (escape trajectory)
radius: 100000,
velocity: 7000,  // WAY TOO FAST
mass: 1000,
G: 1
// Expected: v = √(1×1000/100000) ≈ 0.1 m/s for circular orbit
```

### ✅ Correct: Scale Velocity to Radius
```javascript
// Proper circular orbit
radius: 100000,
velocity: 0.1,  // v = √(GM/r)
mass: 1000,
G: 1,
timestep: 0.001  // Small dt for stability
```

### ❌ Wrong: Default Timestep for Orbits
```javascript
// Default timestep is too large for orbital mechanics
timestep: 0.0166  // 1/60 - causes drift
```

### ✅ Correct: Reduce Timestep for Orbits
```javascript
timestep: 0.001  // 60× smaller, stable orbits
```

## Summary: Quick Reference

| Issue | Solution |
|-------|----------|
| Orbit expands over time | Reduce timestep to 0.001s |
| Orbit spirals inward | Check initial velocity (should be √(GM/r)) |
| Energy increases | Timestep too large, reduce it |
| Energy decreases | Check damping/friction settings (should be 0) |
| Collision at close approach | Increase softening parameter |
| Simulation too slow | Increase timestep (but check stability) |
| Large distances unstable | Scale velocity down, timestep down, or mass up |

---

## Further Reading

- [Verlet Integration](https://en.wikipedia.org/wiki/Verlet_integration)
- [Symplectic Integrators](https://en.wikipedia.org/wiki/Symplectic_integrator)
- [N-Body Problem](https://en.wikipedia.org/wiki/N-body_problem)
- [Orbital Mechanics](https://en.wikipedia.org/wiki/Orbital_mechanics)

For questions or issues, refer to `PhysicsVisualizerArchitecture.md` and scene examples in `src/scenes.js`.
