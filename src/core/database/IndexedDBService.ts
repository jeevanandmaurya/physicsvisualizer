/**
 * IndexedDB Service for Physics Visualizer
 * Handles persistent storage of chat containers, scenes, and related data
 */

export interface DBSchema {
  chatContainers: any;
  userScenes: any;
  chatHistory: any;
  workspace: any;
}

class IndexedDBServiceClass {
  private dbName = 'PhysicsVisualizerDB';
  private dbVersion = 2;
  private db: IDBDatabase | null = null;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('IndexedDB failed to open', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('chatContainers')) {
          const containerStore = db.createObjectStore('chatContainers', { keyPath: 'id' });
          containerStore.createIndex('sceneId', 'sceneContainer.sceneId', { unique: false });
          containerStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('userScenes')) {
          const sceneStore = db.createObjectStore('userScenes', { keyPath: 'id' });
          sceneStore.createIndex('name', 'name', { unique: false });
          sceneStore.createIndex('createdAt', 'createdAt', { unique: false });
          sceneStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('chatHistory')) {
          const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id' });
          chatStore.createIndex('sceneId', 'sceneId', { unique: false });
          chatStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('workspace')) {
          db.createObjectStore('workspace', { keyPath: 'id' });
        }

        console.log('IndexedDB object stores created');
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize IndexedDB');
    }
    return this.db;
  }

  /**
   * Generic get operation
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic get all operation
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic put operation (add or update)
   */
  async put<T>(storeName: string, data: T): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Generic delete operation
   */
  async delete(storeName: string, key: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get items by index
   */
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear a store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Count items in a store
   */
  async count(storeName: string): Promise<number> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ==================== Chat Container Methods ====================

  async getChatContainer(id: string) {
    return this.get('chatContainers', id);
  }

  async getAllChatContainers() {
    return this.getAll('chatContainers');
  }

  async saveChatContainer(container: any) {
    await this.put('chatContainers', container);
    return container.id;
  }

  async deleteChatContainer(id: string) {
    await this.delete('chatContainers', id);
  }

  async getChatContainersBySceneId(sceneId: string) {
    return this.getByIndex('chatContainers', 'sceneId', sceneId);
  }

  // ==================== User Scene Methods ====================

  async getUserScene(id: string) {
    return this.get('userScenes', id);
  }

  async getAllUserScenes() {
    return this.getAll('userScenes');
  }

  async saveUserScene(scene: any) {
    await this.put('userScenes', scene);
    return scene.id;
  }

  async deleteUserScene(id: string) {
    await this.delete('userScenes', id);
  }

  // ==================== Chat History Methods ====================

  async getChatHistory() {
    return this.getAll('chatHistory');
  }

  async saveChat(chat: any) {
    await this.put('chatHistory', chat);
    return chat.id;
  }

  async deleteChat(id: string) {
    await this.delete('chatHistory', id);
  }

  async getChatsBySceneId(sceneId: string) {
    return this.getByIndex('chatHistory', 'sceneId', sceneId);
  }

  // ==================== Workspace Methods ====================

  async getWorkspace(id: string = 'default') {
    return this.get('workspace', id);
  }

  async saveWorkspace(workspace: any) {
    await this.put('workspace', workspace);
    return workspace.id;
  }

  // ==================== Migration Methods ====================

  /**
   * Migrate data from localStorage to IndexedDB
   */
  async migrateFromLocalStorage(): Promise<void> {
    try {
      console.log('Starting migration from localStorage to IndexedDB...');

      // Check if migration has already been done
      const migrationFlag = localStorage.getItem('indexedDBMigrationComplete');
      if (migrationFlag === 'true') {
        console.log('Migration already completed, skipping...');
        return;
      }

      // Migrate chat containers
      const containersJson = localStorage.getItem('physicsVisualizerChatContainers');
      if (containersJson) {
        const containers = JSON.parse(containersJson);
        for (const container of containers) {
          await this.saveChatContainer(container);
        }
        console.log(`Migrated ${containers.length} chat containers`);
      }

      // Migrate user scenes
      const scenesJson = localStorage.getItem('physicsVisualizerScenes');
      if (scenesJson) {
        const scenes = JSON.parse(scenesJson);
        for (const scene of scenes) {
          await this.saveUserScene(scene);
        }
        console.log(`Migrated ${scenes.length} user scenes`);
      }

      // Migrate chat history
      const chatHistoryJson = localStorage.getItem('physicsVisualizerChatHistory');
      if (chatHistoryJson) {
        const chats = JSON.parse(chatHistoryJson);
        for (const chat of chats) {
          await this.saveChat(chat);
        }
        console.log(`Migrated ${chats.length} chats`);
      }

      // Migrate workspace
      const workspaceJson = localStorage.getItem('physicsVisualizerWorkspace');
      if (workspaceJson) {
        const workspace = JSON.parse(workspaceJson);
        await this.saveWorkspace(workspace);
        console.log('Migrated workspace data');
      }

      // Mark migration as complete
      localStorage.setItem('indexedDBMigrationComplete', 'true');
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Error during migration:', error);
      throw error;
    }
  }

  /**
   * Export all data as JSON (for backup)
   */
  async exportAllData(): Promise<string> {
    const data = {
      chatContainers: await this.getAllChatContainers(),
      userScenes: await this.getAllUserScenes(),
      chatHistory: await this.getChatHistory(),
      workspace: await this.getWorkspace(),
      exportDate: new Date().toISOString(),
      version: this.dbVersion
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON (for restore)
   */
  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);

      // Import chat containers
      if (data.chatContainers) {
        for (const container of data.chatContainers) {
          await this.saveChatContainer(container);
        }
      }

      // Import user scenes
      if (data.userScenes) {
        for (const scene of data.userScenes) {
          await this.saveUserScene(scene);
        }
      }

      // Import chat history
      if (data.chatHistory) {
        for (const chat of data.chatHistory) {
          await this.saveChat(chat);
        }
      }

      // Import workspace
      if (data.workspace) {
        await this.saveWorkspace(data.workspace);
      }

      console.log('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Clear all data (use with caution!)
   */
  async clearAllData(): Promise<void> {
    await this.clear('chatContainers');
    await this.clear('userScenes');
    await this.clear('chatHistory');
    await this.clear('workspace');
    console.log('All data cleared');
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    chatContainers: number;
    userScenes: number;
    chatHistory: number;
  }> {
    return {
      chatContainers: await this.count('chatContainers'),
      userScenes: await this.count('userScenes'),
      chatHistory: await this.count('chatHistory')
    };
  }
}

// Export singleton instance
export const IndexedDBService = new IndexedDBServiceClass();

// Initialize on module load
IndexedDBService.init().catch(error => {
  console.error('Failed to initialize IndexedDB:', error);
});
