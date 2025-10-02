# Three-Body Problem Physics Documentation

## Gravitational Force Calculation

### Implementation Analysis

Our gravitational physics engine correctly implements Newton's law of universal gravitation:

```
F = G * m1 * m2 / r²
```

**Key Implementation Details:**

1. **Force Calculation** (lines 35-45 in calculations.js):
   ```javascript
   const dx = pos2[0] - pos1[0]
   const dy = pos2[1] - pos1[1]
   const dz = pos2[2] - pos1[2]
   const distSq = dx*dx + dy*dy + dz*dz + softening²
   const dist = √distSq
   const forceMag = (G * m1 * m2) / effectiveDistSq
   ```

2. **Softening Parameter**: Prevents singularities when objects get too close
   - Added to distance squared: `distSq = r² + ε²`
   - Prevents infinite forces at r → 0

3. **Unit Vector Calculation**:
   ```javascript
   unitX = dx / dist
   unitY = dy / dist
   unitZ = dz / dist
   ```

4. **Force Vector Application**:
   - Object 1: `F⃗₁ = +F_mag * û`
   - Object 2: `F⃗₂ = -F_mag * û` (Newton's 3rd law)

## Stable Three-Body Configurations

### 1. Lagrange Triangular Configuration (L4/L5)

**Physics:**
- Three equal masses at vertices of equilateral triangle
- All orbit around common center of mass (barycenter)
- Configuration rotates as rigid body

**Stability Conditions:**
- Equal masses: m₁ = m₂ = m₃
- Equilateral triangle geometry
- Correct orbital velocity for circular motion

**Position Calculation:**
For radius r = 12 from center:
```
Body 1: (0, 0, r)                    = (0, 0, 12)
Body 2: (-r·cos(30°), 0, -r·sin(30°)) = (-10.392, 0, -6)
Body 3: (r·cos(30°), 0, -r·sin(30°))  = (10.392, 0, -6)
```

**Velocity Calculation:**
Orbital velocity for stable rotation:
```
v = √(G·M_total / r) = √(G·3m / r)
```

For our configuration:
- G = 20
- m = 100 (each)
- r = 12
- v = √(20·300 / 12) = √500 = 6.928 m/s

Velocity directions (perpendicular to radius):
```
Body 1: (-v, 0, 0)           = (-6.928, 0, 0)
Body 2: (v·sin(30°), 0, -v·cos(30°)) = (3.464, 0, -6.0)
Body 3: (v·sin(30°), 0, v·cos(30°))  = (3.464, 0, 6.0)
```

**Period Calculation:**
```
T = 2π√(r³ / (G·M_total))
T = 2π√(12³ / (20·300))
T = 2π√(1728 / 6000)
T ≈ 1.35 seconds
```

### 2. Figure-8 Orbit (Chenciner-Montgomery Solution)

**Discovery:**
- Found by Alain Chenciner and Richard Montgomery (1993)
- Proves stable, periodic, non-chaotic solutions exist
- One of few known exact solutions to three-body problem

**Physics:**
- Three equal masses chase each other in figure-8 path
- Zero angular momentum configuration
- Exact periodic solution with period ≈ 6.32 time units

**Initial Conditions (Normalized Units where G=1, m=1):**

```
Body 1: 
  position = (0.97000436, 0, -0.24308753)
  velocity = (0.466203685, 0, 0.43236573)

Body 2:
  position = (-0.97000436, 0, 0.24308753)
  velocity = (0.466203685, 0, 0.43236573)

Body 3:
  position = (0, 0, 0)
  velocity = (-0.93240737, 0, -0.86473146)
```

**Symmetry:**
- Bodies 1 and 2 are symmetric about origin
- Body 3 starts at origin with opposite momentum
- Total momentum = 0
- Total angular momentum = 0

**Conservation Laws:**
1. Energy: E = KE + PE = constant
2. Momentum: p⃗_total = 0 (always)
3. Angular Momentum: L⃗ = 0 (always)

## Numerical Stability Techniques

### Softening Length (ε)

Purpose: Prevent computational singularities

```
F = G·m₁·m₂ / (r² + ε²)
```

**When to use:**
- ε = 0.05 - 0.1 for figure-8 orbit (tight configuration)
- ε = 0.5 - 1.0 for Lagrange triangular (wider separation)

**Effect:**
- Reduces force spike when r < ε
- Makes numerical integration more stable
- Slight deviation from pure 1/r² law

### Minimum Distance (r_min)

Purpose: Hard cutoff for force calculation

```
r_effective = max(r, r_min)
F = G·m₁·m₂ / r_effective²
```

**Recommended Values:**
- r_min = 0.1 for tight orbits
- r_min = 2.0 for wider configurations

### Time Step Considerations

For stable integration:
1. **Adaptive time stepping**: Reduce Δt when bodies are close
2. **Symplectic integrators**: Preserve energy over long periods
3. **Maximum time step**: Δt < T/100 where T is orbital period

## Physical Insights

### Why Most Three-Body Systems Are Chaotic

1. **Sensitive dependence on initial conditions**
   - Tiny position error → completely different trajectory
   - Exponential divergence (Lyapunov exponent > 0)

2. **No general analytical solution**
   - Unlike two-body problem (closed-form ellipses)
   - Must use numerical integration

3. **Complex phase space**
   - 18 degrees of freedom (3 bodies × 3 dimensions × 2 [position, velocity])
   - Chaotic regions dominate phase space

### Why These Configurations Are Stable

1. **Lagrange Triangular**:
   - High symmetry (C₃ rotational)
   - Centrifugal force = Gravitational force
   - Linear stability analysis shows stable eigenvalues

2. **Figure-8 Orbit**:
   - Exact periodic solution
   - Special symmetry constraints
   - Zero angular momentum keeps configuration planar

## Experimental Observations

### Lagrange Configuration
- **Stable period**: Indefinite (theoretically stable)
- **Perturbation response**: Returns to equilibrium
- **Real examples**: Trojan asteroids at Jupiter's L4/L5 points

### Figure-8 Orbit
- **Period**: ~6.32 time units (normalized)
- **Perturbation response**: Chaotic if disturbed
- **Structural stability**: Topologically robust

## Controller Effects

### Gravitational Constant (G)
- **Increase G**: Faster orbits, tighter binding
- **Decrease G**: Slower orbits, easier escape
- **Scaling**: v ∝ √G, T ∝ 1/√G

### Mass Changes
- **Equal masses**: Maintains symmetry
- **Unequal masses**: Breaks stability (Lagrange only stable if Δm/m < 0.04)

### Softening Length
- **Too small**: Numerical instability, force spikes
- **Too large**: Non-physical force law, orbits distorted

### Position/Velocity Perturbations
- **Small (< 1%)**: May remain quasi-periodic
- **Large (> 5%)**: Usually leads to chaos or ejection

## References

1. Chenciner, A., & Montgomery, R. (2000). "A remarkable periodic solution of the three-body problem in the case of equal masses". Annals of Mathematics.

2. Lagrange, J.L. (1772). "Essai sur le problème des trois corps".

3. Poincaré, H. (1890). "Sur le problème des trois corps et les équations de la dynamique".

## Verification Checklist

✅ Force magnitude: F = G·m₁·m₂/r²
✅ Force direction: Along line connecting masses
✅ Newton's 3rd law: F₁₂ = -F₂₁
✅ Softening prevents singularities
✅ Position updates every frame
✅ Velocities integrated correctly
✅ Energy approximately conserved
✅ Momentum conserved (zero gravity)
✅ Angular momentum conserved

## Known Limitations

1. **Time integration**: Using Rapier's built-in integrator (not symplectic)
2. **Energy drift**: May accumulate over very long simulations
3. **Collision handling**: Softening approximation, not true collision
4. **Frame rate dependent**: Physics update tied to render loop

## Future Improvements

1. **Symplectic integrator**: Better long-term energy conservation
2. **Adaptive timestep**: Reduce step size when bodies approach
3. **Higher-order methods**: RK4 or Verlet integration
4. **Energy monitoring**: Display total energy drift
5. **Phase space plots**: Visualize trajectory in reduced coordinates
