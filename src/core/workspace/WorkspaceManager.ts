/**
 * Workspace Manager - Unified Architecture for Physics Scenes and Chats
 *
 * A Workspace represents a complete physics exploration session containing:
 * - Scene data (objects, physics properties)
 * - Chat history (conversations with AI)
 * - Settings and preferences
 * - Metadata (creation date, tags, etc.)
 */

class Workspace {
  constructor(id, name = 'New Workspace') {
    this.id = id;
    this.name = name;

    // Multiple scenes per workspace
    this.scenes = [this.createDefaultScene()];
    this.currentSceneIndex = 0; // Active scene

    // Multiple chat sessions per workspace
    this.chats = [this.createDefaultChat()];
    this.currentChatId = this.chats[0].id; // Active chat

    this.settings = {
      uiMode: 'simple', // 'simple' or 'advanced'
      showVectors: false,
      vectorScale: 1.5,
      autoSave: true
    };
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Track which chat last modified each scene
    this.sceneChatLinks = new Map(); // sceneId -> chatId
  }

  createDefaultScene() {
    return {
      id: `scene-${Date.now()}`,
      name: 'Physics Scene',
      gravity: [0, -9.81, 0],
      hasGround: true,
      contactMaterial: { friction: 0.5, restitution: 0.7 },
      objects: [],
      camera: { position: [10, 5, 25], fov: 50 }
    };
  }

  createDefaultChat() {
    return {
      id: `chat-${Date.now()}`,
      name: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Get current scene
  getCurrentScene() {
    return this.scenes[this.currentSceneIndex];
  }

  // Set active scene by index
  setCurrentScene(index) {
    if (index >= 0 && index < this.scenes.length) {
      this.currentSceneIndex = index;
      this.metadata.updatedAt = new Date().toISOString();
      return this.getCurrentScene();
    }
    return null;
  }

  // Add new scene
  addScene(sceneData = null) {
    const newScene = sceneData || this.createDefaultScene();
    newScene.id = `scene-${Date.now()}-${this.scenes.length}`;
    this.scenes.push(newScene);
    this.metadata.updatedAt = new Date().toISOString();
    return newScene;
  }

  // Update current scene
  updateCurrentScene(updates) {
    if (this.currentSceneIndex >= 0 && this.currentSceneIndex < this.scenes.length) {
      // Replace the entire scene object to trigger React re-renders
      this.scenes[this.currentSceneIndex] = { ...this.scenes[this.currentSceneIndex], ...updates };
      this.metadata.updatedAt = new Date().toISOString();
    }
    return this;
  }

  // Replace current scene with new scene data (for loading examples or external scenes)
  replaceCurrentScene(newScene) {
    if (this.currentSceneIndex >= 0 && this.currentSceneIndex < this.scenes.length) {
      this.scenes[this.currentSceneIndex] = { ...newScene };
      this.metadata.updatedAt = new Date().toISOString();
    }
    return this;
  }

  // Delete scene by index
  deleteScene(index) {
    if (index >= 0 && index < this.scenes.length && this.scenes.length > 1) {
      this.scenes.splice(index, 1);
      if (this.currentSceneIndex >= index && this.currentSceneIndex > 0) {
        this.currentSceneIndex--;
      }
      this.metadata.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Legacy method for backward compatibility
  updateScene(updates) {
    return this.updateCurrentScene(updates);
  }

  // Add chat message to the current chat
  addMessage(message) {
    const currentChat = this.getChatById(this.currentChatId);
    if (currentChat) {
      currentChat.messages.push({
        ...message,
        id: message.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Ensure message has an ID
        timestamp: new Date().toISOString(),
        workspaceId: this.id
      });
      currentChat.updatedAt = new Date().toISOString();
      this.metadata.updatedAt = new Date().toISOString();
    }
    return this;
  }

  // Add a new chat session
  addChat(chatData = null) {
    const newChat = chatData || this.createDefaultChat();
    newChat.id = `chat-${Date.now()}-${this.chats.length}`;
    newChat.name = newChat.name || `Chat ${this.chats.length + 1}`;
    this.chats.push(newChat);
    this.metadata.updatedAt = new Date().toISOString();
    return newChat;
  }

  // Get a chat by its ID
  getChatById(chatId) {
    return this.chats.find(chat => chat.id === chatId);
  }

  // Set the current active chat
  setCurrentChat(chatId) {
    const chat = this.getChatById(chatId);
    if (chat) {
      this.currentChatId = chatId;
      this.metadata.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Delete a chat session by ID
  deleteChat(chatId) {
    if (this.chats.length > 1) { // Prevent deleting the last chat
      const index = this.chats.findIndex(chat => chat.id === chatId);
      if (index !== -1) {
        this.chats.splice(index, 1);
        // If the deleted chat was the current one, switch to another
        if (this.currentChatId === chatId && this.chats.length > 0) {
          this.currentChatId = this.chats[0].id; // Switch to the first available chat
        } else if (this.chats.length === 0) {
          // Should not happen due to length check, but as a safeguard
          this.chats.push(this.createDefaultChat());
          this.currentChatId = this.chats[0].id;
        }
        this.metadata.updatedAt = new Date().toISOString();
        return true;
      }
    }
    return false;
  }

  // Update settings
  updateSettings(updates) {
    this.settings = { ...this.settings, ...updates };
    this.metadata.updatedAt = new Date().toISOString();
    return this;
  }

  // Get current UI mode
  getUIMode() {
    return this.settings.uiMode;
  }

  // Check if workspace has unsaved changes
  hasUnsavedChanges() {
    return true; // Always assume changes for auto-save
  }

  // Link a scene to a chat (when AI modifies a scene)
  linkSceneToChat(sceneId, chatId) {
    this.sceneChatLinks.set(sceneId, chatId);
    this.metadata.updatedAt = new Date().toISOString();
    return this;
  }

  // Get the chat ID that last modified a scene
  getChatForScene(sceneId) {
    return this.sceneChatLinks.get(sceneId);
  }

  // Export for saving
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      scenes: this.scenes,
      currentSceneIndex: this.currentSceneIndex,
      chats: this.chats, // Include chats array
      currentChatId: this.currentChatId, // Include current chat ID
      settings: this.settings,
      metadata: this.metadata,
      sceneChatLinks: Object.fromEntries(this.sceneChatLinks) // Convert Map to object
    };
  }

  // Import from saved data
  static fromJSON(data) {
    const workspace = new Workspace(data.id, data.name);

    // Handle migration from old single-scene format
    if (data.scene && !data.scenes) {
      workspace.scenes = [data.scene];
      workspace.currentSceneIndex = 0;
    } else if (data.scenes) {
      workspace.scenes = data.scenes;
      workspace.currentSceneIndex = data.currentSceneIndex || 0;
    }

    // Copy other properties
    workspace.settings = data.settings || { uiMode: 'simple', showVectors: false, vectorScale: 1.5, autoSave: true };
    workspace.metadata = data.metadata || {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Restore chats
    if (data.chats && Array.isArray(data.chats)) {
      workspace.chats = data.chats;
    } else {
      // If no chats found, ensure there's at least one default chat
      workspace.chats = [workspace.createDefaultChat()];
    }
    workspace.currentChatId = data.currentChatId || (workspace.chats.length > 0 ? workspace.chats[0].id : null);

    // Restore scene-chat links
    if (data.sceneChatLinks) {
      workspace.sceneChatLinks = new Map(Object.entries(data.sceneChatLinks));
    }

    return workspace;
  }
}

class WorkspaceManager {
  constructor(database) {
    this.database = database;
    this.currentWorkspace = null;
    this.workspaces = new Map();
    this.listeners = new Set();
    this.autoSaveInterval = null;
  }

  // Create new workspace
  createWorkspace(name = 'New Workspace') {
    const id = `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workspace = new Workspace(id, name);
    this.workspaces.set(id, workspace);
    this.setCurrentWorkspace(workspace); // Set as current immediately
    this.notifyListeners('workspaceCreated', workspace);
    return workspace;
  }

  // Load workspace by ID
  async loadWorkspace(id) {
    try {
      // Try to load from database first
      const data = await this.database.getWorkspace?.(id);
      if (data) {
        const workspace = Workspace.fromJSON(data);
        this.workspaces.set(id, workspace);
        this.setCurrentWorkspace(workspace);
        return workspace;
      }

      // Fallback: try to migrate from old scene/chat format
      const workspace = await this.migrateFromLegacy(id);
      if (workspace) {
        this.workspaces.set(id, workspace);
        this.setCurrentWorkspace(workspace);
        return workspace;
      }

      throw new Error(`Workspace ${id} not found`);
    } catch (error) {
      console.error('Failed to load workspace:', error);
      throw error;
    }
  }

  // Migrate from legacy scene + chat format
  async migrateFromLegacy(sceneId) {
    try {
      const scene = await this.database.getSceneById(sceneId);
      if (!scene) return null;

      const chats = await this.database.getChatHistory();
      const chat = chats.find(c => c.sceneId === sceneId);

      const workspace = new Workspace(`workspace-${sceneId}`, scene.name);
      workspace.scenes = [scene];
      if (chat) {
        // Create a new chat object for the workspace
        const workspaceChat = {
          id: `chat-${Date.now()}`,
          name: chat.name || 'Migrated Chat',
          messages: chat.messages || [],
          createdAt: chat.createdAt || new Date().toISOString(),
          updatedAt: chat.updatedAt || new Date().toISOString()
        };
        workspace.chats = [workspaceChat];
        workspace.currentChatId = workspaceChat.id;
      } else {
        // Ensure there's at least one chat if no legacy chat found
        workspace.chats = [workspace.createDefaultChat()];
        workspace.currentChatId = workspace.chats[0].id;
      }

      return workspace;
    } catch (error) {
      console.error('Migration failed:', error);
      return null;
    }
  }

  // Save current workspace
  async saveCurrentWorkspace() {
    if (!this.currentWorkspace) return;

    try {
      await this.database.saveWorkspace?.(this.currentWorkspace.toJSON());
      this.notifyListeners('workspaceSaved', this.currentWorkspace);
    } catch (error) {
      console.error('Failed to save workspace:', error);
      throw error;
    }
  }

  // Set current workspace
  setCurrentWorkspace(workspace) {
    this.currentWorkspace = workspace;
    this.notifyListeners('currentWorkspaceChanged', workspace);
  }

  // Get current workspace
  getCurrentWorkspace() {
    return this.currentWorkspace;
  }

  // Update current workspace
  updateCurrentWorkspace(updater, silent = false) {
    if (!this.currentWorkspace) return;

    if (typeof updater === 'function') {
      updater(this.currentWorkspace);
    } else {
      Object.assign(this.currentWorkspace, updater);
    }

    this.currentWorkspace.metadata.updatedAt = new Date().toISOString();

    // Only notify listeners if not silent (for UI-triggered updates like adding messages)
    if (!silent) {
      this.notifyListeners('workspaceUpdated', this.currentWorkspace);
    }
  }

  // Add a new chat session to the current workspace
  addChatSession() {
    if (!this.currentWorkspace) return null;
    const newChat = this.currentWorkspace.addChat();
    this.updateCurrentWorkspace(workspace => workspace); // Trigger update
    this.notifyListeners('chatAdded', newChat);
    return newChat;
  }

  // Delete a chat session from the current workspace
  deleteChatSession(chatId) {
    if (!this.currentWorkspace) return false;
    const success = this.currentWorkspace.deleteChat(chatId);
    if (success) {
      this.updateCurrentWorkspace(workspace => workspace); // Trigger update
      this.notifyListeners('chatDeleted', chatId);
    }
    return success;
  }

  // Set the active chat session for the current workspace
  selectChatSession(chatId) {
    if (!this.currentWorkspace) return false;
    const success = this.currentWorkspace.setCurrentChat(chatId);
    if (success) {
      this.updateCurrentWorkspace(workspace => workspace); // Trigger update
      this.notifyListeners('chatSelected', chatId);
    }
    return success;
  }

  // Get the current chat for the workspace
  getCurrentChat() {
    if (!this.currentWorkspace) return null;
    return this.currentWorkspace.getChatById(this.currentChatId);
  }

  // Get all chats for the workspace
  getAllChats() {
    return this.currentWorkspace?.chats || [];
  }

  // Event system for UI updates
  addListener(callback) {
    this.listeners.add(callback);
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Workspace listener error:', error);
      }
    });
  }

  // Auto-save functionality
  startAutoSave(intervalMs = 30000) {
    this.autoSaveInterval = setInterval(() => {
      if (this.currentWorkspace?.settings?.autoSave && this.currentWorkspace.hasUnsavedChanges()) {
        this.saveCurrentWorkspace().catch(error => {
          console.warn('Auto-save failed:', error);
        });
      }
    }, intervalMs);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }
}

export { Workspace, WorkspaceManager };
