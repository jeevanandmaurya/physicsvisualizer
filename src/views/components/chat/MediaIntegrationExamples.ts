/**
 * Example: Integrating MediaPreview with AI Conversations
 * 
 * This file shows how to automatically add media previews to AI responses
 * based on scene generation or detected media URLs.
 */

import { Message } from '../../../ui-logic/chat/Conversation';
import { 
  processAIResponseMedia, 
  detectMediaInMessage,
  createSimulationMedia 
} from './MediaDetector';

/**
 * Example 1: Process AI response with scene generation
 */
export function exampleSceneGenerationResponse() {
  // Simulated AI response that created a scene
  const aiResponse = {
    message: "I've created a pendulum simulation showing energy conservation!",
    sceneGenerated: true,
    sceneId: 'pendulum_energy_v1.0',
    sceneName: 'Pendulum Energy Conservation',
    objectCount: 5
  };

  // Create the message with media
  const message: Message = {
    id: Date.now(),
    text: aiResponse.message,
    isUser: false,
    timestamp: new Date(),
    sceneId: aiResponse.sceneId,
    
    // Add media content for simulation
    mediaContent: processAIResponseMedia(
      aiResponse,
      aiResponse.sceneGenerated,
      aiResponse.sceneId,
      aiResponse.sceneName,
      aiResponse.objectCount
    )
  };

  console.log('Message with simulation media:', message);
  return message;
}

/**
 * Example 2: Process AI response with image URL
 */
export function exampleImageResponse() {
  const aiResponse = {
    message: "Here's a diagram explaining the forces: https://example.com/force-diagram.png",
    sceneGenerated: false
  };

  // Detect media in message
  const detection = detectMediaInMessage(aiResponse.message);

  const message: Message = {
    id: Date.now(),
    text: detection.cleanText, // Text without URL
    isUser: false,
    timestamp: new Date(),
    
    // Add detected media
    mediaContent: detection.mediaContent
  };

  console.log('Message with image media:', message);
  return message;
}

/**
 * Example 3: Manually add simulation media
 */
export function exampleManualSimulationMedia() {
  const message: Message = {
    id: Date.now(),
    text: "Here's your binary star system!",
    isUser: false,
    timestamp: new Date(),
    sceneId: 'binary_star_v1.0',
    
    // Manually create simulation media
    mediaContent: createSimulationMedia(
      'binary_star_v1.0',
      'Binary Star System',
      2,
      '/scenes/binary_star/thumbnail.png'
    )
  };

  console.log('Manual simulation message:', message);
  return message;
}

/**
 * Example 4: Add video media
 */
export function exampleVideoMessage() {
  const message: Message = {
    id: Date.now(),
    text: "Watch this explanation of orbital mechanics:",
    isUser: false,
    timestamp: new Date(),
    
    mediaContent: {
      type: 'video',
      src: '/videos/orbital-mechanics.mp4',
      title: 'Orbital Mechanics Explained',
      thumbnail: '/videos/orbital-mechanics-thumb.jpg',
      autoPlay: false,
      metadata: {
        duration: 180,
        fileSize: '25 MB'
      }
    }
  };

  console.log('Video message:', message);
  return message;
}

/**
 * Example 5: Integration with real AI conversation hook
 */
export async function handleAIMessageWithMedia(
  userMessage: string,
  chatId: string,
  currentScene: any,
  addMessageToWorkspace: (msg: any) => void
) {
  // Step 1: Add user message
  const userMsg: Message = {
    id: Date.now(),
    text: userMessage,
    isUser: true,
    timestamp: new Date()
  };
  addMessageToWorkspace(userMsg);

  // Step 2: Call AI (simulated)
  const aiResponse = await simulateAICall(userMessage, currentScene);

  // Step 3: Create AI message
  const aiMsg: Message = {
    id: Date.now() + 1,
    text: aiResponse.message,
    isUser: false,
    timestamp: new Date()
  };

  // Step 4: Add media if scene was generated
  if (aiResponse.sceneGenerated && aiResponse.sceneId) {
    aiMsg.sceneId = aiResponse.sceneId;
    aiMsg.mediaContent = createSimulationMedia(
      aiResponse.sceneId,
      aiResponse.sceneName,
      aiResponse.objectCount,
      `/scenes/${aiResponse.sceneId}/thumbnail.png`
    );
  }
  // Or detect media in response text
  else {
    const detection = detectMediaInMessage(aiResponse.message);
    if (detection.hasMedia) {
      aiMsg.text = detection.cleanText;
      aiMsg.mediaContent = detection.mediaContent;
    }
  }

  // Step 5: Add AI message to workspace
  addMessageToWorkspace(aiMsg);

  return aiMsg;
}

/**
 * Simulated AI call (replace with real AI integration)
 */
async function simulateAICall(userMessage: string, _currentScene: any) {
  // Check if user is asking for a simulation
  if (userMessage.toLowerCase().includes('pendulum')) {
    return {
      message: "I've created a pendulum simulation for you!",
      sceneGenerated: true,
      sceneId: 'pendulum_energy_v1.0',
      sceneName: 'Pendulum Energy Conservation',
      objectCount: 5
    };
  }
  
  // Check if user is asking for an image/diagram
  if (userMessage.toLowerCase().includes('diagram')) {
    return {
      message: "Here's a force diagram: https://example.com/force-diagram.png",
      sceneGenerated: false
    };
  }

  // Default response
  return {
    message: "I can help you create physics simulations or visualizations!",
    sceneGenerated: false
  };
}

/**
 * Example 6: Bulk message creation with mixed media
 */
export function exampleMixedMediaConversation() {
  const messages: Message[] = [
    // User asks question
    {
      id: 1,
      text: "Can you show me how gravity works?",
      isUser: true,
      timestamp: new Date()
    },
    
    // AI responds with text
    {
      id: 2,
      text: "Sure! Let me explain with both a diagram and a simulation.",
      isUser: false,
      timestamp: new Date()
    },
    
    // AI sends image
    {
      id: 3,
      text: "First, here's a diagram of gravitational force:",
      isUser: false,
      timestamp: new Date(),
      mediaContent: {
        type: 'image',
        src: '/images/gravity-diagram.png',
        title: 'Gravitational Force Diagram',
        metadata: {
          dimensions: { width: 800, height: 600 }
        }
      }
    },
    
    // AI sends simulation
    {
      id: 4,
      text: "Now here's an interactive simulation:",
      isUser: false,
      timestamp: new Date(),
      sceneId: 'gravity_demo_v1.0',
      mediaContent: {
        type: 'simulation',
        sceneId: 'gravity_demo_v1.0',
        title: 'Gravity Demonstration',
        thumbnail: '/scenes/gravity_demo/thumbnail.png',
        metadata: {
          objectCount: 3
        }
      }
    },
    
    // AI sends video
    {
      id: 5,
      text: "For a deeper explanation, watch this:",
      isUser: false,
      timestamp: new Date(),
      mediaContent: {
        type: 'video',
        src: '/videos/gravity-explained.mp4',
        title: 'How Gravity Really Works',
        thumbnail: '/videos/gravity-explained-thumb.jpg',
        metadata: {
          duration: 120
        }
      }
    }
  ];

  return messages;
}

/**
 * Example 7: Error handling for media
 */
export function exampleMediaErrorHandling(url: string) {
  try {
    const detection = detectMediaInMessage(url);
    
    if (!detection.hasMedia) {
      console.warn('No media detected in URL:', url);
      return null;
    }

    // Validate URL before creating message
    const message: Message = {
      id: Date.now(),
      text: 'Here is the content:',
      isUser: false,
      timestamp: new Date(),
      mediaContent: detection.mediaContent
    };

    return message;
  } catch (error) {
    console.error('Error processing media:', error);
    
    // Fallback to text-only message
    return {
      id: Date.now(),
      text: `Content available at: ${url}`,
      isUser: false,
      timestamp: new Date()
    };
  }
}

/**
 * Example 8: Auto-detect and enhance AI responses
 */
export function enhanceAIResponseWithMedia(aiResponse: string): Message {
  const detection = detectMediaInMessage(aiResponse);
  
  return {
    id: Date.now(),
    text: detection.hasMedia ? detection.cleanText : aiResponse,
    isUser: false,
    timestamp: new Date(),
    mediaContent: detection.mediaContent
  };
}

// Export all examples
export default {
  exampleSceneGenerationResponse,
  exampleImageResponse,
  exampleManualSimulationMedia,
  exampleVideoMessage,
  handleAIMessageWithMedia,
  exampleMixedMediaConversation,
  exampleMediaErrorHandling,
  enhanceAIResponseWithMedia
};
