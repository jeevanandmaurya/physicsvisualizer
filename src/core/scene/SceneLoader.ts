/**
 * SceneLoader - Dynamically loads scene examples from the scenes folder structure
 * 
 * Structure:
 * scenes/
 *   └── scene_name/
 *       ├── scene_name_v1.0.json    (scene structure - main)
 *       ├── context.txt              (details, theory, explanation, facts)
 *       └── thumbnail.svg            (visual representation, can be auto-generated)
 */

export interface SceneMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  folderName: string;
}

export interface SceneContext {
  theory?: string;
  explanation?: string;
  facts?: string[];
  details?: string;
}

export interface LoadedScene {
  id: string;
  name: string;
  description: string;
  version: string;
  objects: any[];
  gravity?: number[];
  hasGround?: boolean;
  contactMaterial?: any;
  gravitationalPhysics?: any;
  simulationScale?: string;
  controllers?: any[];
  constraints?: any[];
  forces?: any[];
  settings?: any;
  camera?: any;
  context?: SceneContext;
  thumbnail?: string; // URL or data URI for the thumbnail
  folderName?: string;
}

/**
 * SceneLoader class - Handles loading scenes from the file system
 */
class SceneLoaderClass {
  private cachedScenes: LoadedScene[] | null = null;
  private sceneMap: Map<string, LoadedScene> = new Map();

  /**
   * Get all available scenes from the scenes folder
   */
  async getAllScenes(): Promise<LoadedScene[]> {
    if (this.cachedScenes) {
      return this.cachedScenes;
    }

    try {
      // List of scene folders to load
      const sceneFolders = await this.getSceneFolders();
      
      const scenes: LoadedScene[] = [];
      
      for (const folderName of sceneFolders) {
        try {
          const scene = await this.loadScene(folderName);
          if (scene) {
            scenes.push(scene);
            this.sceneMap.set(scene.id, scene);
          }
        } catch (error) {
          console.error(`Error loading scene from ${folderName}:`, error);
        }
      }

      this.cachedScenes = scenes;
      return scenes;
    } catch (error) {
      console.error('Error getting all scenes:', error);
      return [];
    }
  }

  /**
   * Get a specific scene by ID
   */
  async getSceneById(sceneId: string): Promise<LoadedScene | null> {
    // Check cache first
    if (this.sceneMap.has(sceneId)) {
      return this.sceneMap.get(sceneId)!;
    }

    // Load all scenes if not cached
    await this.getAllScenes();
    
    return this.sceneMap.get(sceneId) || null;
  }

  /**
   * Get list of scene folders from the scenes directory
   */
  private async getSceneFolders(): Promise<string[]> {
    try {
      // Load the manifest file that lists all available scenes
      const response = await fetch('/scenes/manifest.json');
      if (!response.ok) {
        console.error('Could not load scenes manifest');
        return [];
      }
      
      const manifest = await response.json();
      
      // Filter to only enabled scenes
      return manifest.scenes
        .filter((scene: any) => scene.enabled !== false)
        .map((scene: any) => scene.folderName);
    } catch (error) {
      console.error('Error loading scenes manifest:', error);
      return [];
    }
  }

  /**
   * Load a scene from its folder
   */
  private async loadScene(folderName: string): Promise<LoadedScene | null> {
    try {
      // Find the JSON file (should match pattern: folderName_v*.json)
      const sceneData = await this.loadSceneJSON(folderName);
      if (!sceneData) {
        console.warn(`No scene JSON found for ${folderName}`);
        return null;
      }

      // Load context if available
      const context = await this.loadContext(folderName);

      // Load thumbnail if available
      const thumbnail = await this.loadThumbnail(folderName);

      // Merge all data
      const loadedScene: LoadedScene = {
        ...sceneData,
        context,
        thumbnail,
        folderName,
        id: sceneData.id || folderName,
        name: sceneData.name || this.formatName(folderName),
        description: sceneData.description || context?.explanation || '',
        version: this.extractVersion(folderName, sceneData)
      };

      return loadedScene;
    } catch (error) {
      console.error(`Error loading scene ${folderName}:`, error);
      return null;
    }
  }

  /**
   * Load the scene JSON file
   */
  private async loadSceneJSON(folderName: string): Promise<any | null> {
    try {
      // Try to load the JSON file using fetch from public folder
      const response = await fetch(`/scenes/${folderName}/${folderName}_v1.0.json`);
      if (!response.ok) {
        console.warn(`Could not load JSON for ${folderName}: ${response.statusText}`);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.warn(`Could not load JSON for ${folderName}:`, error);
      return null;
    }
  }

  /**
   * Load the context.txt file
   */
  private async loadContext(folderName: string): Promise<SceneContext | undefined> {
    try {
      // Dynamically import the context file
      const response = await fetch(`/scenes/${folderName}/context.txt`);
      if (!response.ok) {
        return undefined;
      }
      
      const text = await response.text();
      
      // Parse the context text into structured data
      return this.parseContextText(text);
    } catch (error) {
      console.warn(`Could not load context for ${folderName}:`, error);
      return undefined;
    }
  }

  /**
   * Parse context.txt into structured data
   */
  private parseContextText(text: string): SceneContext {
    const context: SceneContext = {
      details: text
    };

    // Try to extract structured sections if they exist
    const theoryMatch = text.match(/Theory:([\s\S]*?)(?=\n\n|Explanation:|Facts:|$)/i);
    const explanationMatch = text.match(/Explanation:([\s\S]*?)(?=\n\n|Theory:|Facts:|$)/i);
    const factsMatch = text.match(/Facts:([\s\S]*?)(?=\n\n|Theory:|Explanation:|$)/i);

    if (theoryMatch) context.theory = theoryMatch[1].trim();
    if (explanationMatch) context.explanation = explanationMatch[1].trim();
    if (factsMatch) {
      context.facts = factsMatch[1]
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, ''));
    }

    return context;
  }

  /**
   * Load the thumbnail.svg file
   */
  private async loadThumbnail(folderName: string): Promise<string | undefined> {
    try {
      // Try to load the SVG file
      const response = await fetch(`/scenes/${folderName}/thumbnail.svg`);
      if (response.ok) {
        return `/scenes/${folderName}/thumbnail.svg`;
      }
      
      // If no thumbnail exists, generate a default one
      return this.generateDefaultThumbnail(folderName);
    } catch (error) {
      console.warn(`Could not load thumbnail for ${folderName}:`, error);
      return this.generateDefaultThumbnail(folderName);
    }
  }

  /**
   * Generate a default SVG thumbnail
   */
  private generateDefaultThumbnail(folderName: string): string {
    const name = this.formatName(folderName);
    const initials = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const svg = `
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="150" fill="#4a5568"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#fff" font-size="48" font-family="Arial">${initials}</text>
        <text x="50%" y="85%" text-anchor="middle" fill="#e2e8f0" font-size="12" font-family="Arial">${name}</text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Format folder name to human-readable name
   */
  private formatName(folderName: string): string {
    return folderName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Extract version from filename or scene data
   */
  private extractVersion(folderName: string, sceneData: any): string {
    if (sceneData.version) return sceneData.version;
    
    // Extract from filename pattern
    const match = folderName.match(/v(\d+\.\d+)/);
    return match ? match[1] : '1.0';
  }

  /**
   * Clear the cache - useful for development or when scenes are updated
   */
  clearCache(): void {
    this.cachedScenes = null;
    this.sceneMap.clear();
  }

  /**
   * Reload scenes from the file system
   */
  async reload(): Promise<LoadedScene[]> {
    this.clearCache();
    return this.getAllScenes();
  }
}

// Export singleton instance
export const SceneLoader = new SceneLoaderClass();
