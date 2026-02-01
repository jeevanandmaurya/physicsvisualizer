/**
 * ResponseParser - Parses AI responses into structured data
 * 
 * Handles:
 * - JSON parsing with error recovery
 * - Tool call detection
 * - Scene/patch extraction
 * - Confidence scoring
 */

import type { ParsedResponse } from '../types';

export class ResponseParser {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;
  }

  /**
   * Parse raw AI response text into structured format
   */
  async parse(rawText: string): Promise<ParsedResponse> {
    const errors: string[] = [];
    let parsed: any = null;
    let confidence = 0;

    // Try direct JSON parse first
    try {
      parsed = JSON.parse(rawText.trim());
      confidence = 1.0;
    } catch (e) {
      // Try to recover JSON from text
      parsed = this.recoverJSON(rawText);
      if (parsed) {
        confidence = 0.8;
      } else {
        errors.push('Failed to parse as JSON');
      }
    }

    if (!parsed) {
      // Treat as plain chat message
      return {
        type: 'chat',
        rawText,
        parsed: null,
        message: rawText,
        confidence: 0.5,
        parseErrors: errors
      };
    }

    // Determine response type
    return this.classifyResponse(parsed, rawText, confidence, errors);
  }

  /**
   * Classify parsed JSON into specific response type
   */
  private classifyResponse(
    parsed: any, 
    rawText: string, 
    confidence: number, 
    errors: string[]
  ): ParsedResponse {
    
    // Tool call
    if (parsed.type === 'tool_call' && parsed.tool) {
      return {
        type: 'tool_call',
        rawText,
        parsed,
        tool: this.normalizeToolName(parsed.tool),
        parameters: parsed.parameters || {},
        message: parsed.message,
        confidence,
        parseErrors: errors
      };
    }

    // Create scene
    if (parsed.type === 'create_scene' && parsed.scene) {
      return {
        type: 'create_scene',
        rawText,
        parsed,
        scene: parsed.scene,
        message: parsed.message,
        confidence,
        parseErrors: errors
      };
    }

    // Edit patches
    if (parsed.type === 'edit_patches' && parsed.patches) {
      return {
        type: 'edit_patches',
        rawText,
        parsed,
        patches: parsed.patches,
        message: parsed.message,
        confidence,
        parseErrors: errors
      };
    }

    // Chat response
    if (parsed.type === 'chat' || parsed.content) {
      return {
        type: 'chat',
        rawText,
        parsed,
        message: parsed.content || parsed.message || '',
        confidence,
        parseErrors: errors
      };
    }

    // Unknown structured response - treat as chat
    return {
      type: 'chat',
      rawText,
      parsed,
      message: parsed.message || JSON.stringify(parsed),
      confidence: confidence * 0.7,
      parseErrors: [...errors, 'Unknown response structure']
    };
  }

  /**
   * Attempt to recover JSON from messy text
   */
  private recoverJSON(text: string): any | null {
    if (!text) return null;

    // Clean common issues
    let cleaned = text
      .replace(/<[^>]+>/g, '')  // Remove HTML tags
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')  // Remove control chars
      .replace(/[\u2018\u2019]/g, "'")  // Smart quotes
      .replace(/[\u201C\u201D]/g, '"');

    // Escape code blocks in `code` fields
    cleaned = cleaned.replace(
      /"code"\s*:\s*```([\s\S]*?)```/g, 
      (_m, code) => `"code":"${this.escapeForJson(code)}"`
    );
    cleaned = cleaned.replace(
      /"code"\s*:\s*`([\s\S]*?)`/g, 
      (_m, code) => `"code":"${this.escapeForJson(code)}"`
    );

    // Find JSON object boundaries
    const typeIndex = cleaned.indexOf('"type"');
    if (typeIndex === -1) {
      const braceIndex = cleaned.indexOf('{');
      if (braceIndex === -1) return null;
    }

    const braceStart = cleaned.lastIndexOf('{', typeIndex > 0 ? typeIndex : cleaned.indexOf('{'));
    if (braceStart === -1) return null;

    // Balance braces
    let depth = 0;
    let endIndex = -1;
    for (let i = braceStart; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') {
        depth--;
        if (depth === 0) {
          endIndex = i;
          break;
        }
      }
    }

    let candidate = endIndex > braceStart 
      ? cleaned.slice(braceStart, endIndex + 1) 
      : cleaned.slice(braceStart);

    // Add missing closing braces
    const openCount = (candidate.match(/{/g) || []).length;
    const closeCount = (candidate.match(/}/g) || []).length;
    if (openCount > closeCount) {
      candidate += '}'.repeat(Math.min(8, openCount - closeCount));
    }

    try {
      return JSON.parse(candidate);
    } catch (e) {
      // Last resort: regex match
      const jsonMatch = cleaned.match(/\{[\s\S]*"type"[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          return null;
        }
      }
    }

    return null;
  }

  /**
   * Normalize tool names to canonical form
   */
  private normalizeToolName(toolName: string): string {
    const aliases: Record<string, string> = {
      'create_scene': 'generate_complete_scene',
      'create_scene_objects': 'generate_scene_objects',
      'create_threejs': 'create_threejs_preview',
      'apply_patches': 'apply_scene_patches',
      'execute_js': 'execute_javascript',
      'run_code': 'execute_javascript'
    };
    return aliases[toolName] || toolName;
  }

  private escapeForJson(s: string): string {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, '\\n');
  }
}
