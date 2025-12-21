import { useState, useRef, useEffect } from 'react';
import GeminiAIManager from '../../core/ai/gemini';
import ScenePatcher from '../../core/scene/patcher';
import { useWorkspace } from '../../contexts/WorkspaceContext';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  sceneId?: string;
  aiMetadata?: any;
}

// Pure backend hook for chat functionality
export function useConversation({
  initialMessage,
  currentScene,
  onSceneUpdate,
  chatId,
  updateConversation,
  dataManager,
  workspaceMessages = [], // Add workspace messages as fallback
  addMessageToWorkspace, // NEW: Direct function to add message to workspace
  shouldSwitchScene = true // NEW: Whether to switch global scene on generation
}: {
  initialMessage: string;
  currentScene: any;
  onSceneUpdate: any;
  chatId: string;
  updateConversation: any;
  dataManager: any;
  workspaceMessages: Message[];
  addMessageToWorkspace?: (message: any) => void;
  shouldSwitchScene?: boolean;
}) {
  const { linkSceneToChat, updateCurrentScene, updateSceneById, updateWorkspace, addScene } = useWorkspace();
  const [messages, setMessages] = useState<Message[]>([]); // Don't initialize with messages here - handled by parent components
  const [isLoading, setIsLoading] = useState(false);
  const aiManager = useRef(new GeminiAIManager());
  const scenePatcher = useRef(new ScenePatcher());

  // Sync with workspace messages whenever they change
  useEffect(() => {
    if (workspaceMessages && workspaceMessages.length > 0) {
      // Check if we need to update internal messages
      // We use a simple length and last message ID check to avoid infinite loops
      const lastWorkspaceMsg = workspaceMessages[workspaceMessages.length - 1];
      const lastInternalMsg = messages[messages.length - 1];
      
      const needsUpdate = workspaceMessages.length !== messages.length || 
                         (lastWorkspaceMsg && lastInternalMsg && lastWorkspaceMsg.id !== lastInternalMsg.id.toString());
      
      if (needsUpdate) {
        console.log(`🔄 Syncing useConversation messages with workspace (${workspaceMessages.length} msgs)`);
        // Convert workspace messages to internal format if needed
        const formattedMessages = workspaceMessages.map(msg => ({
          id: typeof msg.id === 'string' ? parseInt(msg.id) || Date.now() : msg.id,
          text: msg.content || (msg as any).text || '',
          isUser: !!msg.isUser,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          sceneId: msg.sceneId,
          aiMetadata: msg.aiMetadata,
          sceneMetadata: (msg as any).sceneMetadata
        }));
        setMessages(formattedMessages as any);
      }
    } else if (workspaceMessages.length === 0 && messages.length > 0) {
      // If workspace is cleared, clear internal state too
      setMessages([]);
    }
  }, [workspaceMessages, messages.length]);

  // REMOVED: Don't sync messages back - causes infinite loops
  // Parent components handle persistence through addMessage

  // Helper function to load existing conversation for a scene
  const loadExistingConversationForScene = async (sceneId) => {
    if (!sceneId || !dataManager) return null;

    try {
      if (chatId) {
        // Try to load the chat from database
        if (dataManager.getChatById) {
          const chat = await dataManager.getChatById(chatId);
          if (chat && chat.messages) {
            return chat.messages;
          }
        }

        // Fallback: try to load from workspace if it's using that
        if (dataManager.get && dataManager.get('workspaces')) {
          const workspaces = await dataManager.get('workspaces');
          for (const workspace of workspaces) {
            if (workspace.chat?.messages?.some(msg => msg.sceneId === sceneId)) {
              return workspace.chat.messages.filter(msg => msg.sceneId === sceneId || !msg.sceneId);
            }
          }
        }
      }

      // Last resort: check localStorage directly
      const chats = dataManager.getChatHistory ? await dataManager.getChatHistory() : [];
      const relevantChat = chats.find(chat => chat.sceneId === sceneId);
      if (relevantChat && relevantChat.messages) {
        return relevantChat.messages;
      }
    } catch (error) {
      console.warn('Failed to load existing conversation:', error);
    }

    return null;
  };

  // Handle scene switching AND chat switching - load existing chat or reset for new scenes
  const prevSceneIdRef = useRef(currentScene?.id);
  const prevChatIdRef = useRef(chatId);
  const isInitialMount = useRef(true);
  
  useEffect(() => {
    const sceneChanged = prevSceneIdRef.current !== currentScene?.id;
    const chatChanged = prevChatIdRef.current !== chatId;
    
    // Only load on initial mount or when chat/scene actually changes
    // Don't reload on every workspaceMessages change (that causes duplicates)
    if (isInitialMount.current || sceneChanged || chatChanged) {
      isInitialMount.current = false;
      
      // If chatId is empty/null and scene changed, clear messages (new scene without chat)
      if (!chatId && sceneChanged) {
        console.log('🆕 New scene without chat, clearing messages');
        setMessages([]);
        prevSceneIdRef.current = currentScene?.id;
        prevChatIdRef.current = chatId;
        return;
      }
      
      // Function to load conversation - try chatId first, then sceneId
      const loadConversation = async () => {
        // First try to load by chatId if available
        if (chatId && dataManager) {
          try {
            if (dataManager.getChatById) {
              const chat = await dataManager.getChatById(chatId);
              if (chat && chat.messages) {
                return chat.messages;
              }
            }
            if (dataManager.getChatHistory) {
              const chats = await dataManager.getChatHistory();
              const relevantChat = chats.find(chat => chat.id === chatId);
              if (relevantChat && relevantChat.messages) {
                return relevantChat.messages;
              }
            }
          } catch (error) {
            console.warn('Failed to load conversation for chatId:', chatId, error);
          }
        }

        // If no chatId or not found, try loading by sceneId
        if (currentScene?.id && dataManager) {
          const conversationsByScene = await loadExistingConversationForScene(currentScene.id);
          if (conversationsByScene) {
            return conversationsByScene;
          }
        }

        return null;
      };

      loadConversation().then(existingConversation => {
        if (existingConversation && existingConversation.length > 0) {
          setMessages(existingConversation);
          prevSceneIdRef.current = currentScene?.id;
          prevChatIdRef.current = chatId;
          return;
        }

        // No existing conversation found in database, use workspace messages
        if (workspaceMessages && workspaceMessages.length > 0) {
          console.log(`📚 Loaded ${workspaceMessages.length} existing messages from workspace for chatId ${chatId}`);
          setMessages(workspaceMessages);
          prevSceneIdRef.current = currentScene?.id;
          prevChatIdRef.current = chatId;
          return;
        }

        // No existing conversation found, start fresh
        console.log(`🆕 Starting fresh conversation for chatId ${chatId}, scene ${currentScene?.id}`);
        const newMessages = initialMessage ? [{
          id: Date.now(),
          text: initialMessage,
          isUser: false,
          timestamp: new Date(),
          sceneId: currentScene?.id
        }] : [];

        setMessages(newMessages);
      });

      prevSceneIdRef.current = currentScene?.id;
      prevChatIdRef.current = chatId;
    }
  }, [currentScene?.id, chatId, initialMessage, dataManager]);

  const sendMessage = async (inputText) => {
    if (!inputText.trim() || isLoading) return false;

    // Check if this scene doesn't have a chat yet - create one
    let currentChatId = chatId;
    if (currentScene && currentScene.id && !currentChatId && dataManager) {
      try {
        console.log('🆕 First interaction with scene, creating chat...');
        currentChatId = await dataManager.getOrCreateChatForScene(currentScene.id, currentScene.name);
        console.log('✅ Created new chat:', currentChatId);

        // Link the scene to the new chat
        linkSceneToChat(currentScene.id, currentChatId);
      } catch (error) {
        console.warn('⚠️ Failed to create chat for scene:', error);
      }
    }

    const userMessage = {
      id: Date.now(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
      sceneId: currentScene?.id
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    // Add user message to workspace immediately
    if (addMessageToWorkspace) {
      addMessageToWorkspace({
        id: userMessage.id.toString(),
        content: userMessage.text,
        isUser: true,
        timestamp: userMessage.timestamp?.getTime() || Date.now(),
        sceneId: userMessage.sceneId
      });
    }

    setIsLoading(true);

    try {
      const chatContext = {
        history: messages,
        currentMessage: userMessage
      };

      const sceneContext = currentScene ? {
        id: currentScene.id,
        name: currentScene.name,
        description: currentScene.description,
        objects: currentScene.objects?.map(obj => ({
          id: obj.id,
          type: obj.type,
          position: obj.position,
          velocity: obj.velocity,
          mass: obj.mass,
          radius: obj.radius,
          dimensions: obj.dimensions,
          color: obj.color,
          isStatic: obj.isStatic,
          rotation: obj.rotation
        })) || [],
        gravity: currentScene.gravity,
        hasGround: currentScene.hasGround,
        contactMaterial: currentScene.contactMaterial,
        backgroundColor: currentScene.backgroundColor,
        lighting: currentScene.lighting,
        camera: currentScene.camera
      } : null;

      const aiResponse = await aiManager.current.processUserMessage(
        userMessage.text,
        chatContext,
        sceneContext
      );

        let sceneUpdateError = null;
        let generatedSceneId = null;

        // OPTION 1: Replace entire scene (updatedScene exists)
        if (aiResponse.updatedScene) {
          console.log('🔄 New scene generated');
          console.log('📊 Updated scene objects:', aiResponse.updatedScene.objects?.length || 0, 'objects');

          try {
            // Determine if this is truly a NEW scene or an update to existing
            const isNewScene = !currentScene || 
                               aiResponse.updatedScene.id !== currentScene.id ||
                               aiResponse.updatedScene.name !== currentScene.name;
            
            if (isNewScene) {
              // ADD new scene to workspace
              console.log('➕ Adding NEW scene to workspace:', aiResponse.updatedScene.name);
              addScene(aiResponse.updatedScene, shouldSwitchScene);
              generatedSceneId = aiResponse.updatedScene.id;
            } else {
              // UPDATE existing scene by ID (not necessarily current)
              console.log('🔄 Updating scene by ID:', currentScene.id);
              updateSceneById(currentScene.id, aiResponse.updatedScene);
              generatedSceneId = currentScene.id;
            }
            
            console.log('✅ Scene operation completed successfully');

            // Link scene to chat if available
            if (chatId && generatedSceneId) {
              linkSceneToChat(generatedSceneId, chatId);
            }

          } catch (error) {
            console.error('❌ Exception handling scene:', error);
            sceneUpdateError = `⚠️ I tried to update the scene, but encountered an error.`;
          }
        }
        // OPTION 2: Patch existing scene (sceneModifications array)
        else if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
          console.log('🔧 AI Scene Modification Detected');
          console.log('Applying', aiResponse.sceneModifications.length, 'modifications');

          generatedSceneId = currentScene?.id;

          if (chatId && generatedSceneId) {
            linkSceneToChat(generatedSceneId, chatId);
            console.log(`🔗 Linked scene ${generatedSceneId} to chat ${chatId}`);
          }

          try {
            const patchResult = scenePatcher.current.applyPatches(currentScene, aiResponse.sceneModifications);

            if (patchResult.success) {
              console.log(`✅ Successfully applied ${patchResult.appliedPatches}/${patchResult.totalPatches} patches`);
              if (currentScene?.id) {
                updateSceneById(currentScene.id, patchResult.scene);
              } else {
                updateCurrentScene(patchResult.scene);
              }
            } else {
              console.error('❌ Failed to apply scene patches:', patchResult.error);
              sceneUpdateError = `⚠️ I tried to modify the scene, but encountered an error: ${patchResult.error}`;
            }
          } catch (error) {
            console.error('❌ Exception applying scene patches:', error);
            sceneUpdateError = `⚠️ I tried to modify the scene, but encountered an unexpected error.`;
          }
        } else {
          console.log('💬 No scene modifications detected in AI response');
        }

      // Determine if scene was generated/modified
      const hasSceneGeneration = !!(aiResponse.updatedScene || (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0));
      const sceneAction = hasSceneGeneration ? (aiResponse.updatedScene ? 'create' : 'modify') : 'none';
      
      // Extract scene metadata for preview card - ONLY if this message actually generated/modified a scene
      let sceneMetadata = undefined;
      if (hasSceneGeneration) {
        // Use the scene from the AI response, not the current scene (which might be old)
        const scene = aiResponse.updatedScene || (aiResponse.sceneModifications?.length > 0 ? currentScene : null);
        
        // Only create metadata if we have a valid scene
        if (scene) {
        
        // Count all objects including those that will be generated by functionCalls
        let estimatedObjectCount = (scene.objects || []).length;
        
        // Check if there are functionCalls that generate objects
        if (scene.functionCalls && Array.isArray(scene.functionCalls)) {
          // Try to estimate object count from function call code
          scene.functionCalls.forEach((fc: any) => {
            if (fc.code) {
              // Look for common patterns like "for(let i=0; i<N" or push statements
              const forLoopMatch = fc.code.match(/for\s*\(\s*let\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\d+)/);
              if (forLoopMatch) {
                estimatedObjectCount += parseInt(forLoopMatch[1]);
              }
            }
          });
        }
        
        const objectTypes = Array.from(new Set(
          (scene.objects || []).map((obj: any) => obj.type).filter(Boolean)
        ));
        
        // If no object types detected but we have estimated objects, add a generic type
        if (objectTypes.length === 0 && estimatedObjectCount > 0) {
          objectTypes.push('Generated Objects');
        }
        
        // Only create metadata if scene has actual objects
        // Don't show preview card for empty scenes (greetings, questions, etc.)
        if (estimatedObjectCount > 0) {
          sceneMetadata = {
            hasSceneGeneration: true,
            sceneId: generatedSceneId || scene.id || currentScene?.id || 'unknown',
            sceneAction: sceneAction as 'create' | 'modify' | 'none',
            sceneSummary: {
              name: scene.name || 'Untitled Scene',
              objectCount: estimatedObjectCount,
              objectTypes: objectTypes,
              thumbnailUrl: scene.thumbnailUrl || undefined
            }
          };
          console.log('📋 Scene metadata created:', sceneMetadata);
        } else {
          console.log('⏭️ Skipping metadata creation for empty scene (0 objects)');
        }
        }
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: sceneUpdateError ? `${aiResponse.text}\n\n${sceneUpdateError}` : aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id,
        aiMetadata: aiResponse.metadata,
        sceneMetadata
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      // Add AI message to workspace with scene metadata
      if (addMessageToWorkspace) {
        addMessageToWorkspace({
          id: aiMessage.id.toString(),
          content: aiMessage.text,
          isUser: false,
          timestamp: aiMessage.timestamp?.getTime() || Date.now(),
          sceneId: aiMessage.sceneId,
          aiMetadata: aiMessage.aiMetadata,
          sceneMetadata
        });
      }

      return true;
    } catch (error) {
      console.error('AI Error:', error);

      const fallbackMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting to my AI service right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      };

      const updatedMessages = [...newMessages, fallbackMessage];
      setMessages(updatedMessages);

      // Add error message to workspace
      if (addMessageToWorkspace) {
        addMessageToWorkspace({
          id: fallbackMessage.id.toString(),
          content: fallbackMessage.text,
          isUser: false,
          timestamp: fallbackMessage.timestamp?.getTime() || Date.now(),
          sceneId: fallbackMessage.sceneId
        });
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateResponse = async (messageIndex) => {
    if (isLoading) return false;

    // Remove messages after the selected one
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);

    if (updateConversation && typeof updateConversation === 'function') {
      updateConversation(messagesToKeep);
    }

    // Get the user message that prompted this response
    const userMessage = messages[messageIndex - 1];
    if (userMessage && userMessage.isUser) {
      setIsLoading(true);

      try {
        const chatContext = {
          history: messagesToKeep.slice(0, -1), // Exclude the AI message we're regenerating
          currentMessage: userMessage
        };

        const sceneContext = currentScene ? {
          id: currentScene.id,
          name: currentScene.name,
          description: currentScene.description,
          objects: currentScene.objects?.map(obj => ({
            id: obj.id,
            type: obj.type,
            position: obj.position,
            velocity: obj.velocity,
            mass: obj.mass,
            radius: obj.radius,
            dimensions: obj.dimensions,
            color: obj.color,
            isStatic: obj.isStatic,
            rotation: obj.rotation
          })) || [],
          gravity: currentScene.gravity,
          hasGround: currentScene.hasGround,
          contactMaterial: currentScene.contactMaterial,
          backgroundColor: currentScene.backgroundColor,
          lighting: currentScene.lighting,
          camera: currentScene.camera
        } : null;

        const aiResponse = await aiManager.current.processUserMessage(
          userMessage.text,
          chatContext,
          sceneContext
        );

        let sceneUpdateError = null;

        // OPTION 1: Replace entire scene (updatedScene exists)
        if (aiResponse.updatedScene) {
          console.log('🔄 Replacing entire scene (regeneration)');

          try {
            if (currentScene?.id) {
              updateSceneById(currentScene.id, aiResponse.updatedScene);
            } else {
              updateCurrentScene(aiResponse.updatedScene);
            }
            console.log('✅ Scene replaced successfully');

            if (chatId && currentScene?.id) {
              linkSceneToChat(currentScene.id, chatId);
            }

          } catch (error) {
            console.error('❌ Exception replacing scene:', error);
            sceneUpdateError = `⚠️ I tried to update the scene, but encountered an error.`;
          }
        }
        // OPTION 2: Patch existing scene (sceneModifications array)
        else if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
          if (chatId && currentScene?.id) {
            linkSceneToChat(currentScene.id, chatId);
          }

          try {
            const patchResult = scenePatcher.current.applyPatches(currentScene, aiResponse.sceneModifications);
            if (patchResult.success) {
              if (currentScene?.id) {
                updateSceneById(currentScene.id, patchResult.scene);
              } else {
                updateCurrentScene(patchResult.scene);
              }
            } else {
              sceneUpdateError = `⚠️ I tried to modify the scene, but encountered an error: ${patchResult.error}`;
            }
          } catch (error) {
            sceneUpdateError = `⚠️ I tried to modify the scene, but encountered an unexpected error.`;
          }
        }

        const aiMessage = {
          id: Date.now() + 1,
          text: sceneUpdateError ? `${aiResponse.text}\n\n${sceneUpdateError}` : aiResponse.text,
          isUser: false,
          timestamp: new Date(),
          sceneId: currentScene?.id,
          aiMetadata: aiResponse.metadata
        };

        const updatedMessages = [...messagesToKeep, aiMessage];
        setMessages(updatedMessages);

        if (updateConversation && typeof updateConversation === 'function') {
          updateConversation(updatedMessages);
        }

        return true;
      } catch (error) {
        console.error('Regeneration Error:', error);
        const fallbackMessage = {
          id: Date.now() + 1,
          text: "I'm sorry, I'm having trouble regenerating the response. Please try again.",
          isUser: false,
          timestamp: new Date(),
          sceneId: currentScene?.id
        };

        const updatedMessages = [...messagesToKeep, fallbackMessage];
        setMessages(updatedMessages);

        if (updateConversation && typeof updateConversation === 'function') {
          updateConversation(updatedMessages);
        }

        return false;
      } finally {
        setIsLoading(false);
      }
    }
    return false;
  };

  const clearConversation = () => {
    const initialMessages = initialMessage ? [{
      id: Date.now(),
      text: initialMessage,
      isUser: false,
      timestamp: new Date(),
      sceneId: currentScene?.id
    }] : [];
    setMessages(initialMessages);

    if (updateConversation && typeof updateConversation === 'function') {
      updateConversation(initialMessages);
    }
  };

  const saveConversation = () => {
    const conversationData = {
      id: chatId || Date.now().toString(),
      messages,
      timestamp: new Date(),
      sceneId: currentScene?.id
    };
    localStorage.setItem(`chat_${conversationData.id}`, JSON.stringify(conversationData));
    return conversationData.id;
  };

  const loadConversation = (conversationId) => {
    const data = localStorage.getItem(`chat_${conversationId}`);
    if (data) {
      const conversation = JSON.parse(data);
      setMessages(conversation.messages);

      if (updateConversation && typeof updateConversation === 'function') {
        updateConversation(conversation.messages);
      }

      return true;
    }
    return false;
  };

  return {
    messages,
    isLoading,
    sendMessage,
    regenerateResponse,
    clearConversation,
    saveConversation,
    loadConversation
  };
}

// Legacy component removed for Fast Refresh compatibility
// Use the useConversation hook directly in UI components
