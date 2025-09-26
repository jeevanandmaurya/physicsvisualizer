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
    "name": "Basic Shapes Showcase",
    "description": "Introduction to physics shapes: sphere, box, and cylinder falling under gravity with realistic collisions.",
  "thumbnailUrl": allShapesThumb,
    "objects": [
      { "id": "sphere-1", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [0, 4, 0], "velocity": [0, 0, 0], "color": "#ff6347" },
      { "id": "box-1", "type": "Box", "mass": 1.5, "dimensions": [1, 1, 1], "position": [2, 4, 0], "velocity": [0, 0, 0], "color": "#32cd32" },
      { "id": "cylinder-1", "type": "Cylinder", "mass": 2, "radius": 0.5, "height": 1.5, "position": [-2, 4, 0], "velocity": [0, 0, 0], "color": "#4682b4" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 0.1, 20], "position": [0, 0, 0], "color": "#666666", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.5, "restitution": 0.7 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial",
    "controllers": [
      {
        "id": "gravity-x",
        "label": "Gravity X",
        "type": "slider",
        "min": -20,
        "max": 20,
        "step": 0.1,
        "value": 0,
        "propertyPath": "gravity[0]"
      },
      {
        "id": "gravity-y",
        "label": "Gravity Y",
        "type": "slider",
        "min": -20,
        "max": 20,
        "step": 0.1,
        "value": -9.81,
        "propertyPath": "gravity[1]"
      },
      {
        "id": "gravity-z",
        "label": "Gravity Z",
        "type": "slider",
        "min": -20,
        "max": 20,
        "step": 0.1,
        "value": 0,
        "propertyPath": "gravity[2]"
      },
      {
        "id": "sphere-mass",
        "label": "Sphere Mass",
        "type": "slider",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "value": 1,
        "objectId": "sphere-1",
        "property": "mass"
      },
      {
        "id": "box-mass",
        "label": "Box Mass",
        "type": "slider",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "value": 1.5,
        "objectId": "box-1",
        "property": "mass"
      },
      {
        "id": "cylinder-mass",
        "label": "Cylinder Mass",
        "type": "slider",
        "min": 0.1,
        "max": 5,
        "step": 0.1,
        "value": 2,
        "objectId": "cylinder-1",
        "property": "mass"
      },

    ]
  },
  {
    "id": "simple-pendulum",
    "name": "Simple Pendulum",
    "description": "Classic physics demonstration of a pendulum swinging under gravity, showing harmonic motion and conservation of energy.",
  "thumbnailUrl": emptyThumb,
    "objects": [
      { "id": "pivot", "type": "Sphere", "mass": 0, "radius": 0.1, "position": [0, 5, 0], "color": "#666666", "isStatic": true },
      { "id": "string", "type": "Cylinder", "mass": 0, "radius": 0.05, "height": 4, "position": [0, 3, 0], "rotation": [0, 0, 1.57], "color": "#8B4513", "isStatic": true },
      { "id": "bob", "type": "Sphere", "mass": 2, "radius": 0.3, "position": [0, 1, 0], "velocity": [3, 0, 0], "color": "#FFD700" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 0.1, 20], "position": [0, 0, 0], "color": "#666666", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.1, "restitution": 0.8 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "projectile-motion",
    "name": "Projectile Motion",
    "description": "Demonstrates parabolic trajectory of a projectile launched at an angle, showing the effects of gravity on motion.",
  "thumbnailUrl": projectileThumb,
    "objects": [
      { "id": "projectile", "type": "Sphere", "mass": 1, "radius": 0.2, "position": [0, 1, 0], "velocity": [8, 8, 0], "color": "#FF4500" },
      { "id": "launcher", "type": "Box", "mass": 0, "dimensions": [2, 0.5, 2], "position": [0, 0.25, 0], "color": "#8B4513", "isStatic": true },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [50, 0.1, 50], "position": [0, 0, 0], "color": "#666666", "isStatic": true },
      { "id": "target", "type": "Cylinder", "mass": 0, "radius": 0.5, "height": 2, "position": [20, 1, 0], "color": "#32CD32", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.3, "restitution": 0.6 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "conservation-momentum",
    "name": "Conservation of Momentum",
    "description": "Two carts collide on a frictionless track, demonstrating conservation of momentum and elastic collisions.",
  "thumbnailUrl": conservationThumb,
    "objects": [
      { "id": "track", "type": "Box", "mass": 0, "dimensions": [40, 1, 5], "position": [0, 1, 0], "color": "#90a4ae", "isStatic": true },
      { "id": "cart_left", "type": "Box", "mass": 20, "dimensions": [4, 2, 4], "position": [-10, 3, 0], "velocity": [40, 0, 0], "color": "#42a5f5" },
      { "id": "cart_right", "type": "Box", "mass": 2, "dimensions": [4, 2, 4], "position": [10, 3, 0], "velocity": [0, 0, 0], "color": "#ab47bc" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [50, 0.1, 50], "position": [0, 0, 0], "color": "#666666", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0, "restitution": 1 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "inclined-plane",
    "name": "Inclined Plane Experiment",
    "description": "Classic physics experiment showing how gravity affects motion on an inclined surface, demonstrating frictional forces.",
  "thumbnailUrl": inclinedThumb,
    "objects": [
      { "id": "ramp", "type": "Box", "mass": 0, "dimensions": [20, 1, 5], "position": [0, 2, 0], "rotation": [0, 0, -0.5], "color": "#8d6e63", "isStatic": true },
      { "id": "block", "type": "Box", "mass": 30, "dimensions": [2, 2, 2], "position": [-8, 8.5, 0], "rotation": [0, 0, -0.5], "color": "#ff7043" },
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [50, 0.1, 50], "position": [0, 0, 0], "color": "#666666", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0, "restitution": 0.2 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "kinetic_theory_no_gravity",
    "name": "Kinetic Theory (No Gravity)",
    "description": "Simulation demonstrating kinetic theory principles. Particles move freely without any external gravity or gravitational attraction between them, colliding elastically with the container walls.",
    "thumbnailUrl": kineticThumb,
    "objects": [
      {
        "id": "wall_bottom",
        "type": "Box",
        "mass": 0,
        "isStatic": true,
        "position": [0.00, -10.10, 0.00],
        "color": "#AAAAAA",
        "dimensions": [20.40, 0.20, 20.40]
      },
      {
        "id": "wall_top",
        "type": "Box",
        "mass": 0,
        "isStatic": true,
        "position": [0.00, 10.10, 0.00],
        "color": "#AAAAAA",
        "dimensions": [20.40, 0.20, 20.40]
      },
      {
        "id": "wall_front",
        "type": "Box",
        "mass": 0,
        "isStatic": true,
        "position": [0.00, 0.00, -10.10],
        "color": "#AAAAAA",
        "dimensions": [20.40, 20.40, 0.20]
      },
      {
        "id": "wall_back",
        "type": "Box",
        "mass": 0,
        "isStatic": true,
        "position": [0.00, 0.00, 10.10],
        "color": "#AAAAAA",
        "opacity": 0.2,
        "dimensions": [20.40, 20.40, 0.20]
      },
      {
        "id": "wall_left",
        "type": "Box",
        "mass": 0,
        "isStatic": true,
        "position": [-10.10, 0.00, 0.00],
        "color": "#AAAAAA",
        "dimensions": [0.20, 20.40, 20.40]
      },
      {
        "id": "wall_right",
        "type": "Box",
        "mass": 0,
        "isStatic": true,
        "position": [10.10, 0.00, 0.00],
        "color": "#AAAAAA",
        "dimensions": [0.20, 20.40, 20.40]
      },
      {
        "id": "ball_1",
        "type": "Sphere",
        "mass": 1,
        "position": [-2.82, 2.50, -2.72],
        "velocity": [-4.03, -0.82, -2.81],
        "color": "#ff6347",
        "radius": 0.40
      },
      {
        "id": "ball_2",
        "type": "Sphere",
        "mass": 1,
        "position": [1.85, 2.22, 2.53],
        "velocity": [0.01, 4.20, -2.68],
        "color": "#4682b4",
        "radius": 0.40
      },
      {
        "id": "ball_3",
        "type": "Sphere",
        "mass": 1,
        "position": [3.14, -0.70, 1.11],
        "velocity": [-3.45, 1.41, -3.46],
        "color": "#3cb371",
        "radius": 0.40
      },
      {
        "id": "ball_4",
        "type": "Sphere",
        "mass": 1,
        "position": [0.15, 0.48, 2.68],
        "velocity": [-0.10, 0.73, 4.95],
        "color": "#ffa500",
        "radius": 0.40
      },
      {
        "id": "ball_5",
        "type": "Sphere",
        "mass": 1,
        "position": [2.64, 4.02, -0.60],
        "velocity": [2.89, -3.69, -1.20],
        "color": "#9370db",
        "radius": 0.40
      },
      {
        "id": "ball_6",
        "type": "Sphere",
        "mass": 1,
        "position": [-4.00, -2.92, -0.05],
        "velocity": [0.89, 4.92, 0.60],
        "color": "#f08080",
        "radius": 0.40
      },
      {
        "id": "ball_7",
        "type": "Sphere",
        "mass": 1,
        "position": [0.34, -4.27, 3.47],
        "velocity": [4.83, 0.30, 1.38],
        "color": "#20b2aa",
        "radius": 0.40
      },
      {
        "id": "ball_8",
        "type": "Sphere",
        "mass": 1,
        "position": [-3.21, -1.33, 0.39],
        "velocity": [-1.20, 3.77, -3.09],
        "color": "#ba55d3",
        "radius": 0.40
      },
      {
        "id": "ball_9",
        "type": "Sphere",
        "mass": 1,
        "position": [2.03, 0.16, 4.20],
        "velocity": [1.14, -4.06, 2.70],
        "color": "#daa520",
        "radius": 0.40
      },
      {
        "id": "ball_10",
        "type": "Sphere",
        "mass": 1,
        "position": [-0.93, 3.59, -2.30],
        "velocity": [-0.67, 4.41, 2.03],
        "color": "#adff2f",
        "radius": 0.40
      }
    ],
    "gravity": [0.00, 0.00, 0.00],
    "hasGround": false,
    "contactMaterial": {
      "friction": 0.00,
      "restitution": 1.00
    },
    "gravitationalPhysics": {
      "enabled": false,
      "gravitationalConstant": 6.6743e-11,
      "minDistance": 1.00e-6,
      "softening": 0.00
    },
    "simulationScale": "terrestrial"
  },
  {
    "id": "solar-system-basics",
    "name": "Solar System Basics",
    "description": "Simplified solar system showing orbital mechanics with a central sun and orbiting planets.",
  "thumbnailUrl": solarThumb,
    "type": "extraterrestrial",
    "objects": [
      { "id": "sun", "type": "Sphere", "mass": 1000, "gravitationalMass": 10000, "position": [0, 0, 0], "radius": 8, "isStatic": true, "color": "#FDB813" },
      { "id": "mercury", "type": "Sphere", "mass": 0.055, "position": [15, 0, 0], "radius": 0.4, "velocity": [0, 0, 25], "color": "#8C7853" },
      { "id": "venus", "type": "Sphere", "mass": 0.815, "position": [-22, 0, 5], "radius": 0.95, "velocity": [-4, 0, -18], "color": "#FFC649" },
      { "id": "earth", "type": "Sphere", "mass": 1, "position": [0, 0, 30], "radius": 1, "velocity": [-15, 0, 0], "color": "#4169E1" },
      { "id": "mars", "type": "Sphere", "mass": 0.107, "position": [40, 0, -8], "radius": 0.53, "velocity": [2.5, 0, 12.5], "color": "#CD5C5C" }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": { "friction": 0.1, "restitution": 0.3 },
    "gravitationalPhysics": { "enabled": true, "gravitationalConstant": 1, "minDistance": 1, "softening": 0.1 },
    "simulationScale": "solar_system"
  },
  {
    "id": "rube-goldberg-simple",
    "name": "Simple Chain Reaction",
    "description": "A basic Rube Goldberg machine demonstrating sequential cause-and-effect physics interactions.",
  "thumbnailUrl": chainReactionThumb,
    "objects": [
      { "id": "base", "type": "Box", "mass": 0, "dimensions": [60, 1, 20], "position": [0, 0.5, 0], "color": "#7f8c8d", "isStatic": true },
      { "id": "start_ball", "type": "Sphere", "mass": 2, "position": [25, 1.5, 0], "velocity": [0, 0, 0], "color": "#e74c3c", "radius": 0.5 },
      { "id": "ramp", "type": "Box", "mass": 0, "dimensions": [10, 0.5, 4], "position": [20, 2, 0], "rotation": [0, 0, 0.3], "color": "#34495e", "isStatic": true },
      { "id": "domino_1", "type": "Box", "mass": 0.5, "dimensions": [0.4, 3, 2], "position": [10, 2.5, 0], "color": "#1abc9c" },
      { "id": "domino_2", "type": "Box", "mass": 0.5, "dimensions": [0.4, 3, 2], "position": [8, 2.5, 0], "color": "#3498db" },
      { "id": "domino_3", "type": "Box", "mass": 0.5, "dimensions": [0.4, 3, 2], "position": [6, 2.5, 0], "color": "#9b59b6" },
      { "id": "lever", "type": "Box", "mass": 1, "dimensions": [8, 0.4, 2], "position": [0, 2, 0], "color": "#c0392b" },
      { "id": "fulcrum", "type": "Cylinder", "mass": 0, "radius": 0.3, "height": 2, "position": [0, 1, 0], "color": "#2c3e50", "isStatic": true },
      { "id": "final_ball", "type": "Sphere", "mass": 1, "position": [-4, 2.5, 0], "color": "#f39c12", "radius": 0.3 }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.5, "restitution": 0.3 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "urban-planning",
    "name": "Urban Planning Physics",
    "description": "A simplified city scene showing realistic physics in an urban environment with moving vehicles and structures.",
  "thumbnailUrl": urbanThumb,
    "objects": [
      { "id": "ground", "type": "Box", "mass": 0, "dimensions": [60, 1, 40], "position": [0, 0.5, 0], "color": "#4B5563", "isStatic": true },
      { "id": "building_1", "type": "Box", "mass": 0, "dimensions": [8, 16, 8], "position": [-15, 8, 10], "color": "#5dade2", "isStatic": true },
      { "id": "building_2", "type": "Box", "mass": 0, "dimensions": [6, 12, 6], "position": [15, 6, -10], "color": "#f7dc6f", "isStatic": true },
      { "id": "car_1", "type": "Box", "mass": 5, "dimensions": [2, 1.2, 1.2], "position": [-20, 1, 5], "velocity": [3, 0, 0], "color": "#e74c3c" },
      { "id": "car_2", "type": "Box", "mass": 5, "dimensions": [2, 1.2, 1.2], "position": [20, 1, -5], "velocity": [-2.5, 0, 0], "color": "#3498db" },
      { "id": "park_bench", "type": "Box", "mass": 0, "dimensions": [3, 0.5, 1], "position": [0, 1, 8], "color": "#8B4513", "isStatic": true },
      { "id": "tree_trunk", "type": "Cylinder", "mass": 0, "radius": 0.3, "height": 4, "position": [5, 2, 12], "color": "#654321", "isStatic": true },
      { "id": "tree_leaves", "type": "Sphere", "mass": 0, "radius": 1.5, "position": [5, 4.5, 12], "color": "#228B22", "isStatic": true }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": { "friction": 0.6, "restitution": 0.3 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "stable-three-body",
    "name": "Stable Three-Body Problem",
    "description": "Three celestial bodies in a stable orbital configuration forming an equilateral triangle. Use controllers to test stability constraints and see when the system becomes unstable.",
    "thumbnailUrl": emptyThumb,
    "simulationScale": "extraterrestrial",
    "objects": [
      { "id": "star1", "type": "Sphere", "mass": 100, "radius": 2, "position": [0, 0, 0], "velocity": [0, 0.4, 0], "color": "#FFFF00" },
      { "id": "star2", "type": "Sphere", "mass": 10, "radius": 1, "position": [10, 0, 0], "velocity": [0, 0.4, 0], "color": "#FF0000" },
      { "id": "star3", "type": "Sphere", "mass": 10, "radius": 1, "position": [5, 8.66, 0], "velocity": [-0.3464, -0.2, 0], "color": "#00FF00" }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": { "friction": 0, "restitution": 0.5 },
    "gravitationalPhysics": { "enabled": true, "gravitationalConstant": 1, "minDistance": 1, "softening": 0.1 },
    "simulationScale": "solar_system",
    "controllers": [
      {
        "id": "star1-mass",
        "label": "Star 1 Mass (Yellow)",
        "type": "slider",
        "min": 50,
        "max": 120,
        "step": 5,
        "value": 100,
        "objectId": "star1",
        "property": "mass"
      },
      {
        "id": "star2-mass",
        "label": "Star 2 Mass (Red)",
        "type": "slider",
        "min": 5,
        "max": 50,
        "step": 1,
        "value": 10,
        "objectId": "star2",
        "property": "mass"
      },
      {
        "id": "star3-mass",
        "label": "Star 3 Mass (Green)",
        "type": "slider",
        "min": 5,
        "max": 50,
        "step": 1,
        "value": 10,
        "objectId": "star3",
        "property": "mass"
      },
      {
        "id": "star3-x-pos",
        "label": "Star 3 X Position",
        "type": "slider",
        "min": 3,
        "max": 7,
        "step": 0.1,
        "value": 5,
        "objectId": "star3",
        "property": "position[0]"
      },
      {
        "id": "star3-y-pos",
        "label": "Star 3 Y Position",
        "type": "slider",
        "min": 7,
        "max": 10,
        "step": 0.1,
        "value": 8.66,
        "objectId": "star3",
        "property": "position[1]"
      },
      {
        "id": "star1-velocity-x",
        "label": "Star 1 Velocity X",
        "type": "slider",
        "min": -1,
        "max": 1,
        "step": 0.1,
        "value": 0,
        "objectId": "star1",
        "property": "velocity[0]"
      },
      {
        "id": "star1-velocity-y",
        "label": "Star 1 Velocity Y",
        "type": "slider",
        "min": 0,
        "max": 1,
        "step": 0.1,
        "value": 0.4,
        "objectId": "star1",
        "property": "velocity[1]"
      },
      {
        "id": "gravitational-constant",
        "label": "Gravitational Constant",
        "type": "slider",
        "min": 0.5,
        "max": 2,
        "step": 0.1,
        "value": 1,
        "propertyPath": "gravitationalPhysics.gravitationalConstant"
      }
    ]
  }
];
