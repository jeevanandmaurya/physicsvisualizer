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
    this.description = '';

    // Multiple scenes per workspace (like current chat.scenes array)
    this.scenes = [this.createDefaultScene()];
    this.currentSceneIndex = 0; // Active scene

    this.chat = {
      messages: [],
      settings: {
        model: 'gemini-1.5-flash',
        temperature: 0.7
      }
    };
    this.settings = {
      uiMode: 'simple', // 'simple' or 'advanced'
      showVectors: false,
      vectorScale: 1.5,
      autoSave: true
    };
    this.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      isPublic: false,
      authorId: null
    };
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
    const currentScene = this.getCurrentScene();
    if (currentScene) {
      Object.assign(currentScene, updates);
      this.metadata.updatedAt = new Date().toISOString();
    }
    return this;
  }

  // Duplicate current scene
  duplicateCurrentScene() {
    const currentScene = this.getCurrentScene();
    if (currentScene) {
      const duplicate = JSON.parse(JSON.stringify(currentScene));
      duplicate.id = `scene-${Date.now()}-${this.scenes.length}`;
      duplicate.name = `${currentScene.name} (Copy)`;
      this.scenes.push(duplicate);
      this.metadata.updatedAt = new Date().toISOString();
      return duplicate;
    }
    return null;
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
    // Compare with last saved state (would be implemented with snapshots)
    return true; // Simplified for now
  }

  // Export for saving
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      scenes: this.scenes,
      currentSceneIndex: this.currentSceneIndex,
      chat: this.chat,
      settings: this.settings,
      metadata: this.metadata
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
    workspace.description = data.description || '';
    workspace.chat = data.chat || { messages: [], settings: { model: 'gemini-1.5-flash', temperature: 0.7 } };
    workspace.settings = data.settings || { uiMode: 'simple', showVectors: false, vectorScale: 1.5, autoSave: true };
    workspace.metadata = data.metadata || {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      isPublic: false,
      authorId: null
    };

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

      // Find associated chat
      const chats = await this.database.getChatHistory();
      const chat = chats.find(c => c.sceneId === sceneId);

      // Create workspace from legacy data
      const workspace = new Workspace(`workspace-${sceneId}`, scene.name);
      workspace.scene = scene;
      if (chat) {
        workspace.chat.messages = chat.messages || [];
      }

      return workspace;
    } catch (error) {
      console.warn('Migration failed:', error);
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
  updateCurrentWorkspace(updater) {
    if (!this.currentWorkspace) return;

    if (typeof updater === 'function') {
      updater(this.currentWorkspace);
    } else {
      Object.assign(this.currentWorkspace, updater);
    }

    this.currentWorkspace.metadata.updatedAt = new Date().toISOString();
    this.notifyListeners('workspaceUpdated', this.currentWorkspace);
  }

  // Get all workspaces
  async getAllWorkspaces() {
    try {
      const workspaces = await this.database.getAllWorkspaces?.() || [];
      return workspaces.map(data => Workspace.fromJSON(data));
    } catch (error) {
      console.error('Failed to get workspaces:', error);
      return [];
    }
  }

  // Delete workspace
  async deleteWorkspace(id) {
    try {
      await this.database.deleteWorkspace?.(id);
      this.workspaces.delete(id);

      if (this.currentWorkspace?.id === id) {
        this.currentWorkspace = null;
        this.notifyListeners('currentWorkspaceChanged', null);
      }

      this.notifyListeners('workspaceDeleted', id);
    } catch (error) {
      console.error('Failed to delete workspace:', error);
      throw error;
    }
  }

  // Duplicate workspace
  duplicateWorkspace(id) {
    const original = this.workspaces.get(id);
    if (!original) return null;

    const duplicate = Workspace.fromJSON(original.toJSON());
    duplicate.id = `workspace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    duplicate.name = `${original.name} (Copy)`;
    duplicate.metadata.createdAt = new Date().toISOString();
    duplicate.metadata.updatedAt = new Date().toISOString();

    this.workspaces.set(duplicate.id, duplicate);
    this.notifyListeners('workspaceDuplicated', duplicate);
    return duplicate;
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
