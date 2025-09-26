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
  updateConversation
}) {
  const { linkSceneToChat, updateCurrentScene } = useWorkspace();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
      isUser: false,
      timestamp: new Date(),
      sceneId: currentScene?.id
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const aiManager = useRef(new GeminiAIManager());
  const scenePatcher = useRef(new ScenePatcher());

  // Update messages when conversationHistory changes or scene switches
  useEffect(() => {
    if (updateConversation && Array.isArray(updateConversation)) {
      setMessages(updateConversation);
    }
  }, [updateConversation]);

  // Handle scene switching - reset chat for new scenes
  const prevSceneIdRef = useRef(currentScene?.id);
  useEffect(() => {
    if (prevSceneIdRef.current !== currentScene?.id) {
      console.log(`🔄 Scene switched from ${prevSceneIdRef.current} to ${currentScene?.id}, resetting chat`);
      setMessages([{
        id: Date.now(),
        text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also simulate scenes in a 3D visualizer.",
        isUser: false,
        timestamp: new Date(),
        sceneId: currentScene?.id
      }]);
      prevSceneIdRef.current = currentScene?.id;
    }
  }, [currentScene?.id, initialMessage]);

  const sendMessage = async (inputText) => {
    if (!inputText.trim() || isLoading) return false;

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
      if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
        console.log('AI Scene Update Detected');
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
        console.log('No scene modifications detected in AI response');
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
        if (aiResponse.sceneModifications && aiResponse.sceneModifications.length > 0) {
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
    const initialMessages = [{
      id: Date.now(),
      text: initialMessage || "Hello! I'm a Physics AI Agent. I can help you with physics questions and also discuss how to represent described scenes in a 3D visualizer JSON format. How can I assist you with physics today?",
      isUser: false,
      timestamp: new Date(),
      sceneId: currentScene?.id
    }];
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
