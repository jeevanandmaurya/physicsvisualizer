export const mechanicsExamples = [
  {
    id: "all-shapes-scene",
    name: "All Shapes Scene",
    description: "A scene with all supported physics shapes.",
    objects: [
      {
        id: "sphere-1",
        type: "Sphere",
        mass: 1,
        radius: 0.5,
        position: [0, 5, 0],
        velocity: [0, 0, 0],
        color: "#ff6347",
        restitution: 0.7,
      },
      {
        id: "box-1",
        type: "Box",
        mass: 1.5,
        dimensions: [1, 1, 1],
        position: [2, 5, 0],
        velocity: [0, 0, 0],
        color: "#32cd32",
        restitution: 0.8,
      },
      {
        id: "cylinder-1",
        type: "Cylinder",
        mass: 2,
        radius: 0.5,
        height: 1.5,
        position: [-2, 5, 0],
        velocity: [0, 0, 0],
        color: "#4682b4",
        restitution: 0.6,
      }
    ],
    gravity: [0, -9.81, 0],
  },
];