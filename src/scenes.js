import allShapesThumb from './assets/thumbnails/allshapes.jpeg';
import chainReactionThumb from './assets/thumbnails/chain-reaction.jpeg';
import conservationThumb from './assets/thumbnails/conservation-momentum.jpeg';
import emptyThumb from './assets/thumbnails/empty.jpeg';
import kineticThumb from './assets/thumbnails/kinetic-theory.jpeg';
import inclinedThumb from './assets/thumbnails/inclined-plane.jpeg';
import projectileThumb from './assets/thumbnails/projectile.jpeg';
import solarThumb from './assets/thumbnails/solarsytem.jpeg';
import urbanThumb from './assets/thumbnails/urban-planing.jpeg';

export const mechanicsExamples = [
  // Class 11th Mechanics Examples
  {
    "id": "motion-straight-line",
    "name": "Motion in a Straight Line",
    "description": "Demonstrates uniformly accelerated motion (free fall) and variable acceleration.",
    "objects": [
      {"id": "ball1", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [0, 10, 0], "velocity": [0, 0, 0], "color": "#FF6347", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 1, 20], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "gravity_y", "label": "Gravity Y", "type": "slider", "min": -15, "max": 0, "step": 0.5, "value": -9.81, "propertyPath": "gravity[1]"}
    ]
  },
  {
    "id": "motion-plane",
    "name": "Motion in a Plane",
    "description": "Projectile motion in 2D plane under gravity.",
    "objects": [
      {"id": "projectile", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [0, 5, 0], "velocity": [5, 7, 0], "color": "#FF4500", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [30, 1, 20], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "vel_x", "label": "Velocity X", "type": "slider", "min": 0, "max": 10, "step": 0.5, "value": 5, "objectId": "projectile", "property": "velocity[0]"},
      {"id": "vel_y", "label": "Velocity Y", "type": "slider", "min": 0, "max": 15, "step": 0.5, "value": 7, "objectId": "projectile", "property": "velocity[1]"}
    ]
  },
  {
    "id": "laws-motion",
    "name": "Laws of Motion (Collisions)",
    "description": "Elastic collision demonstrating Newton's laws.",
    "objects": [
      {"id": "ball1", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [-5, 0.5, 0], "velocity": [10, 0, 0], "color": "#42a5f5", "friction": 0, "restitution": 1},
      {"id": "ball2", "type": "Sphere", "mass": 2, "radius": 0.5, "position": [5, 0.5, 0], "velocity": [0, 0, 0], "color": "#ab47bc", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "mass1", "label": "Mass 1", "type": "slider", "min": 0.5, "max": 5, "step": 0.1, "value": 1, "objectId": "ball1", "property": "mass"},
      {"id": "vel_x1", "label": "Velocity X1", "type": "slider", "min": 0, "max": 20, "step": 1, "value": 10, "objectId": "ball1", "property": "velocity[0]"},
      {"id": "restitution", "label": "Restitution", "type": "slider", "min": 0, "max": 1, "step": 0.1, "value": 1, "propertyPath": "contactMaterial.restitution"}
    ]
  },
  {
    "id": "work-energy",
    "name": "Work and Energy (Pendulum)",
    "description": "Simple pendulum showing energy conservation.",
    "objects": [
      {"id": "pivot", "type": "Sphere", "mass": 0, "radius": 0.2, "position": [0, 10, 0], "color": "#666", "isStatic": true, "friction": 0, "restitution": 1},
      {"id": "bob", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [4, 6, 0], "velocity": [0, 0, 0], "color": "#FFD700", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [10, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "joints": [
      {"bodyA": "pivot", "bodyB": "bob", "type": "revolute", "anchorA": [0, 0, 0], "anchorB": [-4, 4, 0], "axis": [0, 0, 1]}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "angle", "label": "Initial Angle", "type": "slider", "min": -90, "max": 90, "step": 5, "value": 45, "objectId": "bob", "property": "position[0]", "recreatesJoints": true},
      {"id": "mass", "label": "Mass", "type": "slider", "min": 0.5, "max": 5, "step": 0.1, "value": 1, "objectId": "bob", "property": "mass"},
      {"id": "length", "label": "Pendulum Length", "type": "slider", "min": 4, "max": 8, "step": 0.5, "value": 6, "objectId": "bob", "property": "position[1]", "recreatesJoints": true}
    ]
  },
  {
    "id": "system-particles",
    "name": "System of Particles (Collision Chain)",
    "description": "Multiple balls colliding to show center of mass and momentum.",
    "objects": [
      {"id": "ball1", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [-5, 0.5, 0], "velocity": [6, 0, 0], "color": "#FF6347", "friction": 0, "restitution": 1},
      {"id": "ball2", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [0, 0.5, 0], "velocity": [0, 0, 0], "color": "#32CD32", "friction": 0, "restitution": 1},
      {"id": "ball3", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [4, 0.5, 0], "velocity": [0, 0, 0], "color": "#4169E1", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "vel_x1", "label": "Velocity X1", "type": "slider", "min": 0, "max": 10, "step": 1, "value": 6, "objectId": "ball1", "property": "velocity[0]"},
      {"id": "mass2", "label": "Mass 2", "type": "slider", "min": 0.5, "max": 3, "step": 0.1, "value": 1, "objectId": "ball2", "property": "mass"}
    ]
  },
  {
    "id": "rotational-motion",
    "name": "Rotational Motion (Compound Pendulum)",
    "description": "Double pendulum showing rotational dynamics.",
    "objects": [
      {"id": "pivot", "type": "Sphere", "mass": 0, "radius": 0.1, "position": [0, 10, 0], "color": "#666", "isStatic": true, "friction": 0, "restitution": 1},
      {"id": "arm1", "type": "Cylinder", "mass": 1, "radius": 0.2, "height": 2, "position": [0, 9, 0], "velocity": [0, 0, 0], "color": "#FFD700", "friction": 0, "restitution": 1},
      {"id": "arm2", "type": "Cylinder", "mass": 1, "radius": 0.2, "height": 2, "position": [0, 7, 0], "velocity": [0, 0, 0], "color": "#FF6347", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [10, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "joints": [
      {"bodyA": "pivot", "bodyB": "arm1", "type": "revolute", "anchorA": [0, 0, 0], "anchorB": [0, 1, 0], "axis": [0, 0, 1]},
      {"bodyA": "arm1", "bodyB": "arm2", "type": "revolute", "anchorA": [0, -1, 0], "anchorB": [0, 1, 0], "axis": [0, 0, 1]}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "angle1", "label": "Angle 1", "type": "slider", "min": -90, "max": 90, "step": 5, "value": 0, "objectId": "arm1", "property": "position[0]", "recreatesJoints": true},
      {"id": "angle2", "label": "Angle 2", "type": "slider", "min": -90, "max": 90, "step": 5, "value": 0, "objectId": "arm2", "property": "position[0]", "recreatesJoints": true},
      {"id": "length1", "label": "Arm 1 Length", "type": "slider", "min": 1, "max": 4, "step": 0.5, "value": 2, "objectId": "arm1", "property": "height", "recreatesJoints": true},
      {"id": "length2", "label": "Arm 2 Length", "type": "slider", "min": 1, "max": 4, "step": 0.5, "value": 2, "objectId": "arm2", "property": "height", "recreatesJoints": true}
    ]
  },
  {
    "id": "gravitation",
    "name": "Gravitation (Two-Body Orbit)",
    "description": "Stable circular orbit demonstration. v_circular = √(GM/r). Period T = 2π√(r³/GM). Shows conservation of angular momentum and energy. IMPORTANT: For stable orbits, reduce Physics Settings → Timestep to 0.001s or lower. Default timestep (0.0166s) causes numerical integration errors at these scales.",
    "objects": [
      {"id": "body1", "type": "Sphere", "mass": 100, "gravitationalMass": 100, "radius": 1.5, "position": [0, 0, 0], "isStatic": true, "color": "#FFD700", "friction": 0, "restitution": 0},
      {"id": "body2", "type": "Sphere", "mass": 1, "gravitationalMass": 1, "radius": 0.5, "position": [15, 0, 0], "velocity": [0, 0, 2.58], "color": "#4169E1", "friction": 0, "restitution": 0}
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0, "restitution": 0},
    "gravitationalPhysics": {"enabled": true, "gravitationalConstant": 1, "minDistance": 2.0, "softening": 0.8},
    "simulationScale": "solar_system",
    "recommendedTimestep": 0.001,
    "controllers": [
      {"id": "G", "label": "G Constant", "type": "slider", "min": 0.5, "max": 3, "step": 0.1, "value": 1, "propertyPath": "gravitationalPhysics.gravitationalConstant"},
      {"id": "orbital_radius", "label": "Orbital Radius", "type": "slider", "min": 10, "max": 30, "step": 1, "value": 15, "objectId": "body2", "property": "position[0]"},
      {"id": "vel", "label": "Orbital Velocity", "type": "slider", "min": 1, "max": 5, "step": 0.1, "value": 2.58, "objectId": "body2", "property": "velocity[2]"},
      {"id": "central_mass", "label": "Central Mass", "type": "slider", "min": 50, "max": 500, "step": 10, "value": 100, "objectId": "body1", "property": "gravitationalMass"},
      {"id": "planet_mass", "label": "Planet Mass", "type": "slider", "min": 0.5, "max": 5, "step": 0.5, "value": 1, "objectId": "body2", "property": "gravitationalMass"}
    ]
  },
  {
    "id": "friction",
    "name": "Friction on Inclined Plane",
    "description": "Block sliding down incline with friction.",
    "objects": [
      {"id": "ramp", "type": "Box", "mass": 0, "dimensions": [10, 1, 5], "position": [0, 5, 0], "rotation": [0, 0, -0.785], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1},
      {"id": "block", "type": "Box", "mass": 5, "dimensions": [2, 2, 2], "position": [-4, 8, 0], "color": "#FF6347", "friction": 0, "restitution": 1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 1}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "friction", "label": "Friction Coefficient", "type": "slider", "min": 0, "max": 1, "step": 0.1, "value": 0, "propertyPath": "contactMaterial.friction"},
      {"id": "angle", "label": "Incline Angle", "type": "slider", "min": 0, "max": 1, "step": 0.1, "value": 0.785, "propertyPath": "objects[0].rotation[2]"}
    ]
  },
  {
    "id": "fluid-dynamics",
    "name": "Buoyancy and Drag",
    "description": "Object sinking in fluid with buoyancy and drag forces.",
    "objects": [
      {"id": "fluid-box", "type": "Box", "mass": 0, "dimensions": [20, 10, 20], "position": [0, 5, 0], "color": "#1e90ff", "isStatic": true, "friction": 0.1, "restitution": 0},
      {"id": "object", "type": "Sphere", "mass": 1, "radius": 1, "position": [0, 9, 0], "color": "#FF6347", "velocity": [0, 0, 0], "opacity": 0.8, "friction": 0.1, "restitution": 0}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0.1, "restitution": 0},
    "fluid": {"enabled": true, "density": 1000, "viscosity": 1, "dragCoefficient": 0.47},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "density", "label": "Fluid Density", "type": "slider", "min": 500, "max": 2000, "step": 100, "value": 1000, "propertyPath": "fluid.density"},
      {"id": "drag", "label": "Drag Coefficient", "type": "slider", "min": 0, "max": 1, "step": 0.05, "value": 0.47, "propertyPath": "fluid.dragCoefficient"}
    ]
  },
  {
    "id": "balance-scale",
    "name": "Balance Scale (Traditional Weighing Machine)",
    "description": "Classical balance scale with rotating beam. Demonstrates torque equilibrium: τ₁=τ₂ → m₁·d₁=m₂·d₂. Equal arm balance shows mass comparison directly.",
    "objects": [
      {"id": "pivot", "type": "Sphere", "mass": 0, "radius": 0.2, "position": [0, 12, 0], "isStatic": true, "color": "#FFD700", "friction": 0, "restitution": 0},
      
      {"id": "beam", "type": "Box", "mass": 0.5, "dimensions": [10, 0.3, 0.5], "position": [0, 12, 0], "color": "#8B4513", "friction": 0, "restitution": 0},
      
      {"id": "rope1_0", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [-5, 11.8, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope1_1", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [-5, 11.15, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope1_2", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [-5, 10.75, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope1_3", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [-5, 10.35, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope1_4", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [-5, 9.95, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope1_5", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [-5, 9.55, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      
      {"id": "mass1", "type": "Box", "mass": 2, "dimensions": [1, 1, 1], "position": [-5, 8.85, 0], "color": "#FF6347", "friction": 0, "restitution": 0},
      
      {"id": "rope2_0", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [5, 11.8, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope2_1", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [5, 11.15, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope2_2", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [5, 10.75, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope2_3", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [5, 10.35, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope2_4", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [5, 9.95, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      {"id": "rope2_5", "type": "Sphere", "mass": 0.01, "radius": 0.05, "position": [5, 9.55, 0], "color": "#A0522D", "friction": 0, "restitution": 0},
      
      {"id": "mass2", "type": "Box", "mass": 3, "dimensions": [1, 1, 1], "position": [5, 8.85, 0], "color": "#4169E1", "friction": 0, "restitution": 0},
      
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0.3, "restitution": 0}
    ],
    "joints": [
      {"bodyA": "pivot", "bodyB": "beam", "type": "revolute", "anchorA": [0, 0, 0], "anchorB": [0, 0, 0], "axis": [0, 0, 1]},
      
      {"bodyA": "beam", "bodyB": "rope1_0", "type": "fixed", "anchorA": [-5, -0.15, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope1_0", "bodyB": "rope1_1", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope1_1", "bodyB": "rope1_2", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope1_2", "bodyB": "rope1_3", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope1_3", "bodyB": "rope1_4", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope1_4", "bodyB": "rope1_5", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope1_5", "bodyB": "mass1", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.5, 0]},
      
      {"bodyA": "beam", "bodyB": "rope2_0", "type": "fixed", "anchorA": [5, -0.15, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope2_0", "bodyB": "rope2_1", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope2_1", "bodyB": "rope2_2", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope2_2", "bodyB": "rope2_3", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope2_3", "bodyB": "rope2_4", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope2_4", "bodyB": "rope2_5", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.05, 0]},
      {"bodyA": "rope2_5", "bodyB": "mass2", "type": "fixed", "anchorA": [0, -0.05, 0], "anchorB": [0, 0.5, 0]}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0.3, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "mass1_val", "label": "Mass 1 (kg)", "type": "slider", "min": 0.5, "max": 10, "step": 0.5, "value": 2, "objectId": "mass1", "property": "mass"},
      {"id": "mass2_val", "label": "Mass 2 (kg)", "type": "slider", "min": 0.5, "max": 10, "step": 0.5, "value": 3, "objectId": "mass2", "property": "mass"},
      {"id": "arm_length", "label": "Beam Length (m)", "type": "slider", "min": 6, "max": 14, "step": 1, "value": 10, "objectId": "beam", "property": "dimensions[0]", "recreatesJoints": true},
      {"id": "gravity_y", "label": "Gravity (m/s²)", "type": "slider", "min": -20, "max": -5, "step": 0.5, "value": -9.81, "propertyPath": "gravity[1]"},
      {"id": "damping", "label": "Damping", "type": "slider", "min": 0, "max": 5, "step": 0.5, "value": 1, "propertyPath": "joints[0].damping"}
    ]
  },
  {
    "id": "oblique-collision",
    "name": "Oblique Collision (JEE Main)",
    "description": "Two bodies colliding at an angle. Demonstrates conservation of momentum in 2D: m1v1 + m2v2 = m1v1' + m2v2'.",
    "objects": [
      {"id": "ball1", "type": "Sphere", "mass": 2, "radius": 0.6, "position": [-8, 0.6, -4], "velocity": [12, 0, 8], "color": "#FF6347", "friction": 0, "restitution": 0.9},
      {"id": "ball2", "type": "Sphere", "mass": 3, "radius": 0.8, "position": [6, 0.8, 5], "velocity": [-8, 0, -6], "color": "#4169E1", "friction": 0, "restitution": 0.9},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [30, 1, 30], "position": [0, -0.5, 0], "isStatic": true, "color": "#2F4F2F", "friction": 0, "restitution": 0.9}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 0.9},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "mass1", "label": "Mass 1 (kg)", "type": "slider", "min": 0.5, "max": 5, "step": 0.1, "value": 2, "objectId": "ball1", "property": "mass"},
      {"id": "mass2", "label": "Mass 2 (kg)", "type": "slider", "min": 0.5, "max": 5, "step": 0.1, "value": 3, "objectId": "ball2", "property": "mass"},
      {"id": "vel_x1", "label": "Ball 1 Velocity X", "type": "slider", "min": 0, "max": 20, "step": 1, "value": 12, "objectId": "ball1", "property": "velocity[0]"},
      {"id": "vel_z1", "label": "Ball 1 Velocity Z", "type": "slider", "min": 0, "max": 15, "step": 1, "value": 8, "objectId": "ball1", "property": "velocity[2]"},
      {"id": "vel_x2", "label": "Ball 2 Velocity X", "type": "slider", "min": -20, "max": 0, "step": 1, "value": -8, "objectId": "ball2", "property": "velocity[0]"},
      {"id": "vel_z2", "label": "Ball 2 Velocity Z", "type": "slider", "min": -15, "max": 0, "step": 1, "value": -6, "objectId": "ball2", "property": "velocity[2]"},
      {"id": "restitution", "label": "Coefficient of Restitution", "type": "slider", "min": 0, "max": 1, "step": 0.1, "value": 0.9, "propertyPath": "contactMaterial.restitution"}
    ]
  },
  {
    "id": "banked-curve",
    "name": "Banked Curve (Olympiad)",
    "description": "Vehicle on banked circular track. Optimal angle θ = tan⁻¹(v²/rg). Banking eliminates need for friction.",
    "objects": [
      {"id": "track", "type": "Box", "mass": 0, "dimensions": [40, 1, 10], "position": [0, 2, 0], "rotation": [0, 0, -0.4], "isStatic": true, "color": "#696969", "friction": 0.3, "restitution": 0},
      {"id": "vehicle", "type": "Box", "mass": 5, "dimensions": [2, 1, 1.5], "position": [-8, 5, 0], "velocity": [15, 0, 0], "color": "#DC143C", "friction": 0.3, "restitution": 0},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [50, 1, 30], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0.3, "restitution": 0}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0.3, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "banking_angle", "label": "Banking Angle (rad)", "type": "slider", "min": 0, "max": 1.2, "step": 0.05, "value": 0.4, "objectId": "track", "property": "rotation[2]"},
      {"id": "velocity", "label": "Vehicle Speed (m/s)", "type": "slider", "min": 5, "max": 30, "step": 1, "value": 15, "objectId": "vehicle", "property": "velocity[0]"},
      {"id": "friction_coeff", "label": "Friction Coefficient", "type": "slider", "min": 0, "max": 1, "step": 0.05, "value": 0.3, "propertyPath": "contactMaterial.friction"},
      {"id": "mass", "label": "Vehicle Mass (kg)", "type": "slider", "min": 1, "max": 10, "step": 0.5, "value": 5, "objectId": "vehicle", "property": "mass"}
    ]
  },
  {
    "id": "spring-mass-oscillator",
    "name": "Spring-Mass System (SHM)",
    "description": "Horizontal spring-mass demonstrating SHM: T = 2π√(m/k), ω = √(k/m). Shows energy interchange between KE and PE.",
    "objects": [
      {"id": "wall", "type": "Box", "mass": 0, "dimensions": [1, 3, 3], "position": [-10, 1.5, 0], "isStatic": true, "color": "#696969", "friction": 0, "restitution": 0},
      {"id": "mass", "type": "Box", "mass": 2, "dimensions": [2, 2, 2], "position": [-5, 1, 0], "velocity": [0, 0, 0], "color": "#FF6347", "friction": 0, "restitution": 0},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [30, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 0}
    ],
    "joints": [
      {"bodyA": "wall", "bodyB": "mass", "type": "spring", "anchorA": [0.5, 0, 0], "anchorB": [-1, 0, 0], "restLength": 3, "stiffness": 50, "damping": 0.1}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "mass_val", "label": "Mass (kg)", "type": "slider", "min": 0.5, "max": 10, "step": 0.5, "value": 2, "objectId": "mass", "property": "mass"},
      {"id": "spring_k", "label": "Spring Constant k (N/m)", "type": "slider", "min": 10, "max": 200, "step": 10, "value": 50, "recreatesJoints": true},
      {"id": "damping", "label": "Damping Coefficient", "type": "slider", "min": 0, "max": 5, "step": 0.1, "value": 0.1, "recreatesJoints": true},
      {"id": "amplitude", "label": "Initial Displacement (m)", "type": "slider", "min": -5, "max": 5, "step": 0.5, "value": 0, "objectId": "mass", "property": "position[0]"},
      {"id": "gravity_y", "label": "Gravity (m/s²)", "type": "slider", "min": -15, "max": 0, "step": 0.5, "value": -9.81, "propertyPath": "gravity[1]"}
    ]
  },
  {
    "id": "coupled-oscillators",
    "name": "Coupled Oscillators (Advanced)",
    "description": "Two masses connected by springs showing normal modes. Demonstrates coupled harmonic motion with beats and energy transfer.",
    "objects": [
      {"id": "wall1", "type": "Box", "mass": 0, "dimensions": [1, 3, 3], "position": [-12, 1.5, 0], "isStatic": true, "color": "#696969", "friction": 0, "restitution": 0},
      {"id": "mass1", "type": "Box", "mass": 1.5, "dimensions": [1.5, 1.5, 1.5], "position": [-7, 0.75, 0], "velocity": [0, 0, 0], "color": "#FF6347", "friction": 0, "restitution": 0},
      {"id": "mass2", "type": "Box", "mass": 1.5, "dimensions": [1.5, 1.5, 1.5], "position": [-2, 0.75, 0], "velocity": [0, 0, 0], "color": "#4169E1", "friction": 0, "restitution": 0},
      {"id": "wall2", "type": "Box", "mass": 0, "dimensions": [1, 3, 3], "position": [3, 1.5, 0], "isStatic": true, "color": "#696969", "friction": 0, "restitution": 0},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [30, 1, 10], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 0}
    ],
    "joints": [
      {"bodyA": "wall1", "bodyB": "mass1", "type": "spring", "anchorA": [0.5, 0, 0], "anchorB": [-0.75, 0, 0], "restLength": 3.5, "stiffness": 80, "damping": 0.5},
      {"bodyA": "mass1", "bodyB": "mass2", "type": "spring", "anchorA": [0.75, 0, 0], "anchorB": [-0.75, 0, 0], "restLength": 3.5, "stiffness": 40, "damping": 0.5},
      {"bodyA": "mass2", "bodyB": "wall2", "type": "spring", "anchorA": [0.75, 0, 0], "anchorB": [-0.5, 0, 0], "restLength": 3.5, "stiffness": 80, "damping": 0.5}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "mass1_val", "label": "Mass 1 (kg)", "type": "slider", "min": 0.5, "max": 5, "step": 0.5, "value": 1.5, "objectId": "mass1", "property": "mass"},
      {"id": "mass2_val", "label": "Mass 2 (kg)", "type": "slider", "min": 0.5, "max": 5, "step": 0.5, "value": 1.5, "objectId": "mass2", "property": "mass"},
      {"id": "k_outer", "label": "Outer Spring k (N/m)", "type": "slider", "min": 20, "max": 200, "step": 10, "value": 80, "recreatesJoints": true},
      {"id": "k_coupling", "label": "Coupling Spring k (N/m)", "type": "slider", "min": 10, "max": 100, "step": 5, "value": 40, "recreatesJoints": true},
      {"id": "damping_val", "label": "Damping", "type": "slider", "min": 0, "max": 3, "step": 0.1, "value": 0.5, "recreatesJoints": true},
      {"id": "displacement1", "label": "Mass 1 Initial Pos", "type": "slider", "min": -10, "max": -4, "step": 0.5, "value": -7, "objectId": "mass1", "property": "position[0]"},
      {"id": "displacement2", "label": "Mass 2 Initial Pos", "type": "slider", "min": -5, "max": 1, "step": 0.5, "value": -2, "objectId": "mass2", "property": "position[0]"}
    ]
  },
  {
    "id": "gyroscope-precession",
    "name": "Gyroscopic Precession (Olympiad)",
    "description": "Spinning disc showing precession. Angular momentum L = Iω, precession ΩP = τ/L = mgr/(Iω). Demonstrates rotational dynamics.",
    "objects": [
      {"id": "pivot", "type": "Sphere", "mass": 0, "radius": 0.3, "position": [0, 8, 0], "isStatic": true, "color": "#555555", "friction": 0, "restitution": 0},
      {"id": "arm", "type": "Cylinder", "mass": 0.5, "radius": 0.15, "height": 4, "position": [2, 8, 0], "rotation": [0, 0, Math.PI/2], "velocity": [0, 0, 0], "color": "#A9A9A9", "friction": 0, "restitution": 0},
      {"id": "disc", "type": "Cylinder", "mass": 2, "radius": 1.2, "height": 0.3, "position": [4, 8, 0], "rotation": [0, 0, 0], "angularVelocity": [0, 20, 0], "color": "#FFD700", "friction": 0, "restitution": 0},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 1, 20], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0, "restitution": 0}
    ],
    "joints": [
      {"bodyA": "pivot", "bodyB": "arm", "type": "revolute", "anchorA": [0, 0, 0], "anchorB": [-2, 0, 0], "axis": [0, 1, 0]},
      {"bodyA": "arm", "bodyB": "disc", "type": "fixed", "anchorA": [2, 0, 0], "anchorB": [0, 0, 0]}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "spin_rate", "label": "Disc Spin ω (rad/s)", "type": "slider", "min": 0, "max": 50, "step": 2, "value": 20, "objectId": "disc", "property": "angularVelocity[1]"},
      {"id": "disc_mass", "label": "Disc Mass (kg)", "type": "slider", "min": 0.5, "max": 5, "step": 0.5, "value": 2, "objectId": "disc", "property": "mass"},
      {"id": "disc_radius", "label": "Disc Radius (m)", "type": "slider", "min": 0.5, "max": 2, "step": 0.1, "value": 1.2, "objectId": "disc", "property": "radius"},
      {"id": "arm_length", "label": "Arm Length (m)", "type": "slider", "min": 2, "max": 6, "step": 0.5, "value": 4, "objectId": "arm", "property": "height", "recreatesJoints": true},
      {"id": "gravity_y", "label": "Gravity (m/s²)", "type": "slider", "min": -15, "max": -5, "step": 0.5, "value": -9.81, "propertyPath": "gravity[1]"}
    ]
  },
  {
    "id": "rolling-motion",
    "name": "Rolling Motion (No Slip Condition)",
    "description": "Sphere/cylinder rolling down incline. Demonstrates v = ωr, a = αr, and energy: ½mv² + ½Iω² = mgh. Compare different moments of inertia.",
    "objects": [
      {"id": "ramp", "type": "Box", "mass": 0, "dimensions": [15, 1, 8], "position": [0, 6, 0], "rotation": [0, 0, -0.524], "isStatic": true, "color": "#696969", "friction": 0.8, "restitution": 0},
      {"id": "sphere", "type": "Sphere", "mass": 2, "radius": 0.8, "position": [-6, 11, -2], "velocity": [0, 0, 0], "color": "#FF6347", "friction": 0.8, "restitution": 0.1},
      {"id": "cylinder", "type": "Cylinder", "mass": 2, "radius": 0.8, "height": 1, "position": [-6, 11, 0], "rotation": [Math.PI/2, 0, 0], "velocity": [0, 0, 0], "color": "#4169E1", "friction": 0.8, "restitution": 0.1},
      {"id": "disc", "type": "Cylinder", "mass": 2, "radius": 0.8, "height": 0.3, "position": [-6, 11, 2], "rotation": [Math.PI/2, 0, 0], "velocity": [0, 0, 0], "color": "#32CD32", "friction": 0.8, "restitution": 0.1},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [25, 1, 20], "position": [0, -0.5, 0], "isStatic": true, "color": "#8B4513", "friction": 0.8, "restitution": 0}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0.8, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "incline_angle", "label": "Incline Angle (rad)", "type": "slider", "min": 0.1, "max": 1.2, "step": 0.05, "value": 0.524, "objectId": "ramp", "property": "rotation[2]"},
      {"id": "friction_coeff", "label": "Friction μ", "type": "slider", "min": 0, "max": 1, "step": 0.05, "value": 0.8, "propertyPath": "contactMaterial.friction"},
      {"id": "mass_val", "label": "Object Mass (kg)", "type": "slider", "min": 0.5, "max": 10, "step": 0.5, "value": 2, "objectId": "sphere", "property": "mass"},
      {"id": "radius_val", "label": "Object Radius (m)", "type": "slider", "min": 0.3, "max": 1.5, "step": 0.1, "value": 0.8, "objectId": "sphere", "property": "radius"},
      {"id": "gravity_y", "label": "Gravity (m/s²)", "type": "slider", "min": -20, "max": -5, "step": 0.5, "value": -9.81, "propertyPath": "gravity[1]"}
    ]
  },
  {
    "id": "variable-mass-rocket",
    "name": "Variable Mass System (Rocket)",
    "description": "Rocket propulsion with variable mass. Tsiolkovsky equation: Δv = ve·ln(m0/mf). Demonstrates thrust F = dm/dt · ve.",
    "objects": [
      {"id": "rocket", "type": "Cylinder", "mass": 10, "radius": 0.6, "height": 4, "position": [0, 2, 0], "velocity": [0, 0, 0], "color": "#DC143C", "friction": 0, "restitution": 0},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [40, 1, 40], "position": [0, -0.5, 0], "isStatic": true, "color": "#2F4F2F", "friction": 0.3, "restitution": 0}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0.3, "restitution": 0},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "thrust": {"enabled": true, "force": 150, "direction": [0, 1, 0], "fuelMass": 8, "burnRate": 0.5},
    "controllers": [
      {"id": "thrust_force", "label": "Thrust Force (N)", "type": "slider", "min": 50, "max": 500, "step": 10, "value": 150, "propertyPath": "thrust.force"},
      {"id": "burn_rate", "label": "Burn Rate (kg/s)", "type": "slider", "min": 0.1, "max": 2, "step": 0.1, "value": 0.5, "propertyPath": "thrust.burnRate"},
      {"id": "initial_mass", "label": "Initial Mass (kg)", "type": "slider", "min": 5, "max": 20, "step": 1, "value": 10, "objectId": "rocket", "property": "mass"},
      {"id": "fuel_mass", "label": "Fuel Mass (kg)", "type": "slider", "min": 2, "max": 15, "step": 1, "value": 8, "propertyPath": "thrust.fuelMass"},
      {"id": "gravity_y", "label": "Gravity (m/s²)", "type": "slider", "min": -15, "max": -5, "step": 0.5, "value": -9.81, "propertyPath": "gravity[1]"}
    ]
  },
  {
    "id": "three-body-problem",
    "name": "Three-Body Lagrange Configuration (Stable)",
    "description": "Stable three-body system in Lagrange L4/L5 triangular configuration. Equal masses at equilateral triangle vertices orbiting common center. Period T = 2π√(r³/GM).",
    "objects": [
      {"id": "body1", "type": "Sphere", "mass": 100, "gravitationalMass": 100, "radius": 0.5, "position": [0, 0, 20], "velocity": [-5.37, 0, 0], "color": "#FFD700", "friction": 0, "restitution": 0},
      {"id": "body2", "type": "Sphere", "mass": 100, "gravitationalMass": 100, "radius": 0.5, "position": [-17.32, 0, -10], "velocity": [2.685, 0, -4.65], "color": "#FF6347", "friction": 0, "restitution": 0},
      {"id": "body3", "type": "Sphere", "mass": 100, "gravitationalMass": 100, "radius": 0.5, "position": [17.32, 0, -10], "velocity": [2.685, 0, 4.65], "color": "#4169E1", "friction": 0, "restitution": 0}
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0, "restitution": 0},
    "gravitationalPhysics": {"enabled": true, "gravitationalConstant": 20, "minDistance": 3.0, "softening": 1.5},
    "simulationScale": "solar_system",
    "controllers": [
      {"id": "G_constant", "label": "G Constant", "type": "slider", "min": 10, "max": 40, "step": 1, "value": 20, "propertyPath": "gravitationalPhysics.gravitationalConstant"},
      {"id": "equal_mass", "label": "Body Mass", "type": "slider", "min": 50, "max": 200, "step": 10, "value": 100, "objectId": "body1", "property": "gravitationalMass"},
      {"id": "orbital_radius", "label": "Orbit Radius", "type": "slider", "min": 15, "max": 30, "step": 1, "value": 20, "objectId": "body1", "property": "position[2]"},
      {"id": "orbital_speed", "label": "Orbital Speed", "type": "slider", "min": 3, "max": 10, "step": 0.5, "value": 5.37, "objectId": "body1", "property": "velocity[0]"},
      {"id": "softening", "label": "Softening Length", "type": "slider", "min": 0.5, "max": 3, "step": 0.1, "value": 1.5, "propertyPath": "gravitationalPhysics.softening"}
    ]
  },
  {
    "id": "figure-eight-orbit",
    "name": "Figure-8 Three-Body Orbit (Chenciner-Montgomery)",
    "description": "Remarkable periodic solution to three-body problem. Three equal masses chase each other in figure-8 pattern. Discovered 1993, proves stable non-chaotic solutions exist.",
    "objects": [
      {"id": "body1", "type": "Sphere", "mass": 1, "gravitationalMass": 1, "radius": 0.15, "position": [4.85, 0, -1.215], "velocity": [0.233, 0, 0.216], "color": "#FFD700", "friction": 0, "restitution": 0},
      {"id": "body2", "type": "Sphere", "mass": 1, "gravitationalMass": 1, "radius": 0.15, "position": [-4.85, 0, 1.215], "velocity": [0.233, 0, 0.216], "color": "#FF6347", "friction": 0, "restitution": 0},
      {"id": "body3", "type": "Sphere", "mass": 1, "gravitationalMass": 1, "radius": 0.15, "position": [0, 0, 0], "velocity": [-0.466, 0, -0.432], "color": "#4169E1", "friction": 0, "restitution": 0}
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0, "restitution": 0},
    "gravitationalPhysics": {"enabled": true, "gravitationalConstant": 0.04, "minDistance": 0.5, "softening": 0.8},
    "simulationScale": "solar_system",
    "controllers": [
      {"id": "G_constant", "label": "G Constant", "type": "slider", "min": 0.02, "max": 0.1, "step": 0.01, "value": 0.04, "propertyPath": "gravitationalPhysics.gravitationalConstant"},
      {"id": "scale_factor", "label": "Orbit Scale", "type": "slider", "min": 3, "max": 8, "step": 0.5, "value": 5, "objectId": "body1", "property": "position[0]"},
      {"id": "speed_factor", "label": "Speed Scale", "type": "slider", "min": 0.1, "max": 0.5, "step": 0.05, "value": 0.2, "objectId": "body1", "property": "velocity[0]"},
      {"id": "softening", "label": "Softening Length", "type": "slider", "min": 0.3, "max": 2, "step": 0.1, "value": 0.8, "propertyPath": "gravitationalPhysics.softening"},
      {"id": "min_distance", "label": "Min Distance", "type": "slider", "min": 0.3, "max": 1.5, "step": 0.1, "value": 0.5, "propertyPath": "gravitationalPhysics.minDistance"}
    ]
  },
  {
    "id": "kinetic-theory-diffusion",
    "name": "Kinetic Theory of Diffusion",
    "description": "Demonstrates diffusion in kinetic theory with particles of different densities mixing through random motion and collisions. Different numbers of red and yellow particles are placed in two regions separated by an imaginary partition. The particles diffuse and mix over time.",
    "objects": [
      {"id": "wall-left", "type": "Box", "mass": 0, "dimensions": [5, 40, 40], "position": [-22.5, 20, 0], "isStatic": true, "color": "#ffffff", "opacity": 0.1, "friction": 0, "restitution": 1},
      {"id": "wall-right", "type": "Box", "mass": 0, "dimensions": [5, 40, 40], "position": [22.5, 20, 0], "isStatic": true, "color": "#ffffff", "opacity": 0.1, "friction": 0, "restitution": 1},
      {"id": "wall-front", "type": "Box", "mass": 0, "dimensions": [40, 40, 5], "position": [0, 20, -22.5], "isStatic": true, "color": "#ffffff", "opacity": 0.1, "friction": 0, "restitution": 1},
      {"id": "wall-back", "type": "Box", "mass": 0, "dimensions": [40, 40, 5], "position": [0, 20, 22.5], "isStatic": true, "color": "#ffffff", "opacity": 0.1, "friction": 0, "restitution": 1},
      {"id": "wall-floor", "type": "Box", "mass": 0, "dimensions": [40, 5, 40], "position": [0, 2.5, 0], "isStatic": true, "color": "#ffffff", "opacity": 0.1, "friction": 0, "restitution": 1},
      {"id": "wall-ceiling", "type": "Box", "mass": 0, "dimensions": [40, 5, 40], "position": [0, 37.5, 0], "isStatic": true, "color": "#ffffff", "opacity": 0.1, "friction": 0, "restitution": 1},
      {"id": "red1", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [-10, 15, 0], "velocity": [8, 0, 0], "color": "#ff0000", "friction": 0, "restitution": 1},
      {"id": "red2", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [-8, 25, 5], "velocity": [-5, 3, 4], "color": "#ff0000", "friction": 0, "restitution": 1},
      {"id": "red3", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [-12, 10, -8], "velocity": [6, -7, 2], "color": "#ff0000", "friction": 0, "restitution": 1},
      {"id": "red4", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [-6, 30, 8], "velocity": [-2, -9, 6], "color": "#ff0000", "friction": 0, "restitution": 1},
      {"id": "yellow1", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [10, 12, 3], "velocity": [-4, 8, -1], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow2", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [12, 18, -4], "velocity": [7, -5, 3], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow3", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [8, 27, 6], "velocity": [-6, 4, -8], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow4", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [14, 22, -2], "velocity": [3, 2, -9], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow5", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [6, 35, 7], "velocity": [9, -1, 5], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow6", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [16, 16, -9], "velocity": [-8, 6, -4], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow7", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [11, 29, 1], "velocity": [5, -3, -2], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow8", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [13, 33, -5], "velocity": [-3, -8, 7], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow9", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [9, 20, 4], "velocity": [6, 1, -6], "color": "#ffff00", "friction": 0, "restitution": 1},
      {"id": "yellow10", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [15, 24, 3], "velocity": [-1, -7, 8], "color": "#ffff00", "friction": 0, "restitution": 1}
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0, "restitution": 1},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": []
  },
  {
    "id": "gas-particles",
    "name": "Gas Particle System",
    "description": "Programmatically generated gas particles with Brownian motion. No individual JSON objects needed - particles generated based on parameters.",
  
    "objects": [
      {"id": "left-wall", "type": "Box", "mass": 0, "dimensions": [0.5, 10, 10], "position": [-5.25, 5, 0], "color": "#666666", "opacity": 0.1, "transparent": true, "isStatic": true},
      {"id": "right-wall", "type": "Box", "mass": 0, "dimensions": [0.5, 10, 10], "position": [5.25, 5, 0], "color": "#666666", "opacity": 0.1, "transparent": true, "isStatic": true},
      {"id": "front-wall", "type": "Box", "mass": 0, "dimensions": [10, 10, 0.5], "position": [0, 5, -5.25], "color": "#666666", "opacity": 0.1, "transparent": true, "isStatic": true},
      {"id": "back-wall", "type": "Box", "mass": 0, "dimensions": [10, 10, 0.5], "position": [0, 5, 5.25], "color": "#666666", "opacity": 0.1, "transparent": true, "isStatic": true},
      {"id": "top-wall", "type": "Box", "mass": 0, "dimensions": [10, 0.5, 10], "position": [0, 10.25, 0], "color": "#666666", "opacity": 0.1, "transparent": true, "isStatic": true},
      {"id": "bottom-wall", "type": "Box", "mass": 0, "dimensions": [10, 0.5, 10], "position": [0, -0.25, 0], "color": "#666666", "opacity": 0.1, "transparent": true, "isStatic": true}
    ],
  
    "particles": {
      "enabled": true,
      "count": 100,
      "type": "gas",
      "position": [0, 5, 0],
      "size": [10, 10, 10],
      "mass": 0.001,
      "radius": 0.15,
      "temperature": 10.0,
      "restitution": 0.9
    },
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0.1, "restitution": 0.9},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial",
    "controllers": [
      {"id": "particle_count", "label": "Particle Count", "type": "slider", "min": 10, "max": 200, "step": 10, "value": 100, "propertyPath": "particles.count"},
      {"id": "particle_radius", "label": "Particle Radius", "type": "slider", "min": 0.01, "max": 0.3, "step": 0.01, "value": 0.15, "propertyPath": "particles.radius"},
      {"id": "temperature", "label": "Temperature", "type": "slider", "min": 0, "max": 20, "step": 0.5, "value": 10.0, "propertyPath": "particles.temperature"},
      {"id": "volume_size", "label": "Volume Size", "type": "slider", "min": 5, "max": 20, "step": 1, "value": 10, "propertyPath": "particles.size[0]"}
    ]
  },
  {
    "id": "function-test-sphere-ring",
    "name": "Function Call Test: Sphere Ring",
    "description": "Demonstrates dynamic object generation using function calls. Creates 20 spheres arranged in a ring pattern.",
    "objects": [
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [30, 1, 30], "position": [0, -0.5, 0], "color": "#8B4513", "isStatic": true}
    ],
    "functionCalls": [
      {
        "name": "generateSphereArray",
        "parameters": {
          "count": 20,
          "center": [0, 5, 0],
          "radius": 0.3,
          "spread": 8,
          "mass": 1,
          "color": "#FF6347",
          "velocityVariation": 0
        }
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0.5, "restitution": 0.8},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial"
  }
];
