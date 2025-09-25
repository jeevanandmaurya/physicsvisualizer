/**
 * AI-Generated Descriptions for Example Scenes
 * Each example scene gets a comprehensive chat context that explains:
 * - What the scene demonstrates
 * - Key physics concepts
 * - How to interact with it
 * - Educational value
 */

export const sceneDescriptions = {
  "basic-shapes-showcase": {
    title: "Basic Shapes Showcase - Introduction to Physics Objects",
    description: `Welcome to the Basic Shapes Showcase! This scene introduces you to the fundamental 3D physics objects in our simulator.

**What you'll see:**
- A red sphere, green box, and blue cylinder falling under gravity
- All objects colliding realistically with each other and the ground

**Physics Concepts Demonstrated:**
- **Gravity**: All objects accelerate downward at 9.81 m/s²
- **Collision Detection**: Objects bounce and slide based on their shapes
- **Mass Effects**: Different objects have different masses affecting their motion
- **Friction & Restitution**: Surface properties affect how objects interact

**Try This:**
1. Click play to watch the objects fall and collide
2. Try changing the gravity in the settings
3. Experiment with different masses and materials
4. Observe how shape affects rolling vs. sliding behavior

**Educational Value:**
This scene helps understand how different geometric shapes behave under identical physical conditions, forming the foundation for more complex physics simulations.`,
    questions: [
      "Why does the sphere roll while the box slides?",
      "How does mass affect the collision outcomes?",
      "What happens if we remove gravity?",
      "How would this look on the moon vs. Jupiter?"
    ]
  },

  "simple-pendulum": {
    title: "Simple Pendulum - Harmonic Motion Classic",
    description: `Explore the timeless elegance of pendulum motion! This scene demonstrates one of physics' most fundamental harmonic oscillators.

**What you'll see:**
- A golden bob attached to a string, swinging from a fixed pivot point
- The pendulum starts with an initial velocity, creating smooth oscillatory motion

**Physics Concepts Demonstrated:**
- **Periodic Motion**: Regular, repeating cycles of motion
- **Conservation of Energy**: Potential ↔ Kinetic energy conversion
- **Simple Harmonic Motion**: Sinusoidal displacement over time
- **Damping Effects**: Natural energy loss through friction

**Key Parameters:**
- **Length**: Affects oscillation period (T = 2π√(L/g))
- **Mass**: Doesn't affect period (surprising fact!)
- **Initial Angle**: Determines maximum displacement
- **Gravity**: Influences the motion frequency

**Try This:**
1. Start the simulation and observe the smooth swinging motion
2. Try different initial displacements
3. Experiment with pendulum length and mass
4. Add air resistance or change gravity

**Educational Value:**
The pendulum demonstrates how complex motion can emerge from simple physical laws, and how mathematical analysis can predict real-world behavior with remarkable accuracy.`,
    questions: [
      "Why doesn't mass affect the pendulum's swing time?",
      "How does length change the oscillation period?",
      "What energy transformations occur during swinging?",
      "How would this work in zero gravity?"
    ]
  },

  "projectile-motion": {
    title: "Projectile Motion - The Physics of Throwing",
    description: `Master the art of projectile motion! This fundamental physics concept explains everything from basketball shots to artillery fire.

**What you'll see:**
- An orange projectile launched at an angle toward a green target
- The object follows a perfect parabolic trajectory under gravity

**Physics Concepts Demonstrated:**
- **Parabolic Trajectory**: The curved path due to constant horizontal velocity and accelerating vertical motion
- **Vector Components**: Initial velocity splits into horizontal (constant) and vertical (gravity-affected) components
- **Range Equation**: R = (v²sin(2θ))/g - maximum range at 45° launch angle
- **Time of Flight**: How long the projectile stays airborne

**Key Parameters:**
- **Launch Angle**: 45° gives maximum range for given speed
- **Initial Speed**: Higher speed = longer range
- **Gravity**: Affects both trajectory height and flight time
- **Air Resistance**: (Not included here for simplicity)

**Try This:**
1. Launch the projectile and observe the parabolic path
2. Try different launch angles (0°, 30°, 45°, 60°, 90°)
3. Change the initial speed and see how range varies
4. Modify gravity to see how it affects the trajectory

**Educational Value:**
Projectile motion combines kinematics with gravity, teaching vector analysis and the independence of horizontal/vertical motion components.`,
    questions: [
      "Why is 45° the optimal launch angle for maximum range?",
      "How do horizontal and vertical motions differ?",
      "What factors affect the projectile's flight time?",
      "How would air resistance change this motion?"
    ]
  },

  "conservation-momentum": {
    title: "Conservation of Momentum - Collision Dynamics",
    description: `Witness the fundamental law of conservation of momentum in action! This scene shows how momentum transfers during collisions.

**What you'll see:**
- Two carts on a frictionless track moving toward each other
- A heavy cart (blue) collides with a light cart (purple)
- Perfect elastic collision with no energy loss

**Physics Concepts Demonstrated:**
- **Conservation of Momentum**: Total momentum remains constant in collisions
- **Elastic Collisions**: Kinetic energy is conserved
- **Mass Ratios**: How object masses affect post-collision velocities
- **Center of Mass**: The system's overall motion

**Key Parameters:**
- **Mass Ratio**: Heavy cart (20kg) vs Light cart (2kg) = 10:1 ratio
- **Initial Velocities**: Only the heavy cart has initial motion
- **Friction**: Zero (frictionless track)
- **Restitution**: Perfect elasticity (e=1.0)

**Try This:**
1. Start the collision and observe the velocity transfers
2. Try different mass ratios
3. Change initial velocities
4. Add friction to see inelastic collisions

**Educational Value:**
This demonstrates one of physics' most fundamental conservation laws, showing how momentum redistributes during interactions while maintaining total system momentum.`,
    questions: [
      "Why does the heavy cart barely slow down?",
      "How do mass ratios affect collision outcomes?",
      "What would happen with inelastic collisions?",
      "How does this apply to real-world car crashes?"
    ]
  },

  "inclined-plane": {
    title: "Inclined Plane - Gravity and Friction",
    description: `Discover how gravity behaves on sloped surfaces! This classic physics experiment shows the interplay between gravitational force components and friction.

**What you'll see:**
- A heavy block on a wooden ramp inclined at an angle
- The block slides down due to gravity's parallel component
- Friction opposes the motion along the surface

**Physics Concepts Demonstrated:**
- **Force Components**: Gravity splits into normal and parallel forces
- **Friction**: Opposes motion with F_friction = μN
- **Mechanical Advantage**: Inclined planes reduce force requirements
- **Work-Energy Principle**: Force × distance relationships

**Key Parameters:**
- **Inclination Angle**: Determines force component sizes
- **Block Mass**: Affects normal force and friction
- **Friction Coefficient**: Surface roughness effects
- **Ramp Length**: Influences the mechanical advantage

**Try This:**
1. Release the block and observe its motion
2. Try different ramp angles
3. Change the block's mass
4. Modify friction coefficients

**Educational Value:**
The inclined plane demonstrates force resolution and shows how simple machines can make work easier by trading force for distance.`,
    questions: [
      "How does ramp angle affect the sliding force?",
      "Why do heavier objects need more force to move?",
      "How does this demonstrate mechanical advantage?",
      "What happens with different surface materials?"
    ]
  },

  "kinetic_theory_no_gravity": {
    title: "Kinetic Theory - Particle Motion Fundamentals",
    description: `Explore the microscopic world of particle motion! This scene demonstrates kinetic theory principles in a zero-gravity environment.

**What you'll see:**
- Ten colored spheres moving freely in a sealed container
- Particles bounce elastically off container walls
- No external forces - pure kinetic energy conservation

