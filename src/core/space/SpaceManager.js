/**
 * Space Manager - Unified Architecture for Physics Spaces
 *
 * A Space represents a complete physics exploration session containing:
 * - Single scene data (objects, physics properties)
 * - Dedicated chat history (conversations with AI)
 * - Settings and preferences
 * - Metadata (creation date, tags, etc.)
 */

class Space {
  constructor(id, name = 'New Space') {
    this.id = id;
    this.name = name;

    // Single scene per space
    this.scene = this.createDefaultScene();

    // Dedicated chat for this space
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

  // Update the scene
  updateScene(updates) {
    // Replace the entire scene object to trigger React re-renders
    this.scene = { ...this.scene, ...updates };
    this.metadata.updatedAt = new Date().toISOString();
    return this;
  }

  // Replace the entire scene
  replaceScene(newScene) {
    this.scene = { ...newScene };
    this.metadata.updatedAt = new Date().toISOString();
    return this;
  }

  // Add chat message
  addMessage(message) {
    this.chat.messages.push({
      ...message,
      timestamp: new Date().toISOString(),
      spaceId: this.id
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

  // Check if space has unsaved changes
  hasUnsavedChanges() {
    return true; // Always assume changes for auto-save
  }

  // Export for saving
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      scene: this.scene,
      chat: this.chat,
      settings: this.settings,
      metadata: this.metadata
    };
  }

  // Import from saved data
  static fromJSON(data) {
    const space = new Space(data.id, data.name);

    // Copy properties
    space.scene = data.scene || space.scene;
    space.chat = data.chat || { messages: [] };
    space.settings = data.settings || {
      uiMode: 'simple',
      showVectors: false,
      vectorScale: 1.5,
      autoSave: true
    };
    space.metadata = data.metadata || {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return space;
  }
}

class SpaceManager {
  constructor(database) {
    this.database = database;
    this.currentSpace = null;
    this.spaces = new Map();
    this.listeners = new Set();
    this.isSessionOnly = true; // Default to session-only mode
  }

  // Create new space
  createSpace(name = 'New Space') {
    const id = `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const space = new Space(id, name);
    this.spaces.set(id, space);
    this.notifyListeners('spaceCreated', space);
    return space;
  }

  // Load space by ID
  async loadSpace(id) {
    try {
      // Try to load from database first
      const data = await this.database.getSpace?.(id);
      if (data) {
        const space = Space.fromJSON(data);
        this.spaces.set(id, space);
        this.setCurrentSpace(space);
        return space;
      }

      // Fallback: try to migrate from old workspace format
      const space = await this.migrateFromWorkspace(id);
      if (space) {
        this.spaces.set(id, space);
        this.setCurrentSpace(space);
        return space;
      }

      throw new Error(`Space ${id} not found`);
    } catch (error) {
      console.error('Failed to load space:', error);
      throw error;
    }
  }

  // Migrate from legacy workspace format
  async migrateFromWorkspace(spaceId) {
    try {
      const workspace = await this.database.getWorkspace(spaceId);
      if (!workspace) return null;

      const space = new Space(spaceId, workspace.name);
      // Use the current scene from workspace, or first scene
      space.scene = workspace.scenes?.[workspace.currentSceneIndex] || workspace.scene || space.scene;
      space.chat = workspace.chat || { messages: [] };
      space.settings = workspace.settings || space.settings;
      space.metadata = workspace.metadata || space.metadata;

      // Migrate scene-chat links to space structure
      if (workspace.sceneChatLinks) {
        const sceneChatLinks = new Map(Object.entries(workspace.sceneChatLinks));
        const chatId = sceneChatLinks.get(space.scene.id);
        if (chatId) {
          const chat = await this.database.getChatById(chatId);
          if (chat) space.chat = chat;
        }
      }

      return space;
    } catch (error) {
      return null;
    }
  }

  // Get all spaces
  async getSpaces() {
    try {
      const savedSpaces = await this.database.getSpaces?.() || [];
      return savedSpaces.map(data => Space.fromJSON(data));
    } catch (error) {
      console.error('Failed to get spaces:', error);
      return Array.from(this.spaces.values());
    }
  }

  // Save current space
  async saveCurrentSpace() {
    if (!this.currentSpace) return;

    try {
      await this.database.saveSpace?.(this.currentSpace.toJSON());
      this.notifyListeners('spaceSaved', this.currentSpace);
    } catch (error) {
      console.error('Failed to save space:', error);
      throw error;
    }
  }

  // Save specific space
  async saveSpace(space) {
    if (!space) return;

    try {
      await this.database.saveSpace?.(space.toJSON());
      this.notifyListeners('spaceSaved', space);
    } catch (error) {
      console.error('Failed to save space:', error);
      throw error;
    }
  }

  // Delete space
  async deleteSpace(id) {
    this.spaces.delete(id);
    await this.database.deleteSpace?.(id);
    this.notifyListeners('spaceDeleted', id);
  }

  // Set current space
  setCurrentSpace(space) {
    this.currentSpace = space;
    this.notifyListeners('currentSpaceChanged', space);
  }

  // Get current space
  getCurrentSpace() {
    return this.currentSpace;
  }

  // Update current space
  updateCurrentSpace(updater, silent = false) {
    if (!this.currentSpace) return;

    if (typeof updater === 'function') {
      updater(this.currentSpace);
    } else {
      Object.assign(this.currentSpace, updater);
    }

    this.currentSpace.metadata.updatedAt = new Date().toISOString();

    // Only notify listeners if not silent
    if (!silent) {
      this.notifyListeners('spaceUpdated', this.currentSpace);
    }
  }

  // Create and switch to new space
  createAndSwitchToSpace(name) {
    const space = this.createSpace(name);
    this.setCurrentSpace(space);
    return space;
  }

  // Duplicate current space
  duplicateCurrentSpace(newName = null) {
    if (!this.currentSpace) return null;

    const spaceData = this.currentSpace.toJSON();
    const newSpace = new Space(
      `space-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      newName || `${spaceData.name} (Copy)`
    );

    // Deep copy scene and chat
    newSpace.scene = JSON.parse(JSON.stringify(spaceData.scene));
    newSpace.scene.id = `scene-${Date.now()}`; // New ID for scene
    newSpace.chat = { messages: [] }; // Start with empty chat for new space
    newSpace.settings = { ...spaceData.settings };

    this.spaces.set(newSpace.id, newSpace);
    this.setCurrentSpace(newSpace);
    this.notifyListeners('spaceDuplicated', newSpace);

    return newSpace;
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
        console.error('Space listener error:', error);
      }
    });
  }

  // Auto-save functionality
  startAutoSave(intervalMs = 30000) {
    this.autoSaveInterval = setInterval(() => {
      if (this.currentSpace?.settings?.autoSave && this.currentSpace.hasUnsavedChanges()) {
        this.saveCurrentSpace().catch(error => {
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

  // Initialize with default space
  initialize() {
    if (!this.currentSpace) {
      const defaultSpace = this.createSpace('Default Space');
      this.setCurrentSpace(defaultSpace);
      console.log('Initialized default space');
    }
  }
}

export { Space, SpaceManager };
