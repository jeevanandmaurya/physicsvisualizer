/**
 * Example Scenes Loader
 * Loads predefined example scenes with their context.txt as chat history
 */

export interface ExampleScene {
  id: string;
  name: string;
  sceneId: string;
  scenePath: string;
  contextPath: string;
  category: string;
  description?: string;
  thumbnail?: string;
}

export interface ExampleSceneData {
  scene: ExampleScene;
  sceneData: any;
  chatHistory: string;
  messages: any[];
}

/**
 * List of all available example scenes
 */
export const EXAMPLE_SCENES: ExampleScene[] = [
  {
    id: 'projectile-motion',
    name: 'Projectile Motion',
    sceneId: 'projectile_motion_v1.0',
    scenePath: '/scenes/projectile_motion/projectile_motion_v1.0.json',
    contextPath: '/scenes/projectile_motion/context.txt',
    category: 'Classical Mechanics',
    description: 'Parabolic trajectory of launched objects'
  },
  {
    id: 'pendulum-energy',
    name: 'Pendulum Energy',
    sceneId: 'pendulum_energy_v1.0',
    scenePath: '/scenes/pendulum_energy/pendulum_energy_v1.0.json',
    contextPath: '/scenes/pendulum_energy/context.txt',
    category: 'Classical Mechanics',
    description: 'Energy conservation in pendulum motion'
  },
  {
    id: 'momentum-conservation',
    name: 'Momentum Conservation',
    sceneId: 'momentum_conservation_v1.0',
    scenePath: '/scenes/momentum_conservation/momentum_conservation_v1.0.json',
    contextPath: '/scenes/momentum_conservation/context.txt',
    category: 'Classical Mechanics',
    description: 'Elastic and inelastic collisions'
  },
  {
    id: 'laws-motion-collision',
    name: 'Laws of Motion',
    sceneId: 'laws_motion_collision_v1.0',
    scenePath: '/scenes/laws_motion_collision/laws_motion_collision_v1.0.json',
    contextPath: '/scenes/laws_motion_collision/context.txt',
    category: 'Classical Mechanics',
    description: 'Newton\'s laws demonstration'
  },
  {
    id: 'annotation-demo',
    name: 'Visual Annotations',
    sceneId: 'annotation_demo_v1.0',
    scenePath: '/scenes/annotation_demo/annotation_demo_v1.0.json',
    contextPath: '/scenes/annotation_demo/context.txt',
    category: 'Features',
    description: 'Visual annotation system demo'
  },
  {
    id: 'tool-demo-spiral',
    name: 'AI Tool Demo',
    sceneId: 'tool_demo_spiral_v1.0',
    scenePath: '/scenes/tool_demo_spiral/tool_demo_spiral_v1.0.json',
    contextPath: '/scenes/tool_demo_spiral/context.txt',
    category: 'Features',
    description: 'AI scene generation capabilities'
  }
];

/**
 * Convert context.txt content to chat messages
 */
function parseContextToMessages(context: string): any[] {
  const messages: any[] = [];
  
  // Split by common section headers
  const sections = context.split(/\n(?=Theory:|Explanation:|Facts:|Key Equations:|Features Shown:|Objects:|What to Observe:)/);
  
  let messageId = 1;
  
  // Create system message with full context
  messages.push({
    id: `example-msg-${messageId++}`,
    content: context,
    isUser: false,
    timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    role: 'assistant'
  });
  
  return messages;
}

/**
 * Load a specific example scene with its data and chat history
 */
export async function loadExampleScene(sceneId: string): Promise<ExampleSceneData | null> {
  const scene = EXAMPLE_SCENES.find(s => s.id === sceneId || s.sceneId === sceneId);
  if (!scene) {
    console.error(`Example scene not found: ${sceneId}`);
    return null;
  }

  try {
    // Load scene JSON
    const sceneResponse = await fetch(scene.scenePath);
    if (!sceneResponse.ok) {
      throw new Error(`Failed to load scene: ${scene.scenePath}`);
    }
    const sceneData = await sceneResponse.json();

    // Load context.txt
    let chatHistory = '';
    let messages: any[] = [];
    try {
      const contextResponse = await fetch(scene.contextPath);
      if (contextResponse.ok) {
        chatHistory = await contextResponse.text();
        messages = parseContextToMessages(chatHistory);
      }
    } catch (err) {
      console.warn(`Context file not found for ${scene.id}, using empty history`);
    }

    return {
      scene,
      sceneData,
      chatHistory,
      messages
    };
  } catch (error) {
    console.error(`Error loading example scene ${sceneId}:`, error);
    return null;
  }
}

/**
 * Load all example scenes (metadata only, not full data)
 */
export async function loadAllExampleScenes(): Promise<ExampleScene[]> {
  return EXAMPLE_SCENES;
}

/**
 * Get example scenes grouped by category
 */
export function getExampleScenesByCategory(): Record<string, ExampleScene[]> {
  const grouped: Record<string, ExampleScene[]> = {};
  
  EXAMPLE_SCENES.forEach(scene => {
    if (!grouped[scene.category]) {
      grouped[scene.category] = [];
    }
    grouped[scene.category].push(scene);
  });
  
  return grouped;
}
