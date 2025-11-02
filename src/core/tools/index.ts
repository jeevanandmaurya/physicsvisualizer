/**
 * Tools Module - Export all tool-related functionality
 */

export { ToolRegistry, toolRegistry } from './ToolRegistry';
export { JavaScriptExecutor, jsExecutor } from './JavaScriptExecutor';
export { default as registerBuiltInTools } from './BuiltInTools';
export { FunctionCallSystem, functionCallSystem } from './FunctionCallSystem';

export type { ToolDefinition, ToolParameter, ToolExecutionContext, ToolResult } from './ToolRegistry';
export type { ExecutionEnvironment } from './JavaScriptExecutor';

// Initialize tools on import
import registerBuiltInTools from './BuiltInTools';
registerBuiltInTools();
