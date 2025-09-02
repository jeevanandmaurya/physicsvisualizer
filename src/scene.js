export const mechanicsExamples = [
  {
    "id": "basic-shapes-showcase",
    "name": "Basic Shapes Showcase",
    "description": "Introduction to physics shapes: sphere, box, and cylinder falling under gravity with realistic collisions.",
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
    "simulationScale": "terrestrial"
  },
  {
    "id": "simple-pendulum",
    "name": "Simple Pendulum",
    "description": "Classic physics demonstration of a pendulum swinging under gravity, showing harmonic motion and conservation of energy.",
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
    "id": "kinetic-theory",
    "name": "Kinetic Theory Demonstration",
    "description": "Particles in a sealed container demonstrating kinetic theory - they move freely and elastically collide with walls.",
    "objects": [
      { "id": "wall_bottom", "type": "Box", "mass": 0, "isStatic": true, "position": [0, -10, 0], "dimensions": [20, 0.2, 20], "color": "#AAAAAA" },
      { "id": "wall_top", "type": "Box", "mass": 0, "isStatic": true, "position": [0, 10, 0], "dimensions": [20, 0.2, 20], "color": "#AAAAAA" },
      { "id": "wall_left", "type": "Box", "mass": 0, "isStatic": true, "position": [-10, 0, 0], "dimensions": [0.2, 20, 20], "color": "#AAAAAA" },
      { "id": "wall_right", "type": "Box", "mass": 0, "isStatic": true, "position": [10, 0, 0], "dimensions": [0.2, 20, 20], "color": "#AAAAAA" },
      { "id": "wall_front", "type": "Box", "mass": 0, "isStatic": true, "position": [0, 0, -10], "dimensions": [20, 20, 0.2], "color": "#AAAAAA" },
      { "id": "wall_back", "type": "Box", "mass": 0, "isStatic": true, "position": [0, 0, 10], "dimensions": [20, 20, 0.2], "color": "#AAAAAA" },
      { "id": "particle_1", "type": "Sphere", "mass": 1, "position": [-2, 2, -2], "velocity": [-4, -0.8, -2.8], "color": "#ff6347", "radius": 0.4 },
      { "id": "particle_2", "type": "Sphere", "mass": 1, "position": [1.8, 2.2, 2.5], "velocity": [0.01, 4.2, -2.68], "color": "#4682b4", "radius": 0.4 },
      { "id": "particle_3", "type": "Sphere", "mass": 1, "position": [3.1, -0.7, 1.1], "velocity": [-3.45, 1.41, -3.46], "color": "#3cb371", "radius": 0.4 }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": { "friction": 0, "restitution": 1 },
    "gravitationalPhysics": { "enabled": false },
    "simulationScale": "terrestrial"
  },
  {
    "id": "solar-system-basics",
    "name": "Solar System Basics",
    "description": "Simplified solar system showing orbital mechanics with a central sun and orbiting planets.",
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
  }
,
  {
  "id": "stellar_swarm_tabletop",
  "name": "Stellar Swarm Tabletop",
  "description": "Scaled-down orbital N-body tableau with a static central star, 8 planets with 2 moons each, two dense asteroid rings (72 bodies), and 20 comets. Gravity is zero-g globally with an increased G for visible motion.",
  "objects": [
    {
      "id": "star_core",
      "type": "Sphere",
      "mass": 1,
      "gravitationalMass": 5000,
      "isStatic": true,
      "position": [0, 0, 0],
      "radius": 4,
      "color": "#ffd27a",
      "opacity": 1
    },
    {
      "id": "planet_aurora",
      "type": "Sphere",
      "mass": 120,
      "position": [7, 0, 0],
      "radius": 0.9,
      "color": "#ff9e80",
      "velocity": [0, 0, 37.796]
    },
    {
      "id": "moon_aurora_i",
      "type": "Sphere",
      "mass": 2,
      "position": [8.5, 0, 0],
      "radius": 0.25,
      "color": "#cfd8dc",
      "velocity": [0, 0, 50.445]
    },
    {
      "id": "moon_aurora_ii",
      "type": "Sphere",
      "mass": 1.5,
      "position": [9.2, 0, 0],
      "radius": 0.2,
      "color": "#b0bec5",
      "velocity": [0, 0, 48.236]
    },
    {
      "id": "planet_cobalt",
      "type": "Sphere",
      "mass": 180,
      "position": [7.071, 0, 7.071],
      "radius": 1.1,
      "color": "#4db6ff",
      "velocity": [-22.361, 0, 22.361]
    },
    {
      "id": "moon_cobalt_i",
      "type": "Sphere",
      "mass": 3,
      "position": [8.344, 0, 8.344],
      "radius": 0.28,
      "color": "#c5cae9",
      "velocity": [-32.361, 0, 32.361]
    },
    {
      "id": "moon_cobalt_ii",
      "type": "Sphere",
      "mass": 2,
      "position": [8.910, 0, 8.910],
      "radius": 0.23,
      "color": "#9fa8da",
      "velocity": [-30.686, 0, 30.686]
    },
    {
      "id": "planet_verdant",
      "type": "Sphere",
      "mass": 220,
      "position": [0, 0, 13],
      "radius": 1.2,
      "color": "#81c784",
      "velocity": [-27.735, 0, 0]
    },
    {
      "id": "moon_verdant_i",
      "type": "Sphere",
      "mass": 3.5,
      "position": [0, 0, 15],
      "radius": 0.3,
      "color": "#a5d6a7",
      "velocity": [-42.567, 0, 0]
    },
    {
      "id": "moon_verdant_ii",
      "type": "Sphere",
      "mass": 2,
      "position": [0, 0, 15.8],
      "radius": 0.25,
      "color": "#c8e6c9",
      "velocity": [-40.268, 0, 0]
    },
    {
      "id": "planet_ember",
      "type": "Sphere",
      "mass": 260,
      "position": [-11.314, 0, 11.314],
      "radius": 1.4,
      "color": "#ff7043",
      "velocity": [-17.678, 0, -17.678]
    },
    {
      "id": "moon_ember_i",
      "type": "Sphere",
      "mass": 3,
      "position": [-12.940, 0, 12.940],
      "radius": 0.28,
      "color": "#ffab91",
      "velocity": [-28.306, 0, -28.306]
    },
    {
      "id": "moon_ember_ii",
      "type": "Sphere",
      "mass": 2,
      "position": [-13.576, 0, 13.576],
      "radius": 0.24,
      "color": "#ffccbc",
      "velocity": [-26.693, 0, -26.693]
    },
    {
      "id": "planet_azure",
      "type": "Sphere",
      "mass": 300,
      "position": [-20, 0, 0],
      "radius": 1.6,
      "color": "#42a5f5",
      "velocity": [0, 0, -22.361]
    },
    {
      "id": "moon_azure_i",
      "type": "Sphere",
      "mass": 3.5,
      "position": [-22.5, 0, 0],
      "radius": 0.32,
      "color": "#90caf9",
      "velocity": [0, 0, -37.853]
    },
    {
      "id": "moon_azure_ii",
      "type": "Sphere",
      "mass": 2.5,
      "position": [-23.5, 0, 0],
      "radius": 0.26,
      "color": "#bbdefb",
      "velocity": [0, 0, -35.453]
    },
    {
      "id": "planet_obsidian",
      "type": "Sphere",
      "mass": 280,
      "position": [-16.971, 0, -16.971],
      "radius": 1.5,
      "color": "#7e57c2",
      "velocity": [14.432, 0, -14.432]
    },
    {
      "id": "moon_obsidian_i",
      "type": "Sphere",
      "mass": 3.5,
      "position": [-18.385, 0, -18.385],
      "radius": 0.3,
      "color": "#b39ddb",
      "velocity": [26.262, 0, -26.262]
    },
    {
      "id": "moon_obsidian_ii",
      "type": "Sphere",
      "mass": 2.5,
      "position": [-18.951, 0, -18.951],
      "radius": 0.26,
      "color": "#d1c4e9",
      "velocity": [24.432, 0, -24.432]
    },
    {
      "id": "planet_garnet",
      "type": "Sphere",
      "mass": 240,
      "position": [0, 0, -29],
      "radius": 1.3,
      "color": "#fdd835",
      "velocity": [18.576, 0, 0]
    },
    {
      "id": "moon_garnet_i",
      "type": "Sphere",
      "mass": 3,
      "position": [0, 0, -31.2],
      "radius": 0.28,
      "color": "#fff176",
      "velocity": [33.354, 0, 0]
    },
    {
      "id": "moon_garnet_ii",
      "type": "Sphere",
      "mass": 2,
      "position": [0, 0, -32],
      "radius": 0.24,
      "color": "#fff59d",
      "velocity": [31.225, 0, 0]
    },
    {
      "id": "planet_nimbus",
      "type": "Sphere",
      "mass": 260,
      "position": [23.334, 0, -23.334],
      "radius": 1.45,
      "color": "#26a69a",
      "velocity": [12.312, 0, 12.312]
    },
    {
      "id": "moon_nimbus_i",
      "type": "Sphere",
      "mass": 3,
      "position": [25.102, 0, -25.102],
      "radius": 0.3,
      "color": "#80cbc4",
      "velocity": [22.504, 0, 22.504]
    },
    {
      "id": "moon_nimbus_ii",
      "type": "Sphere",
      "mass": 2,
      "position": [25.597, 0, -25.597],
      "radius": 0.26,
      "color": "#b2dfdb",
      "velocity": [21.326, 0, 21.326]
    },

    {
      "id": "belt_r1_obj_00",
      "type": "Sphere",
      "mass": 1.5,
      "position": [28, 0, 0],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [0, 0, 18.898],
      "rotation": [0, 0, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_01",
      "type": "Box",
      "mass": 1.8,
      "position": [27.575, 0, 4.862],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [-3.283, 0, 18.617],
      "rotation": [0, 0.174533, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_02",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [26.312, 0, 9.577],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [-6.460, 0, 17.742],
      "rotation": [0, 0.349066, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_03",
      "type": "Sphere",
      "mass": 1.5,
      "position": [24.249, 0, 14],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [-9.449, 0, 16.362],
      "rotation": [0, 0.523599, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_04",
      "type": "Box",
      "mass": 1.8,
      "position": [21.449, 0, 18],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [-12.151, 0, 14.479],
      "rotation": [0, 0.698132, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_05",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [18, 0, 21.449],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [-14.479, 0, 12.151],
      "rotation": [0, 0.872665, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_06",
      "type": "Sphere",
      "mass": 1.5,
      "position": [14, 0, 24.249],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [-16.362, 0, 9.449],
      "rotation": [0, 1.047198, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_07",
      "type": "Box",
      "mass": 1.8,
      "position": [9.577, 0, 26.312],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [-17.742, 0, 6.460],
      "rotation": [0, 1.22173, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_08",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [4.862, 0, 27.575],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [-18.617, 0, 3.283],
      "rotation": [0, 1.396263, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_09",
      "type": "Sphere",
      "mass": 1.5,
      "position": [0, 0, 28],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [-18.898, 0, 0],
      "rotation": [0, 1.570796, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_10",
      "type": "Box",
      "mass": 1.8,
      "position": [-4.862, 0, 27.575],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [-18.617, 0, -3.283],
      "rotation": [0, 1.745329, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_11",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [-9.577, 0, 26.312],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [-17.742, 0, -6.460],
      "rotation": [0, 1.919862, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_12",
      "type": "Sphere",
      "mass": 1.5,
      "position": [-14, 0, 24.249],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [-16.362, 0, -9.449],
      "rotation": [0, 2.094395, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_13",
      "type": "Box",
      "mass": 1.8,
      "position": [-18, 0, 21.449],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [-14.479, 0, -12.151],
      "rotation": [0, 2.268928, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_14",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [-21.449, 0, 18],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [-12.151, 0, -14.479],
      "rotation": [0, 2.443461, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_15",
      "type": "Sphere",
      "mass": 1.5,
      "position": [-24.249, 0, 14],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [-9.449, 0, -16.362],
      "rotation": [0, 2.617994, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_16",
      "type": "Box",
      "mass": 1.8,
      "position": [-26.312, 0, 9.577],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [-6.460, 0, -17.742],
      "rotation": [0, 2.792527, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_17",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [-27.575, 0, 4.862],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [-3.283, 0, -18.617],
      "rotation": [0, 2.96706, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_18",
      "type": "Sphere",
      "mass": 1.5,
      "position": [-28, 0, 0],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [0, 0, -18.898],
      "rotation": [0, 3.141593, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_19",
      "type": "Box",
      "mass": 1.8,
      "position": [-27.575, 0, -4.862],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [3.283, 0, -18.617],
      "rotation": [0, 3.316126, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_20",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [-26.312, 0, -9.577],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [6.460, 0, -17.742],
      "rotation": [0, 3.490659, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_21",
      "type": "Sphere",
      "mass": 1.5,
      "position": [-24.249, 0, -14],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [9.449, 0, -16.362],
      "rotation": [0, 3.665191, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_22",
      "type": "Box",
      "mass": 1.8,
      "position": [-21.449, 0, -18],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [12.151, 0, -14.479],
      "rotation": [0, 3.839724, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_23",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [-18, 0, -21.449],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [14.479, 0, -12.151],
      "rotation": [0, 4.014257, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_24",
      "type": "Sphere",
      "mass": 1.5,
      "position": [-14, 0, -24.249],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [16.362, 0, -9.449],
      "rotation": [0, 4.18879, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_25",
      "type": "Box",
      "mass": 1.8,
      "position": [-9.577, 0, -26.312],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [17.742, 0, -6.460],
      "rotation": [0, 4.363323, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_26",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [-4.862, 0, -27.575],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [18.617, 0, -3.283],
      "rotation": [0, 4.537856, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_27",
      "type": "Sphere",
      "mass": 1.5,
      "position": [0, 0, -28],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [18.898, 0, 0],
      "rotation": [0, 4.712389, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_28",
      "type": "Box",
      "mass": 1.8,
      "position": [4.862, 0, -27.575],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [18.617, 0, 3.283],
      "rotation": [0, 4.886922, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_29",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [9.577, 0, -26.312],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [17.742, 0, 6.460],
      "rotation": [0, 5.061455, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_30",
      "type": "Sphere",
      "mass": 1.5,
      "position": [14, 0, -24.249],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [16.362, 0, 9.449],
      "rotation": [0, 5.235988, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_31",
      "type": "Box",
      "mass": 1.8,
      "position": [18, 0, -21.449],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [14.479, 0, 12.151],
      "rotation": [0, 5.410521, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_32",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [21.449, 0, -18],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [12.151, 0, 14.479],
      "rotation": [0, 5.585054, 0],
      "angularVelocity": [0, 0.25, 0]
    },
    {
      "id": "belt_r1_obj_33",
      "type": "Sphere",
      "mass": 1.5,
      "position": [24.249, 0, -14],
      "radius": 0.28,
      "color": "#9e9e9e",
      "velocity": [9.449, 0, 16.362],
      "rotation": [0, 5.759587, 0],
      "angularVelocity": [0, 0.1, 0]
    },
    {
      "id": "belt_r1_obj_34",
      "type": "Box",
      "mass": 1.8,
      "position": [26.312, 0, -9.577],
      "dimensions": [0.5, 0.4, 0.3],
      "color": "#8d6e63",
      "velocity": [6.460, 0, 17.742],
      "rotation": [0, 5.934119, 0],
      "angularVelocity": [0, 0.2, 0]
    },
    {
      "id": "belt_r1_obj_35",
      "type": "Cylinder",
      "mass": 1.2,
      "position": [27.575, 0, -4.862],
      "radius": 0.22,
      "height": 0.6,
      "color": "#607d8b",
      "velocity": [3.283, 0, 18.617],
      "rotation": [0, 6.108652, 0],
      "angularVelocity": [0, 0.25, 0]
    },

    {
      "id": "belt_r2_obj_00",
      "type": "Sphere",
      "mass": 1.6,
      "position": [36, 0, 0],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [0, 0, 16.667],
      "rotation": [0, 0, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_01",
      "type": "Box",
      "mass": 2,
      "position": [35.454, 0, 6.251],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [-2.894, 0, 16.413],
      "rotation": [0, 0.174533, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_02",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [33.829, 0, 12.313],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [-5.700, 0, 15.661],
      "rotation": [0, 0.349066, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_03",
      "type": "Sphere",
      "mass": 1.6,
      "position": [31.177, 0, 18],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [-8.334, 0, 14.434],
      "rotation": [0, 0.523599, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_04",
      "type": "Box",
      "mass": 2,
      "position": [27.578, 0, 23.140],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [-10.713, 0, 12.767],
      "rotation": [0, 0.698132, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_05",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [23.140, 0, 27.578],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [-12.767, 0, 10.713],
      "rotation": [0, 0.872665, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_06",
      "type": "Sphere",
      "mass": 1.6,
      "position": [18, 0, 31.177],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [-14.434, 0, 8.334],
      "rotation": [0, 1.047198, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_07",
      "type": "Box",
      "mass": 2,
      "position": [12.313, 0, 33.829],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [-15.661, 0, 5.700],
      "rotation": [0, 1.22173, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_08",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [6.251, 0, 35.454],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [-16.413, 0, 2.894],
      "rotation": [0, 1.396263, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_09",
      "type": "Sphere",
      "mass": 1.6,
      "position": [0, 0, 36],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [-16.667, 0, 0],
      "rotation": [0, 1.570796, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_10",
      "type": "Box",
      "mass": 2,
      "position": [-6.251, 0, 35.454],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [-16.413, 0, -2.894],
      "rotation": [0, 1.745329, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_11",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [-12.313, 0, 33.829],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [-15.661, 0, -5.700],
      "rotation": [0, 1.919862, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_12",
      "type": "Sphere",
      "mass": 1.6,
      "position": [-18, 0, 31.177],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [-14.434, 0, -8.334],
      "rotation": [0, 2.094395, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_13",
      "type": "Box",
      "mass": 2,
      "position": [-23.140, 0, 27.578],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [-12.767, 0, -10.713],
      "rotation": [0, 2.268928, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_14",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [-27.578, 0, 23.140],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [-10.713, 0, -12.767],
      "rotation": [0, 2.443461, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_15",
      "type": "Sphere",
      "mass": 1.6,
      "position": [-31.177, 0, 18],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [-8.334, 0, -14.434],
      "rotation": [0, 2.617994, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_16",
      "type": "Box",
      "mass": 2,
      "position": [-33.829, 0, 12.313],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [-5.700, 0, -15.661],
      "rotation": [0, 2.792527, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_17",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [-35.454, 0, 6.251],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [-2.894, 0, -16.413],
      "rotation": [0, 2.96706, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_18",
      "type": "Sphere",
      "mass": 1.6,
      "position": [-36, 0, 0],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [0, 0, -16.667],
      "rotation": [0, 3.141593, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_19",
      "type": "Box",
      "mass": 2,
      "position": [-35.454, 0, -6.251],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [2.894, 0, -16.413],
      "rotation": [0, 3.316126, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_20",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [-33.829, 0, -12.313],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [5.700, 0, -15.661],
      "rotation": [0, 3.490659, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_21",
      "type": "Sphere",
      "mass": 1.6,
      "position": [-31.177, 0, -18],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [8.334, 0, -14.434],
      "rotation": [0, 3.665191, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_22",
      "type": "Box",
      "mass": 2,
      "position": [-27.578, 0, -23.140],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [10.713, 0, -12.767],
      "rotation": [0, 3.839724, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_23",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [-23.140, 0, -27.578],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [12.767, 0, -10.713],
      "rotation": [0, 4.014257, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_24",
      "type": "Sphere",
      "mass": 1.6,
      "position": [-18, 0, -31.177],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [14.434, 0, -8.334],
      "rotation": [0, 4.18879, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_25",
      "type": "Box",
      "mass": 2,
      "position": [-12.313, 0, -33.829],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [15.661, 0, -5.700],
      "rotation": [0, 4.363323, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_26",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [-6.251, 0, -35.454],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [16.413, 0, -2.894],
      "rotation": [0, 4.537856, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_27",
      "type": "Sphere",
      "mass": 1.6,
      "position": [0, 0, -36],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [16.667, 0, 0],
      "rotation": [0, 4.712389, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_28",
      "type": "Box",
      "mass": 2,
      "position": [6.251, 0, -35.454],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [16.413, 0, 2.894],
      "rotation": [0, 4.886922, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_29",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [12.313, 0, -33.829],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [15.661, 0, 5.700],
      "rotation": [0, 5.061455, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_30",
      "type": "Sphere",
      "mass": 1.6,
      "position": [18, 0, -31.177],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [14.434, 0, 8.334],
      "rotation": [0, 5.235988, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_31",
      "type": "Box",
      "mass": 2,
      "position": [23.140, 0, -27.578],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [12.767, 0, 10.713],
      "rotation": [0, 5.410521, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_32",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [27.578, 0, -23.140],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [10.713, 0, 12.767],
      "rotation": [0, 5.585054, 0],
      "angularVelocity": [0, 0.27, 0]
    },
    {
      "id": "belt_r2_obj_33",
      "type": "Sphere",
      "mass": 1.6,
      "position": [31.177, 0, -18],
      "radius": 0.3,
      "color": "#b0bec5",
      "velocity": [8.334, 0, 14.434],
      "rotation": [0, 5.759587, 0],
      "angularVelocity": [0, 0.12, 0]
    },
    {
      "id": "belt_r2_obj_34",
      "type": "Box",
      "mass": 2,
      "position": [33.829, 0, -12.313],
      "dimensions": [0.55, 0.45, 0.35],
      "color": "#6d4c41",
      "velocity": [5.700, 0, 15.661],
      "rotation": [0, 5.934119, 0],
      "angularVelocity": [0, 0.22, 0]
    },
    {
      "id": "belt_r2_obj_35",
      "type": "Cylinder",
      "mass": 1.3,
      "position": [35.454, 0, -6.251],
      "radius": 0.24,
      "height": 0.65,
      "color": "#546e7a",
      "velocity": [2.894, 0, 16.413],
      "rotation": [0, 6.108652, 0],
      "angularVelocity": [0, 0.27, 0]
    },

    {
      "id": "comet_00",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [44, 0, 0],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [-2, 0, 10.556],
      "rotation": [0, 0, 0]
    },
    {
      "id": "comet_01",
      "type": "Box",
      "mass": 2.5,
      "position": [42.798, 0, 13.906],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [-5.127, 0, 9.308],
      "rotation": [0, 0.314159, 0]
    },
    {
      "id": "comet_02",
      "type": "Sphere",
      "mass": 2,
      "position": [37.615, 0, 27.037],
      "radius": 0.4,
      "color": "#e0f7fa",
      "velocity": [-7.690, 0, 7.176],
      "rotation": [0, 0.628319, 0]
    },
    {
      "id": "comet_03",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [27.626, 0, 38.024],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [-9.435, 0, 4.388],
      "rotation": [0, 0.942478, 0]
    },
    {
      "id": "comet_04",
      "type": "Box",
      "mass": 2.5,
      "position": [14.833, 0, 45.651],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [-10.230, 0, 1.222],
      "rotation": [0, 1.256637, 0]
    },
    {
      "id": "comet_05",
      "type": "Sphere",
      "mass": 2,
      "position": [0, 0, 44],
      "radius": 0.4,
      "color": "#e0f7fa",
      "velocity": [-10.556, 0, -2],
      "rotation": [0, 1.570796, 0]
    },
    {
      "id": "comet_06",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [-14.833, 0, 45.651],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [-9.334, 0, -5.080],
      "rotation": [0, 1.884956, 0]
    },
    {
      "id": "comet_07",
      "type": "Box",
      "mass": 2.5,
      "position": [-27.626, 0, 38.024],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [-7.540, 0, -7.973],
      "rotation": [0, 2.199115, 0]
    },
    {
      "id": "comet_08",
      "type": "Sphere",
      "mass": 2,
      "position": [-37.615, 0, 27.037],
      "radius": 0.4,
      "color": "#e0f7fa",
      "velocity": [-5.267, 0, -10.062],
      "rotation": [0, 2.513274, 0]
    },
    {
      "id": "comet_09",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [-42.798, 0, 13.906],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [-2.482, 0, -11.480],
      "rotation": [0, 2.827433, 0]
    },
    {
      "id": "comet_10",
      "type": "Box",
      "mass": 2.5,
      "position": [-44, 0, 0],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [2, 0, -10.556],
      "rotation": [0, 3.141593, 0]
    },
    {
      "id": "comet_11",
      "type": "Sphere",
      "mass": 2,
      "position": [-42.798, 0, -13.906],
      "radius": 0.4,
      "color": "#e0f7fa",
      "velocity": [5.127, 0, -9.308],
      "rotation": [0, 3.455752, 0]
    },
    {
      "id": "comet_12",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [-37.615, 0, -27.037],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [7.690, 0, -7.176],
      "rotation": [0, 3.769911, 0]
    },
    {
      "id": "comet_13",
      "type": "Box",
      "mass": 2.5,
      "position": [-27.626, 0, -38.024],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [9.435, 0, -4.388],
      "rotation": [0, 4.08407, 0]
    },
    {
      "id": "comet_14",
      "type": "Sphere",
      "mass": 2,
      "position": [-14.833, 0, -45.651],
      "radius": 0.4,
      "color": "#e0f7fa",
      "velocity": [10.230, 0, -1.222],
      "rotation": [0, 4.398229, 0]
    },
    {
      "id": "comet_15",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [0, 0, -44],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [10.556, 0, 2],
      "rotation": [0, 4.712389, 0]
    },
    {
      "id": "comet_16",
      "type": "Box",
      "mass": 2.5,
      "position": [14.833, 0, -45.651],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [9.334, 0, 5.080],
      "rotation": [0, 5.026548, 0]
    },
    {
      "id": "comet_17",
      "type": "Sphere",
      "mass": 2,
      "position": [27.626, 0, -38.024],
      "radius": 0.4,
      "color": "#e0f7fa",
      "velocity": [7.540, 0, 7.973],
      "rotation": [0, 5.340707, 0]
    },
    {
      "id": "comet_18",
      "type": "Cylinder",
      "mass": 2.2,
      "position": [37.615, 0, -27.037],
      "radius": 0.3,
      "height": 0.8,
      "color": "#e0f7fa",
      "velocity": [5.267, 0, 10.062],
      "rotation": [0, 5.654866, 0]
    },
    {
      "id": "comet_19",
      "type": "Box",
      "mass": 2.5,
      "position": [42.798, 0, -13.906],
      "dimensions": [0.7, 0.4, 0.4],
      "color": "#e0f7fa",
      "velocity": [2.482, 0, 11.480],
      "rotation": [0, 5.969026, 0]
    }
  ],
  "gravity": [0, 0, 0],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.4,
    "restitution": 0.6
  },
  "gravitationalPhysics": {
    "enabled": true,
    "gravitationalConstant": 2,
    "minDistance": 0.5,
    "softening": 0.1
  },
  "simulationScale": "solar_system"
},
  {
    "id": "kinetic_theory_no_gravity",
    "name": "Kinetic Theory (No Gravity)",
    "description": "Simulation demonstrating kinetic theory principles. Particles move freely without any external gravity or gravitational attraction between them, colliding elastically with the container walls.",
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
  }
  , {
    "id": "solar_system_enhanced_v3",
    "name": "Enhanced Solar System Simulation",
    "description": "A carefully balanced solar system simulation with improved orbital mechanics. Orbital velocities are calculated using v = sqrt(G*M/r) adjusted for the exaggerated gravitational constant. Includes orbital eccentricity variations and proper mass ratios based on real planetary data scaled appropriately.",
    "objects": [
      {
        "id": "sun",
        "type": "Sphere",
        "mass": 2000,
        "gravitationalMass": 20000,
        "position": [0, 0, 0],
        "radius": 12,
        "isStatic": true,
        "color": "#FDB813",
        "opacity": 1,
        "restitution": 0.1
      },
      {
        "id": "mercury",
        "type": "Sphere",
        "mass": 0.055,
        "gravitationalMass": 0.055,
        "position": [20, 0, 0],
        "radius": 0.4,
        "velocity": [0, 0, 31.62],
        "color": "#8C7853",
        "opacity": 1
      },
      {
        "id": "venus",
        "type": "Sphere",
        "mass": 0.815,
        "gravitationalMass": 0.815,
        "position": [-30, 0, 5],
        "radius": 0.95,
        "velocity": [-5.77, 0, -25.82],
        "color": "#FFC649",
        "opacity": 1
      },
      {
        "id": "earth",
        "type": "Sphere",
        "mass": 1,
        "gravitationalMass": 1,
        "position": [0, 0, 40],
        "radius": 1,
        "velocity": [-22.36, 0, 0],
        "color": "#4169E1",
        "opacity": 1
      },
      {
        "id": "moon",
        "type": "Sphere",
        "mass": 0.012,
        "gravitationalMass": 0.012,
        "position": [0, 0, 42.5],
        "radius": 0.27,
        "velocity": [-24.5, 0, 0],
        "color": "#C0C0C0",
        "opacity": 1
      },
      {
        "id": "mars",
        "type": "Sphere",
        "mass": 0.107,
        "gravitationalMass": 0.107,
        "position": [55, 0, -10],
        "radius": 0.53,
        "velocity": [3.65, 0, 19.07],
        "color": "#CD5C5C",
        "opacity": 1
      },
      {
        "id": "jupiter",
        "type": "Sphere",
        "mass": 317.8,
        "gravitationalMass": 317.8,
        "position": [90, 0, 0],
        "radius": 5,
        "velocity": [0, 0, 14.91],
        "color": "#DAA520",
        "opacity": 1
      },
      {
        "id": "io",
        "type": "Sphere",
        "mass": 0.015,
        "gravitationalMass": 0.015,
        "position": [96, 0, 0],
        "radius": 0.3,
        "velocity": [0, 0, 17.5],
        "color": "#FFFF99",
        "opacity": 1
      },
      {
        "id": "saturn",
        "type": "Sphere",
        "mass": 95.2,
        "gravitationalMass": 95.2,
        "position": [-120, 0, 20],
        "radius": 4.5,
        "velocity": [-2.36, 0, -12.91],
        "color": "#F4A460",
        "opacity": 1
      },
      {
        "id": "uranus",
        "type": "Sphere",
        "mass": 14.5,
        "gravitationalMass": 14.5,
        "position": [0, 0, 160],
        "radius": 2.5,
        "velocity": [-11.18, 0, 0],
        "color": "#4FD0E0",
        "opacity": 1
      },
      {
        "id": "neptune",
        "type": "Sphere",
        "mass": 17.1,
        "gravitationalMass": 17.1,
        "position": [0, 0, -190],
        "radius": 2.4,
        "velocity": [10.25, 0, 0],
        "color": "#4169E1",
        "opacity": 0.9
      }
    ],
    "gravity": [0, 0, 0],
    "hasGround": false,
    "contactMaterial": {
      "friction": 0.1,
      "restitution": 0.3
    },
    "gravitationalPhysics": {
      "enabled": true,
      "gravitationalConstant": 1,
      "minDistance": 1,
      "softening": 0.1
    },
    "simulationScale": "solar_system"
  },
  { "id": "cosmic_ballet_megastructure", "name": "Cosmic Ballet: The Dyson Sphere Construction", "description": "A creative multi-scale physics simulation featuring a partially constructed Dyson sphere around a binary star system, with construction drones, asteroid mining operations, rotating space habitats, and a rogue planet passing through. The scene demonstrates complex gravitational interactions, orbital mechanics, and engineering megastructures in a visually stunning arrangement.", "objects": [{ "id": "primary_star", "type": "Sphere", "mass": 1500, "gravitationalMass": 15000, "position": [0, 0, 0], "radius": 8, "velocity": [0, 0, 0], "angularVelocity": [0, 0.1, 0], "color": "#FFD700", "opacity": 1, "isStatic": false }, { "id": "secondary_star", "type": "Sphere", "mass": 800, "gravitationalMass": 8000, "position": [25, 0, 0], "radius": 5, "velocity": [0, 0, 20], "color": "#FF6347", "opacity": 1 }, { "id": "dyson_ring_1", "type": "Cylinder", "mass": 50, "gravitationalMass": 5, "position": [12.5, 0, 0], "radius": 35, "height": 2, "velocity": [0, 0, 10], "rotation": [0, 0, 0], "angularVelocity": [0, 0.05, 0], "color": "#708090", "opacity": 0.7 }, { "id": "dyson_ring_2", "type": "Cylinder", "mass": 50, "gravitationalMass": 5, "position": [12.5, 0, 0], "radius": 40, "height": 1.5, "velocity": [0, 0, 9.5], "rotation": [1.57, 0, 0], "angularVelocity": [0.03, 0, 0], "color": "#778899", "opacity": 0.6 }, { "id": "dyson_ring_3", "type": "Cylinder", "mass": 50, "gravitationalMass": 5, "position": [12.5, 0, 0], "radius": 45, "height": 1, "velocity": [0, 0, 9], "rotation": [0, 1.57, 0], "angularVelocity": [0, 0, 0.02], "color": "#696969", "opacity": 0.5 }, { "id": "construction_hub", "type": "Box", "mass": 20, "gravitationalMass": 20, "position": [50, 10, 0], "dimensions": [4, 2, 4], "velocity": [0, 0, 12], "rotation": [0, 0, 0], "angularVelocity": [0.1, 0.1, 0.1], "color": "#4682B4", "opacity": 1 }, { "id": "mining_asteroid_1", "type": "Sphere", "mass": 5, "gravitationalMass": 5, "position": [60, 0, 20], "radius": 1.5, "velocity": [-5, 0, 10], "color": "#8B4513", "opacity": 1 }, { "id": "mining_asteroid_2", "type": "Sphere", "mass": 3, "gravitationalMass": 3, "position": [65, -5, 15], "radius": 1.2, "velocity": [-4, 2, 9], "color": "#A0522D", "opacity": 1 }, { "id": "drone_swarm_center", "type": "Sphere", "mass": 0.1, "gravitationalMass": 0.1, "position": [55, 5, 10], "radius": 0.3, "velocity": [-3, 1, 11], "color": "#00FF00", "opacity": 0.8 }, { "id": "habitat_ring", "type": "Cylinder", "mass": 100, "gravitationalMass": 100, "position": [-60, 0, 0], "radius": 15, "height": 5, "velocity": [0, 0, -8], "rotation": [0, 0, 0], "angularVelocity": [0, 0.2, 0], "color": "#87CEEB", "opacity": 0.9 }, { "id": "habitat_sphere_1", "type": "Sphere", "mass": 10, "gravitationalMass": 10, "position": [-60, 0, 15], "radius": 2, "velocity": [-8, 0, -8], "color": "#98FB98", "opacity": 1 }, { "id": "habitat_sphere_2", "type": "Sphere", "mass": 10, "gravitationalMass": 10, "position": [-60, 0, -15], "radius": 2, "velocity": [8, 0, -8], "color": "#90EE90", "opacity": 1 }, { "id": "rogue_planet", "type": "Sphere", "mass": 200, "gravitationalMass": 200, "position": [100, 30, -80], "radius": 6, "velocity": [-15, -5, 20], "color": "#8B008B", "opacity": 1 }, { "id": "rogue_moon_1", "type": "Sphere", "mass": 5, "gravitationalMass": 5, "position": [108, 30, -80], "radius": 1, "velocity": [-15, -5, 23], "color": "#9370DB", "opacity": 1 }, { "id": "rogue_moon_2", "type": "Sphere", "mass": 3, "gravitationalMass": 3, "position": [100, 35, -85], "radius": 0.8, "velocity": [-17, -5, 20], "color": "#9932CC", "opacity": 1 }, { "id": "energy_collector_1", "type": "Plane", "mass": 1, "gravitationalMass": 0.1, "position": [30, 20, 30], "dimensions": [8, 0.2, 8], "velocity": [-10, -2, 5], "rotation": [0.5, 0.5, 0], "angularVelocity": [0.01, 0.01, 0.01], "color": "#FFD700", "opacity": 0.6 }, { "id": "energy_collector_2", "type": "Plane", "mass": 1, "gravitationalMass": 0.1, "position": [-30, 15, -35], "dimensions": [6, 0.2, 6], "velocity": [8, 1, -6], "rotation": [-0.3, 0.7, 0], "angularVelocity": [0.02, 0, 0.01], "color": "#FFA500", "opacity": 0.6 }, { "id": "wormhole_gate_ring", "type": "Cylinder", "mass": 500, "gravitationalMass": 50, "position": [0, -50, 0], "radius": 20, "height": 3, "velocity": [0, 0, 0], "rotation": [1.57, 0, 0], "angularVelocity": [0, 0, 0.3], "color": "#4B0082", "opacity": 0.8, "isStatic": true }, { "id": "wormhole_core", "type": "Sphere", "mass": 100, "gravitationalMass": 1000, "position": [0, -50, 0], "radius": 5, "velocity": [0, 0, 0], "color": "#000000", "opacity": 0.9, "isStatic": true }, { "id": "antimatter_containment", "type": "Box", "mass": 30, "gravitationalMass": 30, "position": [80, -20, 50], "dimensions": [3, 6, 3], "velocity": [-8, 3, -10], "rotation": [0, 0, 0], "angularVelocity": [0.05, 0.1, 0.05], "color": "#FF1493", "opacity": 0.7 }, { "id": "quantum_beacon", "type": "Sphere", "mass": 0.5, "gravitationalMass": 0.5, "position": [0, 40, 0], "radius": 1, "velocity": [0, 0, 0], "angularVelocity": [1, 1, 1], "color": "#00FFFF", "opacity": 0.5 }, { "id": "debris_field_1", "type": "Box", "mass": 0.2, "gravitationalMass": 0.2, "position": [45, 5, 25], "dimensions": [1, 0.5, 2], "velocity": [-6, 1, 8], "rotation": [0.2, 0.3, 0.4], "angularVelocity": [0.5, 0.5, 0.5], "color": "#A9A9A9", "opacity": 1 }, { "id": "debris_field_2", "type": "Box", "mass": 0.3, "gravitationalMass": 0.3, "position": [48, 3, 22], "dimensions": [1.5, 0.3, 1], "velocity": [-5.5, 0.5, 8.5], "rotation": [0.1, 0.5, 0.2], "angularVelocity": [0.3, 0.6, 0.4], "color": "#808080", "opacity": 1 }, { "id": "alien_artifact", "type": "Cylinder", "mass": 50, "gravitationalMass": 500, "position": [-100, 0, 100], "radius": 4, "height": 12, "velocity": [10, 0, -10], "rotation": [0.785, 0.785, 0], "angularVelocity": [0.1, 0.1, 0.1], "color": "#7FFF00", "opacity": 0.8 }, { "id": "gravitational_lens", "type": "Sphere", "mass": 1000, "gravitationalMass": 5000, "position": [0, 0, -150], "radius": 3, "velocity": [0, 0, 0], "color": "#191970", "opacity": 0.3, "isStatic": true }], "gravity": [0, 0, 0], "hasGround": false, "contactMaterial": { "friction": 0.3, "restitution": 0.5 }, "gravitationalPhysics": { "enabled": true, "gravitationalConstant": 0.5, "minDistance": 2, "softening": 0.5 }, "simulationScale": "galactic" }

,{
  "id": "floating_metropolis",
  "name": "Gravity-Defying Sky City",
  "description": "A complex floating city with multiple levels, platforms, and structures suspended in space without gravity",
  "objects": [
    {
      "id": "central_tower_base",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 0, 0],
      "radius": 8,
      "height": 3,
      "color": "#2c3e50",
      "isStatic": true
    },
    {
      "id": "central_tower_mid",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 4.5, 0],
      "radius": 6,
      "height": 6,
      "color": "#34495e",
      "isStatic": true
    },
    {
      "id": "central_tower_top",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 10.5, 0],
      "radius": 4,
      "height": 8,
      "color": "#7f8c8d",
      "isStatic": true
    },
    {
      "id": "spire",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 17, 0],
      "radius": 0.5,
      "height": 5,
      "color": "#ecf0f1",
      "isStatic": true
    },
    {
      "id": "platform_north",
      "type": "Box",
      "mass": 0,
      "position": [0, 8, 25],
      "dimensions": [20, 1, 15],
      "color": "#3498db",
      "isStatic": true
    },
    {
      "id": "building_n1",
      "type": "Box",
      "mass": 0,
      "position": [-6, 11.5, 22],
      "dimensions": [4, 6, 4],
      "color": "#2980b9",
      "isStatic": true
    },
    {
      "id": "building_n2",
      "type": "Box",
      "mass": 0,
      "position": [6, 10, 28],
      "dimensions": [3, 3, 3],
      "color": "#2980b9",
      "isStatic": true
    },
    {
      "id": "platform_south",
      "type": "Box",
      "mass": 0,
      "position": [0, 12, -30],
      "dimensions": [25, 1, 18],
      "color": "#e74c3c",
      "isStatic": true
    },
    {
      "id": "building_s1",
      "type": "Cylinder",
      "mass": 0,
      "position": [-8, 16, -28],
      "radius": 3,
      "height": 7,
      "color": "#c0392b",
      "isStatic": true
    },
    {
      "id": "building_s2",
      "type": "Box",
      "mass": 0,
      "position": [7, 15.5, -32],
      "dimensions": [5, 6, 5],
      "color": "#c0392b",
      "isStatic": true
    },
    {
      "id": "platform_east",
      "type": "Box",
      "mass": 0,
      "position": [35, 5, 0],
      "dimensions": [15, 1, 22],
      "color": "#2ecc71",
      "isStatic": true
    },
    {
      "id": "building_e1",
      "type": "Box",
      "mass": 0,
      "position": [32, 8, -5],
      "dimensions": [4, 5, 4],
      "color": "#27ae60",
      "isStatic": true
    },
    {
      "id": "building_e2",
      "type": "Cylinder",
      "mass": 0,
      "position": [38, 7.5, 6],
      "radius": 2,
      "height": 4,
      "color": "#27ae60",
      "isStatic": true
    },
    {
      "id": "platform_west",
      "type": "Box",
      "mass": 0,
      "position": [-40, 15, 0],
      "dimensions": [18, 1, 25],
      "color": "#f39c12",
      "isStatic": true
    },
    {
      "id": "building_w1",
      "type": "Box",
      "mass": 0,
      "position": [-42, 19, -8],
      "dimensions": [6, 7, 6],
      "color": "#d68910",
      "isStatic": true
    },
    {
      "id": "building_w2",
      "type": "Box",
      "mass": 0,
      "position": [-38, 17.5, 7],
      "dimensions": [4, 4, 4],
      "color": "#d68910",
      "isStatic": true
    },
    {
      "id": "bridge_ns",
      "type": "Box",
      "mass": 0,
      "position": [0, 10, 0],
      "dimensions": [2, 0.5, 50],
      "color": "#95a5a6",
      "isStatic": true
    },
    {
      "id": "bridge_ew",
      "type": "Box",
      "mass": 0,
      "position": [0, 10, 0],
      "dimensions": [70, 0.5, 2],
      "color": "#95a5a6",
      "isStatic": true
    },
    {
      "id": "floating_park",
      "type": "Cylinder",
      "mass": 0,
      "position": [20, 20, 15],
      "radius": 8,
      "height": 0.5,
      "color": "#16a085",
      "isStatic": true
    },
    {
      "id": "park_tree1",
      "type": "Cylinder",
      "mass": 0,
      "position": [18, 21.5, 13],
      "radius": 0.5,
      "height": 2.5,
      "color": "#8b4513",
      "isStatic": true
    },
    {
      "id": "park_tree2",
      "type": "Cylinder",
      "mass": 0,
      "position": [22, 21.5, 17],
      "radius": 0.5,
      "height": 2.5,
      "color": "#8b4513",
      "isStatic": true
    },
    {
      "id": "upper_platform",
      "type": "Box",
      "mass": 0,
      "position": [-15, 25, -15],
      "dimensions": [12, 1, 12],
      "color": "#9b59b6",
      "isStatic": true
    },
    {
      "id": "upper_building",
      "type": "Box",
      "mass": 0,
      "position": [-15, 28.5, -15],
      "dimensions": [8, 6, 8],
      "color": "#8e44ad",
      "isStatic": true
    },
    {
      "id": "floating_sphere1",
      "type": "Sphere",
      "mass": 0,
      "position": [25, 30, -20],
      "radius": 3,
      "color": "#e67e22",
      "isStatic": true
    },
    {
      "id": "floating_sphere2",
      "type": "Sphere",
      "mass": 0,
      "position": [-30, 35, 25],
      "radius": 4,
      "color": "#d35400",
      "isStatic": true
    },
    {
      "id": "diagonal_platform1",
      "type": "Box",
      "mass": 0,
      "position": [15, 18, -25],
      "dimensions": [10, 1, 10],
      "color": "#1abc9c",
      "rotation": [0, 0.785, 0],
      "isStatic": true
    },
    {
      "id": "diagonal_building1",
      "type": "Box",
      "mass": 0,
      "position": [15, 21, -25],
      "dimensions": [6, 5, 6],
      "color": "#16a085",
      "rotation": [0, 0.785, 0],
      "isStatic": true
    },
    {
      "id": "transport_tube1",
      "type": "Cylinder",
      "mass": 0,
      "position": [10, 15, 0],
      "radius": 1,
      "height": 20,
      "color": "#bdc3c7",
      "rotation": [0, 0, 1.57],
      "isStatic": true,
      "opacity": 0.7
    },
    {
      "id": "transport_tube2",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 20, 10],
      "radius": 1,
      "height": 25,
      "color": "#bdc3c7",
      "rotation": [1.57, 0, 0],
      "isStatic": true,
      "opacity": 0.7
    },
    {
      "id": "antenna_tower",
      "type": "Cylinder",
      "mass": 0,
      "position": [-25, 22, 10],
      "radius": 0.3,
      "height": 15,
      "color": "#ecf0f1",
      "isStatic": true
    },
    {
      "id": "antenna_dish",
      "type": "Cylinder",
      "mass": 0,
      "position": [-25, 30, 10],
      "radius": 2,
      "height": 0.5,
      "color": "#bdc3c7",
      "isStatic": true
    },
    {
      "id": "lower_platform",
      "type": "Box",
      "mass": 0,
      "position": [0, -10, 0],
      "dimensions": [30, 1, 30],
      "color": "#34495e",
      "isStatic": true
    },
    {
      "id": "lower_building1",
      "type": "Box",
      "mass": 0,
      "position": [-10, -7, -10],
      "dimensions": [5, 5, 5],
      "color": "#2c3e50",
      "isStatic": true
    },
    {
      "id": "lower_building2",
      "type": "Cylinder",
      "mass": 0,
      "position": [10, -6.5, 10],
      "radius": 3,
      "height": 6,
      "color": "#2c3e50",
      "isStatic": true
    },
    {
      "id": "vertical_connector1",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, -5, 0],
      "radius": 0.5,
      "height": 10,
      "color": "#7f8c8d",
      "isStatic": true
    },
    {
      "id": "floating_platform_tiny1",
      "type": "Box",
      "mass": 0,
      "position": [45, 8, 20],
      "dimensions": [5, 0.5, 5],
      "color": "#e74c3c",
      "isStatic": true
    },
    {
      "id": "floating_platform_tiny2",
      "type": "Box",
      "mass": 0,
      "position": [-45, 18, -25],
      "dimensions": [5, 0.5, 5],
      "color": "#3498db",
      "isStatic": true
    },
    {
      "id": "orbital_ring",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 40, 0],
      "radius": 35,
      "height": 0.5,
      "color": "#95a5a6",
      "isStatic": true,
      "opacity": 0.5
    },
    {
      "id": "ring_station1",
      "type": "Box",
      "mass": 0,
      "position": [35, 40, 0],
      "dimensions": [3, 2, 3],
      "color": "#ecf0f1",
      "isStatic": true
    },
    {
      "id": "ring_station2",
      "type": "Box",
      "mass": 0,
      "position": [-35, 40, 0],
      "dimensions": [3, 2, 3],
      "color": "#ecf0f1",
      "isStatic": true
    },
    {
      "id": "ring_station3",
      "type": "Box",
      "mass": 0,
      "position": [0, 40, 35],
      "dimensions": [3, 2, 3],
      "color": "#ecf0f1",
      "isStatic": true
    },
    {
      "id": "ring_station4",
      "type": "Box",
      "mass": 0,
      "position": [0, 40, -35],
      "dimensions": [3, 2, 3],
      "color": "#ecf0f1",
      "isStatic": true
    }
  ],
  "gravity": [0, 0, 0],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.5,
    "restitution": 0.7
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.67430e-11,
    "minDistance": 1e-6,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},
{
  "id": "urban_eco_city",
  "name": "Urban Eco City",
  "description": "A detailed, realistic, and meaningful city scene representing a sustainable urban environment. The city features residential blocks, office towers, a central park, a river with bridges, a school, a hospital, a sports stadium, and a solar farm. All objects are carefully positioned to avoid overlap and reflect a plausible city layout at tabletop scale.",
  "objects": [
    {
      "id": "central_park",
      "type": "Box",
      "mass": 0,
      "position": [0, 0.5, 0],
      "dimensions": [30, 1, 20],
      "color": "#27ae60",
      "isStatic": true
    },
    {
      "id": "park_pond",
      "type": "Cylinder",
      "mass": 0,
      "position": [5, 1.1, 2],
      "radius": 4,
      "height": 0.2,
      "color": "#5dade2",
      "isStatic": true,
      "opacity": 0.7
    },
    {
      "id": "residential_block_1",
      "type": "Box",
      "mass": 0,
      "position": [-20, 4, 10],
      "dimensions": [10, 8, 10],
      "color": "#f7cac9",
      "isStatic": true
    },
    {
      "id": "residential_block_2",
      "type": "Box",
      "mass": 0,
      "position": [-20, 4, -10],
      "dimensions": [10, 8, 10],
      "color": "#f7cac9",
      "isStatic": true
    },
    {
      "id": "residential_block_3",
      "type": "Box",
      "mass": 0,
      "position": [20, 4, 10],
      "dimensions": [10, 8, 10],
      "color": "#f7cac9",
      "isStatic": true
    },
    {
      "id": "residential_block_4",
      "type": "Box",
      "mass": 0,
      "position": [20, 4, -10],
      "dimensions": [10, 8, 10],
      "color": "#f7cac9",
      "isStatic": true
    },
    {
      "id": "office_tower_1",
      "type": "Box",
      "mass": 0,
      "position": [-10, 10, 25],
      "dimensions": [8, 20, 8],
      "color": "#5dade2",
      "isStatic": true
    },
    {
      "id": "office_tower_2",
      "type": "Box",
      "mass": 0,
      "position": [10, 10, 25],
      "dimensions": [8, 20, 8],
      "color": "#5dade2",
      "isStatic": true
    },
    {
      "id": "school",
      "type": "Box",
      "mass": 0,
      "position": [-25, 3, -25],
      "dimensions": [12, 6, 8],
      "color": "#f9e79f",
      "isStatic": true
    },
    {
      "id": "hospital",
      "type": "Box",
      "mass": 0,
      "position": [25, 5, -25],
      "dimensions": [14, 10, 10],
      "color": "#f1948a",
      "isStatic": true
    },
    {
      "id": "sports_stadium",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 6, 30],
      "radius": 12,
      "height": 6,
      "color": "#a569bd",
      "isStatic": true
    },
    {
      "id": "river",
      "type": "Box",
      "mass": 0,
      "position": [0, 0.2, -15],
      "dimensions": [60, 0.4, 6],
      "color": "#85c1e9",
      "isStatic": true,
      "opacity": 0.6
    },
    {
      "id": "bridge_1",
      "type": "Box",
      "mass": 0,
      "position": [-15, 1.2, -15],
      "dimensions": [10, 1, 8],
      "color": "#b2babb",
      "isStatic": true
    },
    {
      "id": "bridge_2",
      "type": "Box",
      "mass": 0,
      "position": [15, 1.2, -15],
      "dimensions": [10, 1, 8],
      "color": "#b2babb",
      "isStatic": true
    },
    {
      "id": "solar_farm",
      "type": "Box",
      "mass": 0,
      "position": [0, 1, -35],
      "dimensions": [30, 2, 8],
      "color": "#34495e",
      "isStatic": true
    },
    {
      "id": "solar_panel_1",
      "type": "Box",
      "mass": 0,
      "position": [-10, 2.2, -35],
      "dimensions": [6, 0.2, 6],
      "color": "#5dade2",
      "isStatic": true,
      "opacity": 0.8
    },
    {
      "id": "solar_panel_2",
      "type": "Box",
      "mass": 0,
      "position": [0, 2.2, -35],
      "dimensions": [6, 0.2, 6],
      "color": "#5dade2",
      "isStatic": true,
      "opacity": 0.8
    },
    {
      "id": "solar_panel_3",
      "type": "Box",
      "mass": 0,
      "position": [10, 2.2, -35],
      "dimensions": [6, 0.2, 6],
      "color": "#5dade2",
      "isStatic": true,
      "opacity": 0.8
    },
    {
      "id": "tree_1",
      "type": "Cylinder",
      "mass": 0,
      "position": [-5, 2, 5],
      "radius": 0.4,
      "height": 3,
      "color": "#784212",
      "isStatic": true
    },
    {
      "id": "tree_1_leaves",
      "type": "Sphere",
      "mass": 0,
      "position": [-5, 3.8, 5],
      "radius": 1.2,
      "color": "#229954",
      "isStatic": true
    },
    {
      "id": "tree_2",
      "type": "Cylinder",
      "mass": 0,
      "position": [5, 2, -5],
      "radius": 0.4,
      "height": 3,
      "color": "#784212",
      "isStatic": true
    },
    {
      "id": "tree_2_leaves",
      "type": "Sphere",
      "mass": 0,
      "position": [5, 3.8, -5],
      "radius": 1.2,
      "color": "#229954",
      "isStatic": true
    },
    {
      "id": "tree_3",
      "type": "Cylinder",
      "mass": 0,
      "position": [0, 2, 8],
      "radius": 0.4,
      "height": 3,
      "color": "#784212",
      "isStatic": true
    },
    {
      "id": "tree_3_leaves",
      "type": "Sphere",
      "mass": 0,
      "position": [0, 3.8, 8],
      "radius": 1.2,
      "color": "#229954",
      "isStatic": true
    },
    {
      "id": "bus",
      "type": "Box",
      "mass": 10,
      "position": [-15, 2, -13],
      "dimensions": [4, 2, 2],
      "color": "#f4d03f",
      "velocity": [2, 0, 0]
    },
    {
      "id": "car_1",
      "type": "Box",
      "mass": 5,
      "position": [15, 2, -17],
      "dimensions": [2, 1.2, 1.2],
      "color": "#e74c3c",
      "velocity": [-2, 0, 0]
    },
    {
      "id": "car_2",
      "type": "Box",
      "mass": 5,
      "position": [0, 2, -13],
      "dimensions": [2, 1.2, 1.2],
      "color": "#3498db",
      "velocity": [2, 0, 0]
    }
  ],
  "gravity": [0, -9.81, 0],
  "hasGround": true,
  "contactMaterial": {
    "friction": 0.6,
    "restitution": 0.3
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-8,
    "minDistance": 0.01,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "comprehensive_physics_lab",
  "name": "Comprehensive Physics Lab",
  "description": "A detailed tabletop scene that demonstrates core mechanics concepts: an inclined-plane experiment, elastic collisions between carts on a track, and projectile motion from a launch platform. Students can observe frictional forces, gravitational acceleration, momentum conservation, and parabolic trajectories—all in one interactive setup.",
  "objects": [
    {
      "id": "inclined_plane",
      "type": "Box",
      "mass": 0,
      "position": [-10, 2, 0],
      "dimensions": [20, 1, 5],
      "color": "#8d6e63",
      "rotation": [0, 0, -0.2618],
      "isStatic": true
    },
    {
      "id": "block_on_incline",
      "type": "Box",
      "mass": 3,
      "position": [-18, 5.5, 0],
      "dimensions": [2, 2, 2],
      "color": "#ff7043",
      "restitution": 0.2,
      "velocity": [0, 0, 0]
    },
    {
      "id": "cart_track",
      "type": "Box",
      "mass": 0,
      "position": [0, 1, 15],
      "dimensions": [40, 1, 5],
      "color": "#90a4ae",
      "isStatic": true
    },
    {
      "id": "cart_left",
      "type": "Box",
      "mass": 2,
      "position": [-10, 2, 15],
      "dimensions": [4, 2, 4],
      "color": "#42a5f5",
      "velocity": [3, 0, 0],
      "restitution": 0.9
    },
    {
      "id": "cart_right",
      "type": "Box",
      "mass": 2,
      "position": [10, 2, 15],
      "dimensions": [4, 2, 4],
      "color": "#ab47bc",
      "velocity": [0, 0, 0],
      "restitution": 0.9
    },
    {
      "id": "launch_platform",
      "type": "Box",
      "mass": 0,
      "position": [30, 1, 0],
      "dimensions": [5, 1, 5],
      "color": "#afb42b",
      "isStatic": true
    },
    {
      "id": "projectile_sphere",
      "type": "Sphere",
      "mass": 1,
      "position": [30, 3, 0],
      "radius": 1,
      "color": "#fdd835",
      "velocity": [5, 5, 0],
      "restitution": 0.6
    }
  ],
  "gravity": [0, -9.81, 0],
  "hasGround": true,
  "contactMaterial": {
    "friction": 0.3,
    "restitution": 0.8
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-8,
    "minDistance": 0.01,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "rube_goldberg_coffee_machine",
  "name": "The Morning Coffee Automaton",
  "description": "A complex Rube Goldberg machine designed to perform the simple task of pressing a button on a coffee maker. It features a multi-stage chain reaction including a marble run, a massive domino rally, a catapult, a Newton's cradle, a plinko drop, and rolling logs. Every object is carefully placed to ensure a smooth, continuous, and chaotic operation.",
  "objects": [
    {
      "id": "base_structure_main",
      "type": "Box",
      "mass": 0,
      "position": [0, 0.5, 0],
      "dimensions": [120, 1, 60],
      "color": "#7f8c8d",
      "isStatic": true
    },
    {
      "id": "back_wall",
      "type": "Box",
      "mass": 0,
      "position": [0, 20, -29.5],
      "dimensions": [120, 40, 1],
      "color": "#95a5a6",
      "isStatic": true
    },
    {
      "id": "start_platform",
      "type": "Box",
      "mass": 0,
      "position": [50, 35, 0],
      "dimensions": [20, 1, 20],
      "color": "#bdc3c7",
      "isStatic": true
    },
    {
      "id": "marble_start",
      "type": "Sphere",
      "mass": 5,
      "position": [58, 36.6, 0],
      "radius": 1,
      "color": "#e74c3c",
      "restitution": 0.5
    },
    {
      "id": "ramp_1",
      "type": "Box",
      "mass": 0,
      "position": [48, 33, 0],
      "dimensions": [15, 0.5, 4],
      "color": "#34495e",
      "isStatic": true,
      "rotation": [0, 0, 0.35]
    },
    {
      "id": "ramp_2",
      "type": "Box",
      "mass": 0,
      "position": [34, 30, 5],
      "dimensions": [15, 0.5, 4],
      "color": "#34495e",
      "isStatic": true,
      "rotation": [0.3, 0, -0.25]
    },
    {
      "id": "ramp_3_to_dominoes",
      "type": "Box",
      "mass": 0,
      "position": [20, 27, 0],
      "dimensions": [15, 0.5, 4],
      "color": "#34495e",
      "isStatic": true,
      "rotation": [0, 0, 0.3]
    },
    {
      "id": "domino_platform",
      "type": "Box",
      "mass": 0,
      "position": [-15, 23, 0],
      "dimensions": [70, 1, 10],
      "color": "#bdc3c7",
      "isStatic": true
    },
    { "id": "domino_0", "type": "Box", "mass": 0.2, "position": [15, 25, 0], "dimensions": [0.4, 3, 2], "color": "#1abc9c", "restitution": 0.1 },
    { "id": "domino_1", "type": "Box", "mass": 0.2, "position": [13, 25, 0], "dimensions": [0.4, 3, 2], "color": "#16a085", "restitution": 0.1 },
    { "id": "domino_2", "type": "Box", "mass": 0.2, "position": [11, 25, 0], "dimensions": [0.4, 3, 2], "color": "#2ecc71", "restitution": 0.1 },
    { "id": "domino_3", "type": "Box", "mass": 0.2, "position": [9, 25, 0], "dimensions": [0.4, 3, 2], "color": "#27ae60", "restitution": 0.1 },
    { "id": "domino_4", "type": "Box", "mass": 0.2, "position": [7, 25, 0], "dimensions": [0.4, 3, 2], "color": "#3498db", "restitution": 0.1 },
    { "id": "domino_5", "type": "Box", "mass": 0.2, "position": [5, 25, 0], "dimensions": [0.4, 3, 2], "color": "#2980b9", "restitution": 0.1 },
    { "id": "domino_6", "type": "Box", "mass": 0.2, "position": [3, 25, 0], "dimensions": [0.4, 3, 2], "color": "#9b59b6", "restitution": 0.1 },
    { "id": "domino_7", "type": "Box", "mass": 0.2, "position": [1, 25, 0], "dimensions": [0.4, 3, 2], "color": "#8e44ad", "restitution": 0.1 },
    { "id": "domino_8", "type": "Box", "mass": 0.2, "position": [-1, 25, 0], "dimensions": [0.4, 3, 2], "color": "#f1c40f", "restitution": 0.1 },
    { "id": "domino_9", "type": "Box", "mass": 0.2, "position": [-3, 25, 0], "dimensions": [0.4, 3, 2], "color": "#f39c12", "restitution": 0.1 },
    { "id": "domino_10", "type": "Box", "mass": 0.2, "position": [-5, 25, 0], "dimensions": [0.4, 3, 2], "color": "#e67e22", "restitution": 0.1 },
    { "id": "domino_11", "type": "Box", "mass": 0.2, "position": [-7, 25, 0], "dimensions": [0.4, 3, 2], "color": "#d35400", "restitution": 0.1 },
    { "id": "domino_12", "type": "Box", "mass": 0.2, "position": [-9, 25, 0], "dimensions": [0.4, 3, 2], "color": "#e74c3c", "restitution": 0.1 },
    { "id": "domino_13", "type": "Box", "mass": 0.2, "position": [-11, 25, 0], "dimensions": [0.4, 3, 2], "color": "#c0392b", "restitution": 0.1 },
    { "id": "domino_14", "type": "Box", "mass": 0.2, "position": [-13, 25, 0], "dimensions": [0.4, 3, 2], "color": "#1abc9c", "restitution": 0.1 },
    { "id": "domino_15", "type": "Box", "mass": 0.2, "position": [-15, 25, 0], "dimensions": [0.4, 3, 2], "color": "#16a085", "restitution": 0.1 },
    { "id": "domino_16", "type": "Box", "mass": 0.2, "position": [-17, 25, 0], "dimensions": [0.4, 3, 2], "color": "#2ecc71", "restitution": 0.1 },
    { "id": "domino_17", "type": "Box", "mass": 0.2, "position": [-19, 25, 0], "dimensions": [0.4, 3, 2], "color": "#27ae60", "restitution": 0.1 },
    { "id": "domino_18", "type": "Box", "mass": 0.2, "position": [-21, 25, 0], "dimensions": [0.4, 3, 2], "color": "#3498db", "restitution": 0.1 },
    { "id": "domino_19", "type": "Box", "mass": 0.2, "position": [-23, 25, 0], "dimensions": [0.4, 3, 2], "color": "#2980b9", "restitution": 0.1 },
    { "id": "domino_20", "type": "Box", "mass": 0.2, "position": [-25, 25, 0], "dimensions": [0.4, 3, 2], "color": "#9b59b6", "restitution": 0.1 },
    { "id": "domino_21", "type": "Box", "mass": 0.2, "position": [-27, 25, 0], "dimensions": [0.4, 3, 2], "color": "#8e44ad", "restitution": 0.1 },
    { "id": "domino_22", "type": "Box", "mass": 0.2, "position": [-29, 25, 0], "dimensions": [0.4, 3, 2], "color": "#f1c40f", "restitution": 0.1 },
    { "id": "domino_23", "type": "Box", "mass": 0.2, "position": [-31, 25, 0], "dimensions": [0.4, 3, 2], "color": "#f39c12", "restitution": 0.1 },
    { "id": "domino_24", "type": "Box", "mass": 0.2, "position": [-33, 25, 0], "dimensions": [0.4, 3, 2], "color": "#e67e22", "restitution": 0.1 },
    { "id": "domino_25", "type": "Box", "mass": 0.2, "position": [-35, 25, 0], "dimensions": [0.4, 3, 2], "color": "#d35400", "restitution": 0.1 },
    { "id": "domino_26", "type": "Box", "mass": 0.2, "position": [-37, 25, 0], "dimensions": [0.4, 3, 2], "color": "#e74c3c", "restitution": 0.1 },
    { "id": "domino_27", "type": "Box", "mass": 0.2, "position": [-39, 25, 0], "dimensions": [0.4, 3, 2], "color": "#c0392b", "restitution": 0.1 },
    { "id": "domino_28", "type": "Box", "mass": 0.2, "position": [-41, 25, 0], "dimensions": [0.4, 3, 2], "color": "#1abc9c", "restitution": 0.1 },
    { "id": "domino_29", "type": "Box", "mass": 0.2, "position": [-43, 25, 0], "dimensions": [0.4, 3, 2], "color": "#16a085", "restitution": 0.1 },
    {
      "id": "lever_platform",
      "type": "Box",
      "mass": 0,
      "position": [-52, 21, 0],
      "dimensions": [10, 1, 10],
      "color": "#bdc3c7",
      "isStatic": true
    },
    {
      "id": "lever_fulcrum",
      "type": "Cylinder",
      "mass": 0,
      "position": [-52, 22, 0],
      "radius": 0.5,
      "height": 4,
      "color": "#2c3e50",
      "isStatic": true
    },
    {
      "id": "lever_arm",
      "type": "Box",
      "mass": 2,
      "position": [-52, 22.5, 0],
      "dimensions": [12, 0.4, 2],
      "color": "#c0392b"
    },
    {
      "id": "catapult_payload",
      "type": "Sphere",
      "mass": 4,
      "position": [-57, 23.2, 0],
      "radius": 0.8,
      "color": "#f39c12"
    },
    {
      "id": "newton_cradle_platform",
      "type": "Box",
      "mass": 0,
      "position": [-57, 30, 10],
      "dimensions": [2, 1, 14],
      "color": "#bdc3c7",
      "isStatic": true
    },
    { "id": "cradle_ball_1", "type": "Sphere", "mass": 5, "position": [-57, 32, 4], "radius": 1, "color": "#ecf0f1", "restitution": 0.98 },
    { "id": "cradle_ball_2", "type": "Sphere", "mass": 5, "position": [-57, 32, 6.01], "radius": 1, "color": "#ecf0f1", "restitution": 0.98 },
    { "id": "cradle_ball_3", "type": "Sphere", "mass": 5, "position": [-57, 32, 8.02], "radius": 1, "color": "#ecf0f1", "restitution": 0.98 },
    { "id": "cradle_ball_4", "type": "Sphere", "mass": 5, "position": [-57, 32, 10.03], "radius": 1, "color": "#ecf0f1", "restitution": 0.98 },
    { "id": "cradle_ball_5", "type": "Sphere", "mass": 5, "position": [-57, 32, 12.04], "radius": 1, "color": "#ecf0f1", "restitution": 0.98 },
    {
      "id": "plinko_chip",
      "type": "Cylinder",
      "mass": 1,
      "position": [-57, 32, 16],
      "radius": 1.2,
      "height": 0.3,
      "color": "#3498db"
    },
    { "id": "plinko_peg_1", "type": "Cylinder", "mass": 0, "position": [-50, 27, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_2", "type": "Cylinder", "mass": 0, "position": [-45, 25, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_3", "type": "Cylinder", "mass": 0, "position": [-50, 23, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_4", "type": "Cylinder", "mass": 0, "position": [-45, 21, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_5", "type": "Cylinder", "mass": 0, "position": [-50, 19, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_6", "type": "Cylinder", "mass": 0, "position": [-45, 17, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_7", "type": "Cylinder", "mass": 0, "position": [-50, 15, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_8", "type": "Cylinder", "mass": 0, "position": [-45, 13, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    { "id": "plinko_peg_9", "type": "Cylinder", "mass": 0, "position": [-50, 11, 16], "radius": 0.3, "height": 1, "color": "#2c3e50", "isStatic": true },
    {
      "id": "funnel_to_logs",
      "type": "Box",
      "mass": 0,
      "position": [-47.5, 9, 16],
      "dimensions": [10, 0.5, 2],
      "color": "#e67e22",
      "isStatic": true,
      "rotation": [0,0,-0.2]
    },
    {
      "id": "log_platform",
      "type": "Box",
      "mass": 0,
      "position": [-25, 1, 16],
      "dimensions": [30, 1, 10],
      "color": "#bdc3c7",
      "isStatic": true
    },
    { "id": "log_1", "type": "Cylinder", "mass": 3, "position": [-40, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_2", "type": "Cylinder", "mass": 3, "position": [-37, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_3", "type": "Cylinder", "mass": 3, "position": [-34, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_4", "type": "Cylinder", "mass": 3, "position": [-31, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_5", "type": "Cylinder", "mass": 3, "position": [-28, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_6", "type": "Cylinder", "mass": 3, "position": [-25, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_7", "type": "Cylinder", "mass": 3, "position": [-22, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_8", "type": "Cylinder", "mass": 3, "position": [-19, 3.5, 16], "radius": 1, "height": 3, "color": "#784212" },
    { "id": "log_final", "type": "Cylinder", "mass": 3, "position": [-16, 3.5, 16], "radius": 1, "height": 3, "color": "#e74c3c" },
    {
      "id": "coffee_machine_body",
      "type": "Box",
      "mass": 0,
      "position": [-10, 5, 16],
      "dimensions": [4, 8, 4],
      "color": "#34495e",
      "isStatic": true
    },
    {
      "id": "coffee_carafe_plate",
      "type": "Cylinder",
      "mass": 0,
      "position": [-10, 1.25, 16],
      "radius": 2.2,
      "height": 0.5,
      "color": "#000000",
      "isStatic": true
    },
    {
      "id": "coffee_carafe",
      "type": "Cylinder",
      "mass": 0,
      "position": [-10, 3, 16],
      "radius": 1.8,
      "height": 3,
      "color": "#aed6f1",
      "isStatic": true,
      "opacity": 0.4
    },
    {
      "id": "coffee_filter_holder",
      "type": "Box",
      "mass": 0,
      "position": [-10, 6, 16],
      "dimensions": [3, 2, 3],
      "color": "#2c3e50",
      "isStatic": true
    },
    {
      "id": "final_button_housing",
      "type": "Box",
      "mass": 0,
      "position": [-10, 7, 18.5],
      "dimensions": [2, 2, 1],
      "color": "#2c3e50",
      "isStatic": true
    },
    {
      "id": "final_button",
      "type": "Box",
      "mass": 1,
      "position": [-10, 7, 17.8],
      "dimensions": [1.5, 1.5, 0.6],
      "color": "#c0392b"
    },
    { "id": "deco_gear_1", "type": "Cylinder", "mass": 0, "position": [20, 15, -29], "radius": 5, "height": 1, "color": "#f39c12", "isStatic": true, "rotation": [1.57,0,0] },
    { "id": "deco_gear_2", "type": "Cylinder", "mass": 0, "position": [30, 25, -29], "radius": 8, "height": 1, "color": "#f39c12", "isStatic": true, "rotation": [1.57,0,0] },
    { "id": "deco_gear_3", "type": "Cylinder", "mass": 0, "position": [5, 8, -29], "radius": 4, "height": 1, "color": "#f39c12", "isStatic": true, "rotation": [1.57,0,0] },
    { "id": "deco_gear_4", "type": "Cylinder", "mass": 0, "position": [-10, 18, -29], "radius": 6, "height": 1, "color": "#f39c12", "isStatic": true, "rotation": [1.57,0,0] },
    { "id": "deco_pipe_1", "type": "Cylinder", "mass": 0, "position": [-40, 30, -29], "radius": 1, "height": 20, "color": "#7f8c8d", "isStatic": true, "rotation": [1.57,0,1.57] },
    { "id": "deco_pipe_2", "type": "Cylinder", "mass": 0, "position": [40, 5, -29], "radius": 1, "height": 30, "color": "#7f8c8d", "isStatic": true, "rotation": [0.8,0,0] },
    { "id": "deco_pipe_3", "type": "Cylinder", "mass": 0, "position": [0, 35, -29], "radius": 1.5, "height": 40, "color": "#7f8c8d", "isStatic": true, "rotation": [1.57,0,1.57] },
    { "id": "deco_box_1", "type": "Box", "mass": 0, "position": [55, 5, 20], "dimensions": [4,8,4], "color": "#34495e", "isStatic": true },
    { "id": "deco_box_2", "type": "Box", "mass": 0, "position": [50, 4, -20], "dimensions": [6,6,6], "color": "#34495e", "isStatic": true },
    { "id": "deco_box_3", "type": "Box", "mass": 0, "position": [-55, 8, -15], "dimensions": [2,14,2], "color": "#34495e", "isStatic": true },
    { "id": "deco_sphere_1", "type": "Sphere", "mass": 0, "position": [0, 35, 25], "radius": 3, "color": "#9b59b6", "isStatic": true }
  ],
  "gravity": [0, -9.81, 0],
  "hasGround": true,
  "contactMaterial": {
    "friction": 0.5,
    "restitution": 0.3
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 0.1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "neo_kyoto_the_great_sprawl_v2",
  "name": "Neo-Kyoto: The Great Sprawl v2",
  "description": "A massively expanded cyberpunk city focusing on architectural complexity and overwhelming scale. The 'Digital Rain' has been removed and replaced with hundreds of additional buildings, creating a dense urban forest. The scene is dominated by unique mega-structures, including the twisting 'Izanagi Shard', a city-spanning arcology bridge, and a data ziggurat, all without flying vehicles to emphasize the oppressive, monumental scale.",
  "objects": [
    {
      "id": "custom_ground_plane",
      "type": "Plane",
      "mass": 0,
      "position": [0, -0.05, 0],
      "dimensions": [500, 0.1, 500],
      "color": "#17202A",
      "isStatic": true
    },
    {"id": "shard_segment_000", "type": "Box", "mass": 0, "position": [0, 1.0, 0], "dimensions": [40.0, 2.0, 40.0], "color": "#17202A", "isStatic": true, "rotation": [0, 0.0, 0]},
    {"id": "shard_segment_001", "type": "Box", "mass": 0, "position": [0, 3.0, 0], "dimensions": [39.8, 2.0, 39.8], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.02, 0]},
    {"id": "shard_segment_002", "type": "Box", "mass": 0, "position": [0, 5.0, 0], "dimensions": [39.6, 2.0, 39.6], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.04, 0]},
    {"id": "shard_segment_003", "type": "Box", "mass": 0, "position": [0, 7.0, 0], "dimensions": [39.4, 2.0, 39.4], "color": "#283747", "isStatic": true, "rotation": [0, 0.06, 0]},
    {"id": "shard_segment_004", "type": "Box", "mass": 0, "position": [0, 9.0, 0], "dimensions": [39.2, 2.0, 39.2], "color": "#17202A", "isStatic": true, "rotation": [0, 0.08, 0]},
    {"id": "shard_segment_005", "type": "Box", "mass": 0, "position": [0, 11.0, 0], "dimensions": [39.0, 2.0, 39.0], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.1, 0]},
    {"id": "shard_segment_006", "type": "Box", "mass": 0, "position": [0, 13.0, 0], "dimensions": [38.8, 2.0, 38.8], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.12, 0]},
    {"id": "shard_segment_007", "type": "Box", "mass": 0, "position": [0, 15.0, 0], "dimensions": [38.6, 2.0, 38.6], "color": "#283747", "isStatic": true, "rotation": [0, 0.14, 0]},
    {"id": "shard_segment_008", "type": "Box", "mass": 0, "position": [0, 17.0, 0], "dimensions": [38.4, 2.0, 38.4], "color": "#17202A", "isStatic": true, "rotation": [0, 0.16, 0]},
    {"id": "shard_segment_009", "type": "Box", "mass": 0, "position": [0, 19.0, 0], "dimensions": [38.2, 2.0, 38.2], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.18, 0]},
    {"id": "shard_segment_010", "type": "Box", "mass": 0, "position": [0, 21.0, 0], "dimensions": [38.0, 2.0, 38.0], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.2, 0]},
    {"id": "shard_segment_011", "type": "Box", "mass": 0, "position": [0, 23.0, 0], "dimensions": [37.8, 2.0, 37.8], "color": "#283747", "isStatic": true, "rotation": [0, 0.22, 0]},
    {"id": "shard_segment_012", "type": "Box", "mass": 0, "position": [0, 25.0, 0], "dimensions": [37.6, 2.0, 37.6], "color": "#17202A", "isStatic": true, "rotation": [0, 0.24, 0]},
    {"id": "shard_segment_013", "type": "Box", "mass": 0, "position": [0, 27.0, 0], "dimensions": [37.4, 2.0, 37.4], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.26, 0]},
    {"id": "shard_segment_014", "type": "Box", "mass": 0, "position": [0, 29.0, 0], "dimensions": [37.2, 2.0, 37.2], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.28, 0]},
    {"id": "shard_segment_015", "type": "Box", "mass": 0, "position": [0, 31.0, 0], "dimensions": [37.0, 2.0, 37.0], "color": "#283747", "isStatic": true, "rotation": [0, 0.3, 0]},
    {"id": "shard_segment_016", "type": "Box", "mass": 0, "position": [0, 33.0, 0], "dimensions": [36.8, 2.0, 36.8], "color": "#17202A", "isStatic": true, "rotation": [0, 0.32, 0]},
    {"id": "shard_segment_017", "type": "Box", "mass": 0, "position": [0, 35.0, 0], "dimensions": [36.6, 2.0, 36.6], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.34, 0]},
    {"id": "shard_segment_018", "type": "Box", "mass": 0, "position": [0, 37.0, 0], "dimensions": [36.4, 2.0, 36.4], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.36, 0]},
    {"id": "shard_segment_019", "type": "Box", "mass": 0, "position": [0, 39.0, 0], "dimensions": [36.2, 2.0, 36.2], "color": "#283747", "isStatic": true, "rotation": [0, 0.38, 0]},
    {"id": "shard_segment_020", "type": "Box", "mass": 0, "position": [0, 41.0, 0], "dimensions": [36.0, 2.0, 36.0], "color": "#17202A", "isStatic": true, "rotation": [0, 0.4, 0]},
    {"id": "shard_segment_021", "type": "Box", "mass": 0, "position": [0, 43.0, 0], "dimensions": [35.8, 2.0, 35.8], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.42, 0]},
    {"id": "shard_segment_022", "type": "Box", "mass": 0, "position": [0, 45.0, 0], "dimensions": [35.6, 2.0, 35.6], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.44, 0]},
    {"id": "shard_segment_023", "type": "Box", "mass": 0, "position": [0, 47.0, 0], "dimensions": [35.4, 2.0, 35.4], "color": "#283747", "isStatic": true, "rotation": [0, 0.46, 0]},
    {"id": "shard_segment_024", "type": "Box", "mass": 0, "position": [0, 49.0, 0], "dimensions": [35.2, 2.0, 35.2], "color": "#17202A", "isStatic": true, "rotation": [0, 0.48, 0]},
    {"id": "shard_segment_025", "type": "Box", "mass": 0, "position": [0, 51.0, 0], "dimensions": [35.0, 2.0, 35.0], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.5, 0]},
    {"id": "shard_segment_026", "type": "Box", "mass": 0, "position": [0, 53.0, 0], "dimensions": [34.8, 2.0, 34.8], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.52, 0]},
    {"id": "shard_segment_027", "type": "Box", "mass": 0, "position": [0, 55.0, 0], "dimensions": [34.6, 2.0, 34.6], "color": "#283747", "isStatic": true, "rotation": [0, 0.54, 0]},
    {"id": "shard_segment_028", "type": "Box", "mass": 0, "position": [0, 57.0, 0], "dimensions": [34.4, 2.0, 34.4], "color": "#17202A", "isStatic": true, "rotation": [0, 0.56, 0]},
    {"id": "shard_segment_029", "type": "Box", "mass": 0, "position": [0, 59.0, 0], "dimensions": [34.2, 2.0, 34.2], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.58, 0]},
    {"id": "shard_segment_030", "type": "Box", "mass": 0, "position": [0, 61.0, 0], "dimensions": [34.0, 2.0, 34.0], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.6, 0]},
    {"id": "shard_segment_031", "type": "Box", "mass": 0, "position": [0, 63.0, 0], "dimensions": [33.8, 2.0, 33.8], "color": "#283747", "isStatic": true, "rotation": [0, 0.62, 0]},
    {"id": "shard_segment_032", "type": "Box", "mass": 0, "position": [0, 65.0, 0], "dimensions": [33.6, 2.0, 33.6], "color": "#17202A", "isStatic": true, "rotation": [0, 0.64, 0]},
    {"id": "shard_segment_033", "type": "Box", "mass": 0, "position": [0, 67.0, 0], "dimensions": [33.4, 2.0, 33.4], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.66, 0]},
    {"id": "shard_segment_034", "type": "Box", "mass": 0, "position": [0, 69.0, 0], "dimensions": [33.2, 2.0, 33.2], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.68, 0]},
    {"id": "shard_segment_035", "type": "Box", "mass": 0, "position": [0, 71.0, 0], "dimensions": [33.0, 2.0, 33.0], "color": "#283747", "isStatic": true, "rotation": [0, 0.7, 0]},
    {"id": "shard_segment_036", "type": "Box", "mass": 0, "position": [0, 73.0, 0], "dimensions": [32.8, 2.0, 32.8], "color": "#17202A", "isStatic": true, "rotation": [0, 0.72, 0]},
    {"id": "shard_segment_037", "type": "Box", "mass": 0, "position": [0, 75.0, 0], "dimensions": [32.6, 2.0, 32.6], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.74, 0]},
    {"id": "shard_segment_038", "type": "Box", "mass": 0, "position": [0, 77.0, 0], "dimensions": [32.4, 2.0, 32.4], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.76, 0]},
    {"id": "shard_segment_039", "type": "Box", "mass": 0, "position": [0, 79.0, 0], "dimensions": [32.2, 2.0, 32.2], "color": "#283747", "isStatic": true, "rotation": [0, 0.78, 0]},
    {"id": "shard_segment_040", "type": "Box", "mass": 0, "position": [0, 81.0, 0], "dimensions": [32.0, 2.0, 32.0], "color": "#17202A", "isStatic": true, "rotation": [0, 0.8, 0]},
    {"id": "shard_segment_041", "type": "Box", "mass": 0, "position": [0, 83.0, 0], "dimensions": [31.8, 2.0, 31.8], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.82, 0]},
    {"id": "shard_segment_042", "type": "Box", "mass": 0, "position": [0, 85.0, 0], "dimensions": [31.6, 2.0, 31.6], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.84, 0]},
    {"id": "shard_segment_043", "type": "Box", "mass": 0, "position": [0, 87.0, 0], "dimensions": [31.4, 2.0, 31.4], "color": "#283747", "isStatic": true, "rotation": [0, 0.86, 0]},
    {"id": "shard_segment_044", "type": "Box", "mass": 0, "position": [0, 89.0, 0], "dimensions": [31.2, 2.0, 31.2], "color": "#17202A", "isStatic": true, "rotation": [0, 0.88, 0]},
    {"id": "shard_segment_045", "type": "Box", "mass": 0, "position": [0, 91.0, 0], "dimensions": [31.0, 2.0, 31.0], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.9, 0]},
    {"id": "shard_segment_046", "type": "Box", "mass": 0, "position": [0, 93.0, 0], "dimensions": [30.8, 2.0, 30.8], "color": "#212F3D", "isStatic": true, "rotation": [0, 0.92, 0]},
    {"id": "shard_segment_047", "type": "Box", "mass": 0, "position": [0, 95.0, 0], "dimensions": [30.6, 2.0, 30.6], "color": "#283747", "isStatic": true, "rotation": [0, 0.94, 0]},
    {"id": "shard_segment_048", "type": "Box", "mass": 0, "position": [0, 97.0, 0], "dimensions": [30.4, 2.0, 30.4], "color": "#17202A", "isStatic": true, "rotation": [0, 0.96, 0]},
    {"id": "shard_segment_049", "type": "Box", "mass": 0, "position": [0, 99.0, 0], "dimensions": [30.2, 2.0, 30.2], "color": "#1C2833", "isStatic": true, "rotation": [0, 0.98, 0]},
    {"id": "shard_segment_050", "type": "Box", "mass": 0, "position": [0, 101.0, 0], "dimensions": [30.0, 2.0, 30.0], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.0, 0]},
    {"id": "shard_segment_051", "type": "Box", "mass": 0, "position": [0, 103.0, 0], "dimensions": [29.8, 2.0, 29.8], "color": "#283747", "isStatic": true, "rotation": [0, 1.02, 0]},
    {"id": "shard_segment_052", "type": "Box", "mass": 0, "position": [0, 105.0, 0], "dimensions": [29.6, 2.0, 29.6], "color": "#17202A", "isStatic": true, "rotation": [0, 1.04, 0]},
    {"id": "shard_segment_053", "type": "Box", "mass": 0, "position": [0, 107.0, 0], "dimensions": [29.4, 2.0, 29.4], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.06, 0]},
    {"id": "shard_segment_054", "type": "Box", "mass": 0, "position": [0, 109.0, 0], "dimensions": [29.2, 2.0, 29.2], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.08, 0]},
    {"id": "shard_segment_055", "type": "Box", "mass": 0, "position": [0, 111.0, 0], "dimensions": [29.0, 2.0, 29.0], "color": "#283747", "isStatic": true, "rotation": [0, 1.1, 0]},
    {"id": "shard_segment_056", "type": "Box", "mass": 0, "position": [0, 113.0, 0], "dimensions": [28.8, 2.0, 28.8], "color": "#17202A", "isStatic": true, "rotation": [0, 1.12, 0]},
    {"id": "shard_segment_057", "type": "Box", "mass": 0, "position": [0, 115.0, 0], "dimensions": [28.6, 2.0, 28.6], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.14, 0]},
    {"id": "shard_segment_058", "type": "Box", "mass": 0, "position": [0, 117.0, 0], "dimensions": [28.4, 2.0, 28.4], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.16, 0]},
    {"id": "shard_segment_059", "type": "Box", "mass": 0, "position": [0, 119.0, 0], "dimensions": [28.2, 2.0, 28.2], "color": "#283747", "isStatic": true, "rotation": [0, 1.18, 0]},
    {"id": "shard_segment_060", "type": "Box", "mass": 0, "position": [0, 121.0, 0], "dimensions": [28.0, 2.0, 28.0], "color": "#17202A", "isStatic": true, "rotation": [0, 1.2, 0]},
    {"id": "shard_segment_061", "type": "Box", "mass": 0, "position": [0, 123.0, 0], "dimensions": [27.8, 2.0, 27.8], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.22, 0]},
    {"id": "shard_segment_062", "type": "Box", "mass": 0, "position": [0, 125.0, 0], "dimensions": [27.6, 2.0, 27.6], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.24, 0]},
    {"id": "shard_segment_063", "type": "Box", "mass": 0, "position": [0, 127.0, 0], "dimensions": [27.4, 2.0, 27.4], "color": "#283747", "isStatic": true, "rotation": [0, 1.26, 0]},
    {"id": "shard_segment_064", "type": "Box", "mass": 0, "position": [0, 129.0, 0], "dimensions": [27.2, 2.0, 27.2], "color": "#17202A", "isStatic": true, "rotation": [0, 1.28, 0]},
    {"id": "shard_segment_065", "type": "Box", "mass": 0, "position": [0, 131.0, 0], "dimensions": [27.0, 2.0, 27.0], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.3, 0]},
    {"id": "shard_segment_066", "type": "Box", "mass": 0, "position": [0, 133.0, 0], "dimensions": [26.8, 2.0, 26.8], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.32, 0]},
    {"id": "shard_segment_067", "type": "Box", "mass": 0, "position": [0, 135.0, 0], "dimensions": [26.6, 2.0, 26.6], "color": "#283747", "isStatic": true, "rotation": [0, 1.34, 0]},
    {"id": "shard_segment_068", "type": "Box", "mass": 0, "position": [0, 137.0, 0], "dimensions": [26.4, 2.0, 26.4], "color": "#17202A", "isStatic": true, "rotation": [0, 1.36, 0]},
    {"id": "shard_segment_069", "type": "Box", "mass": 0, "position": [0, 139.0, 0], "dimensions": [26.2, 2.0, 26.2], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.38, 0]},
    {"id": "shard_segment_070", "type": "Box", "mass": 0, "position": [0, 141.0, 0], "dimensions": [26.0, 2.0, 26.0], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.4, 0]},
    {"id": "shard_segment_071", "type": "Box", "mass": 0, "position": [0, 143.0, 0], "dimensions": [25.8, 2.0, 25.8], "color": "#283747", "isStatic": true, "rotation": [0, 1.42, 0]},
    {"id": "shard_segment_072", "type": "Box", "mass": 0, "position": [0, 145.0, 0], "dimensions": [25.6, 2.0, 25.6], "color": "#17202A", "isStatic": true, "rotation": [0, 1.44, 0]},
    {"id": "shard_segment_073", "type": "Box", "mass": 0, "position": [0, 147.0, 0], "dimensions": [25.4, 2.0, 25.4], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.46, 0]},
    {"id": "shard_segment_074", "type": "Box", "mass": 0, "position": [0, 149.0, 0], "dimensions": [25.2, 2.0, 25.2], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.48, 0]},
    {"id": "shard_segment_075", "type": "Box", "mass": 0, "position": [0, 151.0, 0], "dimensions": [25.0, 2.0, 25.0], "color": "#283747", "isStatic": true, "rotation": [0, 1.5, 0]},
    {"id": "shard_segment_076", "type": "Box", "mass": 0, "position": [0, 153.0, 0], "dimensions": [24.8, 2.0, 24.8], "color": "#17202A", "isStatic": true, "rotation": [0, 1.52, 0]},
    {"id": "shard_segment_077", "type": "Box", "mass": 0, "position": [0, 155.0, 0], "dimensions": [24.6, 2.0, 24.6], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.54, 0]},
    {"id": "shard_segment_078", "type": "Box", "mass": 0, "position": [0, 157.0, 0], "dimensions": [24.4, 2.0, 24.4], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.56, 0]},
    {"id": "shard_segment_079", "type": "Box", "mass": 0, "position": [0, 159.0, 0], "dimensions": [24.2, 2.0, 24.2], "color": "#283747", "isStatic": true, "rotation": [0, 1.58, 0]},
    {"id": "shard_segment_080", "type": "Box", "mass": 0, "position": [0, 161.0, 0], "dimensions": [24.0, 2.0, 24.0], "color": "#17202A", "isStatic": true, "rotation": [0, 1.6, 0]},
    {"id": "shard_segment_081", "type": "Box", "mass": 0, "position": [0, 163.0, 0], "dimensions": [23.8, 2.0, 23.8], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.62, 0]},
    {"id": "shard_segment_082", "type": "Box", "mass": 0, "position": [0, 165.0, 0], "dimensions": [23.6, 2.0, 23.6], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.64, 0]},
    {"id": "shard_segment_083", "type": "Box", "mass": 0, "position": [0, 167.0, 0], "dimensions": [23.4, 2.0, 23.4], "color": "#283747", "isStatic": true, "rotation": [0, 1.66, 0]},
    {"id": "shard_segment_084", "type": "Box", "mass": 0, "position": [0, 169.0, 0], "dimensions": [23.2, 2.0, 23.2], "color": "#17202A", "isStatic": true, "rotation": [0, 1.68, 0]},
    {"id": "shard_segment_085", "type": "Box", "mass": 0, "position": [0, 171.0, 0], "dimensions": [23.0, 2.0, 23.0], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.7, 0]},
    {"id": "shard_segment_086", "type": "Box", "mass": 0, "position": [0, 173.0, 0], "dimensions": [22.8, 2.0, 22.8], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.72, 0]},
    {"id": "shard_segment_087", "type": "Box", "mass": 0, "position": [0, 175.0, 0], "dimensions": [22.6, 2.0, 22.6], "color": "#283747", "isStatic": true, "rotation": [0, 1.74, 0]},
    {"id": "shard_segment_088", "type": "Box", "mass": 0, "position": [0, 177.0, 0], "dimensions": [22.4, 2.0, 22.4], "color": "#17202A", "isStatic": true, "rotation": [0, 1.76, 0]},
    {"id": "shard_segment_089", "type": "Box", "mass": 0, "position": [0, 179.0, 0], "dimensions": [22.2, 2.0, 22.2], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.78, 0]},
    {"id": "shard_segment_090", "type": "Box", "mass": 0, "position": [0, 181.0, 0], "dimensions": [22.0, 2.0, 22.0], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.8, 0]},
    {"id": "shard_segment_091", "type": "Box", "mass": 0, "position": [0, 183.0, 0], "dimensions": [21.8, 2.0, 21.8], "color": "#283747", "isStatic": true, "rotation": [0, 1.82, 0]},
    {"id": "shard_segment_092", "type": "Box", "mass": 0, "position": [0, 185.0, 0], "dimensions": [21.6, 2.0, 21.6], "color": "#17202A", "isStatic": true, "rotation": [0, 1.84, 0]},
    {"id": "shard_segment_093", "type": "Box", "mass": 0, "position": [0, 187.0, 0], "dimensions": [21.4, 2.0, 21.4], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.86, 0]},
    {"id": "shard_segment_094", "type": "Box", "mass": 0, "position": [0, 189.0, 0], "dimensions": [21.2, 2.0, 21.2], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.88, 0]},
    {"id": "shard_segment_095", "type": "Box", "mass": 0, "position": [0, 191.0, 0], "dimensions": [21.0, 2.0, 21.0], "color": "#283747", "isStatic": true, "rotation": [0, 1.9, 0]},
    {"id": "shard_segment_096", "type": "Box", "mass": 0, "position": [0, 193.0, 0], "dimensions": [20.8, 2.0, 20.8], "color": "#17202A", "isStatic": true, "rotation": [0, 1.92, 0]},
    {"id": "shard_segment_097", "type": "Box", "mass": 0, "position": [0, 195.0, 0], "dimensions": [20.6, 2.0, 20.6], "color": "#1C2833", "isStatic": true, "rotation": [0, 1.94, 0]},
    {"id": "shard_segment_098", "type": "Box", "mass": 0, "position": [0, 197.0, 0], "dimensions": [20.4, 2.0, 20.4], "color": "#212F3D", "isStatic": true, "rotation": [0, 1.96, 0]},
    {"id": "shard_segment_099", "type": "Box", "mass": 0, "position": [0, 199.0, 0], "dimensions": [20.2, 2.0, 20.2], "color": "#283747", "isStatic": true, "rotation": [0, 1.98, 0]},
    {"id": "shard_segment_100", "type": "Box", "mass": 0, "position": [0, 201.0, 0], "dimensions": [20.0, 2.0, 20.0], "color": "#17202A", "isStatic": true, "rotation": [0, 2.0, 0]},
    {"id": "arcology_support_1", "type": "Cylinder", "mass": 0, "position": [-150, 40, -80], "radius": 20, "height": 80, "color": "#283747", "isStatic": true},
    {"id": "arcology_support_2", "type": "Cylinder", "mass": 0, "position": [150, 40, -80], "radius": 20, "height": 80, "color": "#283747", "isStatic": true},
    {"id": "arcology_deck_segment_01", "type": "Box", "mass": 0, "position": [-130, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_02", "type": "Box", "mass": 0, "position": [-110, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_03", "type": "Box", "mass": 0, "position": [-90, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_04", "type": "Box", "mass": 0, "position": [-70, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_05", "type": "Box", "mass": 0, "position": [-50, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_06", "type": "Box", "mass": 0, "position": [-30, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_07", "type": "Box", "mass": 0, "position": [-10, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_08", "type": "Box", "mass": 0, "position": [10, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_09", "type": "Box", "mass": 0, "position": [30, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_10", "type": "Box", "mass": 0, "position": [50, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_11", "type": "Box", "mass": 0, "position": [70, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_12", "type": "Box", "mass": 0, "position": [90, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_13", "type": "Box", "mass": 0, "position": [110, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_deck_segment_14", "type": "Box", "mass": 0, "position": [130, 82.5, -80], "dimensions": [20, 5, 30], "color": "#34495E", "isStatic": true},
    {"id": "arcology_hab_01", "type": "Box", "mass": 0, "position": [-130, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_02", "type": "Box", "mass": 0, "position": [-110, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_03", "type": "Box", "mass": 0, "position": [-90, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_04", "type": "Box", "mass": 0, "position": [-70, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_05", "type": "Box", "mass": 0, "position": [-50, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_06", "type": "Box", "mass": 0, "position": [-30, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_07", "type": "Box", "mass": 0, "position": [-10, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_08", "type": "Box", "mass": 0, "position": [10, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_09", "type": "Box", "mass": 0, "position": [30, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_10", "type": "Box", "mass": 0, "position": [50, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_11", "type": "Box", "mass": 0, "position": [70, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_12", "type": "Box", "mass": 0, "position": [90, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_13", "type": "Box", "mass": 0, "position": [110, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_14", "type": "Box", "mass": 0, "position": [130, 90, -80], "dimensions": [18, 10, 8], "color": "#7F8C8D", "isStatic": true},
    {"id": "arcology_hab_15", "type": "Box", "mass": 0, "position": [-130, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_16", "type": "Box", "mass": 0, "position": [-110, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_17", "type": "Box", "mass": 0, "position": [-90, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_18", "type": "Box", "mass": 0, "position": [-70, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_19", "type": "Box", "mass": 0, "position": [-50, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_20", "type": "Box", "mass": 0, "position": [-30, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_21", "type": "Box", "mass": 0, "position": [-10, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_22", "type": "Box", "mass": 0, "position": [10, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_23", "type": "Box", "mass": 0, "position": [30, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_24", "type": "Box", "mass": 0, "position": [50, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_25", "type": "Box", "mass": 0, "position": [70, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_26", "type": "Box", "mass": 0, "position": [90, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_27", "type": "Box", "mass": 0, "position": [110, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "arcology_hab_28", "type": "Box", "mass": 0, "position": [130, 90, -92], "dimensions": [18, 10, 8], "color": "#707B7C", "isStatic": true},
    {"id": "data_ziggurat_l1", "type": "Box", "mass": 0, "position": [100, 10, 100], "dimensions": [60, 20, 60], "color": "#212F3D", "isStatic": true},
    {"id": "data_ziggurat_l2", "type": "Box", "mass": 0, "position": [100, 30, 100], "dimensions": [50, 20, 50], "color": "#283747", "isStatic": true},
    {"id": "data_ziggurat_l3", "type": "Box", "mass": 0, "position": [100, 50, 100], "dimensions": [40, 20, 40], "color": "#212F3D", "isStatic": true},
    {"id": "data_ziggurat_l4", "type": "Box", "mass": 0, "position": [100, 70, 100], "dimensions": [30, 20, 30], "color": "#283747", "isStatic": true},
    {"id": "data_ziggurat_top", "type": "Sphere", "mass": 0, "position": [100, 90, 100], "radius": 15, "color": "#5DADE2", "isStatic": true, "opacity": 0.5},
    {"id": "data_conduit_1", "type": "Cylinder", "mass": 0, "position": [70, 50, 100], "radius": 1, "height": 100, "rotation": [0,0,1.5707], "color": "#00FFFF", "isStatic": true, "opacity": 0.7},
    {"id": "data_conduit_2", "type": "Cylinder", "mass": 0, "position": [130, 30, 100], "radius": 1, "height": 60, "rotation": [0,0,1.5707], "color": "#00FFFF", "isStatic": true, "opacity": 0.7},
    {"id": "market_container_01", "type": "Box", "mass": 0, "position": [-10, 1.5, 30], "dimensions": [10, 3, 4], "color": "#78281F", "isStatic": true},
    {"id": "market_container_02", "type": "Box", "mass": 0, "position": [-10, 4.5, 30], "dimensions": [10, 3, 4], "color": "#512E5F", "isStatic": true},
    {"id": "market_container_03", "type": "Box", "mass": 0, "position": [0, 1.5, 30], "dimensions": [10, 3, 4], "color": "#0E6251", "isStatic": true},
    {"id": "market_container_04", "type": "Box", "mass": 0, "position": [10, 1.5, 30], "dimensions": [10, 3, 4], "color": "#784212", "isStatic": true},
    {"id": "market_container_05", "type": "Box", "mass": 0, "position": [20, 1.5, 30], "dimensions": [10, 3, 4], "color": "#1B4F72", "isStatic": true},
    {"id": "market_container_06", "type": "Box", "mass": 0, "position": [-10, 1.5, 40], "dimensions": [4, 3, 10], "color": "#7E5109", "isStatic": true},
    {"id": "market_container_07", "type": "Box", "mass": 0, "position": [-10, 4.5, 40], "dimensions": [4, 3, 10], "color": "#4A235A", "isStatic": true},
    {"id": "market_container_08", "type": "Box", "mass": 0, "position": [0, 1.5, 40], "dimensions": [4, 3, 10], "color": "#145A32", "isStatic": true},
    {"id": "market_container_09", "type": "Box", "mass": 0, "position": [10, 1.5, 40], "dimensions": [4, 3, 10], "color": "#6E2C00", "isStatic": true},
    {"id": "market_container_10", "type": "Box", "mass": 0, "position": [20, 1.5, 40], "dimensions": [4, 3, 10], "color": "#154360", "isStatic": true},
    {"id": "market_stall_01", "type": "Box", "mass": 0, "position": [-5, 1, 35], "dimensions": [2,2,2], "color": "#943126", "isStatic": true},
    {"id": "market_stall_02", "type": "Box", "mass": 0, "position": [-2, 1, 35], "dimensions": [2,2,2], "color": "#9B59B6", "isStatic": true},
    {"id": "market_stall_03", "type": "Box", "mass": 0, "position": [1, 1, 35], "dimensions": [2,2,2], "color": "#27AE60", "isStatic": true},
    {"id": "market_stall_04", "type": "Box", "mass": 0, "position": [4, 1, 35], "dimensions": [2,2,2], "color": "#F1C40F", "isStatic": true},
    {"id": "market_stall_05", "type": "Box", "mass": 0, "position": [7, 1, 35], "dimensions": [2,2,2], "color": "#3498DB", "isStatic": true},
    {"id": "market_stall_06", "type": "Box", "mass": 0, "position": [15, 1, 35], "dimensions": [2,2,2], "color": "#E67E22", "isStatic": true},
    {"id": "market_stall_neon_01", "type": "Box", "mass": 0, "position": [-5, 2.1, 35], "dimensions": [1.8,0.2,1.8], "color": "#E74C3C", "isStatic": true, "opacity": 0.8},
    {"id": "market_stall_neon_02", "type": "Box", "mass": 0, "position": [-2, 2.1, 35], "dimensions": [1.8,0.2,1.8], "color": "#BE90D4", "isStatic": true, "opacity": 0.8},
    {"id": "market_stall_neon_03", "type": "Box", "mass": 0, "position": [1, 2.1, 35], "dimensions": [1.8,0.2,1.8], "color": "#58D68D", "isStatic": true, "opacity": 0.8},
    {"id": "market_stall_neon_04", "type": "Box", "mass": 0, "position": [4, 2.1, 35], "dimensions": [1.8,0.2,1.8], "color": "#F9E79F", "isStatic": true, "opacity": 0.8},
    {"id": "market_stall_neon_05", "type": "Box", "mass": 0, "position": [7, 2.1, 35], "dimensions": [1.8,0.2,1.8], "color": "#85C1E9", "isStatic": true, "opacity": 0.8},
    {"id": "market_stall_neon_06", "type": "Box", "mass": 0, "position": [15, 2.1, 35], "dimensions": [1.8,0.2,1.8], "color": "#F5B041", "isStatic": true, "opacity": 0.8},
    {"id": "holo_ad_01", "type": "Box", "mass": 0, "position": [25, 50, 50], "dimensions": [0.2, 40, 60], "color": "#FF00FF", "isStatic": true, "opacity": 0.3},
    {"id": "holo_ad_02", "type": "Box", "mass": 0, "position": [-80, 60, 20], "dimensions": [0.2, 50, 40], "color": "#00FFFF", "isStatic": true, "opacity": 0.3},
    {"id": "holo_ad_03", "type": "Box", "mass": 0, "position": [80, 70, -20], "dimensions": [0.2, 60, 50], "color": "#FFFF00", "isStatic": true, "opacity": 0.3},
    {"id": "sprawl_001", "type": "Box", "mass": 0, "position": [-180, 60, -180], "dimensions": [15, 120, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_002", "type": "Box", "mass": 0, "position": [-160, 50, -180], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_003", "type": "Box", "mass": 0, "position": [-140, 75, -180], "dimensions": [15, 150, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_004", "type": "Box", "mass": 0, "position": [-120, 55, -180], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_005", "type": "Box", "mass": 0, "position": [-100, 65, -180], "dimensions": [15, 130, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_006", "type": "Box", "mass": 0, "position": [-180, 55, -160], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_007", "type": "Box", "mass": 0, "position": [-160, 70, -160], "dimensions": [15, 140, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_008", "type": "Box", "mass": 0, "position": [-140, 45, -160], "dimensions": [15, 90, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_009", "type": "Box", "mass": 0, "position": [-120, 80, -160], "dimensions": [15, 160, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_010", "type": "Box", "mass": 0, "position": [-100, 50, -160], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_011", "type": "Box", "mass": 0, "position": [-180, 80, -140], "dimensions": [15, 160, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_012", "type": "Box", "mass": 0, "position": [-160, 50, -140], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_013", "type": "Box", "mass": 0, "position": [-140, 65, -140], "dimensions": [15, 130, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_014", "type": "Box", "mass": 0, "position": [-120, 45, -140], "dimensions": [15, 90, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_015", "type": "Box", "mass": 0, "position": [-100, 75, -140], "dimensions": [15, 150, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_016", "type": "Box", "mass": 0, "position": [-180, 45, -120], "dimensions": [15, 90, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_017", "type": "Box", "mass": 0, "position": [-160, 85, -120], "dimensions": [15, 170, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_018", "type": "Box", "mass": 0, "position": [-140, 55, -120], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_019", "type": "Box", "mass": 0, "position": [-120, 60, -120], "dimensions": [15, 120, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_020", "type": "Box", "mass": 0, "position": [-100, 40, -120], "dimensions": [15, 80, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_021", "type": "Box", "mass": 0, "position": [-180, 70, -100], "dimensions": [15, 140, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_022", "type": "Box", "mass": 0, "position": [-160, 50, -100], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_023", "type": "Box", "mass": 0, "position": [-140, 75, -100], "dimensions": [15, 150, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_024", "type": "Box", "mass": 0, "position": [-120, 55, -100], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_025", "type": "Box", "mass": 0, "position": [-100, 65, -100], "dimensions": [15, 130, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_026", "type": "Box", "mass": 0, "position": [100, 60, -180], "dimensions": [15, 120, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_027", "type": "Box", "mass": 0, "position": [120, 50, -180], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_028", "type": "Box", "mass": 0, "position": [140, 75, -180], "dimensions": [15, 150, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_029", "type": "Box", "mass": 0, "position": [160, 55, -180], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_030", "type": "Box", "mass": 0, "position": [180, 65, -180], "dimensions": [15, 130, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_031", "type": "Box", "mass": 0, "position": [100, 55, -160], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_032", "type": "Box", "mass": 0, "position": [120, 70, -160], "dimensions": [15, 140, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_033", "type": "Box", "mass": 0, "position": [140, 45, -160], "dimensions": [15, 90, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_034", "type": "Box", "mass": 0, "position": [160, 80, -160], "dimensions": [15, 160, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_035", "type": "Box", "mass": 0, "position": [180, 50, -160], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_036", "type": "Box", "mass": 0, "position": [100, 80, -140], "dimensions": [15, 160, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_037", "type": "Box", "mass": 0, "position": [120, 50, -140], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_038", "type": "Box", "mass": 0, "position": [140, 65, -140], "dimensions": [15, 130, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_039", "type": "Box", "mass": 0, "position": [160, 45, -140], "dimensions": [15, 90, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_040", "type": "Box", "mass": 0, "position": [180, 75, -140], "dimensions": [15, 150, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_041", "type": "Box", "mass": 0, "position": [100, 45, -120], "dimensions": [15, 90, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_042", "type": "Box", "mass": 0, "position": [120, 85, -120], "dimensions": [15, 170, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_043", "type": "Box", "mass": 0, "position": [140, 55, -120], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_044", "type": "Box", "mass": 0, "position": [160, 60, -120], "dimensions": [15, 120, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_045", "type": "Box", "mass": 0, "position": [180, 40, -120], "dimensions": [15, 80, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_046", "type": "Box", "mass": 0, "position": [100, 70, -100], "dimensions": [15, 140, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_047", "type": "Box", "mass": 0, "position": [120, 50, -100], "dimensions": [15, 100, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_048", "type": "Box", "mass": 0, "position": [140, 75, -100], "dimensions": [15, 150, 15], "color": "#2c3e50", "isStatic": true},
    {"id": "sprawl_049", "type": "Box", "mass": 0, "position": [160, 55, -100], "dimensions": [15, 110, 15], "color": "#34495e", "isStatic": true},
    {"id": "sprawl_050", "type": "Box", "mass": 0, "position": [180, 65, -100], "dimensions": [15, 130, 15], "color": "#2c3e50", "isStatic": true}
  ],
  "gravity": [
    0,
    -9.81,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.4,
    "restitution": 0.2
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "sunken_city_of_yhanthlei_v1",
  "name": "The Sunken City of Y'ha-nthlei",
  "description": "An eerie, cyclopean city submerged in the abyssal depths. A central non-Euclidean monolith is surrounded by crumbling ruins, all under the silent watch of giant, bioluminescent jellyfish. The scene is meant to feel ancient, vast, and oppressive, constructed from thousands of primitive shapes.",
  "objects": [
    {
      "id": "seabed_rock_000", "type": "Box", "mass": 0, "position": [-145, -1.5, -130], "dimensions": [15, 3, 20], "color": "#011520", "isStatic": true, "rotation": [0.1, 1.2, -0.1]
    },
    {
      "id": "seabed_rock_001", "type": "Box", "mass": 0, "position": [-120, -2, -140], "dimensions": [18, 4, 16], "color": "#022030", "isStatic": true, "rotation": [-0.15, 0.5, 0.05]
    },
    {
      "id": "seabed_rock_002", "type": "Box", "mass": 0, "position": [-135, -0.5, -110], "dimensions": [12, 2, 18], "color": "#000F1A", "isStatic": true, "rotation": [0.0, 2.1, 0.1]
    },
    {
      "id": "seabed_rock_003", "type": "Box", "mass": 0, "position": [140, -1, 125], "dimensions": [25, 2.5, 22], "color": "#011520", "isStatic": true, "rotation": [-0.05, 3.0, 0.15]
    },
    {
      "id": "seabed_rock_004", "type": "Box", "mass": 0, "position": [115, -2.5, 145], "dimensions": [16, 5, 19], "color": "#022030", "isStatic": true, "rotation": [0.2, 0.8, -0.08]
    },
    {
      "id": "temple_layer_000", "type": "Box", "mass": 0, "position": [0, 0.75, 0], "dimensions": [40, 1.5, 40], "color": "#0D2B1E", "isStatic": true, "rotation": [0, 0, 0]
    },
    {
      "id": "temple_layer_001", "type": "Box", "mass": 0, "position": [-0.2, 2.25, 0.1], "dimensions": [39.8, 1.5, 39.8], "color": "#103C2A", "isStatic": true, "rotation": [-0.01, -0.05, 0.02]
    },
    {
      "id": "temple_layer_002", "type": "Box", "mass": 0, "position": [0.1, 3.75, -0.3], "dimensions": [39.6, 1.5, 39.6], "color": "#081C13", "isStatic": true, "rotation": [0.03, -0.11, -0.02]
    },
    {
      "id": "temple_layer_003", "type": "Box", "mass": 0, "position": [-0.1, 5.25, 0.2], "dimensions": [39.4, 1.5, 39.4], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.02, -0.15, 0.01]
    },
    {
      "id": "temple_layer_004", "type": "Box", "mass": 0, "position": [0.3, 6.75, 0.0], "dimensions": [39.2, 1.5, 39.2], "color": "#103C2A", "isStatic": true, "rotation": [0.01, -0.22, -0.03]
    },
    {
      "id": "temple_layer_005", "type": "Box", "mass": 0, "position": [-0.2, 8.25, -0.2], "dimensions": [39.0, 1.5, 39.0], "color": "#081C13", "isStatic": true, "rotation": [0.04, -0.26, 0.02]
    },
    {
      "id": "temple_layer_006", "type": "Box", "mass": 0, "position": [0.0, 9.75, 0.4], "dimensions": [38.8, 1.5, 38.8], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.03, -0.31, -0.01]
    },
    {
      "id": "temple_layer_007", "type": "Box", "mass": 0, "position": [0.2, 11.25, -0.1], "dimensions": [38.6, 1.5, 38.6], "color": "#103C2A", "isStatic": true, "rotation": [0.02, -0.34, 0.03]
    },
    {
      "id": "temple_layer_008", "type": "Box", "mass": 0, "position": [-0.3, 12.75, 0.1], "dimensions": [38.4, 1.5, 38.4], "color": "#081C13", "isStatic": true, "rotation": [-0.01, -0.40, -0.02]
    },
    {
      "id": "temple_layer_009", "type": "Box", "mass": 0, "position": [0.1, 14.25, 0.2], "dimensions": [38.2, 1.5, 38.2], "color": "#0D2B1E", "isStatic": true, "rotation": [0.03, -0.43, 0.01]
    },
    {
      "id": "temple_layer_010", "type": "Box", "mass": 0, "position": [-0.2, 15.75, -0.3], "dimensions": [38.0, 1.5, 38.0], "color": "#103C2A", "isStatic": true, "rotation": [-0.02, -0.49, -0.03]
    },
    {
      "id": "temple_layer_011", "type": "Box", "mass": 0, "position": [0.3, 17.25, 0.1], "dimensions": [37.8, 1.5, 37.8], "color": "#081C13", "isStatic": true, "rotation": [0.01, -0.55, 0.02]
    },
    {
      "id": "temple_layer_012", "type": "Box", "mass": 0, "position": [-0.1, 18.75, 0.0], "dimensions": [37.6, 1.5, 37.6], "color": "#0D2B1E", "isStatic": true, "rotation": [0.04, -0.58, -0.01]
    },
    {
      "id": "temple_layer_013", "type": "Box", "mass": 0, "position": [0.2, 20.25, -0.2], "dimensions": [37.4, 1.5, 37.4], "color": "#103C2A", "isStatic": true, "rotation": [-0.03, -0.63, 0.03]
    },
    {
      "id": "temple_layer_014", "type": "Box", "mass": 0, "position": [0.0, 21.75, 0.3], "dimensions": [37.2, 1.5, 37.2], "color": "#081C13", "isStatic": true, "rotation": [0.02, -0.69, -0.02]
    },
    {
      "id": "temple_layer_015", "type": "Box", "mass": 0, "position": [-0.3, 23.25, -0.1], "dimensions": [37.0, 1.5, 37.0], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.01, -0.72, 0.01]
    },
    {
      "id": "temple_layer_016", "type": "Box", "mass": 0, "position": [0.1, 24.75, 0.1], "dimensions": [36.8, 1.5, 36.8], "color": "#103C2A", "isStatic": true, "rotation": [0.03, -0.77, -0.03]
    },
    {
      "id": "temple_layer_017", "type": "Box", "mass": 0, "position": [-0.2, 26.25, 0.2], "dimensions": [36.6, 1.5, 36.6], "color": "#081C13", "isStatic": true, "rotation": [-0.02, -0.81, 0.02]
    },
    {
      "id": "temple_layer_018", "type": "Box", "mass": 0, "position": [0.2, 27.75, -0.3], "dimensions": [36.4, 1.5, 36.4], "color": "#0D2B1E", "isStatic": true, "rotation": [0.01, -0.88, -0.01]
    },
    {
      "id": "temple_layer_019", "type": "Box", "mass": 0, "position": [-0.1, 29.25, 0.0], "dimensions": [36.2, 1.5, 36.2], "color": "#103C2A", "isStatic": true, "rotation": [0.04, -0.92, 0.03]
    },
    {
      "id": "temple_layer_020", "type": "Box", "mass": 0, "position": [0.3, 30.75, -0.2], "dimensions": [36.0, 1.5, 36.0], "color": "#081C13", "isStatic": true, "rotation": [-0.03, -0.97, -0.02]
    },
    {
      "id": "temple_layer_021", "type": "Box", "mass": 0, "position": [0.0, 32.25, 0.1], "dimensions": [35.8, 1.5, 35.8], "color": "#0D2B1E", "isStatic": true, "rotation": [0.02, -1.02, 0.01]
    },
    {
      "id": "temple_layer_022", "type": "Box", "mass": 0, "position": [-0.2, 33.75, 0.2], "dimensions": [35.6, 1.5, 35.6], "color": "#103C2A", "isStatic": true, "rotation": [-0.01, -1.06, -0.03]
    },
    {
      "id": "temple_layer_023", "type": "Box", "mass": 0, "position": [0.1, 35.25, -0.1], "dimensions": [35.4, 1.5, 35.4], "color": "#081C13", "isStatic": true, "rotation": [0.03, -1.11, 0.02]
    },
    {
      "id": "temple_layer_024", "type": "Box", "mass": 0, "position": [-0.3, 36.75, 0.3], "dimensions": [35.2, 1.5, 35.2], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.02, -1.15, -0.01]
    },
    {
      "id": "temple_layer_025", "type": "Box", "mass": 0, "position": [0.2, 38.25, 0.0], "dimensions": [35.0, 1.5, 35.0], "color": "#103C2A", "isStatic": true, "rotation": [0.01, -1.22, 0.03]
    },
    {
      "id": "temple_layer_026", "type": "Box", "mass": 0, "position": [-0.1, 39.75, -0.2], "dimensions": [34.8, 1.5, 34.8], "color": "#081C13", "isStatic": true, "rotation": [0.04, -1.26, -0.02]
    },
    {
      "id": "temple_layer_027", "type": "Box", "mass": 0, "position": [0.0, 41.25, 0.1], "dimensions": [34.6, 1.5, 34.6], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.03, -1.31, 0.01]
    },
    {
      "id": "temple_layer_028", "type": "Box", "mass": 0, "position": [0.2, 42.75, 0.2], "dimensions": [34.4, 1.5, 34.4], "color": "#103C2A", "isStatic": true, "rotation": [0.02, -1.34, -0.03]
    },
    {
      "id": "temple_layer_029", "type": "Box", "mass": 0, "position": [-0.2, 44.25, -0.1], "dimensions": [34.2, 1.5, 34.2], "color": "#081C13", "isStatic": true, "rotation": [-0.01, -1.40, 0.02]
    },
    {
      "id": "temple_layer_030", "type": "Box", "mass": 0, "position": [0.1, 45.75, 0.3], "dimensions": [34.0, 1.5, 34.0], "color": "#0D2B1E", "isStatic": true, "rotation": [0.03, -1.43, -0.01]
    },
    {
      "id": "temple_layer_031", "type": "Box", "mass": 0, "position": [-0.3, 47.25, 0.0], "dimensions": [33.8, 1.5, 33.8], "color": "#103C2A", "isStatic": true, "rotation": [-0.02, -1.49, 0.03]
    },
    {
      "id": "temple_layer_032", "type": "Box", "mass": 0, "position": [0.3, 48.75, -0.2], "dimensions": [33.6, 1.5, 33.6], "color": "#081C13", "isStatic": true, "rotation": [0.01, -1.55, -0.02]
    },
    {
      "id": "temple_layer_033", "type": "Box", "mass": 0, "position": [0.0, 50.25, 0.1], "dimensions": [33.4, 1.5, 33.4], "color": "#0D2B1E", "isStatic": true, "rotation": [0.04, -1.58, 0.01]
    },
    {
      "id": "temple_layer_034", "type": "Box", "mass": 0, "position": [-0.2, 51.75, 0.2], "dimensions": [33.2, 1.5, 33.2], "color": "#103C2A", "isStatic": true, "rotation": [-0.03, -1.63, -0.03]
    },
    {
      "id": "temple_layer_035", "type": "Box", "mass": 0, "position": [0.1, 53.25, -0.3], "dimensions": [33.0, 1.5, 33.0], "color": "#081C13", "isStatic": true, "rotation": [0.02, -1.69, 0.02]
    },
    {
      "id": "temple_layer_036", "type": "Box", "mass": 0, "position": [-0.1, 54.75, 0.0], "dimensions": [32.8, 1.5, 32.8], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.01, -1.72, -0.01]
    },
    {
      "id": "temple_layer_037", "type": "Box", "mass": 0, "position": [0.2, 56.25, 0.1], "dimensions": [32.6, 1.5, 32.6], "color": "#103C2A", "isStatic": true, "rotation": [0.03, -1.77, 0.03]
    },
    {
      "id": "temple_layer_038", "type": "Box", "mass": 0, "position": [0.0, 57.75, -0.2], "dimensions": [32.4, 1.5, 32.4], "color": "#081C13", "isStatic": true, "rotation": [-0.02, -1.81, -0.02]
    },
    {
      "id": "temple_layer_039", "type": "Box", "mass": 0, "position": [-0.3, 59.25, 0.2], "dimensions": [32.2, 1.5, 32.2], "color": "#0D2B1E", "isStatic": true, "rotation": [0.01, -1.88, 0.01]
    },
    {
      "id": "temple_layer_040", "type": "Box", "mass": 0, "position": [0.1, 60.75, 0.0], "dimensions": [32.0, 1.5, 32.0], "color": "#103C2A", "isStatic": true, "rotation": [0.04, -1.92, -0.03]
    },
    {
      "id": "temple_layer_041", "type": "Box", "mass": 0, "position": [-0.2, 62.25, -0.1], "dimensions": [31.8, 1.5, 31.8], "color": "#081C13", "isStatic": true, "rotation": [-0.03, -1.97, 0.02]
    },
    {
      "id": "temple_layer_042", "type": "Box", "mass": 0, "position": [0.2, 63.75, 0.3], "dimensions": [31.6, 1.5, 31.6], "color": "#0D2B1E", "isStatic": true, "rotation": [0.02, -2.02, -0.01]
    },
    {
      "id": "temple_layer_043", "type": "Box", "mass": 0, "position": [0.0, 65.25, -0.2], "dimensions": [31.4, 1.5, 31.4], "color": "#103C2A", "isStatic": true, "rotation": [-0.01, -2.06, 0.03]
    },
    {
      "id": "temple_layer_044", "type": "Box", "mass": 0, "position": [-0.1, 66.75, 0.1], "dimensions": [31.2, 1.5, 31.2], "color": "#081C13", "isStatic": true, "rotation": [0.03, -2.11, -0.02]
    },
    {
      "id": "temple_layer_045", "type": "Box", "mass": 0, "position": [0.3, 68.25, 0.2], "dimensions": [31.0, 1.5, 31.0], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.02, -2.15, 0.01]
    },
    {
      "id": "temple_layer_046", "type": "Box", "mass": 0, "position": [-0.2, 69.75, -0.3], "dimensions": [30.8, 1.5, 30.8], "color": "#103C2A", "isStatic": true, "rotation": [0.01, -2.22, -0.03]
    },
    {
      "id": "temple_layer_047", "type": "Box", "mass": 0, "position": [0.1, 71.25, 0.0], "dimensions": [30.6, 1.5, 30.6], "color": "#081C13", "isStatic": true, "rotation": [0.04, -2.26, 0.02]
    },
    {
      "id": "temple_layer_048", "type": "Box", "mass": 0, "position": [0.2, 72.75, 0.1], "dimensions": [30.4, 1.5, 30.4], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.03, -2.31, -0.01]
    },
    {
      "id": "temple_layer_049", "type": "Box", "mass": 0, "position": [-0.3, 74.25, -0.2], "dimensions": [30.2, 1.5, 30.2], "color": "#103C2A", "isStatic": true, "rotation": [0.02, -2.34, 0.03]
    },
    {
      "id": "temple_layer_050", "type": "Box", "mass": 0, "position": [0.0, 75.75, 0.2], "dimensions": [30.0, 1.5, 30.0], "color": "#081C13", "isStatic": true, "rotation": [-0.01, -2.40, -0.02]
    },
    {
      "id": "temple_layer_051", "type": "Box", "mass": 0, "position": [0.1, 77.25, 0.0], "dimensions": [29.8, 1.5, 29.8], "color": "#0D2B1E", "isStatic": true, "rotation": [0.03, -2.43, 0.01]
    },
    {
      "id": "temple_layer_052", "type": "Box", "mass": 0, "position": [-0.2, 78.75, -0.1], "dimensions": [29.6, 1.5, 29.6], "color": "#103C2A", "isStatic": true, "rotation": [-0.02, -2.49, -0.03]
    },
    {
      "id": "temple_layer_053", "type": "Box", "mass": 0, "position": [0.3, 80.25, 0.1], "dimensions": [29.4, 1.5, 29.4], "color": "#081C13", "isStatic": true, "rotation": [0.01, -2.55, 0.02]
    },
    {
      "id": "temple_layer_054", "type": "Box", "mass": 0, "position": [-0.1, 81.75, 0.2], "dimensions": [29.2, 1.5, 29.2], "color": "#0D2B1E", "isStatic": true, "rotation": [0.04, -2.58, -0.01]
    },
    {
      "id": "temple_layer_055", "type": "Box", "mass": 0, "position": [0.2, 83.25, -0.3], "dimensions": [29.0, 1.5, 29.0], "color": "#103C2A", "isStatic": true, "rotation": [-0.03, -2.63, 0.03]
    },
    {
      "id": "temple_layer_056", "type": "Box", "mass": 0, "position": [0.0, 84.75, 0.0], "dimensions": [28.8, 1.5, 28.8], "color": "#081C13", "isStatic": true, "rotation": [0.02, -2.69, -0.02]
    },
    {
      "id": "temple_layer_057", "type": "Box", "mass": 0, "position": [-0.3, 86.25, 0.1], "dimensions": [28.6, 1.5, 28.6], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.01, -2.72, 0.01]
    },
    {
      "id": "temple_layer_058", "type": "Box", "mass": 0, "position": [0.1, 87.75, -0.2], "dimensions": [28.4, 1.5, 28.4], "color": "#103C2A", "isStatic": true, "rotation": [0.03, -2.77, -0.03]
    },
    {
      "id": "temple_layer_059", "type": "Box", "mass": 0, "position": [-0.2, 89.25, 0.2], "dimensions": [28.2, 1.5, 28.2], "color": "#081C13", "isStatic": true, "rotation": [-0.02, -2.81, 0.02]
    },
    {
      "id": "temple_layer_060", "type": "Box", "mass": 0, "position": [0.2, 90.75, 0.0], "dimensions": [28.0, 1.5, 28.0], "color": "#0D2B1E", "isStatic": true, "rotation": [0.01, -2.88, -0.01]
    },
    {
      "id": "temple_layer_061", "type": "Box", "mass": 0, "position": [-0.1, 92.25, 0.3], "dimensions": [27.8, 1.5, 27.8], "color": "#103C2A", "isStatic": true, "rotation": [0.04, -2.92, 0.03]
    },
    {
      "id": "temple_layer_062", "type": "Box", "mass": 0, "position": [0.3, 93.75, -0.1], "dimensions": [27.6, 1.5, 27.6], "color": "#081C13", "isStatic": true, "rotation": [-0.03, -2.97, -0.02]
    },
    {
      "id": "temple_layer_063", "type": "Box", "mass": 0, "position": [0.0, 95.25, 0.1], "dimensions": [27.4, 1.5, 27.4], "color": "#0D2B1E", "isStatic": true, "rotation": [0.02, -3.02, 0.01]
    },
    {
      "id": "temple_layer_064", "type": "Box", "mass": 0, "position": [-0.2, 96.75, -0.2], "dimensions": [27.2, 1.5, 27.2], "color": "#103C2A", "isStatic": true, "rotation": [-0.01, -3.06, -0.03]
    },
    {
      "id": "temple_layer_065", "type": "Box", "mass": 0, "position": [0.1, 98.25, 0.2], "dimensions": [27.0, 1.5, 27.0], "color": "#081C13", "isStatic": true, "rotation": [0.03, -3.11, 0.02]
    },
    {
      "id": "temple_layer_066", "type": "Box", "mass": 0, "position": [-0.3, 99.75, 0.0], "dimensions": [26.8, 1.5, 26.8], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.02, -3.15, -0.01]
    },
    {
      "id": "temple_layer_067", "type": "Box", "mass": 0, "position": [0.2, 101.25, -0.1], "dimensions": [26.6, 1.5, 26.6], "color": "#103C2A", "isStatic": true, "rotation": [0.01, -3.22, 0.03]
    },
    {
      "id": "temple_layer_068", "type": "Box", "mass": 0, "position": [-0.1, 102.75, 0.3], "dimensions": [26.4, 1.5, 26.4], "color": "#081C13", "isStatic": true, "rotation": [0.04, -3.26, -0.02]
    },
    {
      "id": "temple_layer_069", "type": "Box", "mass": 0, "position": [0.3, 104.25, -0.2], "dimensions": [26.2, 1.5, 26.2], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.03, -3.31, 0.01]
    },
    {
      "id": "temple_layer_070", "type": "Box", "mass": 0, "position": [0.0, 105.75, 0.1], "dimensions": [26.0, 1.5, 26.0], "color": "#103C2A", "isStatic": true, "rotation": [0.02, -3.34, -0.03]
    },
    {
      "id": "temple_layer_071", "type": "Box", "mass": 0, "position": [-0.2, 107.25, 0.2], "dimensions": [25.8, 1.5, 25.8], "color": "#081C13", "isStatic": true, "rotation": [-0.01, -3.40, 0.02]
    },
    {
      "id": "temple_layer_072", "type": "Box", "mass": 0, "position": [0.1, 108.75, -0.1], "dimensions": [25.6, 1.5, 25.6], "color": "#0D2B1E", "isStatic": true, "rotation": [0.03, -3.43, -0.01]
    },
    {
      "id": "temple_layer_073", "type": "Box", "mass": 0, "position": [-0.3, 110.25, 0.0], "dimensions": [25.4, 1.5, 25.4], "color": "#103C2A", "isStatic": true, "rotation": [-0.02, -3.49, 0.03]
    },
    {
      "id": "temple_layer_074", "type": "Box", "mass": 0, "position": [0.2, 111.75, -0.3], "dimensions": [25.2, 1.5, 25.2], "color": "#081C13", "isStatic": true, "rotation": [0.01, -3.55, -0.02]
    },
    {
      "id": "temple_layer_075", "type": "Box", "mass": 0, "position": [-0.1, 113.25, 0.1], "dimensions": [25.0, 1.5, 25.0], "color": "#0D2B1E", "isStatic": true, "rotation": [0.04, -3.58, 0.01]
    },
    {
      "id": "temple_layer_076", "type": "Box", "mass": 0, "position": [0.3, 114.75, 0.2], "dimensions": [24.8, 1.5, 24.8], "color": "#103C2A", "isStatic": true, "rotation": [-0.03, -3.63, -0.03]
    },
    {
      "id": "temple_layer_077", "type": "Box", "mass": 0, "position": [0.0, 116.25, -0.2], "dimensions": [24.6, 1.5, 24.6], "color": "#081C13", "isStatic": true, "rotation": [0.02, -3.69, 0.02]
    },
    {
      "id": "temple_layer_078", "type": "Box", "mass": 0, "position": [-0.2, 117.75, 0.0], "dimensions": [24.4, 1.5, 24.4], "color": "#0D2B1E", "isStatic": true, "rotation": [-0.01, -3.72, -0.01]
    },
    {
      "id": "temple_layer_079", "type": "Box", "mass": 0, "position": [0.1, 119.25, 0.1], "dimensions": [24.2, 1.5, 24.2], "color": "#103C2A", "isStatic": true, "rotation": [0.03, -3.77, 0.03]
    },
    {
      "id": "temple_layer_080", "type": "Box", "mass": 0, "position": [-0.1, 120.75, -0.3], "dimensions": [24.0, 1.5, 24.0], "color": "#081C13", "isStatic": true, "rotation": [-0.02, -3.81, -0.02]
    },
    {
      "id": "ruin_cluster_1_block_1", "type": "Box", "mass": 0, "position": [-80, 5, 90], "dimensions": [15, 30, 12], "color": "#1B2631", "isStatic": true, "rotation": [0.8, 0.2, -0.5]
    },
    {
      "id": "ruin_cluster_1_block_2", "type": "Box", "mass": 0, "position": [-75, 2, 85], "dimensions": [10, 25, 10], "color": "#212F3D", "isStatic": true, "rotation": [-0.4, 0.5, 0.9]
    },
    {
      "id": "ruin_cluster_1_pillar_1", "type": "Cylinder", "mass": 0, "position": [-85, 8, 95], "radius": 4, "height": 40, "color": "#1B2631", "isStatic": true, "rotation": [1.4, 0, 0.2]
    },
    {
      "id": "ruin_cluster_2_block_1", "type": "Box", "mass": 0, "position": [100, 3, -110], "dimensions": [20, 18, 22], "color": "#1B2631", "isStatic": true, "rotation": [0.2, -1.5, 0.3]
    },
    {
      "id": "ruin_cluster_2_block_2", "type": "Box", "mass": 0, "position": [110, -1, -115], "dimensions": [14, 14, 14], "color": "#212F3D", "isStatic": true, "rotation": [0.9, -1.8, -0.6]
    },
    {
      "id": "ruin_cluster_2_arch_1", "type": "Box", "mass": 0, "position": [90, 10, -100], "dimensions": [5, 25, 5], "color": "#1B2631", "isStatic": true, "rotation": [0, -1.5, 1.2]
    },
    {
      "id": "ruin_cluster_3_block_1", "type": "Box", "mass": 0, "position": [120, 1, 130], "dimensions": [30, 10, 30], "color": "#1B2631", "isStatic": true, "rotation": [0.1, 0.8, -0.1]
    },
    {
      "id": "ruin_cluster_3_block_2", "type": "Box", "mass": 0, "position": [125, 7, 135], "dimensions": [15, 12, 15], "color": "#212F3D", "isStatic": true, "rotation": [-0.2, 1.1, 0.2]
    },
    {
      "id": "ruin_cluster_4_pillar_1", "type": "Cylinder", "mass": 0, "position": [-130, 12, -100], "radius": 6, "height": 50, "color": "#1B2631", "isStatic": true, "rotation": [1.57, 0, 0.5]
    },
    {
      "id": "ruin_cluster_4_pillar_2", "type": "Cylinder", "mass": 0, "position": [-115, 8, -105], "radius": 5, "height": 40, "color": "#212F3D", "isStatic": true, "rotation": [1.4, 0.2, -0.3]
    },
    {
      "id": "jelly_0_bell", "type": "Sphere", "mass": 0, "position": [-80, 150, -80], "radius": 15, "color": "#48D1CC", "isStatic": true, "opacity": 0.4
    },
    {
      "id": "jelly_0_tentacle_00", "type": "Cylinder", "mass": 0, "position": [-80, 118, -80], "radius": 0.5, "height": 50, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.1]
    },
    {
      "id": "jelly_0_tentacle_01", "type": "Cylinder", "mass": 0, "position": [-83, 115, -91], "radius": 0.5, "height": 55, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, 0.2]
    },
    {
      "id": "jelly_0_tentacle_02", "type": "Cylinder", "mass": 0, "position": [-91, 116, -88], "radius": 0.5, "height": 52, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.2, 0, 0.3]
    },
    {
      "id": "jelly_0_tentacle_03", "type": "Cylinder", "mass": 0, "position": [-94, 119, -78], "radius": 0.5, "height": 48, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.4]
    },
    {
      "id": "jelly_0_tentacle_04", "type": "Cylinder", "mass": 0, "position": [-85, 120, -70], "radius": 0.5, "height": 45, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.2, 0, 0.3]
    },
    {
      "id": "jelly_0_tentacle_05", "type": "Cylinder", "mass": 0, "position": [-75, 117, -71], "radius": 0.5, "height": 51, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.3, 0, 0.1]
    },
    {
      "id": "jelly_0_tentacle_06", "type": "Cylinder", "mass": 0, "position": [-69, 114, -83], "radius": 0.5, "height": 58, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.1, 0, -0.3]
    },
    {
      "id": "jelly_0_tentacle_07", "type": "Cylinder", "mass": 0, "position": [-72, 118, -92], "radius": 0.5, "height": 49, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, -0.2]
    },
    {
      "id": "jelly_1_bell", "type": "Sphere", "mass": 0, "position": [70, 160, 50], "radius": 18, "color": "#48D1CC", "isStatic": true, "opacity": 0.4
    },
    {
      "id": "jelly_1_tentacle_00", "type": "Cylinder", "mass": 0, "position": [70, 126, 50], "radius": 0.6, "height": 58, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.1]
    },
    {
      "id": "jelly_1_tentacle_01", "type": "Cylinder", "mass": 0, "position": [66, 123, 63], "radius": 0.6, "height": 63, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, 0.2]
    },
    {
      "id": "jelly_1_tentacle_02", "type": "Cylinder", "mass": 0, "position": [57, 124, 59], "radius": 0.6, "height": 60, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.2, 0, 0.3]
    },
    {
      "id": "jelly_1_tentacle_03", "type": "Cylinder", "mass": 0, "position": [54, 127, 47], "radius": 0.6, "height": 56, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.4]
    },
    {
      "id": "jelly_1_tentacle_04", "type": "Cylinder", "mass": 0, "position": [63, 128, 38], "radius": 0.6, "height": 53, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.2, 0, 0.3]
    },
    {
      "id": "jelly_1_tentacle_05", "type": "Cylinder", "mass": 0, "position": [75, 125, 37], "radius": 0.6, "height": 59, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.3, 0, 0.1]
    },
    {
      "id": "jelly_1_tentacle_06", "type": "Cylinder", "mass": 0, "position": [83, 122, 45], "radius": 0.6, "height": 66, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.1, 0, -0.3]
    },
    {
      "id": "jelly_1_tentacle_07", "type": "Cylinder", "mass": 0, "position": [80, 126, 58], "radius": 0.6, "height": 57, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, -0.2]
    },
    {
      "id": "jelly_2_bell", "type": "Sphere", "mass": 0, "position": [-60, 140, 90], "radius": 12, "color": "#48D1CC", "isStatic": true, "opacity": 0.4
    },
    {
      "id": "jelly_2_tentacle_00", "type": "Cylinder", "mass": 0, "position": [-60, 110, 90], "radius": 0.4, "height": 50, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.1]
    },
    {
      "id": "jelly_2_tentacle_01", "type": "Cylinder", "mass": 0, "position": [-62, 108, 99], "radius": 0.4, "height": 54, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, 0.2]
    },
    {
      "id": "jelly_2_tentacle_02", "type": "Cylinder", "mass": 0, "position": [-69, 109, 95], "radius": 0.4, "height": 51, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.2, 0, 0.3]
    },
    {
      "id": "jelly_2_tentacle_03", "type": "Cylinder", "mass": 0, "position": [-71, 111, 87], "radius": 0.4, "height": 48, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.4]
    },
    {
      "id": "jelly_2_tentacle_04", "type": "Cylinder", "mass": 0, "position": [-64, 112, 81], "radius": 0.4, "height": 45, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.2, 0, 0.3]
    },
    {
      "id": "jelly_2_tentacle_05", "type": "Cylinder", "mass": 0, "position": [-55, 110, 82], "radius": 0.4, "height": 52, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.3, 0, 0.1]
    },
    {
      "id": "jelly_2_tentacle_06", "type": "Cylinder", "mass": 0, "position": [-50, 107, 91], "radius": 0.4, "height": 58, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.1, 0, -0.3]
    },
    {
      "id": "jelly_3_bell", "type": "Sphere", "mass": 0, "position": [100, 170, -110], "radius": 16, "color": "#48D1CC", "isStatic": true, "opacity": 0.4
    },
    {
      "id": "jelly_3_tentacle_00", "type": "Cylinder", "mass": 0, "position": [100, 138, -110], "radius": 0.5, "height": 54, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.1]
    },
    {
      "id": "jelly_3_tentacle_01", "type": "Cylinder", "mass": 0, "position": [97, 135, -122], "radius": 0.5, "height": 59, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, 0.2]
    },
    {
      "id": "jelly_3_tentacle_02", "type": "Cylinder", "mass": 0, "position": [88, 136, -118], "radius": 0.5, "height": 56, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.2, 0, 0.3]
    },
    {
      "id": "jelly_3_tentacle_03", "type": "Cylinder", "mass": 0, "position": [86, 139, -108], "radius": 0.5, "height": 52, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.1, 0, 0.4]
    },
    {
      "id": "jelly_3_tentacle_04", "type": "Cylinder", "mass": 0, "position": [95, 140, -100], "radius": 0.5, "height": 49, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.2, 0, 0.3]
    },
    {
      "id": "jelly_3_tentacle_05", "type": "Cylinder", "mass": 0, "position": [105, 137, -99], "radius": 0.5, "height": 55, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.3, 0, 0.1]
    },
    {
      "id": "jelly_3_tentacle_06", "type": "Cylinder", "mass": 0, "position": [112, 134, -107], "radius": 0.5, "height": 62, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [-0.1, 0, -0.3]
    },
    {
      "id": "jelly_3_tentacle_07", "type": "Cylinder", "mass": 0, "position": [110, 138, -118], "radius": 0.5, "height": 53, "color": "#48D1CC", "isStatic": true, "opacity": 0.3, "rotation": [0.3, 0, -0.2]
    },
    {
      "id": "spore_00", "type": "Sphere", "mass": 1, "position": [-50, 100, 50], "radius": 0.3, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [0.1, -0.05, 0.1]
    },
    {
      "id": "spore_01", "type": "Sphere", "mass": 1, "position": [60, 80, -40], "radius": 0.2, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [-0.1, -0.02, 0.05]
    },
    {
      "id": "spore_02", "type": "Sphere", "mass": 1, "position": [-20, 120, -70], "radius": 0.3, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [0.05, -0.08, -0.1]
    },
    {
      "id": "spore_03", "type": "Sphere", "mass": 1, "position": [80, 50, 90], "radius": 0.25, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [-0.08, -0.01, 0.12]
    },
    {
      "id": "spore_04", "type": "Sphere", "mass": 1, "position": [10, 150, 10], "radius": 0.3, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [0.1, -0.1, -0.05]
    },
    {
      "id": "spore_05", "type": "Sphere", "mass": 1, "position": [-90, 20, 110], "radius": 0.2, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [0.03, 0.01, -0.09]
    },
    {
      "id": "spore_06", "type": "Sphere", "mass": 1, "position": [120, 90, -80], "radius": 0.25, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [-0.12, -0.04, 0.08]
    },
    {
      "id": "spore_07", "type": "Sphere", "mass": 1, "position": [-110, 60, -100], "radius": 0.3, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [0.07, -0.06, 0.11]
    },
    {
      "id": "spore_08", "type": "Sphere", "mass": 1, "position": [40, 130, 30], "radius": 0.2, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [-0.09, -0.09, -0.09]
    },
    {
      "id": "spore_09", "type": "Sphere", "mass": 1, "position": [-70, 70, 130], "radius": 0.25, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [0.11, -0.03, -0.1]
    },
    {
      "id": "spore_10", "type": "Sphere", "mass": 1, "position": [130, 110, -20], "radius": 0.3, "color": "#98FB98", "isStatic": false, "opacity": 0.8, "velocity": [-0.06, -0.07, 0.1]
    }
  ],
  "gravity": [
    0,
    -0.2,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.6,
    "restitution": 0.1
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
}
,{
  "id": "outlands_atoll_caldera_v1",
  "name": "Outlands: Atoll Caldera",
  "description": "A massive, multi-district floating city reminiscent of the arenas in Apex Legends, suspended over a sea of molten lava. The city is built upon a foundation of thousands of hexagonal basalt columns and features distinct zones: a towering Spire District, an industrial Turbine Power-Hub, and bio-domed Hydroponics Labs. These districts are interconnected by a variety of complex, structurally detailed bridges. The color palette is brighter, with light grays, oranges, and teals to ensure clarity and visual pop against the glowing lava below. The entire scene is static to emphasize its monumental scale.",
  "objects": [
    {
      "id": "lava_sea_plane",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        0.5,
        0
      ],
      "dimensions": [
        2500,
        1,
        2500
      ],
      "color": "#f97316",
      "isStatic": true
    },
    {
      "id": "main_island_base",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        0,
        40,
        0
      ],
      "radius": 200,
      "height": 80,
      "color": "#18181b",
      "isStatic": true
    },
    {
      "id": "turbine_island_base",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        450,
        45,
        100
      ],
      "radius": 120,
      "height": 90,
      "color": "#18181b",
      "isStatic": true
    },
    {
      "id": "hydroponics_island_base",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        -250,
        50,
        -400
      ],
      "radius": 100,
      "height": 100,
      "color": "#18181b",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_base",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        81,
        0
      ],
      "dimensions": [
        40,
        2,
        40
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_01",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        88,
        0
      ],
      "dimensions": [
        38,
        12,
        38
      ],
      "color": "#d1d5db",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_02",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        100,
        0
      ],
      "dimensions": [
        36,
        12,
        36
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_03",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        112,
        0
      ],
      "dimensions": [
        34,
        12,
        34
      ],
      "color": "#d1d5db",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_04",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        124,
        0
      ],
      "dimensions": [
        32,
        12,
        32
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_05",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        136,
        0
      ],
      "dimensions": [
        30,
        12,
        30
      ],
      "color": "#d1d5db",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_06",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        148,
        0
      ],
      "dimensions": [
        28,
        12,
        28
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_seg_07",
      "type": "Box",
      "mass": 0,
      "position": [
        0,
        160,
        0
      ],
      "dimensions": [
        26,
        12,
        26
      ],
      "color": "#d1d5db",
      "isStatic": true
    },
    {
      "id": "spire_central_tower_top",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        0,
        171,
        0
      ],
      "radius": 12,
      "height": 10,
      "color": "#14b8a6",
      "isStatic": true
    },
    {
      "id": "spire_antenna_mast",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        0,
        186,
        0
      ],
      "radius": 1,
      "height": 20,
      "color": "#fefce8",
      "isStatic": true
    },
    {
      "id": "spire_antenna_dish_1",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        0,
        180,
        0
      ],
      "radius": 8,
      "height": 1,
      "color": "#fde047",
      "isStatic": true,
      "rotation": [
        -0.2,
        0,
        0
      ]
    },
    {
      "id": "spire_antenna_dish_2",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        0,
        185,
        0
      ],
      "radius": 6,
      "height": 1,
      "color": "#fde047",
      "isStatic": true,
      "rotation": [
        -0.2,
        0,
        0
      ]
    },
    {
      "id": "spire_antenna_dish_3",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        0,
        190,
        0
      ],
      "radius": 4,
      "height": 1,
      "color": "#fde047",
      "isStatic": true,
      "rotation": [
        -0.2,
        0,
        0
      ]
    },
    {
      "id": "spire_building_a1",
      "type": "Box",
      "mass": 0,
      "position": [
        60,
        95,
        20
      ],
      "dimensions": [
        15,
        30,
        25
      ],
      "color": "#a1a1aa",
      "isStatic": true
    },
    {
      "id": "spire_building_a2",
      "type": "Box",
      "mass": 0,
      "position": [
        60,
        115,
        20
      ],
      "dimensions": [
        12,
        10,
        22
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "spire_building_b1",
      "type": "Box",
      "mass": 0,
      "position": [
        -50,
        100,
        -70
      ],
      "dimensions": [
        20,
        40,
        20
      ],
      "color": "#a1a1aa",
      "isStatic": true
    },
    {
      "id": "spire_building_b2",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        -50,
        125,
        -70
      ],
      "radius": 8,
      "height": 10,
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "spire_building_c1",
      "type": "Box",
      "mass": 0,
      "position": [
        30,
        90,
        80
      ],
      "dimensions": [
        25,
        20,
        15
      ],
      "color": "#a1a1aa",
      "isStatic": true
    },
    {
      "id": "spire_building_c2",
      "type": "Box",
      "mass": 0,
      "position": [
        30,
        105,
        80
      ],
      "dimensions": [
        22,
        10,
        12
      ],
      "color": "#e5e7eb",
      "isStatic": true,
      "rotation": [
        0,
        0.3,
        0
      ]
    },
    {
      "id": "turbine_central_hub",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        450,
        115,
        100
      ],
      "radius": 40,
      "height": 50,
      "color": "#71717a",
      "isStatic": true
    },
    {
      "id": "turbine_nacelle",
      "type": "Sphere",
      "mass": 0,
      "position": [
        450,
        115,
        100
      ],
      "radius": 45,
      "color": "#52525b",
      "isStatic": true
    },
    {
      "id": "turbine_blade_1",
      "type": "Box",
      "mass": 0,
      "position": [
        450,
        185,
        100
      ],
      "dimensions": [
        15,
        100,
        5
      ],
      "color": "#d97706",
      "isStatic": true,
      "rotation": [
        0,
        0,
        0.2
      ]
    },
    {
      "id": "turbine_blade_2",
      "type": "Box",
      "mass": 0,
      "position": [
        508,
        98,
        100
      ],
      "dimensions": [
        15,
        100,
        5
      ],
      "color": "#d97706",
      "isStatic": true,
      "rotation": [
        0,
        0,
        -1.3708
      ]
    },
    {
      "id": "turbine_blade_3",
      "type": "Box",
      "mass": 0,
      "position": [
        392,
        98,
        100
      ],
      "dimensions": [
        15,
        100,
        5
      ],
      "color": "#d97706",
      "isStatic": true,
      "rotation": [
        0,
        0,
        1.3708
      ]
    },
    {
      "id": "turbine_support_strut_1",
      "type": "Box",
      "mass": 0,
      "position": [
        450,
        100,
        100
      ],
      "dimensions": [
        10,
        160,
        10
      ],
      "color": "#3f3f46",
      "isStatic": true
    },
    {
      "id": "turbine_pipe_1",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        450,
        95,
        160
      ],
      "radius": 8,
      "height": 40,
      "color": "#4d7c0f",
      "isStatic": true
    },
    {
      "id": "turbine_pipe_2",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        450,
        95,
        40
      ],
      "radius": 8,
      "height": 40,
      "color": "#4d7c0f",
      "isStatic": true
    },
    {
      "id": "turbine_building_a",
      "type": "Box",
      "mass": 0,
      "position": [
        530,
        100,
        180
      ],
      "dimensions": [
        30,
        40,
        30
      ],
      "color": "#a1a1aa",
      "isStatic": true
    },
    {
      "id": "turbine_building_b",
      "type": "Box",
      "mass": 0,
      "position": [
        370,
        105,
        20
      ],
      "dimensions": [
        40,
        50,
        25
      ],
      "color": "#a1a1aa",
      "isStatic": true
    },
    {
      "id": "hydroponics_dome_1",
      "type": "Sphere",
      "mass": 0,
      "position": [
        -250,
        100,
        -350
      ],
      "radius": 40,
      "color": "#3b82f6",
      "isStatic": true,
      "opacity": 0.3
    },
    {
      "id": "hydroponics_dome_2",
      "type": "Sphere",
      "mass": 0,
      "position": [
        -200,
        100,
        -450
      ],
      "radius": 35,
      "color": "#3b82f6",
      "isStatic": true,
      "opacity": 0.3
    },
    {
      "id": "hydroponics_dome_3",
      "type": "Sphere",
      "mass": 0,
      "position": [
        -320,
        95,
        -460
      ],
      "radius": 30,
      "color": "#3b82f6",
      "isStatic": true,
      "opacity": 0.3
    },
    {
      "id": "hydroponics_lab_1",
      "type": "Box",
      "mass": 0,
      "position": [
        -250,
        105,
        -350
      ],
      "dimensions": [
        20,
        50,
        20
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "hydroponics_lab_2",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        -200,
        102.5,
        -450
      ],
      "radius": 10,
      "height": 45,
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "hydroponics_lab_3",
      "type": "Box",
      "mass": 0,
      "position": [
        -320,
        97.5,
        -460
      ],
      "dimensions": [
        15,
        35,
        15
      ],
      "color": "#e5e7eb",
      "isStatic": true
    },
    {
      "id": "suspension_bridge_tower_1",
      "type": "Box",
      "mass": 0,
      "position": [
        180,
        120,
        100
      ],
      "dimensions": [
        15,
        80,
        15
      ],
      "color": "#ef4444",
      "isStatic": true
    },
    {
      "id": "suspension_bridge_tower_2",
      "type": "Box",
      "mass": 0,
      "position": [
        350,
        120,
        100
      ],
      "dimensions": [
        15,
        80,
        15
      ],
      "color": "#ef4444",
      "isStatic": true
    },
    {
      "id": "suspension_bridge_crossbeam",
      "type": "Box",
      "mass": 0,
      "position": [
        265,
        155,
        100
      ],
      "dimensions": [
        180,
        8,
        8
      ],
      "color": "#ef4444",
      "isStatic": true
    },
    {
      "id": "suspension_bridge_cable_1",
      "type": "Cylinder",
      "mass": 0,
      "position": [
        265,
        125,
        100
      ],
      "radius": 1,
      "height": 200,
      "color": "#fefce8",
      "isStatic": true,
      "rotation": [
        0,
        0,
        0
      ]
    },
    {
      "id": "tube_bridge_start_platform",
      "type": "Box",
      "mass": 0,
      "position": [
        -100,
        80,
        -150
      ],
      "dimensions": [
        30,
        4,
        30
      ],
      "color": "#a1a1aa",
      "isStatic": true
    },
    {
      "id": "tube_bridge_end_platform",
      "type": "Box",
      "mass": 0,
      "position": [
        -250,
        80,
        -280
      ],
      "dimensions": [
        30,
        4,
        30
      ],
      "color": "#a1a1aa",
      "isStatic": true
    }
  ],
  "gravity": [
    0,
    -9.81,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.4,
    "restitution": 0.2
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "protoplanetary_disk_simulation",
  "name": "Protoplanetary Disk",
  "description": "A symbolic representation of a young star system. A massive, static central star is surrounded by over one hundred planetesimals and a few larger proto-planets in a rotating disk. Their mutual gravitational attraction will cause them to orbit, collide, and accrete over time.",
  "objects": [
    {
      "id": "proto_star",
      "type": "Sphere",
      "mass": 100000,
      "gravitationalMass": 100000,
      "isStatic": true,
      "position": [0, 0, 0],
      "radius": 8,
      "color": "#FFFFA0",
      "opacity": 1
    },
    { "id": "p_0", "type": "Sphere", "mass": 36.5, "position": [19.8, -1.5, -4.5], "radius": 1.09, "velocity": [33.7, 0.1, 148.5], "color": "#a48c7e" },
    { "id": "p_1", "type": "Sphere", "mass": 11.2, "position": [-16.7, 0.8, 12.1], "radius": 0.77, "velocity": [-93.9, -0.2, -129.5], "color": "#a08a7b" },
    { "id": "p_2", "type": "Sphere", "mass": 42.1, "position": [-4.1, 1.2, -29.6], "radius": 1.15, "velocity": [128.5, 0.5, -17.8], "color": "#a89082" },
    { "id": "p_3", "type": "Sphere", "mass": 88.4, "position": [-55.3, -2.1, -19.0], "radius": 1.5, "velocity": [52.4, -0.7, -152.6], "color": "#c0a79a" },
    { "id": "p_4", "type": "Sphere", "mass": 20.3, "position": [-22.5, 0.5, -8.7], "radius": 0.89, "velocity": [65.0, -0.1, -168.2], "color": "#a38b7d" },
    { "id": "p_5", "type": "Sphere", "mass": 70.1, "position": [5.0, -0.8, 48.4], "radius": 1.38, "velocity": [-142.1, 0.3, 14.7], "color": "#b8a093" },
    { "id": "p_6", "type": "Sphere", "mass": 95.8, "position": [36.2, 1.9, -49.6], "radius": 1.55, "velocity": [96.2, 0.8, 70.1], "color": "#c4a99d" },
    { "id": "p_7", "type": "Sphere", "mass": 55.7, "position": [41.9, -1.1, 23.0], "radius": 1.29, "velocity": [-66.1, -0.4, 120.4], "color": "#b79f92" },
    { "id": "p_8", "type": "Sphere", "mass": 3.4, "position": [9.4, 0.2, 12.3], "radius": 0.52, "velocity": [-156.4, 0.0, 119.5], "color": "#9e887a" },
    { "id": "p_9", "type": "Sphere", "mass": 105.1, "position": [-54.8, 1.3, 39.5], "radius": 1.6, "velocity": [-72.5, 0.5, -100.5], "color": "#ccb1a5" },
    { "id": "p_10", "type": "Sphere", "mass": 80.9, "position": [70.9, -2.5, 15.6], "radius": 1.46, "velocity": [-28.1, -0.9, 127.8], "color": "#d0b5a9" },
    { "id": "p_11", "type": "Sphere", "mass": 49.3, "position": [23.1, -0.9, -41.9], "radius": 1.22, "velocity": [116.2, -0.3, 63.9], "color": "#b8a093" },
    { "id": "p_12", "type": "Sphere", "mass": 63.8, "position": [-53.8, 1.8, -1.5], "radius": 1.35, "velocity": [3.5, 0.6, -125.7], "color": "#beab9e" },
    { "id": "p_13", "type": "Sphere", "mass": 17.6, "position": [33.7, 0.1, -3.1], "radius": 0.85, "velocity": [7.3, 0.0, 158.4], "color": "#aa9285" },
    { "id": "p_14", "type": "Sphere", "mass": 91.2, "position": [5.9, 2.2, -67.7], "radius": 1.52, "velocity": [131.0, 0.6, -11.4], "color": "#caafa2" },
    { "id": "p_15", "type": "Sphere", "mass": 75.2, "position": [-40.0, -1.4, -49.3], "radius": 1.42, "velocity": [96.2, -0.4, -78.1], "color": "#c4a99d" },
    { "id": "p_16", "type": "Sphere", "mass": 28.0, "position": [16.8, -0.5, 33.7], "radius": 0.98, "velocity": [-128.5, -0.2, 64.0], "color": "#b0978b" },
    { "id": "p_17", "type": "Sphere", "mass": 4.1, "position": [16.2, 0.9, 4.0], "radius": 0.54, "velocity": [-37.5, 0.2, 151.7], "color": "#9f897b" },
    { "id": "p_18", "type": "Sphere", "mass": 110.0, "position": [51.5, 2.8, 62.1], "radius": 1.63, "velocity": [-93.3, 0.6, 77.4], "color": "#d9c0b3" },
    { "id": "p_19", "type": "Sphere", "mass": 66.7, "position": [-61.8, -1.9, 23.4], "radius": 1.37, "velocity": [-44.6, -0.5, -117.7], "color": "#c6aca0" },
    { "id": "proto_planet_1", "type": "Sphere", "mass": 850, "position": [35, 1.5, 35], "radius": 4.8, "velocity": [-98, 0, 98], "color": "#a0a0ff"},
    { "id": "proto_planet_2", "type": "Sphere", "mass": 1200, "position": [-60, -1, 0], "radius": 5.4, "velocity": [0, 0.1, 90], "color": "#8080ff"},
    { "id": "proto_planet_3", "type": "Sphere", "mass": 650, "position": [0, 0.5, 75], "radius": 4.4, "velocity": [-72, -0.2, 0], "color": "#c0c0ff"},
    { "id": "p_20", "type": "Sphere", "mass": 99.3, "position": [-45.8, 2.4, -62.3], "radius": 1.58, "velocity": [99.7, 0.6, -73.3], "color": "#d0b4a8" },
    { "id": "p_21", "type": "Sphere", "mass": 23.5, "position": [33.0, -1.2, -26.5], "radius": 0.93, "velocity": [85.5, -0.5, 106.3], "color": "#b1998c" },
    { "id": "p_22", "type": "Sphere", "mass": 46.1, "position": [-29.8, 0.7, 34.3], "radius": 1.19, "velocity": [-102.3, 0.3, -88.7], "color": "#b49d8f" },
    { "id": "p_23", "type": "Sphere", "mass": 11.9, "position": [-8.5, -0.3, -22.1], "radius": 0.78, "velocity": [152.0, -0.1, -58.5], "color": "#a38b7d" },
    { "id": "p_24", "type": "Sphere", "mass": 72.8, "position": [68.0, 2.1, -12.2], "radius": 1.4, "velocity": [23.1, 0.6, 128.9], "color": "#cbafa3" },
    { "id": "p_25", "type": "Sphere", "mass": 33.1, "position": [-41.2, -1.7, 10.6], "radius": 1.05, "velocity": [-37.5, -0.6, -145.7], "color": "#b1998c" },
    { "id": "p_26", "type": "Sphere", "mass": 59.9, "position": [45.1, 1.4, 38.3], "radius": 1.32, "velocity": [-83.5, 0.4, 98.4], "color": "#c1a79a" },
    { "id": "p_27", "type": "Sphere", "mass": 8.7, "position": [19.8, -0.9, 13.5], "radius": 0.7, "velocity": [-83.1, -0.3, 122.0], "color": "#a28a7c" },
    { "id": "p_28", "type": "Sphere", "mass": 84.1, "position": [-26.8, 2.7, -65.9], "radius": 1.48, "velocity": [116.5, 0.7, -47.4], "color": "#c9aea1" },
    { "id": "p_29", "type": "Sphere", "mass": 39.8, "position": [46.7, 0.3, -8.3], "radius": 1.13, "velocity": [24.7, 0.1, 139.1], "color": "#b59e91" },
    { "id": "p_30", "type": "Sphere", "mass": 6.3, "position": [-16.2, -1.5, -11.0], "radius": 0.62, "velocity": [85.9, -0.5, -126.7], "color": "#a08a7c" },
    { "id": "p_31", "type": "Sphere", "mass": 91.9, "position": [73.5, -2.2, 33.2], "radius": 1.53, "velocity": [-50.7, -0.5, 112.2], "color": "#d2b6a9" },
    { "id": "p_32", "type": "Sphere", "mass": 15.1, "position": [-31.0, 1.8, 8.4], "radius": 0.82, "velocity": [-39.7, 0.8, -146.4], "color": "#a99184" },
    { "id": "p_33", "type": "Sphere", "mass": 52.8, "position": [13.4, 0.1, 51.5], "radius": 1.26, "velocity": [-139.8, 0.0, 36.4], "color": "#ba_a295" },
    { "id": "p_34", "type": "Sphere", "mass": 26.3, "position": [-19.9, -1.1, -33.6], "radius": 0.96, "velocity": [121.2, -0.5, -71.7], "color": "#ae968a" },
    { "id": "p_35", "type": "Sphere", "mass": 102.7, "position": [-82.6, 2.9, -14.6], "radius": 1.59, "velocity": [22.4, 0.7, -127.1], "color": "#d6bdad" },
    { "id": "p_36", "type": "Sphere", "mass": 42.9, "position": [48.9, -0.6, 17.5], "radius": 1.16, "velocity": [-45.7, -0.2, 127.9], "color": "#b9a193" },
    { "id": "p_37", "type": "Sphere", "mass": 69.1, "position": [-29.5, 1.3, 58.7], "radius": 1.38, "velocity": [-114.7, 0.4, 57.6], "color": "#c4a99d" },
    { "id": "p_38", "type": "Sphere", "mass": 2.9, "position": [14.0, 0.7, -3.1], "radius": 0.49, "velocity": [33.7, 0.2, 151.7], "color": "#9d8779" },
    { "id": "p_39", "type": "Sphere", "mass": 87.2, "position": [-68.8, -2.0, -38.2], "radius": 1.5, "velocity": [61.1, -0.5, -110.1], "color": "#d0b4a8" },
    { "id": "p_40", "type": "Sphere", "mass": 56.4, "position": [20.9, -1.8, -55.9], "radius": 1.3, "velocity": [115.5, -0.5, 43.1], "color": "#bfab9d" },
    { "id": "rogue_1", "type": "Sphere", "mass": 150, "position": [-120, 10, -80], "radius": 2.5, "velocity": [25, -2, 20], "color": "#FF6347" },
    { "id": "p_41", "type": "Sphere", "mass": 34.0, "position": [42.6, 1.1, -3.8], "radius": 1.06, "velocity": [13.2, 0.4, 148.0], "color": "#af978a" },
    { "id": "p_42", "type": "Sphere", "mass": 18.2, "position": [-35.8, -0.7, 9.6], "radius": 0.86, "velocity": [-37.2, -0.3, -138.8], "color": "#ab9386" },
    { "id": "p_43", "type": "Sphere", "mass": 78.8, "position": [61.9, 2.5, 45.4], "radius": 1.45, "velocity": [-76.4, 0.6, 104.3], "color": "#cfb3a7" },
    { "id": "p_44", "type": "Sphere", "mass": 9.4, "position": [2.6, 0.4, -24.4], "radius": 0.72, "velocity": [146.5, 0.1, 15.6], "color": "#a38b7d" },
    { "id": "p_45", "type": "Sphere", "mass": 94.6, "position": [-13.7, -1.3, 75.3], "radius": 1.55, "velocity": [-129.4, -0.3, -23.5], "color": "#cfb3a7" },
    { "id": "p_46", "type": "Sphere", "mass": 44.2, "position": [-49.9, 1.9, 21.0], "radius": 1.17, "velocity": [-51.9, 0.7, -123.3], "color": "#ba_a295" },
    { "id": "p_47", "type": "Sphere", "mass": 61.3, "position": [48.1, -0.9, -31.3], "radius": 1.33, "velocity": [70.5, -0.3, 108.3], "color": "#c2a89b" },
    { "id": "p_48", "type": "Sphere", "mass": 13.6, "position": [-29.1, 0.0, -9.9], "radius": 0.8, "velocity": [50.2, 0.0, -147.2], "color": "#a78f82" },
    { "id": "p_49", "type": "Sphere", "mass": 106.6, "position": [84.1, -2.7, 18.0], "radius": 1.61, "velocity": [-26.8, -0.6, 125.1], "color": "#d7bec0" },
    { "id": "p_50", "type": "Sphere", "mass": 52.1, "position": [-55.0, 1.2, 8.1], "radius": 1.25, "velocity": [-19.4, 0.4, -130.6], "color": "#bc_a497" },
    { "id": "p_51", "type": "Sphere", "mass": 29.8, "position": [23.8, 1.7, 36.3], "radius": 1.01, "velocity": [-114.7, 0.7, 75.2], "color": "#ad9588" },
    { "id": "p_52", "type": "Sphere", "mass": 75.9, "position": [-11.0, -1.6, -69.2], "radius": 1.43, "velocity": [128.5, -0.4, -20.5], "color": "#ceb2a6" },
    { "id": "p_53", "type": "Sphere", "mass": 4.8, "position": [18.2, -0.4, -6.1], "radius": 0.57, "velocity": [51.0, -0.1, 152.0], "color": "#9f897b" },
    { "id": "p_54", "type": "Sphere", "mass": 82.5, "position": [73.8, 2.3, -39.1], "radius": 1.47, "velocity": [58.4, 0.5, 110.1], "color": "#d1b5a9" },
    { "id": "p_55", "type": "Sphere", "mass": 48.4, "position": [-37.5, -1.0, 39.8], "radius": 1.21, "velocity": [-99.0, -0.3, -93.3], "color": "#b8a093" },
    { "id": "p_56", "type": "Sphere", "mass": 67.9, "position": [28.2, 0.8, 62.0], "radius": 1.37, "velocity": [-118.8, 0.2, 53.9], "color": "#c8ad_a1" },
    { "id": "p_57", "type": "Sphere", "mass": 19.8, "position": [-36.2, 1.4, -13.6], "radius": 0.88, "velocity": [55.8, 0.5, -148.5], "color": "#ad9588" },
    { "id": "p_58", "type": "Sphere", "mass": 90.0, "position": [59.1, -2.1, 51.5], "radius": 1.52, "velocity": [-78.8, -0.5, 90.5], "color": "#d3b8ac" },
    { "id": "p_59", "type": "Sphere", "mass": 7.4, "position": [5.2, -0.7, 21.0], "radius": 0.65, "velocity": [-144.3, -0.2, 35.8], "color": "#a1897b" },
    { "id": "rogue_2", "type": "Sphere", "mass": 120, "position": [90, 5, 110], "radius": 2.2, "velocity": [-22, 1.5, -28], "color": "#FF4500" },
    { "id": "p_60", "type": "Sphere", "mass": 112.5, "position": [-87.3, 2.8, 25.0], "radius": 1.64, "velocity": [-34.2, 0.6, -119.5], "color": "#db_c2b4" },
    { "id": "p_61", "type": "Sphere", "mass": 55.0, "position": [43.6, -1.4, -40.6], "radius": 1.28, "velocity": [90.5, -0.4, 97.2], "color": "#beab9e" },
    { "id": "p_62", "type": "Sphere", "mass": 31.5, "position": [-25.5, 0.6, 38.8], "radius": 1.03, "velocity": [-112.7, 0.2, -74.1], "color": "#ae968a" },
    { "id": "p_63", "type": "Sphere", "mass": 81.3, "position": [69.9, 2.0, 19.3], "radius": 1.46, "velocity": [-34.4, 0.5, 124.6], "color": "#cfb3a7" },
    { "id": "p_64", "type": "Sphere", "mass": 16.7, "position": [8.4, -0.8, -32.6], "radius": 0.84, "velocity": [155.6, -0.2, 40.1], "color": "#aa9285" },
    { "id": "p_65", "type": "Sphere", "mass": 98.2, "position": [-79.4, -1.9, -17.8], "radius": 1.57, "velocity": [27.7, -0.4, 123.7], "color": "#d5bcae" },
    { "id": "p_66", "type": "Sphere", "mass": 41.5, "position": [37.7, 1.5, 30.6], "radius": 1.15, "velocity": [-85.6, 0.5, 105.4], "color": "#b29a8d" },
    { "id": "p_67", "type": "Sphere", "mass": 64.6, "position": [-58.2, 0.2, -26.5], "radius": 1.35, "velocity": [54.0, 0.0, -118.6], "color": "#c4a99d" },
    { "id": "p_68", "type": "Sphere", "mass": 22.8, "position": [19.0, 1.0, -32.4], "radius": 0.92, "velocity": [116.1, 0.3, 68.0], "color": "#aa9285" },
    { "id": "p_69", "type": "Sphere", "mass": 105.9, "position": [54.1, -2.6, -66.1], "radius": 1.6, "velocity": [101.4, -0.6, -82.9], "color": "#d9c0b3" },
    { "id": "p_70", "type": "Sphere", "mass": 3.7, "position": [-17.5, -1.1, 1.8], "radius": 0.53, "velocity": [-16.0, -0.3, -155.0], "color": "#9e887a" },
    { "id": "p_71", "type": "Sphere", "mass": 86.0, "position": [-29.8, 2.1, 71.0], "radius": 1.49, "velocity": [-121.2, 0.5, 50.8], "color": "#ceb2a6" },
    { "id": "p_72", "type": "Sphere", "mass": 49.9, "position": [53.1, -0.5, 6.8], "radius": 1.23, "velocity": [-17.7, -0.1, 137.9], "color": "#bc_a497" },
    { "id": "p_73", "type": "Sphere", "mass": 72.0, "position": [14.9, 1.8, -66.5], "radius": 1.4, "velocity": [131.0, 0.5, -29.4], "color": "#caa_fa2" },
    { "id": "p_74", "type": "Sphere", "mass": 27.2, "position": [-40.4, -1.3, -20.9], "radius": 0.97, "velocity": [65.9, -0.5, -127.4], "color": "#af978a" },
    { "id": "p_75", "type": "Sphere", "mass": 111.3, "position": [-89.6, -2.9, -8.7], "radius": 1.63, "velocity": [11.8, -0.6, 121.9], "color": "#dad_c1_b3" },
    { "id": "p_76", "type": "Sphere", "mass": 58.7, "position": [34.7, 0.9, 53.6], "radius": 1.31, "velocity": [-106.3, 0.2, 68.7], "color": "#c0a79a" },
    { "id": "p_77", "type": "Sphere", "mass": 5.9, "position": [10.4, -0.2, 18.0], "radius": 0.61, "velocity": [-134.1, -0.1, 77.4], "color": "#a08a7b" },
    { "id": "p_78", "type": "Sphere", "mass": 93.3, "position": [78.1, 2.6, 22.4], "radius": 1.54, "velocity": [-33.2, 0.5, 116.3], "color": "#d4b9ad" },
    { "id": "p_79", "type": "Sphere", "mass": 45.4, "position": [-49.4, -1.8, -1.2], "radius": 1.18, "velocity": [3.2, -0.6, -128.5], "color": "#b69e91" }
  ],
  "gravity": [0, 0, 0],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.2,
    "restitution": 0.1
  },
  "gravitationalPhysics": {
    "enabled": true,
    "gravitationalConstant": 1.5,
    "minDistance": 0.2,
    "softening": 0.1
  },
  "simulationScale": "solar_system"
},{
  "id": "wizard_tower_at_moonlit_falls",
  "name": "Wizard Tower at Moonlit Falls",
  "description": "Building upon positive feedback, this scene presents a more complex and atmospheric block world. A lonely wizard's tower stands atop a high cliff, overlooking a dramatic waterfall that cascades into a calm lake below. A full moon illuminates the landscape, revealing a rickety rope bridge, scattered forests, and a hidden lava cave behind the falls. The scene is designed to evoke a sense of magic and mystery.",
  "objects": [
    {
      "id": "full_moon",
      "type": "Sphere",
      "mass": 0,
      "isStatic": true,
      "position": [80, 100, -80],
      "radius": 15,
      "color": "#F5F5F5"
    },
    {
      "id": "cloud_high_1",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-30, 85, 20],
      "dimensions": [40, 4, 25],
      "color": "#4A4A5C",
      "opacity": 0.8
    },
    {
      "id": "cloud_high_2",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [40, 90, -30],
      "dimensions": [50, 5, 20],
      "color": "#4A4A5C",
      "opacity": 0.8
    },
    {
      "id": "bedrock",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [0, -40, 0],
      "dimensions": [200, 20, 200],
      "color": "#36454F"
    },
    {
      "id": "west_plateau_stone",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-55, -15, 0],
      "dimensions": [90, 30, 150],
      "color": "#708090"
    },
    {
      "id": "west_plateau_dirt",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-55, 1.5, 0],
      "dimensions": [90, 3, 150],
      "color": "#795548"
    },
    {
      "id": "west_plateau_grass",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-55, 4, 0],
      "dimensions": [90, 2, 150],
      "color": "#4B8251"
    },
    {
      "id": "east_cliff_stone",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [55, 0, 0],
      "dimensions": [90, 60, 150],
      "color": "#696969"
    },
    {
      "id": "east_cliff_dirt",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [55, 31.5, 0],
      "dimensions": [90, 3, 150],
      "color": "#795548"
    },
    {
      "id": "east_cliff_grass",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [55, 34, 0],
      "dimensions": [90, 2, 150],
      "color": "#9A8D64"
    },
    {
      "id": "lake_bed",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-10, -5, 0],
      "dimensions": [40, 10, 150],
      "color": "#c2b280"
    },
    {
      "id": "lake_water",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-10, 1, 0],
      "dimensions": [40, 2, 150],
      "color": "#2F4F4F",
      "opacity": 0.85
    },
    {
      "id": "waterfall",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [10, 18, 0],
      "dimensions": [2, 34, 40],
      "color": "#ADD8E6",
      "opacity": 0.6
    },
    {
      "id": "cave_floor",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [18, 10, 0],
      "dimensions": [14, 2, 38],
      "color": "#43464B"
    },
    {
      "id": "lava_pool",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [18, 11, 0],
      "dimensions": [10, 1, 20],
      "color": "#FF4500"
    },
    {
      "id": "bridge_plank_1", "type": "Box", "mass": 0, "isStatic": true, "position": [-8, 6.2, 50], "dimensions": [32, 0.4, 2], "color": "#8B4513", "rotation": [0,0,0.05]},
    { "id": "bridge_plank_2", "type": "Box", "mass": 0, "isStatic": true, "position": [-8, 6.1, 52], "dimensions": [32, 0.4, 2], "color": "#8B4513", "rotation": [0,0,-0.02]},
    { "id": "bridge_plank_3", "type": "Box", "mass": 0, "isStatic": true, "position": [-8, 6.3, 54], "dimensions": [32, 0.4, 2], "color": "#8B4513", "rotation": [0,0,0.03]},
    { "id": "bridge_plank_4", "type": "Box", "mass": 0, "isStatic": true, "position": [-8, 6.0, 56], "dimensions": [32, 0.4, 2], "color": "#8B4513", "rotation": [0,0,-0.04]},
    {
      "id": "wizard_tower_base",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [55, 41, -40],
      "dimensions": [14, 12, 14],
      "color": "#465058"
    },
    {
      "id": "wizard_tower_shaft",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [55, 57, -40],
      "dimensions": [12, 20, 12],
      "color": "#465058"
    },
    {
      "id": "wizard_tower_top",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [55, 68, -40],
      "dimensions": [16, 2, 16],
      "color": "#465058"
    },
    {
      "id": "wizard_tower_crystal",
      "type": "Sphere",
      "mass": 0,
      "isStatic": true,
      "position": [55, 73, -40],
      "radius": 3,
      "color": "#FF00FF"
    },
    { "id": "autumn_tree_1_trunk", "type": "Box", "mass": 0, "isStatic": true, "position": [40, 40, -10], "dimensions": [2, 10, 2], "color": "#5C4033" },
    { "id": "autumn_tree_1_leaves", "type": "Box", "mass": 0, "isStatic": true, "position": [40, 46, -10], "dimensions": [8, 8, 8], "color": "#FF8C00" },
    { "id": "autumn_tree_2_trunk", "type": "Box", "mass": 0, "isStatic": true, "position": [70, 40, -15], "dimensions": [2, 10, 2], "color": "#5C4033" },
    { "id": "autumn_tree_2_leaves", "type": "Box", "mass": 0, "isStatic": true, "position": [70, 46, -15], "dimensions": [8, 8, 8], "color": "#DAA520" },
    { "id": "autumn_tree_3_trunk", "type": "Box", "mass": 0, "isStatic": true, "position": [80, 40, 0], "dimensions": [2, 10, 2], "color": "#5C4033" },
    { "id": "autumn_tree_3_leaves", "type": "Box", "mass": 0, "isStatic": true, "position": [80, 46, 0], "dimensions": [8, 8, 8], "color": "#B22222" },
    { "id": "pine_1_trunk", "type": "Box", "mass": 0, "isStatic": true, "position": [-30, 10.5, 20], "dimensions": [3, 11, 3], "color": "#5c3c1a"},
    { "id": "pine_1_l1", "type": "Box", "mass": 0, "isStatic": true, "position": [-30, 10, 20], "dimensions": [12, 3, 12], "color": "#2E4731"},
    { "id": "pine_1_l2", "type": "Box", "mass": 0, "isStatic": true, "position": [-30, 14, 20], "dimensions": [9, 3, 9], "color": "#2E4731"},
    { "id": "pine_1_l3", "type": "Box", "mass": 0, "isStatic": true, "position": [-30, 18, 20], "dimensions": [5, 3, 5], "color": "#2E4731"},
    { "id": "pine_2_trunk", "type": "Box", "mass": 0, "isStatic": true, "position": [-45, 10.5, 35], "dimensions": [3, 11, 3], "color": "#5c3c1a"},
    { "id": "pine_2_l1", "type": "Box", "mass": 0, "isStatic": true, "position": [-45, 10, 35], "dimensions": [12, 3, 12], "color": "#2E4731"},
    { "id": "pine_2_l2", "type": "Box", "mass": 0, "isStatic": true, "position": [-45, 14, 35], "dimensions": [9, 3, 9], "color": "#2E4731"},
    { "id": "pine_2_l3", "type": "Box", "mass": 0, "isStatic": true, "position": [-45, 18, 35], "dimensions": [5, 3, 5], "color": "#2E4731"},
    { "id": "pine_3_trunk", "type": "Box", "mass": 0, "isStatic": true, "position": [-60, 10.5, 10], "dimensions": [3, 11, 3], "color": "#5c3c1a"},
    { "id": "pine_3_l1", "type": "Box", "mass": 0, "isStatic": true, "position": [-60, 10, 10], "dimensions": [12, 3, 12], "color": "#2E4731"},
    { "id": "pine_3_l2", "type": "Box", "mass": 0, "isStatic": true, "position": [-60, 14, 10], "dimensions": [9, 3, 9], "color": "#2E4731"},
    { "id": "pine_3_l3", "type": "Box", "mass": 0, "isStatic": true, "position": [-60, 18, 10], "dimensions": [5, 3, 5], "color": "#2E4731"}
  ],
  "gravity": [
    0,
    -10,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.8,
    "restitution": 0.1
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "perpetual_motion_engine",
  "name": "Perpetual Motion Engine",
  "description": "A simulation demonstrating the concept of perpetual motion by violating the law of conservation of energy. Inside a sealed, zero-friction container, several spheres are given an initial velocity. The material properties are set with a restitution greater than 1.0, causing each collision to add a small amount of kinetic energy to the system. This results in the spheres accelerating infinitely and chaotically, creating a true perpetual motion machine within the simulation's rules.",
  "objects": [
    {
      "id": "containment_floor",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [0, -15, 0],
      "dimensions": [30, 0.5, 30],
      "color": "#444444",
      "opacity": 0.4
    },
    {
      "id": "containment_ceiling",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [0, 15, 0],
      "dimensions": [30, 0.5, 30],
      "color": "#444444",
      "opacity": 0.4
    },
    {
      "id": "containment_wall_back",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [0, 0, -15],
      "dimensions": [30.5, 30, 0.5],
      "color": "#555555",
      "opacity": 0.4
    },
    {
      "id": "containment_wall_front",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [0, 0, 15],
      "dimensions": [30.5, 30, 0.5],
      "color": "#555555",
      "opacity": 0.4
    },
    {
      "id": "containment_wall_left",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [-15, 0, 0],
      "dimensions": [0.5, 30, 30],
      "color": "#555555",
      "opacity": 0.4
    },
    {
      "id": "containment_wall_right",
      "type": "Box",
      "mass": 0,
      "isStatic": true,
      "position": [15, 0, 0],
      "dimensions": [0.5, 30, 30],
      "color": "#555555",
      "opacity": 0.4
    },
    {
      "id": "prime_mover",
      "type": "Sphere",
      "mass": 5,
      "position": [0, 10, 0],
      "velocity": [15, -5, 12],
      "radius": 2,
      "color": "gold"
    },
    {
      "id": "catalyst_one",
      "type": "Sphere",
      "mass": 2,
      "position": [-8, -10, 5],
      "velocity": [5, 20, -5],
      "radius": 1.5,
      "color": "crimson"
    },
    {
      "id": "catalyst_two",
      "type": "Sphere",
      "mass": 2,
      "position": [8, -10, -5],
      "velocity": [-5, 20, 5],
      "radius": 1.5,
      "color": "royalblue"
    },
    {
      "id": "accelerator_one",
      "type": "Sphere",
      "mass": 10,
      "position": [10, 0, 10],
      "velocity": [-8, 2, -15],
      "radius": 3,
      "color": "darkviolet"
    },
    {
      "id": "accelerator_two",
      "type": "Sphere",
      "mass": 10,
      "position": [-10, 0, -10],
      "velocity": [8, -2, 15],
      "radius": 3,
      "color": "darkgreen"
    }
  ],
  "gravity": [
    0,
    0,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0,
    "restitution": 1.005
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "lever_and_dominoes_collision",
  "name": "Box Collision Demo: Lever and Dominoes",
  "description": "Yes, the engine supports dynamic boxes that move based on collisions. This scene demonstrates the principle. A heavy sphere drops onto one end of a dynamic lever box, causing it to pivot on a static fulcrum. This launches a lighter box from the other end, which then collides with a series of other dynamic boxes set up like dominoes, causing a chain reaction. This shows that both spheres and boxes can be non-static and fully interact with each other.",
  "objects": [
    {
      "id": "ground_plane_object",
      "type": "Plane",
      "isStatic": true,
      "mass": 0,
      "position": [0, -0.1, 0],
      "dimensions": [100, 0.2, 100],
      "color": "#607d8b"
    },
    {
      "id": "hammer_sphere",
      "type": "Sphere",
      "mass": 80,
      "position": [-8, 15, 0],
      "radius": 1.5,
      "color": "#455a64"
    },
    {
      "id": "fulcrum_pivot",
      "type": "Cylinder",
      "isStatic": true,
      "mass": 0,
      "position": [0, 1, 0],
      "radius": 0.5,
      "height": 2,
      "color": "#c5c5c5"
    },
    {
      "id": "lever_box",
      "type": "Box",
      "mass": 10,
      "position": [0, 2.25, 0],
      "dimensions": [20, 0.5, 3],
      "color": "#a1887f",
      "restitution": 0.1
    },
    {
      "id": "payload_box",
      "type": "Box",
      "mass": 1,
      "position": [8.5, 3, 0],
      "dimensions": [1, 1, 1],
      "color": "#ef5350"
    },
    {
      "id": "domino_1",
      "type": "Box",
      "mass": 0.5,
      "position": [20, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#f44336"
    },
    {
      "id": "domino_2",
      "type": "Box",
      "mass": 0.5,
      "position": [22.5, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#ff9800"
    },
    {
      "id": "domino_3",
      "type": "Box",
      "mass": 0.5,
      "position": [25, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#ffeb3b"
    },
    {
      "id": "domino_4",
      "type": "Box",
      "mass": 0.5,
      "position": [27.5, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#4caf50"
    },
    {
      "id": "domino_5",
      "type": "Box",
      "mass": 0.5,
      "position": [30, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#2196f3"
    },
    {
      "id": "domino_6",
      "type": "Box",
      "mass": 0.5,
      "position": [32.5, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#3f51b5"
    },
    {
      "id": "domino_7",
      "type": "Box",
      "mass": 0.5,
      "position": [35, 2, 0],
      "dimensions": [0.3, 4, 2],
      "color": "#9c27b0"
    }
  ],
  "gravity": [
    0,
    -9.81,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0.5,
    "restitution": 0.2
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},
{"id":"galactic_collision_simulation","name":"Colliding Galaxies","description":"Two spiral galaxies approaching each other with hundreds of stars, demonstrating gravitational N-body dynamics at cosmic scale","objects":[{"id":"galaxy_core_1","type":"Sphere","mass":1000000,"position":[-30,0,-20],"dimensions":null,"radius":3,"height":null,"velocity":[2,0,1],"rotation":[0,0,0],"angularVelocity":[0,0.1,0],"color":"#ffaa00","opacity":0.9,"isStatic":false,"gravitationalMass":1000000,"restitution":0.1},{"id":"galaxy_core_2","type":"Sphere","mass":800000,"position":[40,0,30],"dimensions":null,"radius":2.5,"height":null,"velocity":[-2.5,0,-1.5],"rotation":[0,0,0],"angularVelocity":[0,-0.08,0],"color":"#ff6600","opacity":0.9,"isStatic":false,"gravitationalMass":800000,"restitution":0.1},{"id":"star_1","type":"Sphere","mass":100,"position":[-25,2,-18],"radius":0.3,"velocity":[1.8,0.5,0.8],"color":"#ffffff","opacity":1},{"id":"star_2","type":"Sphere","mass":120,"position":[-35,-1,-22],"radius":0.35,"velocity":[2.2,-0.3,1.2],"color":"#ffffcc","opacity":1},{"id":"star_3","type":"Sphere","mass":90,"position":[-28,3,-25],"radius":0.25,"velocity":[1.5,0.2,1.5],"color":"#ccffff","opacity":1},{"id":"star_4","type":"Sphere","mass":110,"position":[-32,-2,-15],"radius":0.3,"velocity":[2.5,0.1,0.5],"color":"#ffcccc","opacity":1},{"id":"star_5","type":"Sphere","mass":95,"position":[-27,1,-20],"radius":0.28,"velocity":[1.9,-0.2,0.9],"color":"#ffffff","opacity":1},{"id":"star_6","type":"Sphere","mass":105,"position":[-33,0,-18],"radius":0.32,"velocity":[2.1,0.3,1.1],"color":"#ffffaa","opacity":1},{"id":"star_7","type":"Sphere","mass":85,"position":[-29,-3,-23],"radius":0.24,"velocity":[1.7,0.4,1.3],"color":"#aaffff","opacity":1},{"id":"star_8","type":"Sphere","mass":115,"position":[-26,4,-16],"radius":0.33,"velocity":[2.3,-0.1,0.7],"color":"#ffaaaa","opacity":1},{"id":"star_9","type":"Sphere","mass":100,"position":[-34,2,-21],"radius":0.3,"velocity":[1.6,0.5,1.4],"color":"#ffffff","opacity":1},{"id":"star_10","type":"Sphere","mass":92,"position":[-30,-1,-24],"radius":0.26,"velocity":[2.0,0.2,1.0],"color":"#ccccff","opacity":1},{"id":"star_11","type":"Sphere","mass":108,"position":[-24,0,-19],"radius":0.31,"velocity":[2.4,-0.3,0.6],"color":"#ffccaa","opacity":1},{"id":"star_12","type":"Sphere","mass":88,"position":[-36,3,-17],"radius":0.25,"velocity":[1.4,0.1,1.2],"color":"#aaffaa","opacity":1},{"id":"star_13","type":"Sphere","mass":112,"position":[-31,-2,-26],"radius":0.32,"velocity":[1.8,0.4,1.6],"color":"#ffffcc","opacity":1},{"id":"star_14","type":"Sphere","mass":97,"position":[-25,1,-14],"radius":0.29,"velocity":[2.2,-0.2,0.4],"color":"#ffffff","opacity":1},{"id":"star_15","type":"Sphere","mass":103,"position":[-37,0,-20],"radius":0.3,"velocity":[1.5,0.3,1.3],"color":"#ffaaff","opacity":1},{"id":"star_16","type":"Sphere","mass":80,"position":[38,1,28],"radius":0.22,"velocity":[-2.3,0.2,-1.3],"color":"#ffffff","opacity":1},{"id":"star_17","type":"Sphere","mass":125,"position":[42,-2,32],"radius":0.36,"velocity":[-2.7,-0.1,-1.7],"color":"#ffffaa","opacity":1},{"id":"star_18","type":"Sphere","mass":95,"position":[36,3,26],"radius":0.28,"velocity":[-2.1,0.3,-1.1],"color":"#ccffcc","opacity":1},{"id":"star_19","type":"Sphere","mass":110,"position":[44,0,34],"radius":0.32,"velocity":[-2.8,0.1,-1.8],"color":"#ffccff","opacity":1},{"id":"star_20","type":"Sphere","mass":87,"position":[39,-1,29],"radius":0.24,"velocity":[-2.4,-0.2,-1.4],"color":"#ffffff","opacity":1},{"id":"star_21","type":"Sphere","mass":118,"position":[35,2,31],"radius":0.34,"velocity":[-2.0,0.4,-1.2],"color":"#ffaacc","opacity":1},{"id":"star_22","type":"Sphere","mass":93,"position":[43,1,27],"radius":0.27,"velocity":[-2.6,0.2,-1.6],"color":"#aaffcc","opacity":1},{"id":"star_23","type":"Sphere","mass":105,"position":[37,-3,33],"radius":0.31,"velocity":[-2.2,-0.3,-1.5],"color":"#ffccaa","opacity":1},{"id":"star_24","type":"Sphere","mass":98,"position":[41,4,25],"radius":0.29,"velocity":[-2.5,0.1,-1.0],"color":"#ffffff","opacity":1},{"id":"star_25","type":"Sphere","mass":91,"position":[34,0,30],"radius":0.26,"velocity":[-1.9,0.3,-1.3],"color":"#ccccff","opacity":1},{"id":"star_26","type":"Sphere","mass":114,"position":[45,-2,28],"radius":0.33,"velocity":[-2.9,-0.1,-1.4],"color":"#ffffcc","opacity":1},{"id":"star_27","type":"Sphere","mass":83,"position":[38,3,35],"radius":0.23,"velocity":[-2.3,0.4,-1.9],"color":"#aaffff","opacity":1},{"id":"star_28","type":"Sphere","mass":122,"position":[40,-1,24],"radius":0.35,"velocity":[-2.4,0.2,-0.9],"color":"#ffaaaa","opacity":1},{"id":"star_29","type":"Sphere","mass":96,"position":[36,2,32],"radius":0.28,"velocity":[-2.1,-0.2,-1.7],"color":"#ffffff","opacity":1},{"id":"star_30","type":"Sphere","mass":107,"position":[42,0,26],"radius":0.31,"velocity":[-2.7,0.3,-1.1],"color":"#ffcccc","opacity":1},{"id":"star_31","type":"Sphere","mass":75,"position":[-15,5,-10],"radius":0.2,"velocity":[3,0.6,2],"color":"#aaaaff","opacity":1},{"id":"star_32","type":"Sphere","mass":130,"position":[25,-5,15],"radius":0.37,"velocity":[-3.2,-0.5,-2.2],"color":"#ffaa88","opacity":1},{"id":"star_33","type":"Sphere","mass":102,"position":[-40,8,-30],"radius":0.3,"velocity":[1.2,0.8,1.8],"color":"#88ffff","opacity":1},{"id":"star_34","type":"Sphere","mass":89,"position":[50,6,40],"radius":0.25,"velocity":[-3.5,0.3,-2.5],"color":"#ff88ff","opacity":1},{"id":"star_35","type":"Sphere","mass":116,"position":[-20,-6,-35],"radius":0.33,"velocity":[2.8,-0.4,2.3],"color":"#ffff88","opacity":1},{"id":"star_36","type":"Sphere","mass":94,"position":[30,7,20],"radius":0.27,"velocity":[-2.9,0.7,-1.9],"color":"#88ff88","opacity":1},{"id":"star_37","type":"Sphere","mass":111,"position":[-45,-8,-12],"radius":0.32,"velocity":[1.1,-0.6,0.8],"color":"#ff8888","opacity":1},{"id":"star_38","type":"Sphere","mass":86,"position":[55,9,45],"radius":0.24,"velocity":[-3.8,0.5,-2.8],"color":"#8888ff","opacity":1},{"id":"star_39","type":"Sphere","mass":104,"position":[-18,10,-28],"radius":0.31,"velocity":[2.6,0.9,2.1],"color":"#ffffff","opacity":1},{"id":"star_40","type":"Sphere","mass":99,"position":[28,-10,18],"radius":0.29,"velocity":[-2.7,-0.7,-1.7],"color":"#ffaaff","opacity":1},{"id":"star_41","type":"Sphere","mass":121,"position":[-48,12,-40],"radius":0.35,"velocity":[0.9,1.0,1.5],"color":"#aaffaa","opacity":1},{"id":"star_42","type":"Sphere","mass":78,"position":[60,-12,50],"radius":0.21,"velocity":[-4.0,-0.8,-3.0],"color":"#ffaaaa","opacity":1},{"id":"star_43","type":"Sphere","mass":109,"position":[-22,15,-8],"radius":0.31,"velocity":[3.2,1.2,0.6],"color":"#aaaaff","opacity":1},{"id":"star_44","type":"Sphere","mass":92,"position":[32,-15,22],"radius":0.26,"velocity":[-3.1,-1.0,-2.1],"color":"#ffaa88","opacity":1},{"id":"star_45","type":"Sphere","mass":117,"position":[-52,18,-45],"radius":0.34,"velocity":[0.7,1.4,2.0],"color":"#88ffff","opacity":1},{"id":"star_46","type":"Sphere","mass":84,"position":[65,-18,55],"radius":0.23,"velocity":[-4.2,-1.2,-3.2],"color":"#ff88ff","opacity":1},{"id":"star_47","type":"Sphere","mass":106,"position":[-25,20,-15],"radius":0.31,"velocity":[3.0,1.5,1.0],"color":"#ffff88","opacity":1},{"id":"star_48","type":"Sphere","mass":101,"position":[35,-20,25],"radius":0.3,"velocity":[-3.3,-1.3,-2.3],"color":"#88ff88","opacity":1},{"id":"star_49","type":"Sphere","mass":113,"position":[-55,22,-50],"radius":0.32,"velocity":[0.5,1.6,2.5],"color":"#ff8888","opacity":1},{"id":"star_50","type":"Sphere","mass":90,"position":[70,-22,60],"radius":0.25,"velocity":[-4.5,-1.4,-3.5],"color":"#8888ff","opacity":1},{"id":"nebula_1","type":"Box","mass":50,"position":[-10,0,-5],"dimensions":[8,2,8],"velocity":[0.5,0.1,0.3],"color":"#ff00ff","opacity":0.3,"restitution":0.05},{"id":"nebula_2","type":"Box","mass":60,"position":[15,0,10],"dimensions":[10,3,10],"velocity":[-0.6,-0.1,-0.4],"color":"#00ffff","opacity":0.25,"restitution":0.05},{"id":"debris_field_1","type":"Cylinder","mass":40,"position":[-5,8,-3],"radius":4,"height":1,"velocity":[0.8,0.2,0.5],"color":"#888888","opacity":0.4,"restitution":0.1},{"id":"debris_field_2","type":"Cylinder","mass":45,"position":[10,-8,8],"radius":5,"height":1.5,"velocity":[-0.9,-0.2,-0.6],"color":"#666666","opacity":0.35,"restitution":0.1},{"id":"star_51","type":"Sphere","mass":119,"position":[-58,25,-55],"radius":0.34,"velocity":[0.3,1.8,2.8],"color":"#ffffff","opacity":1},{"id":"star_52","type":"Sphere","mass":82,"position":[75,-25,65],"radius":0.22,"velocity":[-4.7,-1.5,-3.7],"color":"#ffffcc","opacity":1},{"id":"star_53","type":"Sphere","mass":108,"position":[-28,28,-18],"radius":0.31,"velocity":[2.8,1.9,0.8],"color":"#ccffff","opacity":1},{"id":"star_54","type":"Sphere","mass":97,"position":[38,-28,28],"radius":0.29,"velocity":[-3.5,-1.6,-2.5],"color":"#ffcccc","opacity":1},{"id":"star_55","type":"Sphere","mass":115,"position":[-60,30,-60],"radius":0.33,"velocity":[0.1,2.0,3.0],"color":"#ffffff","opacity":1},{"id":"star_56","type":"Sphere","mass":88,"position":[80,-30,70],"radius":0.24,"velocity":[-5.0,-1.7,-4.0],"color":"#ffffaa","opacity":1},{"id":"star_57","type":"Sphere","mass":103,"position":[-30,32,-20],"radius":0.3,"velocity":[2.6,2.1,0.6],"color":"#aaffff","opacity":1},{"id":"star_58","type":"Sphere","mass":93,"position":[40,-32,30],"radius":0.27,"velocity":[-3.7,-1.8,-2.7],"color":"#ffaaaa","opacity":1},{"id":"star_59","type":"Sphere","mass":112,"position":[-62,35,-65],"radius":0.32,"velocity":[-0.1,2.2,3.2],"color":"#ffffff","opacity":1},{"id":"star_60","type":"Sphere","mass":85,"position":[85,-35,75],"radius":0.23,"velocity":[-5.2,-1.9,-4.2],"color":"#ccccff","opacity":1},{"id":"star_61","type":"Sphere","mass":120,"position":[-32,38,-22],"radius":0.35,"velocity":[2.4,2.3,0.4],"color":"#ffccaa","opacity":1},{"id":"star_62","type":"Sphere","mass":91,"position":[42,-38,32],"radius":0.26,"velocity":[-3.9,-2.0,-2.9],"color":"#aaffaa","opacity":1},{"id":"star_63","type":"Sphere","mass":110,"position":[-65,40,-70],"radius":0.32,"velocity":[-0.3,2.4,3.4],"color":"#ffffcc","opacity":1},{"id":"star_64","type":"Sphere","mass":87,"position":[90,-40,80],"radius":0.24,"velocity":[-5.5,-2.1,-4.5],"color":"#ffffff","opacity":1},{"id":"star_65","type":"Sphere","mass":105,"position":[-35,42,-25],"radius":0.31,"velocity":[2.2,2.5,0.2],"color":"#ffaaff","opacity":1},{"id":"star_66","type":"Sphere","mass":95,"position":[45,-42,35],"radius":0.28,"velocity":[-4.1,-2.2,-3.1],"color":"#ffffff","opacity":1},{"id":"star_67","type":"Sphere","mass":118,"position":[-68,45,-75],"radius":0.34,"velocity":[-0.5,2.6,3.6],"color":"#ffffaa","opacity":1},{"id":"star_68","type":"Sphere","mass":83,"position":[95,-45,85],"radius":0.23,"velocity":[-5.7,-2.3,-4.7],"color":"#ccffcc","opacity":1},{"id":"star_69","type":"Sphere","mass":100,"position":[-38,48,-28],"radius":0.3,"velocity":[2.0,2.7,0.0],"color":"#ffccff","opacity":1},{"id":"star_70","type":"Sphere","mass":98,"position":[48,-48,38],"radius":0.29,"velocity":[-4.3,-2.4,-3.3],"color":"#ffffff","opacity":1},{"id":"star_71","type":"Sphere","mass":124,"position":[-70,50,-80],"radius":0.36,"velocity":[-0.7,2.8,3.8],"color":"#ffaacc","opacity":1},{"id":"star_72","type":"Sphere","mass":79,"position":[98,-50,88],"radius":0.21,"velocity":[-5.9,-2.5,-4.9],"color":"#aaffcc","opacity":1},{"id":"star_73","type":"Sphere","mass":107,"position":[-40,52,-30],"radius":0.31,"velocity":[1.8,2.9,-0.2],"color":"#ffccaa","opacity":1},{"id":"star_74","type":"Sphere","mass":94,"position":[50,-52,40],"radius":0.27,"velocity":[-4.5,-2.6,-3.5],"color":"#ffffff","opacity":1},{"id":"star_75","type":"Sphere","mass":116,"position":[-72,55,-85],"radius":0.33,"velocity":[-0.9,3.0,4.0],"color":"#ccccff","opacity":1},{"id":"star_76","type":"Sphere","mass":86,"position":[100,-55,90],"radius":0.24,"velocity":[-6.1,-2.7,-5.1],"color":"#ffffcc","opacity":1},{"id":"star_77","type":"Sphere","mass":102,"position":[-42,58,-32],"radius":0.3,"velocity":[1.6,3.1,-0.4],"color":"#aaffff","opacity":1},{"id":"star_78","type":"Sphere","mass":96,"position":[52,-58,42],"radius":0.28,"velocity":[-4.7,-2.8,-3.7],"color":"#ffaaaa","opacity":1},{"id":"star_79","type":"Sphere","mass":114,"position":[-75,60,-90],"radius":0.33,"velocity":[-1.1,3.2,4.2],"color":"#ffffff","opacity":1},{"id":"star_80","type":"Sphere","mass":81,"position":[55,0,45],"radius":0.22,"velocity":[-2.0,0.5,-1.0],"color":"#ffcccc","opacity":1},{"id":"star_81","type":"Sphere","mass":126,"position":[-50,0,-40],"radius":0.36,"velocity":[1.0,-0.5,1.5],"color":"#ccffcc","opacity":1},{"id":"star_82","type":"Sphere","mass":99,"position":[20,10,0],"radius":0.29,"velocity":[-1.5,1.0,0.5],"color":"#ccccff","opacity":1},{"id":"star_83","type":"Sphere","mass":111,"position":[-20,-10,0],"radius":0.32,"velocity":[1.5,-1.0,-0.5],"color":"#ffffcc","opacity":1},{"id":"star_84","type":"Sphere","mass":77,"position":[0,20,10],"radius":0.21,"velocity":[0.5,2.0,-0.8],"color":"#ffaaff","opacity":1},{"id":"star_85","type":"Sphere","mass":123,"position":[0,-20,-10],"radius":0.35,"velocity":[-0.5,-2.0,0.8],"color":"#aaffaa","opacity":1},{"id":"star_86","type":"Sphere","mass":106,"position":[10,0,20],"radius":0.31,"velocity":[-0.8,0.3,-1.2],"color":"#ffaaaa","opacity":1},{"id":"star_87","type":"Sphere","mass":89,"position":[-10,0,-20],"radius":0.25,"velocity":[0.8,-0.3,1.2],"color":"#aaaaff","opacity":1},{"id":"star_88","type":"Sphere","mass":113,"position":[30,15,-10],"radius":0.32,"velocity":[-2.2,1.5,0.7],"color":"#ffaa88","opacity":1},{"id":"star_89","type":"Sphere","mass":96,"position":[-30,-15,10],"radius":0.28,"velocity":[2.2,-1.5,-0.7],"color":"#88ffff","opacity":1},{"id":"star_90","type":"Sphere","mass":101,"position":[5,25,5],"radius":0.3,"velocity":[-0.3,2.5,-0.3],"color":"#ff88ff","opacity":1},{"id":"star_91","type":"Sphere","mass":128,"position":[-5,-25,-5],"radius":0.37,"velocity":[0.3,-2.5,0.3],"color":"#ffff88","opacity":1},{"id":"star_92","type":"Sphere","mass":76,"position":[15,5,25],"radius":0.2,"velocity":[-1.0,0.8,-1.8],"color":"#88ff88","opacity":1},{"id":"star_93","type":"Sphere","mass":122,"position":[-15,-5,-25],"radius":0.35,"velocity":[1.0,-0.8,1.8],"color":"#ff8888","opacity":1},{"id":"star_94","type":"Sphere","mass":104,"position":[25,-5,15],"radius":0.31,"velocity":[-1.8,-0.8,-1.0],"color":"#8888ff","opacity":1},{"id":"star_95","type":"Sphere","mass":91,"position":[-25,5,-15],"radius":0.26,"velocity":[1.8,0.8,1.0],"color":"#ffffff","opacity":1},{"id":"star_96","type":"Sphere","mass":109,"position":[8,18,-8],"radius":0.31,"velocity":[-0.6,1.8,0.6],"color":"#ffaaff","opacity":1},{"id":"star_97","type":"Sphere","mass":100,"position":[-8,-18,8],"radius":0.3,"velocity":[0.6,-1.8,-0.6],"color":"#aaffaa","opacity":1},{"id":"star_98","type":"Sphere","mass":125,"position":[22,-12,2],"radius":0.36,"velocity":[-1.6,-1.2,-0.2],"color":"#ffaaaa","opacity":1},{"id":"star_99","type":"Sphere","mass":74,"position":[-22,12,-2],"radius":0.2,"velocity":[1.6,1.2,0.2],"color":"#aaaaff","opacity":1},{"id":"star_100","type":"Sphere","mass":108,"position":[12,8,18],"radius":0.31,"velocity":[-0.9,1.0,-1.4],"color":"#ffaa88","opacity":1},{"id":"asteroid_1","type":"Sphere","mass":5,"position":[0,50,0],"radius":0.15,"velocity":[0,-3,0],"color":"#444444","opacity":0.8},{"id":"asteroid_2","type":"Sphere","mass":8,"position":[50,0,0],"radius":0.18,"velocity":[-3,0,0],"color":"#555555","opacity":0.8},{"id":"asteroid_3","type":"Sphere","mass":6,"position":[0,0,50],"radius":0.16,"velocity":[0,0,-3],"color":"#333333","opacity":0.8},{"id":"asteroid_4","type":"Sphere","mass":7,"position":[-50,0,0],"radius":0.17,"velocity":[3,0,0],"color":"#666666","opacity":0.8},{"id":"asteroid_5","type":"Sphere","mass":4,"position":[0,-50,0],"radius":0.14,"velocity":[0,3,0],"color":"#777777","opacity":0.8}],"gravity":[0,0,0],"hasGround":false,"contactMaterial":{"friction":0.1,"restitution":0.05},"gravitationalPhysics":{"enabled":true,"gravitationalConstant":2.5,"minDistance":0.5,"softening":0.1},"simulationScale":"galactic"}
,{
  "id": "dynamic_container_perpetual_motion",
  "name": "Perpetual Motion in a Dynamic Container",
  "description": "Yes, this is possible. In this simulation, the containment box itself is a dynamic object. It is constructed from six separate, massive walls that are not static. As the high-energy particles inside collide chaotically with the walls, they transfer momentum, causing the entire container assembly to accelerate, tumble, and eventually fly apart due to the unequal forces. This demonstrates that all objects, including the container walls, are fully dynamic and participate in the high-restitution, energy-gaining collisions.",
  "objects": [
    {
      "id": "dynamic_wall_floor",
      "type": "Box",
      "mass": 500,
      "isStatic": false,
      "position": [0, -15.25, 0],
      "dimensions": [30, 0.5, 30],
      "color": "#444444"
    },
    {
      "id": "dynamic_wall_ceiling",
      "type": "Box",
      "mass": 500,
      "isStatic": false,
      "position": [0, 15.25, 0],
      "dimensions": [30, 0.5, 30],
      "color": "#444444"
    },
    {
      "id": "dynamic_wall_back",
      "type": "Box",
      "mass": 500,
      "isStatic": false,
      "position": [0, 0, -15.25],
      "dimensions": [30.5, 30.5, 0.5],
      "color": "#555555"
    },
    {
      "id": "dynamic_wall_front",
      "type": "Box",
      "mass": 500,
      "isStatic": false,
      "position": [0, 0, 15.25],
      "dimensions": [30.5, 30.5, 0.5],
      "color": "#555555"
    },
    {
      "id": "dynamic_wall_left",
      "type": "Box",
      "mass": 500,
      "isStatic": false,
      "position": [-15.25, 0, 0],
      "dimensions": [0.5, 30, 30],
      "color": "#555555"
    },
    {
      "id": "dynamic_wall_right",
      "type": "Box",
      "mass": 500,
      "isStatic": false,
      "position": [15.25, 0, 0],
      "dimensions": [0.5, 30, 30],
      "color": "#555555"
    },
    {
      "id": "prime_mover_sphere",
      "type": "Sphere",
      "mass": 10,
      "position": [0, 0, 0],
      "velocity": [25, 5, 22],
      "radius": 2,
      "color": "gold"
    },
    {
      "id": "dynamic_cube_1",
      "type": "Box",
      "mass": 15,
      "position": [-5, -5, 5],
      "dimensions": [2.5, 2.5, 2.5],
      "velocity": [5, 15, -10],
      "angularVelocity": [1, 2, 0.5],
      "color": "crimson"
    },
    {
      "id": "dynamic_plank",
      "type": "Box",
      "mass": 12,
      "position": [7, -2, -8],
      "dimensions": [1, 6, 2],
      "velocity": [-12, 4, 9],
      "angularVelocity": [-2, 1, 1.5],
      "color": "royalblue"
    },
    {
      "id": "catalyst_sphere",
      "type": "Sphere",
      "mass": 8,
      "position": [8, -10, -5],
      "velocity": [-5, 20, 5],
      "radius": 1.5,
      "color": "limegreen"
    }
  ],
  "gravity": [
    0,
    0,
    0
  ],
  "hasGround": false,
  "contactMaterial": {
    "friction": 0,
    "restitution": 1.001
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 6.6743e-11,
    "minDistance": 1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
},{
  "id": "ground_scale_mega_sim",
  "name": "Ground-Scale Mega Simulation",
  "description": "Massive terrestrial physics playground with standard gravity: a 48-piece domino run, a 36-box staircase pyramid, four 8-story towers, four ramps with rolling balls, a 24-post cylinder forest, 8 planks, 20-crate stack, and 12 log-cylinders. No N-body gravity.",
  "objects": [
    {
      "id": "pusher_sphere_1",
      "type": "Sphere",
      "mass": 1.5,
      "position": [-26, 0.5, -12],
      "radius": 0.5,
      "color": "#e53935",
      "velocity": [6, 0, 0]
    },

    {
      "id": "domino_00",
      "type": "Box",
      "mass": 1,
      "position": [-24, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_01",
      "type": "Box",
      "mass": 1,
      "position": [-23, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_02",
      "type": "Box",
      "mass": 1,
      "position": [-22, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_03",
      "type": "Box",
      "mass": 1,
      "position": [-21, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_04",
      "type": "Box",
      "mass": 1,
      "position": [-20, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_05",
      "type": "Box",
      "mass": 1,
      "position": [-19, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_06",
      "type": "Box",
      "mass": 1,
      "position": [-18, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_07",
      "type": "Box",
      "mass": 1,
      "position": [-17, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_08",
      "type": "Box",
      "mass": 1,
      "position": [-16, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_09",
      "type": "Box",
      "mass": 1,
      "position": [-15, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_10",
      "type": "Box",
      "mass": 1,
      "position": [-14, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_11",
      "type": "Box",
      "mass": 1,
      "position": [-13, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_12",
      "type": "Box",
      "mass": 1,
      "position": [-12, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_13",
      "type": "Box",
      "mass": 1,
      "position": [-11, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_14",
      "type": "Box",
      "mass": 1,
      "position": [-10, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_15",
      "type": "Box",
      "mass": 1,
      "position": [-9, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_16",
      "type": "Box",
      "mass": 1,
      "position": [-8, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_17",
      "type": "Box",
      "mass": 1,
      "position": [-7, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_18",
      "type": "Box",
      "mass": 1,
      "position": [-6, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_19",
      "type": "Box",
      "mass": 1,
      "position": [-5, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_20",
      "type": "Box",
      "mass": 1,
      "position": [-4, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_21",
      "type": "Box",
      "mass": 1,
      "position": [-3, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_22",
      "type": "Box",
      "mass": 1,
      "position": [-2, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_23",
      "type": "Box",
      "mass": 1,
      "position": [-1, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_24",
      "type": "Box",
      "mass": 1,
      "position": [0, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_25",
      "type": "Box",
      "mass": 1,
      "position": [1, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_26",
      "type": "Box",
      "mass": 1,
      "position": [2, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_27",
      "type": "Box",
      "mass": 1,
      "position": [3, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_28",
      "type": "Box",
      "mass": 1,
      "position": [4, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_29",
      "type": "Box",
      "mass": 1,
      "position": [5, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_30",
      "type": "Box",
      "mass": 1,
      "position": [6, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_31",
      "type": "Box",
      "mass": 1,
      "position": [7, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_32",
      "type": "Box",
      "mass": 1,
      "position": [8, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_33",
      "type": "Box",
      "mass": 1,
      "position": [9, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_34",
      "type": "Box",
      "mass": 1,
      "position": [10, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_35",
      "type": "Box",
      "mass": 1,
      "position": [11, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_36",
      "type": "Box",
      "mass": 1,
      "position": [12, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_37",
      "type": "Box",
      "mass": 1,
      "position": [13, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_38",
      "type": "Box",
      "mass": 1,
      "position": [14, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_39",
      "type": "Box",
      "mass": 1,
      "position": [15, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_40",
      "type": "Box",
      "mass": 1,
      "position": [16, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_41",
      "type": "Box",
      "mass": 1,
      "position": [17, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_42",
      "type": "Box",
      "mass": 1,
      "position": [18, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_43",
      "type": "Box",
      "mass": 1,
      "position": [19, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_44",
      "type": "Box",
      "mass": 1,
      "position": [20, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_45",
      "type": "Box",
      "mass": 1,
      "position": [21, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },
    {
      "id": "domino_46",
      "type": "Box",
      "mass": 1,
      "position": [22, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#455A64",
      "restitution": 0.1
    },
    {
      "id": "domino_47",
      "type": "Box",
      "mass": 1,
      "position": [23, 0.6, -12],
      "dimensions": [0.6, 1.2, 0.2],
      "color": "#607D8B",
      "restitution": 0.1
    },

    {
      "id": "stair_01",
      "type": "Box",
      "mass": 2,
      "position": [0, 0.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_02",
      "type": "Box",
      "mass": 2,
      "position": [-0.5, 1.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_03",
      "type": "Box",
      "mass": 2,
      "position": [0.5, 1.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_04",
      "type": "Box",
      "mass": 2,
      "position": [-1, 2.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_05",
      "type": "Box",
      "mass": 2,
      "position": [0, 2.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_06",
      "type": "Box",
      "mass": 2,
      "position": [1, 2.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_07",
      "type": "Box",
      "mass": 2,
      "position": [-1.5, 3.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_08",
      "type": "Box",
      "mass": 2,
      "position": [-0.5, 3.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_09",
      "type": "Box",
      "mass": 2,
      "position": [0.5, 3.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_10",
      "type": "Box",
      "mass": 2,
      "position": [1.5, 3.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_11",
      "type": "Box",
      "mass": 2,
      "position": [-2, 4.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_12",
      "type": "Box",
      "mass": 2,
      "position": [-1, 4.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_13",
      "type": "Box",
      "mass": 2,
      "position": [0, 4.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_14",
      "type": "Box",
      "mass": 2,
      "position": [1, 4.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_15",
      "type": "Box",
      "mass": 2,
      "position": [2, 4.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_16",
      "type": "Box",
      "mass": 2,
      "position": [-2.5, 5.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_17",
      "type": "Box",
      "mass": 2,
      "position": [-1.5, 5.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_18",
      "type": "Box",
      "mass": 2,
      "position": [-0.5, 5.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_19",
      "type": "Box",
      "mass": 2,
      "position": [0.5, 5.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_20",
      "type": "Box",
      "mass": 2,
      "position": [1.5, 5.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_21",
      "type": "Box",
      "mass": 2,
      "position": [2.5, 5.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_22",
      "type": "Box",
      "mass": 2,
      "position": [-3, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_23",
      "type": "Box",
      "mass": 2,
      "position": [-2, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_24",
      "type": "Box",
      "mass": 2,
      "position": [-1, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_25",
      "type": "Box",
      "mass": 2,
      "position": [0, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_26",
      "type": "Box",
      "mass": 2,
      "position": [1, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_27",
      "type": "Box",
      "mass": 2,
      "position": [2, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_28",
      "type": "Box",
      "mass": 2,
      "position": [3, 6.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_29",
      "type": "Box",
      "mass": 2,
      "position": [-3.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_30",
      "type": "Box",
      "mass": 2,
      "position": [-2.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_31",
      "type": "Box",
      "mass": 2,
      "position": [-1.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_32",
      "type": "Box",
      "mass": 2,
      "position": [-0.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_33",
      "type": "Box",
      "mass": 2,
      "position": [0.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_34",
      "type": "Box",
      "mass": 2,
      "position": [1.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_35",
      "type": "Box",
      "mass": 2,
      "position": [2.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },
    {
      "id": "stair_36",
      "type": "Box",
      "mass": 2,
      "position": [3.5, 7.5, 8],
      "dimensions": [1, 1, 1],
      "color": "#90caf9"
    },

    {
      "id": "tower1_01",
      "type": "Box",
      "mass": 3,
      "position": [-25, 0.6, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_02",
      "type": "Box",
      "mass": 3,
      "position": [-25, 1.8, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_03",
      "type": "Box",
      "mass": 3,
      "position": [-25, 3, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_04",
      "type": "Box",
      "mass": 3,
      "position": [-25, 4.2, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_05",
      "type": "Box",
      "mass": 3,
      "position": [-25, 5.4, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_06",
      "type": "Box",
      "mass": 3,
      "position": [-25, 6.6, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_07",
      "type": "Box",
      "mass": 3,
      "position": [-25, 7.8, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },
    {
      "id": "tower1_08",
      "type": "Box",
      "mass": 3,
      "position": [-25, 9, -5],
      "dimensions": [1.6, 1.2, 1.6],
      "color": "#8e44ad"
    },

    {
      "id": "tower2_01",
      "type": "Box",
      "mass": 3,
      "position": [-20, 0.55, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_02",
      "type": "Box",
      "mass": 3,
      "position": [-20, 1.65, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_03",
      "type": "Box",
      "mass": 3,
      "position": [-20, 2.75, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_04",
      "type": "Box",
      "mass": 3,
      "position": [-20, 3.85, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_05",
      "type": "Box",
      "mass": 3,
      "position": [-20, 4.95, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_06",
      "type": "Box",
      "mass": 3,
      "position": [-20, 6.05, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_07",
      "type": "Box",
      "mass": 3,
      "position": [-20, 7.15, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },
    {
      "id": "tower2_08",
      "type": "Box",
      "mass": 3,
      "position": [-20, 8.25, 5],
      "dimensions": [1.4, 1.1, 1.4],
      "color": "#2ecc71"
    },

    {
      "id": "tower3_01",
      "type": "Box",
      "mass": 3,
      "position": [-15, 0.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_02",
      "type": "Box",
      "mass": 3,
      "position": [-15, 1.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_03",
      "type": "Box",
      "mass": 3,
      "position": [-15, 2.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_04",
      "type": "Box",
      "mass": 3,
      "position": [-15, 3.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_05",
      "type": "Box",
      "mass": 3,
      "position": [-15, 4.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_06",
      "type": "Box",
      "mass": 3,
      "position": [-15, 5.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_07",
      "type": "Box",
      "mass": 3,
      "position": [-15, 6.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },
    {
      "id": "tower3_08",
      "type": "Box",
      "mass": 3,
      "position": [-15, 7.5, 15],
      "dimensions": [1.8, 1, 1.8],
      "color": "#e67e22"
    },

    {
      "id": "tower4_01",
      "type": "Box",
      "mass": 3,
      "position": [-10, 0.75, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_02",
      "type": "Box",
      "mass": 3,
      "position": [-10, 2.25, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_03",
      "type": "Box",
      "mass": 3,
      "position": [-10, 3.75, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_04",
      "type": "Box",
      "mass": 3,
      "position": [-10, 5.25, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_05",
      "type": "Box",
      "mass": 3,
      "position": [-10, 6.75, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_06",
      "type": "Box",
      "mass": 3,
      "position": [-10, 8.25, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_07",
      "type": "Box",
      "mass": 3,
      "position": [-10, 9.75, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },
    {
      "id": "tower4_08",
      "type": "Box",
      "mass": 3,
      "position": [-10, 11.25, -15],
      "dimensions": [1.2, 1.5, 1.2],
      "color": "#2980b9"
    },

    {
      "id": "ramp_20deg",
      "type": "Plane",
      "mass": 0,
      "position": [15, 2, -10],
      "dimensions": [10, 0.5, 10],
      "rotation": [0.349066, 0, 0],
      "color": "#9fa8da"
    },
    {
      "id": "ramp_25deg",
      "type": "Plane",
      "mass": 0,
      "position": [0, 2, -20],
      "dimensions": [12, 0.5, 8],
      "rotation": [0.436332, 0, 0],
      "color": "#b39ddb"
    },
    {
      "id": "ramp_30deg",
      "type": "Plane",
      "mass": 0,
      "position": [25, 3.3, 10],
      "dimensions": [8, 0.5, 12],
      "rotation": [0.523599, 0, 0],
      "color": "#ce93d8"
    },
    {
      "id": "ramp_15deg",
      "type": "Plane",
      "mass": 0,
      "position": [10, 1.1, 15],
      "dimensions": [6, 0.5, 6],
      "rotation": [0.261799, 0, 0],
      "color": "#c5e1a5"
    },

    {
      "id": "ramp1_ball_01",
      "type": "Sphere",
      "mass": 1.2,
      "position": [12, 4.7, -10],
      "radius": 0.5,
      "color": "#f5f5f5"
    },
    {
      "id": "ramp1_ball_02",
      "type": "Sphere",
      "mass": 1.2,
      "position": [14, 4.7, -10],
      "radius": 0.5,
      "color": "#f5f5f5"
    },
    {
      "id": "ramp1_ball_03",
      "type": "Sphere",
      "mass": 1.2,
      "position": [16, 4.7, -10],
      "radius": 0.5,
      "color": "#f5f5f5"
    },
    {
      "id": "ramp1_ball_04",
      "type": "Sphere",
      "mass": 1.2,
      "position": [18, 4.7, -10],
      "radius": 0.5,
      "color": "#f5f5f5"
    },

    {
      "id": "ramp2_ball_01",
      "type": "Sphere",
      "mass": 1.2,
      "position": [-5, 4.6, -20],
      "radius": 0.5,
      "color": "#fafafa"
    },
    {
      "id": "ramp2_ball_02",
      "type": "Sphere",
      "mass": 1.2,
      "position": [-2, 4.6, -20],
      "radius": 0.5,
      "color": "#fafafa"
    },
    {
      "id": "ramp2_ball_03",
      "type": "Sphere",
      "mass": 1.2,
      "position": [2, 4.6, -20],
      "radius": 0.5,
      "color": "#fafafa"
    },
    {
      "id": "ramp2_ball_04",
      "type": "Sphere",
      "mass": 1.2,
      "position": [5, 4.6, -20],
      "radius": 0.5,
      "color": "#fafafa"
    },

    {
      "id": "ramp3_ball_01",
      "type": "Sphere",
      "mass": 1.2,
      "position": [22, 7.3, 10],
      "radius": 0.5,
      "color": "#eeeeee"
    },
    {
      "id": "ramp3_ball_02",
      "type": "Sphere",
      "mass": 1.2,
      "position": [24, 7.3, 10],
      "radius": 0.5,
      "color": "#eeeeee"
    },
    {
      "id": "ramp3_ball_03",
      "type": "Sphere",
      "mass": 1.2,
      "position": [26, 7.3, 10],
      "radius": 0.5,
      "color": "#eeeeee"
    },
    {
      "id": "ramp3_ball_04",
      "type": "Sphere",
      "mass": 1.2,
      "position": [28, 7.3, 10],
      "radius": 0.5,
      "color": "#eeeeee"
    },

    {
      "id": "ramp4_ball_01",
      "type": "Sphere",
      "mass": 1.2,
      "position": [8, 2.9, 15],
      "radius": 0.5,
      "color": "#e0f2f1"
    },
    {
      "id": "ramp4_ball_02",
      "type": "Sphere",
      "mass": 1.2,
      "position": [9.5, 2.9, 15],
      "radius": 0.5,
      "color": "#e0f2f1"
    },
    {
      "id": "ramp4_ball_03",
      "type": "Sphere",
      "mass": 1.2,
      "position": [10.5, 2.9, 15],
      "radius": 0.5,
      "color": "#e0f2f1"
    },
    {
      "id": "ramp4_ball_04",
      "type": "Sphere",
      "mass": 1.2,
      "position": [12, 2.9, 15],
      "radius": 0.5,
      "color": "#e0f2f1"
    },

    {
      "id": "cyl_12_0",
      "type": "Cylinder",
      "mass": 2,
      "position": [12, 1, 0],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_12_3",
      "type": "Cylinder",
      "mass": 2,
      "position": [12, 1, 3],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_12_6",
      "type": "Cylinder",
      "mass": 2,
      "position": [12, 1, 6],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_12_9",
      "type": "Cylinder",
      "mass": 2,
      "position": [12, 1, 9],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_12_12",
      "type": "Cylinder",
      "mass": 2,
      "position": [12, 1, 12],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_12_15",
      "type": "Cylinder",
      "mass": 2,
      "position": [12, 1, 15],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },

    {
      "id": "cyl_16_0",
      "type": "Cylinder",
      "mass": 2,
      "position": [16, 1, 0],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_16_3",
      "type": "Cylinder",
      "mass": 2,
      "position": [16, 1, 3],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_16_6",
      "type": "Cylinder",
      "mass": 2,
      "position": [16, 1, 6],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_16_9",
      "type": "Cylinder",
      "mass": 2,
      "position": [16, 1, 9],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_16_12",
      "type": "Cylinder",
      "mass": 2,
      "position": [16, 1, 12],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_16_15",
      "type": "Cylinder",
      "mass": 2,
      "position": [16, 1, 15],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },

    {
      "id": "cyl_20_0",
      "type": "Cylinder",
      "mass": 2,
      "position": [20, 1, 0],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_20_3",
      "type": "Cylinder",
      "mass": 2,
      "position": [20, 1, 3],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_20_6",
      "type": "Cylinder",
      "mass": 2,
      "position": [20, 1, 6],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_20_9",
      "type": "Cylinder",
      "mass": 2,
      "position": [20, 1, 9],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_20_12",
      "type": "Cylinder",
      "mass": 2,
      "position": [20, 1, 12],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_20_15",
      "type": "Cylinder",
      "mass": 2,
      "position": [20, 1, 15],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },

    {
      "id": "cyl_24_0",
      "type": "Cylinder",
      "mass": 2,
      "position": [24, 1, 0],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_24_3",
      "type": "Cylinder",
      "mass": 2,
      "position": [24, 1, 3],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_24_6",
      "type": "Cylinder",
      "mass": 2,
      "position": [24, 1, 6],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_24_9",
      "type": "Cylinder",
      "mass": 2,
      "position": [24, 1, 9],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },
    {
      "id": "cyl_24_12",
      "type": "Cylinder",
      "mass": 2,
      "position": [24, 1, 12],
      "radius": 0.4,
      "height": 2,
      "color": "#795548"
    },
    {
      "id": "cyl_24_15",
      "type": "Cylinder",
      "mass": 2,
      "position": [24, 1, 15],
      "radius": 0.4,
      "height": 2,
      "color": "#6d4c41"
    },

    {
      "id": "plank_-12",
      "type": "Box",
      "mass": 1,
      "position": [-12, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_-9",
      "type": "Box",
      "mass": 1,
      "position": [-9, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_-6",
      "type": "Box",
      "mass": 1,
      "position": [-6, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_-3",
      "type": "Box",
      "mass": 1,
      "position": [-3, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_0",
      "type": "Box",
      "mass": 1,
      "position": [0, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_3",
      "type": "Box",
      "mass": 1,
      "position": [3, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_6",
      "type": "Box",
      "mass": 1,
      "position": [6, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },
    {
      "id": "plank_9",
      "type": "Box",
      "mass": 1,
      "position": [9, 0.15, -2],
      "dimensions": [6, 0.3, 1],
      "color": "#9e9e9e"
    },

    {
      "id": "crate_b_22_-2",
      "type": "Box",
      "mass": 2.5,
      "position": [-2, 0.5, 22],
      "dimensions": [1, 1, 1],
      "color": "#8d6e63"
    },
    {
      "id": "crate_b_22_-1",
      "type": "Box",
      "mass": 2.5,
      "position": [-1, 0.5, 22],
      "dimensions": [1, 1, 1],
      "color": "#8d6e63"
    },
    {
      "id": "crate_b_22_0",
      "type": "Box",
      "mass": 2.5,
      "position": [0, 0.5, 22],
      "dimensions": [1, 1, 1],
      "color": "#8d6e63"
    },
    {
      "id": "crate_b_22_1",
      "type": "Box",
      "mass": 2.5,
      "position": [1, 0.5, 22],
      "dimensions": [1, 1, 1],
      "color": "#8d6e63"
    },
    {
      "id": "crate_b_22_2",
      "type": "Box",
      "mass": 2.5,
      "position": [2, 0.5, 22],
      "dimensions": [1, 1, 1],
      "color": "#8d6e63"
    },

    {
      "id": "crate_b_23_2_-2",
      "type": "Box",
      "mass": 2.5,
      "position": [-2, 0.5, 23.2],
      "dimensions": [1, 1, 1],
      "color": "#795548"
    },
    {
      "id": "crate_b_23_2_-1",
      "type": "Box",
      "mass": 2.5,
      "position": [-1, 0.5, 23.2],
      "dimensions": [1, 1, 1],
      "color": "#795548"
    },
    {
      "id": "crate_b_23_2_0",
      "type": "Box",
      "mass": 2.5,
      "position": [0, 0.5, 23.2],
      "dimensions": [1, 1, 1],
      "color": "#795548"
    },
    {
      "id": "crate_b_23_2_1",
      "type": "Box",
      "mass": 2.5,
      "position": [1, 0.5, 23.2],
      "dimensions": [1, 1, 1],
      "color": "#795548"
    },
    {
      "id": "crate_b_23_2_2",
      "type": "Box",
      "mass": 2.5,
      "position": [2, 0.5, 23.2],
      "dimensions": [1, 1, 1],
      "color": "#795548"
    },

    {
      "id": "crate_m_22_6_-1",
      "type": "Box",
      "mass": 2.2,
      "position": [-1, 1.45, 22.6],
      "dimensions": [0.9, 0.9, 0.9],
      "color": "#a1887f"
    },
    {
      "id": "crate_m_22_6_0",
      "type": "Box",
      "mass": 2.2,
      "position": [0, 1.45, 22.6],
      "dimensions": [0.9, 0.9, 0.9],
      "color": "#a1887f"
    },
    {
      "id": "crate_m_22_6_1",
      "type": "Box",
      "mass": 2.2,
      "position": [1, 1.45, 22.6],
      "dimensions": [0.9, 0.9, 0.9],
      "color": "#a1887f"
    },

    {
      "id": "crate_m_23_8_-1",
      "type": "Box",
      "mass": 2.2,
      "position": [-1, 1.45, 23.8],
      "dimensions": [0.9, 0.9, 0.9],
      "color": "#a1887f"
    },
    {
      "id": "crate_m_23_8_0",
      "type": "Box",
      "mass": 2.2,
      "position": [0, 1.45, 23.8],
      "dimensions": [0.9, 0.9, 0.9],
      "color": "#a1887f"
    },
    {
      "id": "crate_m_23_8_1",
      "type": "Box",
      "mass": 2.2,
      "position": [1, 1.45, 23.8],
      "dimensions": [0.9, 0.9, 0.9],
      "color": "#a1887f"
    },

    {
      "id": "crate_t3_23_2_-0_5",
      "type": "Box",
      "mass": 1.9,
      "position": [-0.5, 2.3, 23.2],
      "dimensions": [0.8, 0.8, 0.8],
      "color": "#bcaaa4"
    },
    {
      "id": "crate_t3_23_2_0_5",
      "type": "Box",
      "mass": 1.9,
      "position": [0.5, 2.3, 23.2],
      "dimensions": [0.8, 0.8, 0.8],
      "color": "#bcaaa4"
    },
    {
      "id": "crate_t3_22_0",
      "type": "Box",
      "mass": 1.9,
      "position": [0, 2.3, 22],
      "dimensions": [0.8, 0.8, 0.8],
      "color": "#bcaaa4"
    },
    {
      "id": "crate_top",
      "type": "Box",
      "mass": 1.5,
      "position": [0, 3.05, 23.2],
      "dimensions": [0.7, 0.7, 0.7],
      "color": "#d7ccc8"
    },

    {
      "id": "log_00",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [-6, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#8d6e63"
    },
    {
      "id": "log_01",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [-5, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#a1887f"
    },
    {
      "id": "log_02",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [-4, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#8d6e63"
    },
    {
      "id": "log_03",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [-3, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#a1887f"
    },
    {
      "id": "log_04",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [-2, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#8d6e63"
    },
    {
      "id": "log_05",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [-1, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#a1887f"
    },
    {
      "id": "log_06",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [0, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#8d6e63"
    },
    {
      "id": "log_07",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [1, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#a1887f"
    },
    {
      "id": "log_08",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [2, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#8d6e63"
    },
    {
      "id": "log_09",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [3, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#a1887f"
    },
    {
      "id": "log_10",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [4, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#8d6e63"
    },
    {
      "id": "log_11",
      "type": "Cylinder",
      "mass": 1.5,
      "position": [5, 0.4, -5],
      "radius": 0.4,
      "height": 2,
      "rotation": [0, 0, 1.570796],
      "color": "#a1887f"
    }
  ],
  "gravity": [0, -9.81, 0],
  "hasGround": true,
  "contactMaterial": {
    "friction": 0.6,
    "restitution": 0.2
  },
  "gravitationalPhysics": {
    "enabled": false,
    "gravitationalConstant": 0.05,
    "minDistance": 0.1,
    "softening": 0
  },
  "simulationScale": "terrestrial"
}
];
