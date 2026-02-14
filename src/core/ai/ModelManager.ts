/**
 * ModelManager - Handles model selection and API communication
 * 
 * Responsibilities:
 * - Model configuration and selection
 * - API request/response handling  
 * - Error handling and retries
 * - Token usage tracking
 * 
 * Does NOT handle:
 * - Response parsing (use Agent's ResponseParser)
 * - Planning/thinking (use Agent's Thinker)
 * - Execution (use Agent's ActionExecutor)
 */

import type { ModelConfig, ModelResponse, ModelError } from './types';

// Import prompts
import agentPromptRaw from './prompts/agentPrompt.txt?raw';

export class ModelManager {
  private config: ModelConfig;
  private isInitialized: boolean = false;
  private prompt: string;

  constructor(config?: Partial<ModelConfig>) {
    // Default configuration - auto-detect based on available keys
    const hasNvidiaKey = !!import.meta.env.VITE_NVIDIA_API_KEY;
    const hasGeminiKey = !!import.meta.env.VITE_GEMINI_API_KEY;

    let provider: ModelConfig['provider'] = 'ollama';
    let model = import.meta.env.VITE_OLLAMA_MODEL || 'qwen2.5:3b-instruct';
    let apiKey = undefined;

    if (hasNvidiaKey) {
      provider = 'nvidia';
      model = 'z-ai/glm4.7'; // Updated to faster model
      apiKey = import.meta.env.VITE_NVIDIA_API_KEY;
    } else if (hasGeminiKey) {
      provider = 'gemini';
      model = 'gemini-3-flash-preview';
      apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    }

    this.config = {
      provider,
      model,
      apiKey,
      endpoint: import.meta.env.VITE_OLLAMA_ENDPOINT || 'http://localhost:11434/api/generate',
      maxTokens: 10000,
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      ...config
    };

    this.prompt = agentPromptRaw;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
    console.log(`✅ ModelManager initialized: Using ${this.config.provider} (${this.config.model})`);
  }

  /**
   * Get the system prompt
   */
  getSystemPrompt(): string {
    return this.prompt;
  }

  /**
   * Get current model configuration
   */
  getConfig(): ModelConfig {
    return { ...this.config };
  }

  /**
   * Update model configuration
   */
  setConfig(config: Partial<ModelConfig>): void {
    this.config = { ...this.config, ...config };
    console.log(`🔧 ModelManager config updated: ${this.config.provider} (${this.config.model})`);
  }

  /**
   * Send a prompt to the model and get raw response
   */
  async sendPrompt(userPrompt: string, context?: { chatHistory?: any[]; sceneContext?: string }): Promise<ModelResponse> {
    await this.initialize();

    // Build full prompt with system prompt and context
    const fullPrompt = this.buildPrompt(userPrompt, context);

    switch (this.config.provider) {
      case 'gemini':
        return this.callGemini(fullPrompt);
      case 'nvidia':
        return this.callNvidia(fullPrompt);
      case 'ollama':
        return this.callOllama(fullPrompt);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  /**
   * Build full prompt with system instructions and context
   */
  private buildPrompt(userPrompt: string, context?: { chatHistory?: any[]; sceneContext?: string }): string {
    const parts: string[] = [this.prompt];

    if (context?.chatHistory?.length) {
      const recentHistory = context.chatHistory.slice(-8);
      parts.push(`\nCHAT CONTEXT (recent):\n${JSON.stringify(recentHistory, null, 2)}`);
    }

    if (context?.sceneContext) {
      parts.push(`\n${context.sceneContext}`);
    }

    parts.push(`\nUSER MESSAGE: ${userPrompt}`);

    return parts.join('\n');
  }

  /**
   * Call Gemini API
   */
  private async callGemini(prompt: string, maxRetries = 3): Promise<ModelResponse> {
    if (!this.config.apiKey) {
      throw this.createError('NO_API_KEY', 'Gemini API key not configured', 401, false);
    }

    console.log('🚀 AI Request: Using Gemini');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: this.config.temperature,
                topK: this.config.topK,
                topP: this.config.topP,
                maxOutputTokens: this.config.maxTokens,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorText = await this.extractErrorText(response);
          const status = response.status;

          // Retry on transient errors
          if ((status >= 500 || status === 429) && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Gemini API error ${status}, retrying in ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }

          throw this.createError('API_ERROR', `Gemini API error: ${status} - ${errorText}`, status, status >= 500 || status === 429);
        }

        const data = await response.json();

        if (data.error) {
          throw this.createError('API_ERROR', data.error.message || 'Unknown error', 500, false);
        }

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const usage = data.usageMetadata ? {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0
        } : undefined;

        return { text, usage, model: this.config.model };

      } catch (error: any) {
        if (attempt === maxRetries) throw error;

        const msg = error?.message || String(error);
        if (!this.isRetryableError(msg)) throw error;

        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Transient error (attempt ${attempt}/${maxRetries}): ${msg}. Retrying...`);
        await this.sleep(delay);
      }
    }

    throw this.createError('MAX_RETRIES', 'Max retries exceeded', 500, false);
  }

  /**
   * Call Ollama API
   */
  private async callOllama(prompt: string): Promise<ModelResponse> {
    if (!this.config.endpoint) {
      throw this.createError('NO_ENDPOINT', 'Ollama endpoint not configured', 400, false);
    }

    console.log(`🤖 AI Request: Using Ollama (${this.config.model})`);

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        prompt,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No body');
      throw this.createError('API_ERROR', `Ollama API error: ${response.status} - ${errorText}`, response.status, false);
    }

    // Handle streaming response
    const raw = await this.readStreamingResponse(response);
    const text = this.parseOllamaResponse(raw);

    return { text, model: this.config.model };
  }

  /**
   * Call Nvidia API
   */
  private async callNvidia(prompt: string, maxRetries = 3): Promise<ModelResponse> {
    if (!this.config.apiKey) {
      throw this.createError('NO_API_KEY', 'Nvidia API key not configured', 401, false);
    }

    console.log('🚀 AI Request: Using Nvidia API');

    // Use relative path to avoid CORS (Vite proxy/Vercel handles it)
    const invokeUrl = "/api/nvidia/v1/chat/completions";

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(invokeUrl, {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            model: "z-ai/glm4.7", // Updated model
            messages: [{ role: "user", content: prompt }], // User wrapper
            max_tokens: 16384,
            temperature: 1.00,
            top_p: 1.00,
            stream: false, // Simple JSON mode
            extra_body: {
              chat_template_kwargs: {
                enable_thinking: false,
                clear_thinking: true
              }
            }
          })
        });

        if (!response.ok) {
          const errorText = await this.extractErrorText(response);
          const status = response.status;

          // Retry on transient errors
          if ((status >= 500 || status === 429) && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000;
            console.warn(`Nvidia API error ${status}, retrying in ${delay}ms...`);
            await this.sleep(delay);
            continue;
          }

          throw this.createError('API_ERROR', `Nvidia API error: ${status} - ${errorText}`, status, status >= 500 || status === 429);
        }

        const data = await response.json();

        // Nvidia/OpenAI compatible response structure
        const text = data.choices?.[0]?.message?.content || '';
        const usage = data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0
        } : undefined;

        return { text, usage, model: this.config.model };

      } catch (error: any) {
        if (attempt === maxRetries) throw error;

        const msg = error?.message || String(error);
        if (!this.isRetryableError(msg)) throw error;

        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Transient error (attempt ${attempt}/${maxRetries}): ${msg}. Retrying...`);
        await this.sleep(delay);
      }
    }
    throw this.createError('MAX_RETRIES', 'Max retries exceeded', 500, false);
  }

  /**
   * Read streaming response body
   */
  private async readStreamingResponse(response: Response): Promise<string> {
    if (!response.body) return response.text().catch(() => '');

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulated = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value, { stream: true });
    }

    return accumulated;
  }

  /**
   * Parse Ollama streaming response
   */
  private parseOllamaResponse(raw: string): string {
    if (!raw) return '';

    const lines = raw.split(/\r?\n/).filter(Boolean);
    let assembled = '';

    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.response) {
          assembled += typeof parsed.response === 'string' ? parsed.response : JSON.stringify(parsed.response);
        }
      } catch {
        assembled += line;
      }
    }

    return assembled || raw;
  }

  /**
   * Extract error text from response
   */
  private async extractErrorText(response: Response): Promise<string> {
    try {
      const json = await response.json();
      return json.error?.message || JSON.stringify(json);
    } catch {
      return response.text().catch(() => 'Unknown error');
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(message: string): boolean {
    const retryablePatterns = ['503', 'overloaded', '429', 'network', 'timeout', 'ECONNRESET'];
    return retryablePatterns.some(p => message.toLowerCase().includes(p.toLowerCase()));
  }

  /**
   * Create structured error
   */
  private createError(code: string, message: string, status: number, isRetryable: boolean): ModelError {
    return { code, message, status, isRetryable };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Default singleton instance
export const modelManager = new ModelManager();
