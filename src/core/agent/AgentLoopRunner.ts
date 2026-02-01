import { codeExecutor } from '../sandbox/execution/CodeExecutor';

export type AgentLoopInputState = {
  keysDown?: Record<string, boolean>;
};

export type AgentLoopPlayerState = {
  position?: [number, number, number];
};

export type AgentLoopTickContext = {
  time: number;
  dt: number;
  input: AgentLoopInputState;
  player: AgentLoopPlayerState;
};

export type AgentLoopTickResult = {
  state?: unknown;
  objects?: any[];
  addObjects?: any[];
  patches?: any[];
  removeObjectIds?: string[];
  forces?: Record<string, [number, number, number]>;
  impulses?: Record<string, [number, number, number]>;
};

export type AgentLoopConfig = {
  enabled?: boolean;
  code?: string;
  tickHz?: number;
  timeoutMs?: number;
  debug?: boolean;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export class AgentLoopRunner {
  private state: unknown = undefined;
  private busy = false;
  private lastTickAt = 0;
  private lastCode: string | null = null;
  private lastDebugLogAtMs = 0;
  private lastErrorLogAtMs = 0;

  reset(): void {
    this.state = undefined;
    this.busy = false;
    this.lastTickAt = 0;
    this.lastCode = null;
    this.lastDebugLogAtMs = 0;
    this.lastErrorLogAtMs = 0;
  }

  get isBusy(): boolean {
    return this.busy;
  }

  /**
   * Execute one tick of a user-provided jsLoop.
   *
   * Contract: user code must define `function jsLoop(ctx, state) { ... }` and return a JSON-serializable object:
   *   { state, objects/addObjects, patches, removeObjectIds }
   */
  async tick(options: {
    config: AgentLoopConfig;
    scene: any;
    ctx: AgentLoopTickContext;
  }): Promise<AgentLoopTickResult | null> {
    const code = options.config.code || '';
    const enabled = options.config.enabled !== false;
    const tickHz = Math.max(1, options.config.tickHz || 10);
    const timeoutMs = Math.max(50, options.config.timeoutMs || 200);
    const debug = options.config.debug === true;

    if (!enabled || !code.trim()) return null;

    // Reset internal state when code changes.
    if (this.lastCode !== code) {
      this.state = undefined;
      this.lastCode = code;
      this.lastTickAt = 0;

      if (debug) {
        console.log('[jsLoop] code changed/reset');
      }
    }

    const now = options.ctx.time;
    const minInterval = 1 / tickHz;
    if (now - this.lastTickAt < minInterval) return null;
    if (this.busy) return null;

    this.busy = true;
    this.lastTickAt = now;

    try {
      const wrapped = `
${code}

if (typeof jsLoop !== 'function') {
  throw new Error('AgentLoop: expected a function named jsLoop(ctx, state)');
}

return jsLoop({
  time: params.ctx?.time,
  dt: params.ctx?.dt,
  input: params.ctx?.input,
  player: params.ctx?.player,
  scene,
}, params.state);
`;

      const exec = await codeExecutor.executeCode(
        wrapped,
        {
          scene: options.scene,
          params: {
            ctx: options.ctx,
            state: this.state,
          },
          time: options.ctx.time,
          dt: options.ctx.dt,
          input: options.ctx.input,
          player: options.ctx.player,
        },
        {
          returnType: 'value',
          timeout: timeoutMs,
          allowSceneModification: false,
        }
      );

      if (debug) {
        const nowMs = Date.now();
        if (nowMs - this.lastDebugLogAtMs > 1000) {
          const pos = options.ctx.player?.position;
          const posStr = Array.isArray(pos) ? pos.map(v => (typeof v === 'number' ? v.toFixed(2) : String(v))).join(',') : '';
          console.log(`[jsLoop] tick t=${options.ctx.time.toFixed(2)} dt=${options.ctx.dt.toFixed(3)} pos=[${posStr}]`);
          this.lastDebugLogAtMs = nowMs;
        }
      }

      if (!exec.success) {
        if (debug) {
          const nowMs = Date.now();
          if (nowMs - this.lastErrorLogAtMs > 500) {
            console.warn('[jsLoop] execution failed:', exec.error);
            this.lastErrorLogAtMs = nowMs;
          }
        }
        return null;
      }

      if (debug && Array.isArray(exec.data?.console) && exec.data.console.length > 0) {
        const nowMs = Date.now();
        if (nowMs - this.lastDebugLogAtMs > 250) {
          console.log('[jsLoop] sandbox console:', exec.data.console);
          this.lastDebugLogAtMs = nowMs;
        }
      }

      const result = exec.data?.result;
      if (!isObject(result)) {
        if (debug) {
          console.log('[jsLoop] returned non-object:', result);
        }
        return null;
      }

      const tickResult: AgentLoopTickResult = result as AgentLoopTickResult;
      if ('state' in tickResult) {
        this.state = tickResult.state;
      }

      const hasChanges =
        (Array.isArray(tickResult.objects) && tickResult.objects.length > 0) ||
        (Array.isArray(tickResult.addObjects) && tickResult.addObjects.length > 0) ||
        (Array.isArray(tickResult.patches) && tickResult.patches.length > 0) ||
        (Array.isArray(tickResult.removeObjectIds) && tickResult.removeObjectIds.length > 0);

      if (debug && hasChanges) {
        const addCount = (Array.isArray(tickResult.addObjects) ? tickResult.addObjects.length : 0) +
          (Array.isArray(tickResult.objects) ? tickResult.objects.length : 0);
        const removeCount = Array.isArray(tickResult.removeObjectIds) ? tickResult.removeObjectIds.length : 0;
        const patchCount = Array.isArray(tickResult.patches) ? tickResult.patches.length : 0;
        console.log(`[jsLoop] changes: +${addCount} -${removeCount} patches=${patchCount}`);
      }

      return hasChanges ? tickResult : null;
    } finally {
      this.busy = false;
    }
  }
}
