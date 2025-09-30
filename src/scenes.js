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
  {
    "id": "basic-shapes-showcase",
    "name": "✨ Prism Cascade - Shape Symphony",
    "description": "Beautiful cascade of physics shapes falling under gravity - watch as spheres, cubes, cylinders, cones, capsules, and tetrahedrons bounce and tumble with realistic collisions in this geometric masterpiece!",
    "thumbnailUrl": allShapesThumb,
    "objects": [
      { "id": "sphere-1", "type": "Sphere", "mass": 1.2, "radius": 0.6, "position": [-6, 8, 0], "velocity": [0, 0, 0], "color": "#ff4757" },
      { "id": "sphere-2", "type": "Sphere", "mass": 1.2, "radius": 0.6, "position": [-4, 9, 0], "velocity": [0, 0, 0], "color": "#ff3737" },
      { "id": "sphere-3", "type": "Sphere", "mass": 1.2, "radius": 0.6, "position": [-2, 10, 0], "velocity": [0, 0, 0], "color": "#ff6347" },
      { "id": "box-1", "type": "Box", "mass": 1.8, "dimensions": [1.2, 1.2, 1.2], "position": [0, 8.5, 0], "velocity": [0, 0, 0], "color": "#2c3e50" },
      { "id": "box-2", "type": "Box", "mass": 1.8, "dimensions": [1.2, 1.2, 1.2], "position": [1.5, 9.5, 0], "velocity": [0, 0, 0], "color": "#3498db" },
      { "id": "box-3", "type": "Box", "mass": 1.8, "dimensions": [1.2, 1.2, 1.2], "position": [3, 10.5, 0], "velocity": [0, 0, 0], "color": "#1e90ff" },
      { "id": "cylinder-1", "type": "Cylinder", "mass": 2.5, "radius": 0.5, "height": 2, "position": [6, 7.5, 0], "velocity": [0, 0, 0], "color": "#ffd700" },
      { "id": "cylinder-2", "type": "Cylinder", "mass": 2.5, "radius": 0.5, "height": 2, "position": [7.5, 8.5, 0], "velocity": [0, 0, 0], "color": "#ffb347" },
      { "id": "cylinder-3", "type": "Cylinder", "mass": 2.5, "radius": 0.5, "height": 2, "position": [9, 9.5, 0], "velocity": [0, 0, 0], "color": "#ffed4e" },
      { "id": "cone-1", "type": "Cone", "mass": 1.5, "radius": 0.7, "height": 1.8, "position": [-9, 6.5, 0], "velocity": [0, 0, 0], "color": "#e84393" },
      { "id": "cone-2", "type": "Cone", "mass": 1.5, "radius": 0.7, "height": 1.8, "position": [-10.5, 7.5, 0], "velocity": [0, 0, 0], "color": "#fd79a8" },
      { "id": "capsule-1", "type": "Capsule", "mass": 2.2, "radius": 0.4, "height": 1.5, "position": [12, 5.5, 0], "velocity": [0, 0, 0], "color": "#26de81" },
      { "id": "capsule-2", "type": "Capsule", "mass": 2.2, "radius": 0.4, "height": 1.5, "position": [13.5, 6.5, 0], "velocity": [0, 0, 0], "color": "#20bf6b" },
      { "id": "tetrahedron-1", "type": "ConvexPolyhedron", "mass": 1.8, "radius": 0.8, "position": [-15, 4.5, 0], "velocity": [0, 0, 0], "color": "#9c88ff" },
      { "id": "tetrahedron-2", "type": "ConvexPolyhedron", "mass": 1.8, "radius": 0.8, "position": [-16.5, 5.5, 0], "velocity": [0, 0, 0], "color": "#a29bfe" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [30, 2, 30], "position": [0, -1, 0], "color": "#2d3748", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.5, "restitution": 0.7 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      { "id": "gravity-x", "label": "Gravity X", "type": "slider", "min": -20, "max": 20, "step": 0.1, "value": 0, "propertyPath": "gravity[0]" },
      { "id": "gravity-y", "label": "Gravity Y", "type": "slider", "min": -20, "max": 20, "step": 0.1, "value": -9.81, "propertyPath": "gravity[1]" },
      { "id": "gravity-z", "label": "Gravity Z", "type": "slider", "min": -20, "max": 20, "step": 0.1, "value": 0, "propertyPath": "gravity[2]" },
      { "id": "sphere-mass", "label": "Sphere Mass", "type": "slider", "min": 0.1, "max": 5, "step": 0.1, "value": 1, "objectId": "sphere-1", "property": "mass" },
      { "id": "box-mass", "label": "Box Mass", "type": "slider", "min": 0.1, "max": 5, "step": 0.1, "value": 1.5, "objectId": "box-1", "property": "mass" },
      { "id": "cylinder-mass", "label": "Cylinder Mass", "type": "slider", "min": 0.1, "max": 5, "step": 0.1, "value": 2, "objectId": "cylinder-1", "property": "mass" },
      { "id": "cone-mass", "label": "Cone Mass", "type": "slider", "min": 0.1, "max": 5, "step": 0.1, "value": 1.2, "objectId": "cone-1", "property": "mass" },
      { "id": "capsule-mass", "label": "Capsule Mass", "type": "slider", "min": 0.1, "max": 5, "step": 0.1, "value": 1.8, "objectId": "capsule-1", "property": "mass" },
      { "id": "tetrahedron-mass", "label": "Tetrahedron Mass", "type": "slider", "min": 0.1, "max": 5, "step": 0.1, "value": 1.3, "objectId": "tetrahedron-1", "property": "mass" }
    ]
  },
  {
    "id": "simple-pendulum",
    "name": "Simple Pendulum - Revolute Joint",
    "description": "Classic physics demonstration using revolute joint - pendulum swinging under gravity, showing harmonic motion and conservation of energy.",
    "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "pivot", "type": "Sphere", "mass": 0, "radius": 0.2, "position": [0, 8, 0], "color": "#666666", "isStatic": true },
      { "id": "bob", "type": "Sphere", "mass": 2, "radius": 0.4, "position": [3.5, 1.938, 0], "velocity": [0, 0, 0], "color": "#FFD700" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 0.2, 20], "position": [0, -0.1, 0], "color": "#666666", "isStatic": true }
    ],
    "joints": [
      {
        "bodyA": "pivot",
        "bodyB": "bob",
        "type": "revolute",
        "anchorA": [0, 0, 0],
        "anchorB": [-3.5, 6.062, 0],
        "axis": [0, 0, 1]
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.01, "restitution": 0.9 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "initial-angle",
        "label": "Initial Angle (degrees)",
        "type": "slider",
        "min": -90,
        "max": 90,
        "step": 5,
        "value": 30,
        "objectId": "bob",
        "property": "position[0]",
        "recreatesJoints": true
      },
      {
        "id": "pendulum-mass",
        "label": "Pendulum Mass",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 2,
        "objectId": "bob",
        "property": "mass"
      },
      {
        "id": "pendulum-length",
        "label": "Pendulum Length",
        "type": "slider",
        "min": 1,
        "max": 5,
        "step": 0.5,
        "value": 2,
        "objectId": "bob",
        "property": "position[1]"
      },
      {
        "id": "pendulum-x-velocity",
        "label": "X Velocity",
        "type": "slider",
        "min": -10,
        "max": 10,
        "step": 0.5,
        "value": 0,
        "objectId": "bob",
        "property": "velocity[0]"
      },
      {
        "id": "pendulum-y-velocity",
        "label": "Y Velocity",
        "type": "slider",
        "min": -10,
        "max": 10,
        "step": 0.5,
        "value": 0,
        "objectId": "bob",
        "property": "velocity[1]"
      },
      {
        "id": "pendulum-z-velocity",
        "label": "Z Velocity",
        "type": "slider",
        "min": -10,
        "max": 10,
        "step": 0.5,
        "value": 0,
        "objectId": "bob",
        "property": "velocity[2]"
      }
    ]
  },
  {
    "id": "double-pendulum",
    "name": "🎪 Double Pendulum - Chaotic Motion",
    "description": "A double pendulum exhibiting chaotic behavior and sensitive dependence on initial conditions. Small changes in starting angle create dramatically different motion patterns - the essence of chaos theory!",
    "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "fixed-anchor", "type": "Sphere", "mass": 0, "radius": 0.05, "position": [0, 8, 0], "color": "#333333", "isStatic": true },
      { "id": "upper-mass", "type": "Sphere", "mass": 3, "radius": 0.4, "position": [2, 6, 0], "velocity": [0, 0, 0], "color": "#e74c3c" },
      { "id": "lower-mass", "type": "Sphere", "mass": 2, "radius": 0.35, "position": [4, 3, 0], "velocity": [0, 0, 0], "color": "#3498db" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [15, 0.2, 15], "position": [0, -0.1, 0], "color": "#2d3748", "isStatic": true }
    ],
    "joints": [
      {
        "bodyA": "fixed-anchor",
        "bodyB": "upper-mass",
        "type": "revolute",
        "anchorA": [0, 0, 0],
        "anchorB": [-2, 2, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "upper-mass",
        "bodyB": "lower-mass",
        "type": "revolute",
        "anchorA": [0, 0, 0],
        "anchorB": [-2, 3, 0],
        "axis": [0, 0, 1]
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.1, "restitution": 0.3 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "upper-mass-knob",
        "label": "Upper Mass",
        "type": "slider",
        "min": 1,
        "max": 10,
        "step": 0.1,
        "value": 3,
        "objectId": "upper-mass",
        "property": "mass"
      },
      {
        "id": "lower-mass-knob",
        "label": "Lower Mass",
        "type": "slider",
        "min": 0.5,
        "max": 8,
        "step": 0.1,
        "value": 2,
        "objectId": "lower-mass",
        "property": "mass"
      },
      {
        "id": "upper-angle",
        "label": "Upper Angle (degrees)",
        "type": "slider",
        "min": -90,
        "max": 90,
        "step": 5,
        "value": 30,
        "objectId": "upper-mass",
        "property": "position[0]",
        "recreatesJoints": true
      },
      {
        "id": "lower-angle",
        "label": "Lower Angle (degrees)",
        "type": "slider",
        "min": -90,
        "max": 90,
        "step": 5,
        "value": 30,
        "objectId": "lower-mass",
        "property": "position[0]",
        "recreatesJoints": true
      },
      {
        "id": "gravity-strength",
        "label": "Gravity Strength",
        "type": "slider",
        "min": -15,
        "max": -1,
        "step": 0.5,
        "value": -9.81,
        "propertyPath": "gravity[1]"
      }
    ]
  },
  {
    "id": "constrained-mass-system",
    "name": "🔗 Constrained Mass System - Rigid Connections",
    "description": "Five masses connected by rigid distance constraints demonstrating constrained motion systems. Study how rigid constraints affect motion and how energy transfers through connected bodies. Explore different mass ratios and initial conditions.",
    "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "mass-1", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [-6, 5, 0], "velocity": [0, 0, 0], "color": "#FF6B6B" },
      { "id": "mass-2", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [-3, 5, 0], "velocity": [0, 0, 0], "color": "#4ECDC4" },
      { "id": "mass-3", "type": "Sphere", "mass": 3, "radius": 0.3, "position": [0, 5, 0], "velocity": [0, 0, 0], "color": "#45B7D1" },
      { "id": "mass-4", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [3, 5, 0], "velocity": [0, 0, 0], "color": "#96CEB4" },
      { "id": "mass-5", "type": "Sphere", "mass": 1, "radius": 0.3, "position": [6, 5, 0], "velocity": [15, 0, 0], "color": "#FFEAA7" },
      { "id": "wall-left", "type": "Box", "mass": 0, "dimensions": [0.5, 10, 10], "position": [-9, 5, 0], "color": "#2d3748", "isStatic": true },
      { "id": "wall-right", "type": "Box", "mass": 0, "dimensions": [0.5, 10, 10], "position": [9, 5, 0], "color": "#2d3748", "isStatic": true },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 0.2, 20], "position": [0, -0.1, 0], "color": "#666666", "isStatic": true }
    ],
    "joints": [
      {
        "bodyA": "wall-left",
        "bodyB": "mass-1",
        "type": "distance",
        "anchorA": [0.25, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 3.0
      },
      {
        "bodyA": "mass-1",
        "bodyB": "mass-2",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 3.0
      },
      {
        "bodyA": "mass-2",
        "bodyB": "mass-3",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 3.0
      },
      {
        "bodyA": "mass-3",
        "bodyB": "mass-4",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 3.0
      },
      {
        "bodyA": "mass-4",
        "bodyB": "mass-5",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 3.0
      },
      {
        "bodyA": "mass-5",
        "bodyB": "wall-right",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [-0.25, 0, 0],
        "distance": 3.0
      }
    ],
    "gravity": [0, -4.9, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.1, "restitution": 0.1 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "mass-1-value",
        "label": "Mass 1",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 1,
        "objectId": "mass-1",
        "property": "mass"
      },
      {
        "id": "mass-2-value",
        "label": "Mass 2",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 2,
        "objectId": "mass-2",
        "property": "mass"
      },
      {
        "id": "mass-3-value",
        "label": "Mass 3",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 3,
        "objectId": "mass-3",
        "property": "mass"
      },
      {
        "id": "mass-4-value",
        "label": "Mass 4",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 2,
        "objectId": "mass-4",
        "property": "mass"
      },
      {
        "id": "mass-5-value",
        "label": "Mass 5",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 1,
        "objectId": "mass-5",
        "property": "mass"
      },
      {
        "id": "constraint-length",
        "label": "Constraint Length",
        "type": "slider",
        "min": 2.0,
        "max": 4.0,
        "step": 0.1,
        "value": 3.0,
        "propertyPath": "joints[*].distance"
      },
      {
        "id": "initial-velocity",
        "label": "Mass-5 Initial Velocity",
        "type": "slider",
        "min": 0,
        "max": 30,
        "step": 1,
        "value": 15,
        "objectId": "mass-5",
        "property": "velocity[0]"
      }
    ]
  },
  {
    "id": "newtons-cradle",
    "name": "⚖️ Newton's Cradle - Conservation Demo",
    "description": "Newton's cradle demonstrating conservation of momentum and energy. The kinetic energy transfers from ball to ball, showcasing perfectly elastic collisions and the physics of conservation laws in action.",
    "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "pivot", "type": "Box", "mass": 0, "dimensions": [12, 0.5, 0.5], "position": [0, 4, 0], "color": "#2d3748", "isStatic": true },
      { "id": "ball-1", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [-2.5, 1.5, 0], "velocity": [0, 0, 0], "color": "#ff4757" },
      { "id": "ball-2", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [-1.5, 1.5, 0], "velocity": [0, 0, 0], "color": "#5352ed" },
      { "id": "ball-3", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [-0.5, 1.5, 0], "velocity": [0, 0, 0], "color": "#3742fa" },
      { "id": "ball-4", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [0.5, 1.5, 0], "velocity": [0, 0, 0], "color": "#5352ed" },
      { "id": "ball-5", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [1.5, 1.5, 0], "velocity": [0, 0, 0], "color": "#3742fa" },
      { "id": "ball-6", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [2.5, 1.5, 0], "velocity": [20, 0, 0], "color": "#ff4757" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [15, 0.2, 15], "position": [0, -0.1, 0], "color": "#666666", "isStatic": true }
    ],
    "joints": [
      {
        "bodyA": "pivot",
        "bodyB": "ball-1",
        "type": "revolute",
        "anchorA": [-2.5, 0, 0],
        "anchorB": [0, 2.5, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "pivot",
        "bodyB": "ball-2",
        "type": "revolute",
        "anchorA": [-1.5, 0, 0],
        "anchorB": [0, 2.5, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "pivot",
        "bodyB": "ball-3",
        "type": "revolute",
        "anchorA": [-0.5, 0, 0],
        "anchorB": [0, 2.5, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "pivot",
        "bodyB": "ball-4",
        "type": "revolute",
        "anchorA": [0.5, 0, 0],
        "anchorB": [0, 2.5, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "pivot",
        "bodyB": "ball-5",
        "type": "revolute",
        "anchorA": [1.5, 0, 0],
        "anchorB": [0, 2.5, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "pivot",
        "bodyB": "ball-6",
        "type": "revolute",
        "anchorA": [2.5, 0, 0],
        "anchorB": [0, 2.5, 0],
        "axis": [0, 0, 1]
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.1, "restitution": 0.99 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "ball-mass",
        "label": "Ball Mass",
        "type": "slider",
        "min": 0.5,
        "max": 5,
        "step": 0.1,
        "value": 2,
        "propertyPath": "objects[ball-*].mass"
      },
      {
        "id": "rest-length",
        "label": "String Length",
        "type": "slider",
        "min": 1.0,
        "max": 3.0,
        "step": 0.1,
        "value": 2.5,
        "propertyPath": "joints[*].anchorB[1]"
      },
      {
        "id": "restitution",
        "label": "Collision Elasticity",
        "type": "slider",
        "min": 0.8,
        "max": 1.0,
        "step": 0.01,
        "value": 0.99,
        "propertyPath": "contactMaterial.restitution"
      },
      {
        "id": "initial-velocity",
        "label": "Right Ball Velocity",
        "type": "slider",
        "min": 0,
        "max": 30,
        "step": 1,
        "value": 20,
        "objectId": "ball-6",
        "property": "velocity[0]"
      }
    ]
  },
  {
    "id": "robotic-arm",
    "name": "🤖 Robotic Arm - Forward Kinematics",
    "description": "Programmable 3-segment robotic arm with revolute joints. Study forward and inverse kinematics, demonstrating how joint angles determine end effector position. Perfect for understanding robotic manipulation and spatial positioning.",
    "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "base", "type": "Cylinder", "mass": 0, "radius": 0.3, "height": 0.8, "position": [0, 0, 0], "color": "#2d3748", "isStatic": true },
      { "id": "segment-1", "type": "Box", "mass": 4, "dimensions": [3, 0.2, 0.2], "position": [1.5, 0.4, 0], "color": "#e74c3c" },
      { "id": "segment-2", "type": "Box", "mass": 3, "dimensions": [2.5, 0.2, 0.2], "position": [4.25, 0.4, 0], "color": "#f39c12" },
      { "id": "segment-3", "type": "Box", "mass": 2, "dimensions": [2, 0.2, 0.2], "position": [6.5, 0.4, 0], "color": "#27ae60" },
      { "id": "end-effector", "type": "Box", "mass": 1, "dimensions": [0.8, 0.8, 0.5], "position": [7.9, 0.4, 0], "color": "#8e44ad" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [15, 0.1, 15], "position": [0, -0.05, 0], "color": "#95a5a6", "isStatic": true }
    ],
    "joints": [
      {
        "bodyA": "base",
        "bodyB": "segment-1",
        "type": "revolute",
        "anchorA": [0, 0.4, 0],
        "anchorB": [-1.5, 0, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "segment-1",
        "bodyB": "segment-2",
        "type": "revolute",
        "anchorA": [1.5, 0, 0],
        "anchorB": [-1.25, 0, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "segment-2",
        "bodyB": "segment-3",
        "type": "revolute",
        "anchorA": [1.25, 0, 0],
        "anchorB": [-1.0, 0, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "segment-3",
        "bodyB": "end-effector",
        "type": "revolute",
        "anchorA": [1.0, 0, 0],
        "anchorB": [-0.4, 0, 0],
        "axis": [0, 0, 1]
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.5, "restitution": 0.1 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "joint-1-angle",
        "label": "Joint 1 Angle (deg)",
        "type": "slider",
        "min": -180,
        "max": 180,
        "step": 5,
        "value": 0,
        "propertyPath": "joints[0].angle"
      },
      {
        "id": "joint-2-angle",
        "label": "Joint 2 Angle (deg)",
        "type": "slider",
        "min": -180,
        "max": 180,
        "step": 5,
        "value": 45,
        "propertyPath": "joints[1].angle"
      },
      {
        "id": "joint-3-angle",
        "label": "Joint 3 Angle (deg)",
        "type": "slider",
        "min": -180,
        "max": 180,
        "step": 5,
        "value": 45,
        "propertyPath": "joints[2].angle"
      },
      {
        "id": "joint-4-angle",
        "label": "Joint 4 Angle (deg)",
        "type": "slider",
        "min": -180,
        "max": 180,
        "step": 5,
        "value": 0,
        "propertyPath": "joints[3].angle"
      },
      {
        "id": "segment-mass-1",
        "label": "Segment 1 Mass",
        "type": "slider",
        "min": 1,
        "max": 10,
        "step": 0.5,
        "value": 4,
        "objectId": "segment-1",
        "property": "mass"
      },
      {
        "id": "segment-mass-2",
        "label": "Segment 2 Mass",
        "type": "slider",
        "min": 1,
        "max": 8,
        "step": 0.5,
        "value": 3,
        "objectId": "segment-2",
        "property": "mass"
      }
    ]
  },
  {
    "id": "catenary-cable",
    "name": "🌉 Catenary Cable - Suspension Bridge",
    "description": "Demonstrates the mathematical catenary curve - the shape a hanging flexible cable assumes under gravity. Study structural engineering principles and the physics of tension in suspended systems.",
    "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "tower-left", "type": "Box", "mass": 0, "dimensions": [0.2, 6, 0.2], "position": [-7, 3, 0], "color": "#34495e", "isStatic": true },
      { "id": "tower-right", "type": "Box", "mass": 0, "dimensions": [0.2, 6, 0.2], "position": [7, 3, 0], "color": "#34495e", "isStatic": true },
      { "id": "node-1", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [-6, 4, 0], "color": "#e74c3c", "isStatic": false },
      { "id": "node-2", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [-4, 2.5, 0], "color": "#f39c12" },
      { "id": "node-3", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [-2, 1.8, 0], "color": "#f1c40f" },
      { "id": "node-4", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [0, 1.8, 0], "color": "#27ae60" },
      { "id": "node-5", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [2, 1.8, 0], "color": "#3498db" },
      { "id": "node-6", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [4, 2.5, 0], "color": "#9b59b6" },
      { "id": "node-7", "type": "Sphere", "mass": 0.1, "radius": 0.1, "position": [6, 4, 0], "color": "#e67e22" },
      { "id": "load-1", "type": "Box", "mass": 5, "dimensions": [0.8, 0.2, 0.2], "position": [-4, 1, 0], "color": "#e74c3c" },
      { "id": "load-2", "type": "Box", "mass": 3, "dimensions": [0.6, 0.2, 0.2], "position": [0, 0.5, 0], "color": "#f39c12" },
      { "id": "load-3", "type": "Box", "mass": 4, "dimensions": [0.7, 0.2, 0.2], "position": [4, 1, 0], "color": "#27ae60" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 0.2, 20], "position": [0, -0.1, 0], "color": "#666666", "isStatic": true }
    ],
    "joints": [
      {
        "bodyA": "tower-left",
        "bodyB": "node-1",
        "type": "revolute",
        "anchorA": [1, 1, 0],
        "anchorB": [0, 0, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "node-1",
        "bodyB": "node-2",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 2.5
      },
      {
        "bodyA": "node-2",
        "bodyB": "node-3",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 2.5
      },
      {
        "bodyA": "node-3",
        "bodyB": "node-4",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 2.5
      },
      {
        "bodyA": "node-4",
        "bodyB": "node-5",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 2.5
      },
      {
        "bodyA": "node-5",
        "bodyB": "node-6",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 2.5
      },
      {
        "bodyA": "node-6",
        "bodyB": "node-7",
        "type": "distance",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 0, 0],
        "distance": 2.5
      },
      {
        "bodyA": "tower-right",
        "bodyB": "node-7",
        "type": "revolute",
        "anchorA": [-1, 1, 0],
        "anchorB": [0, 0, 0],
        "axis": [0, 0, 1]
      },
      {
        "bodyA": "node-2",
        "bodyB": "load-1",
        "type": "spherical",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 1.5, 0]
      },
      {
        "bodyA": "node-4",
        "bodyB": "load-2",
        "type": "spherical",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 1.3, 0]
      },
      {
        "bodyA": "node-6",
        "bodyB": "load-3",
        "type": "spherical",
        "anchorA": [0, 0, 0],
        "anchorB": [0, 1.5, 0]
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.3, "restitution": 0.2 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "cable-tension",
        "label": "Cable Tension (Distance Constraint)",
        "type": "slider",
        "min": 1.5,
        "max": 4.0,
        "step": 0.1,
        "value": 2.5,
        "propertyPath": "joints[node-*|node-*].distance"
      },
      {
        "id": "load-mass-1",
        "label": "Load 1 Mass",
        "type": "slider",
        "min": 1,
        "max": 10,
        "step": 0.5,
        "value": 5,
        "objectId": "load-1",
        "property": "mass"
      },
      {
        "id": "load-mass-2",
        "label": "Load 2 Mass",
        "type": "slider",
        "min": 1,
        "max": 10,
        "step": 0.5,
        "value": 3,
        "objectId": "load-2",
        "property": "mass"
      },
      {
        "id": "load-mass-3",
        "label": "Load 3 Mass",
        "type": "slider",
        "min": 1,
        "max": 10,
        "step": 0.5,
        "value": 4,
        "objectId": "load-3",
        "property": "mass"
      }
    ]
  }
];