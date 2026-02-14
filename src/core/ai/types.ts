/**
 * Type definitions for the AI module
 */

// Model configuration
export interface ModelConfig {
  provider: 'gemini' | 'ollama' | 'openai' | 'anthropic' | 'nvidia';
  model: string;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  topK?: number;
  topP?: number;
}

// Response from model API
export interface ModelResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
  model?: string;
}

// Error from model API
export interface ModelError {
  code: string;
  message: string;
  status?: number;
  isRetryable: boolean;
  retryAfter?: number;
}

// Supported providers
export type ModelProvider = 'gemini' | 'ollama' | 'openai' | 'anthropic' | 'nvidia';

// Provider-specific configs
export interface GeminiConfig extends ModelConfig {
  provider: 'gemini';
  model: string; // e.g., 'gemini-3-flash-preview'
}

export interface OllamaConfig extends ModelConfig {
  provider: 'ollama';
  endpoint: string; // e.g., 'http://localhost:11434/api/generate'
  model: string; // e.g., 'qwen2.5:3b-instruct'
}

export interface OpenAIConfig extends ModelConfig {
  provider: 'openai';
  model: string; // e.g., 'gpt-4o'
  organization?: string;
}

export interface AnthropicConfig extends ModelConfig {
  provider: 'anthropic';
  model: string; // e.g., 'claude-3-5-sonnet-20241022'
}

export interface NvidiaConfig extends ModelConfig {
  provider: 'nvidia';
  model: string; // e.g., 'z-ai/glm4.7'
}
