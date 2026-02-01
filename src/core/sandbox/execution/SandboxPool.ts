/**
 * SandboxPool - Pool of pre-warmed workers for instant execution
 * Manages worker lifecycle and load balancing
 */

import { WorkerSandbox } from './WorkerSandbox';
import { SandboxRequest, SandboxResponse, SandboxConfig } from '../shared/types';

const DEFAULT_CONFIG: SandboxConfig = {
  maxWorkers: 8,
  warmPoolSize: 4,  // More workers for parallel thumbnail loading
  defaultTimeout: 5000,
  maxMemory: 50 * 1024 * 1024, // 50MB
  useSharedMemory: true,
};

interface PooledWorker {
  sandbox: WorkerSandbox;
  busy: boolean;
  lastUsed: number;
  executionCount: number;
  id: string;
}

export class SandboxPool {
  private workers: PooledWorker[] = [];
  private config: SandboxConfig;
  private requestQueue: Array<{
    request: SandboxRequest;
    resolve: (value: SandboxResponse) => void;
    reject: (error: Error) => void;
  }> = [];
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(config: Partial<SandboxConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize pool with warm workers
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    console.log(`🔥 Warming up sandbox pool with ${this.config.warmPoolSize} workers...`);
    const startTime = performance.now();

    const promises: Promise<void>[] = [];

    for (let i = 0; i < this.config.warmPoolSize; i++) {
      promises.push(this.spawnWorker());
    }

    await Promise.all(promises);

    this.initialized = true;
    console.log(`✅ Sandbox pool ready in ${(performance.now() - startTime).toFixed(1)}ms`);
  }

  private async spawnWorker(): Promise<void> {
    const sandbox = new WorkerSandbox();
    await sandbox.waitForReady();

    const worker: PooledWorker = {
      sandbox,
      busy: false,
      lastUsed: Date.now(),
      executionCount: 0,
      id: `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.workers.push(worker);
  }

  /**
   * Get an available worker, spawning new one if needed
   */
  private async getAvailableWorker(): Promise<PooledWorker> {
    // First, try to find an idle worker
    let worker = this.workers.find((w) => !w.busy);

    if (!worker) {
      // No idle workers, spawn new one if under limit
      if (this.workers.length < this.config.maxWorkers) {
        await this.spawnWorker();
        worker = this.workers[this.workers.length - 1];
      } else {
        // All workers busy, wait for one to become available
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            const available = this.workers.find((w) => !w.busy);
            if (available) {
              clearInterval(checkInterval);
              resolve(available);
            }
          }, 1);
        });
      }
    }

    return worker!;
  }

  /**
   * Execute code using pool
   */
  async execute(request: SandboxRequest): Promise<SandboxResponse> {
    await this.initialize();

    const worker = await this.getAvailableWorker();
    worker.busy = true;
    worker.executionCount++;

    try {
      const response = await worker.sandbox.execute(request);
      return response;
    } finally {
      worker.busy = false;
      worker.lastUsed = Date.now();
      this.processQueue();
    }
  }

  /**
   * Execute batch of requests in parallel
   */
  async executeBatch(requests: SandboxRequest[]): Promise<SandboxResponse[]> {
    await this.initialize();

    // Distribute requests across available workers
    const chunkSize = Math.ceil(requests.length / this.workers.length);

    const promises = this.workers.map(async (worker, index) => {
      const start = index * chunkSize;
      const chunk = requests.slice(start, start + chunkSize);

      if (chunk.length === 0) return [];

      worker.busy = true;
      try {
        return await worker.sandbox.executeBatch(chunk);
      } finally {
        worker.busy = false;
        worker.lastUsed = Date.now();
      }
    });

    const chunkResults = await Promise.all(promises);
    return chunkResults.flat();
  }

  /**
   * Queue a request if all workers are busy
   */
  private processQueue(): void {
    if (this.requestQueue.length === 0) return;

    const availableWorker = this.workers.find((w) => !w.busy);
    if (!availableWorker) return;

    const { request, resolve, reject } = this.requestQueue.shift()!;

    this.execute(request).then(resolve).catch(reject);
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    totalWorkers: number;
    busyWorkers: number;
    idleWorkers: number;
    queueLength: number;
    totalExecutions: number;
  } {
    const busyCount = this.workers.filter((w) => w.busy).length;
    const totalExecutions = this.workers.reduce((sum, w) => sum + w.executionCount, 0);

    return {
      totalWorkers: this.workers.length,
      busyWorkers: busyCount,
      idleWorkers: this.workers.length - busyCount,
      queueLength: this.requestQueue.length,
      totalExecutions,
    };
  }

  /**
   * Cleanup idle workers
   */
  cleanup(maxIdleTime: number = 60000): void {
    const now = Date.now();

    this.workers = this.workers.filter((worker) => {
      if (!worker.busy && now - worker.lastUsed > maxIdleTime) {
        // Keep at least warmPoolSize workers
        if (this.workers.length > this.config.warmPoolSize) {
          worker.sandbox.terminate();
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Terminate all workers
   */
  terminate(): void {
    for (const worker of this.workers) {
      worker.sandbox.terminate();
    }
    this.workers = [];
    this.requestQueue = [];
    this.initialized = false;
    this.initPromise = null;
  }
}

// Singleton pool instance
export const sandboxPool = new SandboxPool();
