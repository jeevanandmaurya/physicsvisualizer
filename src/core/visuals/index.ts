/**
 * Visual Annotation System - Main Entry Point
 * 
 * This system provides non-physical visual enhancements for physics simulations:
 * - Text labels (velocity, mass, energy, etc.)
 * - Vector arrows (velocity, force, momentum)
 * - Motion trails
 * - Symbols and icons
 * - Visual effects (glow, sparks, etc.)
 * 
 * All annotations render in 3D space but don't participate in physics simulation.
 */

// Main manager component
export { VisualAnnotationManager } from './VisualAnnotationManager';

// Annotation components
export { TextAnnotationComponent } from './annotations/TextAnnotationComponent';
export { VectorAnnotationComponent } from './annotations/VectorAnnotationComponent';

// Renderers
export { CanvasSpriteRenderer, PhysicsFormatter } from './renderers/CanvasSpriteRenderer';

// Utilities
export * from './utils/CoordinateUtils';

// Types
export * from './types';

// Re-export for convenience
export type { 
  VisualAnnotation,
  TextAnnotation,
  VectorAnnotation,
  TrailAnnotation,
  SymbolAnnotation,
  EffectAnnotation,
  PhysicsData,
  SceneWithAnnotations,
  AnnotationManagerConfig
} from './types';
