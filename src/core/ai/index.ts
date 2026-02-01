/**
 * AI Module - Model selection, API communication, and error handling
 * 
 * This module handles ONLY:
 * - Model configuration and selection (Gemini, Ollama, etc.)
 * - API request/response handling
 * - Error handling and retries
 * - Token usage tracking
 * 
 * All agentic work (parsing, thinking, simulating, executing) 
 * is handled by the Agent module in sandbox/agent/
 */

export { ModelManager } from './ModelManager';
export type { ModelConfig, ModelResponse, ModelError } from './types';
