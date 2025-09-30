import { useState, useRef, useEffect } from 'react';
import GeminiAIManager from '../../core/ai/gemini';
import ScenePatcher from '../../core/scene/patcher';
import { useWorkspace } from '../../contexts/WorkspaceContext';

// Pure backend hook for chat functionality
export function useConversation({
  initialMessage,
  currentScene,
  onSceneUpdate,
  chatId,
  updateConversation,
  dataManager,
  workspaceMessages = [] // Add workspace messages as fallback
}) {
  const { linkSceneToChat, updateCurrentScene, updateWorkspace, addScene } = useWorkspace();
  const [messages, setMessages] = useState([]); // Don't initialize with messages here - handled by parent components
  const [isLoading, setIsLoading] = useState(false);
  const aiManager = useRef(new GeminiAIManager());
  const scenePatcher = useRef(new ScenePatcher());

  // Only sync messages if we actually manage state (not when parent component handles it)
  useEffect(() => {
    if (messages && messages.length > 0 && updateConversation && typeof updateConversation === 'function') {
      updateConversation(messages);
    }
  }, [messages, updateConversation]);

  // Update messages when conversationHistory changes or scene switches
  useEffect(() => {
    if (updateConversation && Array.isArray(updateConversation)) {
      setMessages(updateConversation);
    }
  }, [updateConversation]);

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

  // Handle scene switching - load existing chat or reset for new scenes
  const prevSceneIdRef = useRef(currentScene?.id);
  useEffect(() => {
    if (prevSceneIdRef.current !== currentScene?.id) {
      console.log(`🔄 Scene switched from ${prevSceneIdRef.current} to ${currentScene?.id}`);

      // Function to load conversation - try chatId first, then sceneId
      const loadConversation = async () => {
        // First try to load by chatId if available
        if (chatId && dataManager) {
          try {
            if (dataManager.getChatById) {
              const chat = await dataManager.getChatById(chatId);
              if (chat && chat.messages) {
                console.log(`📚 Loaded ${chat.messages.length} existing messages by chatId ${chatId}`);
                return chat.messages;
              }
            }
            if (dataManager.getChatHistory) {
              const chats = await dataManager.getChatHistory();
              const relevantChat = chats.find(chat => chat.id === chatId);
              if (relevantChat && relevantChat.messages) {
                console.log(`📚 Loaded ${relevantChat.messages.length} existing messages by chatId ${chatId}`);
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
            console.log(`📚 Loaded ${conversationsByScene.length} existing messages by sceneId ${currentScene.id}`);
            return conversationsByScene;
          }
        }

        return null;
      };

      loadConversation().then(existingConversation => {
        if (existingConversation && existingConversation.length > 0) {
          setMessages(existingConversation);
          if (updateConversation && typeof updateConversation === 'function') {
            updateConversation(existingConversation);
          }
          prevSceneIdRef.current = currentScene?.id;
          return;
        }

        // No existing conversation found in database, try workspace messages
        if (workspaceMessages && workspaceMessages.length > 0) {
          // Filter messages for current scene if they have sceneId
          const sceneMessages = workspaceMessages.filter(msg =>
            !msg.sceneId || msg.sceneId === currentScene?.id
          );
          if (sceneMessages.length > 0) {
            console.log(`📚 Loaded ${sceneMessages.length} existing messages from workspace for scene ${currentScene?.id}`);
            setMessages(sceneMessages);
            if (updateConversation && typeof updateConversation === 'function') {
              updateConversation(sceneMessages);
            }
            prevSceneIdRef.current = currentScene?.id;
            return;
          }
        }

        // No existing conversation found, start fresh
        console.log(`🆕 Starting fresh conversation for scene ${currentScene?.id}`);
        const newMessages = initialMessage ? [{
          id: Date.now(),
          text: initialMessage,
          isUser: false,
          timestamp: new Date(),
          sceneId: currentScene?.id
        }] : [];

        setMessages(newMessages);
        if (updateConversation && typeof updateConversation === 'function') {
          updateConversation(newMessages);
        }
      });

      prevSceneIdRef.current = currentScene?.id;
    }
  }, [currentScene?.id, chatId, initialMessage, dataManager, updateConversation, loadExistingConversationForScene, workspaceMessages]);

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

    if (updateConversation && typeof updateConversation === 'function') {
      updateConversation(newMessages);
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

        // Handle scene generation (replace current scene - for full scene replacement)
        if (aiResponse.metadata?.mode === 'generation' && aiResponse.updatedScene) {
          console.log('🎨 AI Scene Generation Detected - Replacing current scene');

          try {
            // Replace the entire current scene
            updateCurrentScene(aiResponse.updatedScene);
            console.log('✅ Successfully generated and replaced scene');

          } catch (error) {
            console.error('❌ Exception updating generated scene:', error);
            sceneUpdateError = `⚠️ I tried to replace the current scene, but encountered an unexpected error.`;
          }
        }

        // Handle scene creation (add new scene to workspace)
        else if (aiResponse.type === 'create_scene' || aiResponse.type === 'create') {
          console.log('➕ AI Scene Creation Detected - Adding new scene to workspace');

          try {
            // Add new scene to workspace
            const newScene = addScene(aiResponse.updatedScene || aiResponse.scene);
            console.log('✅ Successfully created new scene in workspace:', newScene.id);

            // If we have a chatId, link the new scene to it
            if (chatId && newScene.id) {
              linkSceneToChat(newScene.id, chatId);
              console.log(`🔗 Linked new scene ${newScene.id} to chat ${chatId}`);
            }

          } catch (error) {
            console.error('❌ Exception creating new scene:', error);
            sceneUpdateError = `⚠️ I tried to create a new scene, but encountered an unexpected error.`;
          }
        }
        // Handle scene modifications (patching existing scene)
        else if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
          console.log('🔧 AI Scene Modification Detected');
          console.log('Applying', aiResponse.sceneModifications.length, 'modifications');

          if (chatId && currentScene?.id) {
            linkSceneToChat(currentScene.id, chatId);
            console.log(`🔗 Linked scene ${currentScene.id} to chat ${chatId}`);
          }

          try {
            const patchResult = scenePatcher.current.applyPatches(currentScene, aiResponse.sceneModifications);

            if (patchResult.success) {
              console.log(`✅ Successfully applied ${patchResult.appliedPatches}/${patchResult.totalPatches} patches`);
              updateCurrentScene(patchResult.scene);
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

      const aiMessage = {
        id: Date.now() + 1,
        text: sceneUpdateError ? `${aiResponse.text}\n\n${sceneUpdateError}` : aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id,
        aiMetadata: aiResponse.metadata
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);

      if (updateConversation && typeof updateConversation === 'function') {
        updateConversation(updatedMessages);
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

      if (updateConversation && typeof updateConversation === 'function') {
        updateConversation(updatedMessages);
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

        // Handle scene generation (replace current scene)
        if (aiResponse.metadata?.mode === 'generation' && aiResponse.updatedScene) {
          console.log('🎨 AI Scene Generation Detected (regeneration) - Replacing current scene');

          try {
            // Replace the entire current scene
            updateCurrentScene(aiResponse.updatedScene);
            console.log('✅ Successfully regenerated and replaced scene');
          } catch (error) {
            console.error('❌ Exception updating regenerated scene:', error);
            sceneUpdateError = `⚠️ I tried to replace the scene, but encountered an unexpected error.`;
          }
        }

        // Handle scene creation (add new scene to workspace) - regeneration
        else if (aiResponse.type === 'create_scene' || aiResponse.type === 'create') {
          console.log('➕ AI Scene Creation Detected (regeneration) - Adding new scene to workspace');

          try {
            // Add new scene to workspace
            const newScene = addScene(aiResponse.updatedScene || aiResponse.scene);
            console.log('✅ Successfully created new scene in workspace:', newScene.id);

            // If we have a chatId, link the new scene to it
            if (chatId && newScene.id) {
              linkSceneToChat(newScene.id, chatId);
              console.log(`🔗 Linked new scene ${newScene.id} to chat ${chatId}`);
            }

          } catch (error) {
            console.error('❌ Exception creating new scene:', error);
            sceneUpdateError = `⚠️ I tried to create a new scene, but encountered an unexpected error.`;
          }
        }

        // Handle scene modifications (patching existing scene)
        else if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
          if (chatId && currentScene?.id) {
            linkSceneToChat(currentScene.id, chatId);
          }

          try {
            const patchResult = scenePatcher.current.applyPatches(currentScene, aiResponse.sceneModifications);
            if (patchResult.success) {
              updateCurrentScene(patchResult.scene);
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

// Legacy component for backward compatibility - now just a wrapper
function Conversation(props) {
  const conversation = useConversation(props);

  // This component should not render UI anymore - it's just a backend hook
  // The UI should be handled by ChatOverlay and ChatView components
  return null;
}

export default Conversation;
