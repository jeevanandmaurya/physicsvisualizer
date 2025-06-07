export const mechanicsExamples = [
  {
    "id": "all-shapes-scene",
    "name": "All Shapes (Standard Gravity)",
    "description": "A scene with all supported physics shapes interacting with standard Earth-like gravity. Inter-object gravitational attraction is disabled.",
    "objects": [
      {"id": "sphere-1", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [0, 4, 0], "velocity": [0, 0, 0], "color": "#ff6347"},
      {"id": "box-1", "type": "Box", "mass": 1.5, "dimensions": [1, 1, 1], "position": [2, 4, 0], "velocity": [0, 0, 0], "color": "#32cd32"},
      {"id": "cylinder-1", "type": "Cylinder", "mass": 2, "radius": 0.5, "height": 1.5, "position": [-2, 4, 0], "velocity": [0, 0, 0], "color": "#4682b4"},
      {"id": "ground", "type": "Box", "mass": 0, "dimensions": [20, 0.1, 20], "position": [0, 0, 0], "color": "white", "isStatic": true}
    ],
    "gravity": [0, -9.81, 0],
    "hasGround": true,
    "contactMaterial": {"friction": 0.5, "restitution": 0.7},
    "gravitationalPhysics": {"enabled": false},
    "simulationScale": "terrestrial"
  },
  {
    "id": "cartoon-planet-moon-system",
    "name": "Cartoon Planet-Moon System",
    "description": "A lightweight 'moon' orbits a 'planet'. The gravitational constant is scaled up to make the interaction visible with smaller masses and distances.",
    "objects": [
      {
        "id": "planet", "type": "Sphere", "mass": 10000, "radius": 15, "position": [0, 0, 0], "velocity": [0, 0, 0], "color": "#4169e1", "isStatic": true
      },
      {
        "id": "moon", "type": "Sphere", "mass": 1, "radius": 5, "position": [100, 0, 0], "velocity": [0, 40, 0], "color": "#c0c0c0"
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0.1, "restitution": 0.9},
    "gravitationalPhysics": {
      "enabled": true, "gravitationalConstant": 10, "minDistance": 1, "softening": 0.1
    },
    "simulationScale": "terrestrial"
  },
  {
    "id": "cartoon-sun-planet-moon",
    "name": "Sun, Planet & Moon System",
    "description": "A satellite orbits a planet, which in turn orbits a central, fixed sun. This demonstrates a hierarchical orbital system.",
    "objects": [
      {
        "id": "sun", "type": "Sphere", "mass": 10000, "radius": 10, "position": [0, 0, 0], "velocity": [0, 0, 0], "color": "#FFD700", "isStatic": true
      },
      {
        "id": "planet", "type": "Sphere", "mass": 100, "radius": 3, "position": [150, 0, 0], "velocity": [0, 44.72, 0], "color": "#4682b4"
      },
      {
        "id": "moon", "type": "Sphere", "mass": 1, "radius": 0.5, "position": [160, 0, 0], "velocity": [0, 54.72, 0], "color": "#c0c0c0"
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0.1, "restitution": 0.9},
    "gravitationalPhysics": {
      "enabled": true, "gravitationalConstant": 10, "minDistance": 1, "softening": 0.1
    },
    "simulationScale": "solar_system"
  },
  {
    "id": "cartoon-binary-system",
    "name": "Cartoon Binary System",
    "description": "Two 'stars' with different masses orbit their common center of mass. Their velocities are balanced to maintain a stable, visually clear elliptical dance.",
    "objects": [
      {
        "id": "star-a", "type": "Sphere", "mass": 1000, "radius": 3, "position": [-10, 0, 0], "velocity": [0, 5, 0], "color": "#FFD700"
      },
      {
        "id": "star-b", "type": "Sphere", "mass": 1000, "radius": 3, "position": [10, 0, 0], "velocity": [0, -5, 0], "color": "#FF4500"
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0.2, "restitution": 0.8},
    "gravitationalPhysics": {
      "enabled": true, "gravitationalConstant": 1, "minDistance": 1, "softening": 0.1
    },
    "simulationScale": "solar_system"
  },
  {
    "id": "cartoon-solar-system",
    "name": "Cartoon Solar System",
    "description": "A simplified 'solar system' with several planets orbiting a central star. The scaled physics makes Kepler's laws (faster inner planets) easy to see.",
    "objects": [
      {
        "id": "sun", "type": "Sphere", "mass": 1000, "radius": 5, "position": [0, 0, 0], "velocity": [0, 0, 0], "color": "#FFD700", "isStatic": true
      },
      {
        "id": "planet-a", "type": "Sphere", "mass": 10, "radius": 1, "position": [20, 0, 0], "velocity": [0, 15.8, 0], "color": "#B22222"
      },
      {
        "id": "planet-b", "type": "Sphere", "mass": 15, "radius": 1.5, "position": [40, 0, 0], "velocity": [0, 11.2, 0], "color": "#4169E1"
      },
      {
        "id": "planet-c", "type": "Sphere", "mass": 20, "radius": 2, "position": [60, 0, 0], "velocity": [0, 9.1, 0], "color": "#32cd32"
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {"friction": 0.1, "restitution": 0.9},
    "gravitationalPhysics": {
      "enabled": true, "gravitationalConstant": 5, "minDistance": 1, "softening": 0.1
    },
    "simulationScale": "solar_system"
  }
];