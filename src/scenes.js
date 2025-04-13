import { rotate } from "three/tsl";

export const mechanicsExamples = [
  {
    id: "all-shapes-scene",
    name: "All Shapes Scene",
    description: "A scene with all supported physics shapes interacting dynamically.",
    objects: [
      {
        id: "sphere-1",
        type: "Sphere",
        mass: 1,
        radius: 0.5,
        position: [0, 4, 0],
        velocity: [0, 0, 0],
        color: "#ff6347",
        restitution: 0.7,
        friction: 0.4, // Optional, remove if unsupported
      },
      {
        id: "box-1",
        type: "Box",
        mass: 1.5,
        dimensions: [1, 1, 1],
        position: [2, 4, 0],
        velocity: [0, 0, 0],
        color: "#32cd32",
        restitution: 0.8,
        friction: 0.5,
      },
      {
        id: "cylinder-1",
        type: "Cylinder",
        mass: 2,
        radius: 0.5,
        height: 1.5,
        position: [-2, 4, 0],
        velocity: [0, 0, 0],
        color: "#4682b4",
        restitution: 0.6,
        friction: 0.3,
      },
      {
        id: "ground",
        type: "Box",
        mass: 0, // Static
        dimensions: [20, 0.1, 20],
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "white",
        restitution: 0.8,
        friction: 0.6,
      },
    ],
    gravity: [0, -9.81, 0],
  },
  {
    id: "projectile-motion",
    name: "Projectile Motion",
    description: "A sphere launched to show parabolic trajectory under gravity.",
    objects: [
      {
        id: "projectile-sphere",
        type: "Sphere",
        mass: 1,
        radius: 0.3,
        position: [-5, 1, 0],
        velocity: [6, 4, 0], // ~33-degree angle
        color: "#ff4500",
        restitution: 0.9,
        friction: 0.4,
      },
      {
        id: "ground",
        type: "Box",
        mass: 0,
        dimensions: [20, 0.1, 20],
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "white",
        restitution: 0.8,
        friction: 0.6,
      },
    ],
    gravity: [0, -9.81, 0],
  },
  {
    id: "collision-demo",
    name: "Elastic Collision",
    description: "Two spheres colliding to demonstrate momentum conservation.",
    objects: [
      {
        id: "sphere-left",
        type: "Sphere",
        mass: 1,
        radius: 0.5,
        position: [-4, 3, 0],
        velocity: [3, 0, 0],
        color: "#1e90ff",
        restitution: 0.95,
        friction: 0.3,
      },
      {
        id: "sphere-right",
        type: "Sphere",
        mass: 1,
        radius: 0.5,
        position: [4, 3, 0],
        velocity: [-3, 0, 0],
        color: "#ff69b4",
        restitution: 0.95,
        friction: 0.3,
      },
      {
        id: "ground",
        type: "Box",
        mass: 0,
        dimensions: [20, 0.1, 20],
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "white",
        restitution: 0.8,
        friction: 0.6,
      },
    ],
    gravity: [0, -9.81, 0],
  },
  {
    id: "inclined-plane",
    name: "Inclined Plane",
    description: "A box sliding down a ramp to illustrate gravity and friction.",
    objects: [
      {
        id: "sliding-box",
        type: "Box",
        mass: 1,
        dimensions: [0.5, 0.5, 0.5],
        position: [6, 6, -2],
        velocity: [0, 0, 0],
        color: "#ff69b4",
        restitution: 0.5,
        friction: 0.4,
      },
      {
        id: "sliding-ball",
        type: "Sphere",
        mass: 1,
        radius: 0.5,
        position: [6, 6, 2],
        velocity: [0, 0, 0],
        color: "yellow",
        restitution: 0.5,
        friction: 0.4,
      },
      {
        id: "ramp",
        type: "Box",
        mass: 0,
        dimensions: [20, 0.2, 10],
        position: [0, 0.5, 0],
        rotation: [0, 0, Math.PI / 6], // 30 degrees
        velocity: [0, 0, 0],
        color: "#228b22",
        restitution: 0.7,
        friction: 0.5,
      },
      {
        id: "ground",
        type: "Box",
        mass: 0,
        dimensions: [20, 0.1, 20],
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "white",
        restitution: 0.8,
        friction: 0.6,
      },
    ],
    gravity: [0, -9.81, 0],
  },
  {
    id: "narrow-walls-collision",
    name: "Narrow Walls ",
    description: "A ball bouncing between two vertical walls that move closer together.",
    objects: [
      {
        id: "ball",
        type: "Sphere",
        mass: 1,
        radius: 0.3,
        position: [0, 10, 0],
        velocity: [20, 0, 0], // Directed right
        color: "#ffd700",
        restitution: 0.95,
        friction: 0.2,
      },
      {
        id: "left-wall",
        type: "Box",
        mass: 0, // Static (moved in Visualizer)
        dimensions: [0.2, 20, 2],
        position: [-3, 5, 0],
        velocity: [0, 0, 0],
        rotation: [0,0,0.1],
        color: "#4682b4",
        restitution: 0.95,
        friction: 0.2,
      },
      {
        id: "right-wall",
        type: "Box",
        mass: 0,
        dimensions: [0.2, 20, 2],
        position: [3,5, 0],
        velocity: [0, 0, 0],
        rotation: [0,0,-0.1],
        color: "#4682b4",
        restitution: 0.95,
        friction: 0.2,
      },
      {
        id: "ground",
        type: "Box",
        mass: 0,
        dimensions: [20, 0.1, 20],
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "white",
        restitution: 0.8,
        friction: 0.6,
      },
    ],
    gravity: [0, -9.81, 0],
  },
  {
    id: "stacking-demo",
    name: "Stacking Demo",
    description: "Boxes stacked to test stability and gravity in a pile.",
    objects: [
      {
        id: "box-1",
        type: "Box",
        mass: 1,
        dimensions: [1, 1, 1],
        position: [0, 1, 0],
        velocity: [0, 0, 0],
        color: "#ffa500",
        restitution: 0.6,
        friction: 0.5,
      },
      {
        id: "box-2",
        type: "Box",
        mass: 1,
        dimensions: [2, 1, 2],
        position: [0, 4, 0],
        velocity: [0, 0, 0],
        color: "#ffa500",
        restitution: 0.6,
        friction: 0.5,
      },
      {
        id: "box-3",
        type: "Box",
        mass: 1,
        dimensions: [3, 1, 3],
        position: [0, 6, 0],
        velocity: [0, 0, 0],
        color: "#ffa500",
        restitution: 0.6,
        friction: 0.5,
      },
      {
        id: "ground",
        type: "Box",
        mass: 0,
        dimensions: [20, 0.1, 20],
        position: [0, 0, 0],
        velocity: [0, 0, 0],
        color: "white",
        restitution: 0.8,
        friction: 0.6,
      },
    ],
    gravity: [0, -9.81, 0],
  },
];