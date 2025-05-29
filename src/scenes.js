export const mechanicsExamples = [
  // Basic physics demonstrations (no individual gravitation needed)
  {
    "id": "all-shapes-scene",
    "name": "All Shapes Scene",
    "description": "A scene with all supported physics shapes interacting dynamically with standard gravity and collision physics.",
    "objects": [
      {
        "id": "sphere-1",
        "type": "Sphere",
        "mass": 1,
        "radius": 0.5,
        "position": [0, 4, 0],
        "velocity": [0, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#ff6347",
        "restitution": 0.7,
        "friction": 0.4
      },
      {
        "id": "box-1",
        "type": "Box",
        "mass": 1.5,
        "dimensions": [1, 1, 1],
        "position": [2, 4, 0],
        "velocity": [0, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#32cd32",
        "restitution": 0.8,
        "friction": 0.5
      },
      {
        "id": "cylinder-1",
        "type": "Cylinder",
        "mass": 2,
        "radius": 0.5,
        "height": 1.5,
        "position": [-2, 4, 0],
        "velocity": [0, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#4682b4",
        "restitution": 0.6,
        "friction": 0.3
      },
      {
        "id": "ground",
        "type": "Box",
        "mass": 0,
        "dimensions": [20, 0.1, 20],
        "position": [0, 0, 0],
        "velocity": [0, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "white",
        "restitution": 0.8,
        "friction": 0.6,
        "isStatic": true
      }
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {
      "friction": 0.5,
      "restitution": 0.7
    },
    "simulationScale": "terrestrial"
  },
  {
    "id": "circular-orbital-system",
    "name": "Circular Orbital System",
    "description": "Balls in stable circular orbits around a central massive object demonstrating Kepler's laws.",
    "objects": [
      {
        "id": "central-mass",
        "type": "Sphere",
        "mass": 100,
        "radius": 2.0,
        "position": [0, 0, 0],
        "velocity": [0, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#FFD700",
        "restitution": 0.9,
        "friction": 0.1,
        "gravitationalMass": 100,
        "isStatic": true
      },
      {
        "id": "ball-0",
        "type": "Sphere",
        "mass": 0.1,
        "radius": 0.4,
        "position": [8.000, 0, 0.000],
        "velocity": [0, 0, 3.536],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#ff6347",
        "restitution": 1,
        "friction": 0,
        "gravitationalMass": 0.1
      },
      {
        "id": "ball-1",
        "type": "Sphere",
        "mass": 0.1,
        "radius": 0.4,
        "position": [6.472, 0, 4.708],
        "velocity": [-1.667, 0, 2.291],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#32cd32",
        "restitution": 1,
        "friction": 0,
        "gravitationalMass": 0.1
      },
      {
        "id": "ball-2",
        "type": "Sphere",
        "mass": 0.1,
        "radius": 0.4,
        "position": [2.472, 0, 7.611],
        "velocity": [-2.693, 0, 0.875],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#4169e1",
        "restitution": 1,
        "friction": 0,
        "gravitationalMass": 0.1
      },
      {
        "id": "ball-3",
        "type": "Sphere",
        "mass": 0.1,
        "radius": 0.4,
        "position": [-2.472, 0, 7.611],
        "velocity": [-2.693, 0, -0.875],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#ff1493",
        "restitution": 1,
        "friction": 0,
        "gravitationalMass": 0.1
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {
      "friction": 0,
      "restitution": 1
    },
    "gravitationalPhysics": {
      "enabled": true,
      "gravitationalConstant": 1,
      "minDistance": 0.1,
      "softening": 0.05
    },
    "simulationScale": "terrestrial"
  },
  {
    "id": "binary-star-system",
    "name": "Binary Star System with Planets",
    "description": "Two massive stars orbiting each other with smaller planets in complex gravitational dance.",
    "objects": [
      {
        "id": "star-a",
        "type": "Sphere",
        "mass": 10000,
        "radius": 25,
        "position": [-15, 0, 0],
        "velocity": [0, 8, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0.1, 0],
        "color": "#FFD700",
        "restitution": 0.9,
        "friction": 0.1,
        "gravitationalMass": 10000
      },
      {
        "id": "star-b",
        "type": "Sphere",
        "mass": 8000,
        "radius": 22,
        "position": [18.75, 0, 0],
        "velocity": [0, -10, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, -0.12, 0],
        "color": "#FF4500",
        "restitution": 0.9,
        "friction": 0.1,
        "gravitationalMass": 8000
      },
      {
        "id": "planet-1",
        "type": "Sphere",
        "mass": 0.1,
        "radius": 2,
        "position": [-30, 0, 0],
        "velocity": [0, 6, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 1, 0],
        "color": "#4169E1",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 0.1
      },
      {
        "id": "planet-2",
        "type": "Sphere",
        "mass": 0.15,
        "radius": 2.2,
        "position": [35, 0, 0],
        "velocity": [0, -7, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, -0.8, 0],
        "color": "#B22222",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 0.15
      },
      {
        "id": "asteroid",
        "type": "Sphere",
        "mass": 0.01,
        "radius": 0.8,
        "position": [0, 25, 0],
        "velocity": [4, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [2, 3, 1],
        "color": "#696969",
        "restitution": 0.5,
        "friction": 0.4,
        "gravitationalMass": 0.01
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {
      "friction": 0.2,
      "restitution": 0.8
    },
    "gravitationalPhysics": {
      "enabled": true,
      "gravitationalConstant": 1,
      "minDistance": 1.0,
      "softening": 0.5
    },
    "simulationScale": "solar_system"
  },
  {
    "id": "solar-system",
    "name": "Scaled Solar System",
    "description": "A simplified, scaled-down representation of the inner solar system with proper orbital velocities for G=1.",
    "objects": [
      {
        "id": "sun",
        "type": "Sphere",
        "mass": 100000,
        "radius": 80,
        "position": [0, 0, 0],
        "velocity": [0, 0, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#FFD700",
        "restitution": 0.7,
        "friction": 0.1,
        "gravitationalMass": 100000
      },
      {
        "id": "mercury",
        "type": "Sphere",
        "mass": 0.055,
        "radius": 12,
        "position": [120, 0, 0],
        "velocity": [0, 91.3, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#A9A9A9",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 0.055
      },
      {
        "id": "venus",
        "type": "Sphere",
        "mass": 0.815,
        "radius": 18,
        "position": [200, 0, 0],
        "velocity": [0, 70.7, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#FFDAB9",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 0.815
      },
      {
        "id": "earth",
        "type": "Sphere",
        "mass": 1,
        "radius": 15,
        "position": [300, 0, 0],
        "velocity": [0, 57.7, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#4169E1",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 1
      },
      {
        "id": "mars",
        "type": "Sphere",
        "mass": 0.107,
        "radius": 12,
        "position": [450, 0, 0],
        "velocity": [0, 47.1, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#B22222",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 0.107
      },
      {
        "id": "jupiter",
        "type": "Sphere",
        "mass": 318,
        "radius": 40,
        "position": [800, 0, 0],
        "velocity": [0, 35.4, 0],
        "rotation": [0, 0, 0],
        "angularVelocity": [0, 0, 0],
        "color": "#DAA520",
        "restitution": 0.7,
        "friction": 0.3,
        "gravitationalMass": 318
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {
      "friction": 0.1,
      "restitution": 0.9
    },
    "gravitationalPhysics": {
      "enabled": true,
      "gravitationalConstant": 1,
      "minDistance": 1.0,
      "softening": 0.1
    },
    "simulationScale": "solar_system"
  }
];