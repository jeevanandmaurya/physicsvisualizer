/**
 * PhysicsDataStore - High-performance data store that bypasses React
 * Separates physics data collection from UI rendering
 * Uses event-driven architecture for selective updates
 */

interface PhysicsSnapshot {
  velocities: Record<string, number[]>;
  positions: Record<string, number[]>;
  timestamp: number;
}

interface HistoryPoint {
  t: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

type DataListener = (data: PhysicsSnapshot) => void;
type HistoryListener = (history: Record<string, HistoryPoint[]>) => void;

class PhysicsDataStore {
  // High-frequency data (updated every frame) - NO REACT STATE
  private velocities: Record<string, number[]> = {};
  private positions: Record<string, number[]> = {};
  private history: Record<string, HistoryPoint[]> = {};
  private lastRecordTime: Record<string, number> = {};
  
  // Listeners for selective updates
  private dataListeners: Set<DataListener> = new Set();
  private historyListeners: Set<HistoryListener> = new Set();
  
  // Throttling
  private lastDataNotification: number = 0;
  private lastHistoryNotification: number = 0;
  private dataThrottleMs: number = 100; // Update UI max 10 times/sec
  private historyThrottleMs: number = 500; // Update graphs max 2 times/sec
  
  // Configuration
  private maxHistoryPoints: number = 2000;
  private dataTimeStep: number = 0.016; // 60 FPS

  /**
   * Update physics data (called every frame from physics engine)
   * This is HOT PATH - must be fast!
   */
  updatePhysicsData(objectId: string, velocity: number[], position: number[], time: number) {
    // Update current state (fast, no allocation)
    this.velocities[objectId] = velocity;
    this.positions[objectId] = position;

    // Record history if enough time has passed
    const lastRecord = this.lastRecordTime[objectId] || 0;
    if (time - lastRecord >= this.dataTimeStep) {
      if (!this.history[objectId]) {
        this.history[objectId] = [];
      }
      
      const hist = this.history[objectId];
      hist.push({
        t: time,
        x: position[0],
        y: position[1],
        z: position[2],
        vx: velocity[0],
        vy: velocity[1],
        vz: velocity[2]
      });

      this.lastRecordTime[objectId] = time;

      // Limit history size
      if (hist.length > this.maxHistoryPoints) {
        hist.shift(); // Remove oldest
      }

      // Notify history listeners (throttled)
      this.notifyHistoryListeners();
    }

    // Notify data listeners (throttled)
    this.notifyDataListeners();
  }

  /**
   * Batch update multiple objects (more efficient)
   */
  batchUpdate(data: Record<string, { velocity: number[]; position: number[]; time: number }>) {
    Object.entries(data).forEach(([id, info]) => {
      this.updatePhysicsData(id, info.velocity, info.position, info.time);
    });
  }

  /**
   * Get current snapshot (synchronous, no React)
   */
  getSnapshot(): PhysicsSnapshot {
    return {
      velocities: { ...this.velocities },
      positions: { ...this.positions },
      timestamp: performance.now()
    };
  }

  /**
   * Get object history (synchronous)
   */
  getHistory(objectId?: string): Record<string, HistoryPoint[]> | HistoryPoint[] {
    if (objectId) {
      return this.history[objectId] || [];
    }
    return { ...this.history };
  }

  /**
   * Subscribe to data updates (for real-time UI)
   */
  subscribeToData(listener: DataListener): () => void {
    this.dataListeners.add(listener);
    // Return unsubscribe function
    return () => this.dataListeners.delete(listener);
  }

  /**
   * Subscribe to history updates (for graphs)
   */
  subscribeToHistory(listener: HistoryListener): () => void {
    this.historyListeners.add(listener);
    return () => this.historyListeners.delete(listener);
  }

  /**
   * Notify data listeners (throttled)
   */
  private notifyDataListeners() {
    const now = performance.now();
    if (now - this.lastDataNotification < this.dataThrottleMs) {
      return; // Throttle
    }

    this.lastDataNotification = now;
    const snapshot = this.getSnapshot();
    
    // Use requestIdleCallback for non-critical updates
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.dataListeners.forEach(listener => listener(snapshot));
      });
    } else {
      // Fallback
      this.dataListeners.forEach(listener => listener(snapshot));
    }
  }

  /**
   * Notify history listeners (throttled)
   */
  private notifyHistoryListeners() {
    const now = performance.now();
    if (now - this.lastHistoryNotification < this.historyThrottleMs) {
      return; // Throttle
    }

    this.lastHistoryNotification = now;
    const history = { ...this.history };
    
    // Use requestIdleCallback for graph updates
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.historyListeners.forEach(listener => listener(history));
      });
    } else {
      this.historyListeners.forEach(listener => listener(history));
    }
  }

  /**
   * Clear all data (on scene reset)
   */
  clear() {
    this.velocities = {};
    this.positions = {};
    this.history = {};
    this.lastRecordTime = {};
    this.lastDataNotification = 0;
    this.lastHistoryNotification = 0;
  }

  /**
   * Configure update rates
   */
  setUpdateRates(dataThrottleMs?: number, historyThrottleMs?: number, dataTimeStep?: number) {
    if (dataThrottleMs !== undefined) this.dataThrottleMs = dataThrottleMs;
    if (historyThrottleMs !== undefined) this.historyThrottleMs = historyThrottleMs;
    if (dataTimeStep !== undefined) this.dataTimeStep = dataTimeStep;
  }

  /**
   * Get current object IDs
   */
  getObjectIds(): string[] {
    return Object.keys(this.velocities);
  }

  /**
   * Check if object exists
   */
  hasObject(objectId: string): boolean {
    return objectId in this.velocities;
  }
}

// Global singleton instance
export const physicsDataStore = new PhysicsDataStore();

export default PhysicsDataStore;
