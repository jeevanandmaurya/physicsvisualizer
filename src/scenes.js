// src/data/scenes.js

// Define and export the array of scene configurations
export const mechanicsExamples = [
    {
      id: "projectile_motion",
      name: "Projectile Motion",
      description: "A ball launched with initial velocity.",
      objects: [
        {
          id: "proj-ball",
          type: "Sphere",
          mass: 2.0,
          radius: 0.5,
          position: [0, 0.3, 0], // Start near ground
          velocity: [5, 7, 0], // Give it upward and forward velocity
          color: "#ff6347", // Tomato color
          restitution: 0.6,
        }
      ],
      gravity: [0, -9.81, 0]
    },
    {
      id: "collision_v",
      name: "Vertical Collision",
      description: "Two spheres dropped vertically, colliding.",
      objects: [
        {
          id: "coll-sphere1-v",
          type: "Sphere",
          mass: 1.5, // Slightly heavier
          radius: 0.5,
          position: [0, 10, 0],
          velocity: [0, 0, 0],
          color: "#6a5acd", // SlateBlue
          restitution: 0.8,
        },
        {
          id: "coll-sphere2-v",
          type: "Sphere",
          mass: 1.0,
          radius: 0.5,
          position: [0, 5, 0], // Start lower sphere higher up
          velocity: [0, 0, 0],
          color: "#00ced1", // DarkTurquoise
          restitution: 0.8,
        }
      ],
      gravity: [0, -9.81, 0]
    },
      {
      id: "collision_h",
      name: "Horizontal Collision",
      description: "Two spheres collide horizontally on a plane.",
      objects: [
        {
          id: "coll-sphere1-h",
          type: "Sphere",
          mass: 1.0,
          radius: 0.5,
          position: [-5, 0.5, 0], // Start left, just above ground
          velocity: [5, 0, 0], // Moving right
          color: "#ff4500", // OrangeRed
          restitution: 0.9,
        },
        {
          id: "coll-sphere2-h",
          type: "Sphere",
          mass: 2.0, // Heavier
          radius: 0.5,
          position: [5, 0.5, 0], // Start right
          velocity: [-3, 0, 0], // Moving left
          color: "#20b2aa", // LightSeaGreen
          restitution: 0.9,
        }
      ],
      gravity: [0, -9.81, 0] // Gravity still applies, they'll bounce slightly
    },
     {
      id: "stacking",
      name: "Stacking",
      description: "Multiple spheres dropped onto each other.",
      objects: [
        { id: "stack-1", type: "Sphere", mass: 1, radius: 0.5, position: [0, 10, 0], velocity: [0,0,0], color: "#ff00ff", restitution: 0.1 },
        { id: "stack-2", type: "Sphere", mass: 1, radius: 0.5, position: [0.1, 8, 0], velocity: [0,0,0], color: "#00ff00", restitution: 0.1 },
        { id: "stack-3", type: "Sphere", mass: 1, radius: 0.5, position: [-0.1, 6, 0], velocity: [0,0,0], color: "#0000ff", restitution: 0.1 },
         { id: "stack-4", type: "Sphere", mass: 1, radius: 0.5, position: [0, 4, 0], velocity: [0,0,0], color: "#ffff00", restitution: 0.1 }
      ],
      gravity: [0, -9.81, 0]
    },
    // NOTE: Add pendulum example back ONLY if you implement constraints/joints
    // {
    //   id: "simple_pendulum",
    //   name: "Simple Pendulum (Needs Constraints)",
    //   description: "Physics needs constraints for pendulum behavior.",
    //   objects: [ ... ],
    //   gravity: [0, -9.81, 0]
    // },
  ];
  
  // You could add more exports here if needed, like default settings, etc.