/**
 * ToolRegistry - Central registry for all executable tools
 * Manages tool definitions, validation, and execution
 */

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required?: boolean;
  default?: any;
  enum?: any[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: 'scene' | 'execution' | 'generation' | 'analysis' | 'workflow';
  executor: (params: any, context: ToolExecutionContext) => Promise<ToolResult>;
  examples?: string[];
  permissions?: string[]; // e.g., ['execute_code', 'modify_scene']
}

export interface ToolExecutionContext {
  scene?: any;
  chatHistory?: any[];
  workspace?: any;
  userId?: string;
  sessionId?: string;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: {
    executionTime?: number;
    resourcesUsed?: string[];
    warnings?: string[];
  };
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private executionLog: Array<{ tool: string; timestamp: number; result: ToolResult }> = [];
  private maxLogSize = 100;

  /**
   * Register a new tool
   */
  registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      console.warn(`⚠️ Tool "${tool.name}" is already registered. Overwriting...`);
    }
    this.tools.set(tool.name, tool);
    console.log(`✅ Registered tool: ${tool.name} (${tool.category})`);
  }

  /**
   * Get a tool definition
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all tools, optionally filtered by category
   */
  getAllTools(category?: string): ToolDefinition[] {
    const tools = Array.from(this.tools.values());
    return category ? tools.filter(t => t.category === category) : tools;
  }

  /**
   * Execute a tool with parameters
   */
  async executeTool(
    toolName: string,
    parameters: any,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    const startTime = Date.now();
    const tool = this.tools.get(toolName);

    if (!tool) {
      return {
        success: false,
        error: `Tool "${toolName}" not found`,
        metadata: { executionTime: Date.now() - startTime }
      };
    }

    // Validate parameters
    const validationError = this.validateParameters(tool, parameters);
    if (validationError) {
      return {
        success: false,
        error: validationError,
        metadata: { executionTime: Date.now() - startTime }
      };
    }

    // Apply defaults for missing parameters
    const finalParams = this.applyDefaults(tool, parameters);

    try {
      console.log(`🔧 Executing tool: ${toolName}`, finalParams);
      const result = await tool.executor(finalParams, context);
      
      result.metadata = {
        ...result.metadata,
        executionTime: Date.now() - startTime
      };

      // Log execution
      this.logExecution(toolName, result);

      console.log(`✅ Tool "${toolName}" executed successfully in ${result.metadata.executionTime}ms`);
      return result;
    } catch (error: any) {
      const errorResult = {
        success: false,
        error: `Tool execution failed: ${error.message}`,
        metadata: { executionTime: Date.now() - startTime }
      };
      this.logExecution(toolName, errorResult);
      console.error(`❌ Tool "${toolName}" failed:`, error);
      return errorResult;
    }
  }

  /**
   * Validate tool parameters
   */
  private validateParameters(tool: ToolDefinition, parameters: any): string | null {
    for (const param of tool.parameters) {
      if (param.required && !(param.name in parameters)) {
        return `Missing required parameter: ${param.name}`;
      }

      if (param.name in parameters) {
        const value = parameters[param.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;

        if (actualType !== param.type && value !== null && value !== undefined) {
          return `Parameter "${param.name}" must be of type ${param.type}, got ${actualType}`;
        }

        if (param.enum && !param.enum.includes(value)) {
          return `Parameter "${param.name}" must be one of: ${param.enum.join(', ')}`;
        }
      }
    }

    return null;
  }

  /**
   * Apply default values to parameters
   */
  private applyDefaults(tool: ToolDefinition, parameters: any): any {
    const result = { ...parameters };
    
    for (const param of tool.parameters) {
      if (!(param.name in result) && param.default !== undefined) {
        result[param.name] = param.default;
      }
    }

    return result;
  }

  /**
   * Log tool execution
   */
  private logExecution(tool: string, result: ToolResult): void {
    this.executionLog.push({
      tool,
      timestamp: Date.now(),
      result
    });

    // Keep log size manageable
    if (this.executionLog.length > this.maxLogSize) {
      this.executionLog.shift();
    }
  }

  /**
   * Get execution history
   */
  getExecutionHistory(limit?: number): Array<{ tool: string; timestamp: number; result: ToolResult }> {
    const history = [...this.executionLog].reverse();
    return limit ? history.slice(0, limit) : history;
  }

  /**
   * Get tool schema for AI (formatted for LLM consumption)
   */
  getToolSchemaForAI(): any[] {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: {
        type: 'object',
        properties: tool.parameters.reduce((acc, param) => {
          acc[param.name] = {
            type: param.type,
            description: param.description,
            ...(param.enum ? { enum: param.enum } : {}),
            ...(param.default !== undefined ? { default: param.default } : {})
          };
          return acc;
        }, {} as any),
        required: tool.parameters.filter(p => p.required).map(p => p.name)
      },
      examples: tool.examples || []
    }));
  }

  /**
   * Clear all tools (useful for testing)
   */
  clear(): void {
    this.tools.clear();
    this.executionLog = [];
    console.log('🧹 Tool registry cleared');
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalTools: number;
    toolsByCategory: Record<string, number>;
    recentExecutions: number;
    successRate: number;
  } {
    const tools = Array.from(this.tools.values());
    const toolsByCategory = tools.reduce((acc, tool) => {
      acc[tool.category] = (acc[tool.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentExecutions = this.executionLog.length;
    const successfulExecutions = this.executionLog.filter(e => e.result.success).length;
    const successRate = recentExecutions > 0 ? successfulExecutions / recentExecutions : 0;

    return {
      totalTools: this.tools.size,
      toolsByCategory,
      recentExecutions,
      successRate
    };
  }
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry();

export default ToolRegistry;
