export const scenes = {
  projectileMotion: {
    name: "Projectile Motion",
    objects: [
      {
        type: "sphere",
        mass: 1,
        radius: 0.5,
        position: [0, 1.5, 0],
        velocity: [8, 0, 0],
        color: "red"
      }
    ],
    gravity: [0, -9.81, 0],
    duration: 10
  },
  horizontalMotion: {
    name: "Horizontal Motion",
    objects: [
      {
        type: "sphere",
        mass: 1,
        radius: 0.5,
        position: [-5, 0.5, 0],
        velocity: [5, 0, 0],
        color: "blue"
      }
    ],
    gravity: [0, -9.81, 0],
    duration: 10
  },
  freefall: {
    name: "Free Fall",
    objects: [
      {
        type: "sphere",
        mass: 1,
        radius: 0.5,
        position: [0, 10, 0],
        velocity: [0, 0, 0],
        color: "green"
      }
    ],
    gravity: [0, -9.81, 0],
    duration: 5
  },
  bounce: {
    name: "Bouncing Ball",
    objects: [
      {
        type: "sphere",
        mass: 1,
        radius: 0.5,
        position: [0, 5, 0],
        velocity: [2, 0, 0],
        color: "orange",
        restitution: 0.8
      }
    ],
    gravity: [0, -9.81, 0],
    duration: 10
  }
};