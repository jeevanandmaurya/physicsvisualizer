import { Message } from '../../../ui-logic/chat/Conversation';

export const demoMessages: Message[] = [
  {
    id: 1,
    text: "Show me a pendulum simulation",
    isUser: true,
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 2,
    text: "I've created a pendulum energy conservation simulation for you! You can see how potential energy converts to kinetic energy as it swings.",
    isUser: false,
    timestamp: new Date(Date.now() - 295000),
    sceneMetadata: {
      hasSceneGeneration: true,
      sceneId: 'pendulum_energy_v1.0',
      sceneAction: 'create',
      sceneSummary: {
        name: 'Pendulum Energy Conservation',
        objectCount: 5,
        objectTypes: ['sphere', 'rope', 'anchor']
      }
    }
  },
  {
    id: 3,
    text: "Can you show me a binary star system?",
    isUser: true,
    timestamp: new Date(Date.now() - 240000)
  },
  {
    id: 4,
    text: "Here's a binary star system where two stars orbit their common center of mass. Watch how they dance around each other!",
    isUser: false,
    timestamp: new Date(Date.now() - 235000),
    sceneMetadata: {
      hasSceneGeneration: true,
      sceneId: 'binary_star_v1.0',
      sceneAction: 'create',
      sceneSummary: {
        name: 'Binary Star System',
        objectCount: 2,
        objectTypes: ['star', 'star']
      }
    }
  },
  {
    id: 5,
    text: "Show me projectile motion",
    isUser: true,
    timestamp: new Date(Date.now() - 180000)
  },
  {
    id: 6,
    text: "I've created a projectile motion demonstration. You can see the parabolic trajectory and how gravity affects the motion.",
    isUser: false,
    timestamp: new Date(Date.now() - 175000),
    sceneMetadata: {
      hasSceneGeneration: true,
      sceneId: 'projectile_motion_v1.0',
      sceneAction: 'create',
      sceneSummary: {
        name: 'Projectile Motion',
        objectCount: 3,
        objectTypes: ['sphere', 'ground', 'trajectory']
      }
    }
  },
  {
    id: 7,
    text: "Create a wave pattern animation",
    isUser: true,
    timestamp: new Date(Date.now() - 120000)
  },
  {
    id: 8,
    text: "Here's an interactive wave pattern showing interference and superposition!",
    isUser: false,
    timestamp: new Date(Date.now() - 115000),
    sceneMetadata: {
      hasSceneGeneration: true,
      sceneId: 'wave_pattern_v1.0',
      sceneAction: 'create',
      sceneSummary: {
        name: 'Wave Interference Pattern',
        objectCount: 100,
        objectTypes: ['wave', 'particle']
      }
    }
  },
  {
    id: 9,
    text: "Show me an image example",
    isUser: true,
    timestamp: new Date(Date.now() - 60000)
  },
  {
    id: 10,
    text: "Here's a sample diagram:",
    isUser: false,
    timestamp: new Date(Date.now() - 55000),
    mediaContent: {
      type: 'image',
      src: 'https://picsum.photos/800/600',
      title: 'Physics Diagram',
      description: 'Sample illustration',
      metadata: {
        dimensions: { width: 800, height: 600 },
        fileSize: '125 KB'
      }
    }
  },
  {
    id: 11,
    text: "Show me a video tutorial",
    isUser: true,
    timestamp: new Date(Date.now() - 30000)
  },
  {
    id: 12,
    text: "Here's an educational video explaining the concepts:",
    isUser: false,
    timestamp: new Date(Date.now() - 25000),
    mediaContent: {
      type: 'video',
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      title: 'Physics Tutorial',
      description: 'Concepts explained',
      thumbnail: 'https://picsum.photos/400/225',
      metadata: {
        duration: 10,
        fileSize: '1.5 MB'
      }
    }
  }
];

export default demoMessages;
