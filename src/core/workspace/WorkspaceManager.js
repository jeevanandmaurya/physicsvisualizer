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

    // Multiple scenes per workspace (like current chat.scenes array)
    this.scenes = [this.createDefaultScene()];
    this.currentSceneIndex = 0; // Active scene

    this.chat = {
      messages: []
    };

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

  // Add chat message
  addMessage(message) {
    this.chat.messages.push({
      ...message,
      timestamp: new Date().toISOString(),
      workspaceId: this.id
    });
    this.metadata.updatedAt = new Date().toISOString();
    return this;
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
      chat: this.chat,
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
    workspace.chat = data.chat || { messages: [] };
    workspace.settings = data.settings || { uiMode: 'simple', showVectors: false, vectorScale: 1.5, autoSave: true };
    workspace.metadata = data.metadata || {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

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
  }

  // Create new workspace
  createWorkspace(name = 'New Workspace') {
    const id = `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const workspace = new Workspace(id, name);
    this.workspaces.set(id, workspace);
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
      if (chat) workspace.chat.messages = chat.messages || [];

      return workspace;
    } catch (error) {
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
