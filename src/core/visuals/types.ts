/**
 * Visual Annotation System - Type Definitions
 * Non-physical visual elements that enhance physics simulations
 */

export type AnnotationType = 'text' | 'vector' | 'trail' | 'symbol' | 'effect';

export type AnchorPosition = 'top' | 'bottom' | 'left' | 'right' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type VectorType = 'velocity' | 'acceleration' | 'force' | 'momentum' | 'custom';

export type TextContentType = 
  | 'speed'           // Magnitude of velocity
  | 'velocity'        // Full velocity vector
  | 'acceleration'    // Acceleration
  | 'mass'           // Object mass
  | 'kineticEnergy'  // Kinetic energy
  | 'momentum'       // Momentum
  | 'position'       // Position coordinates
  | 'custom';        // Custom text

/**
 * Base annotation interface - all annotations extend this
 */
export interface BaseAnnotation {
  id: string;
  type: AnnotationType;
  attachedToObjectId: string;
  
  // Positioning relative to object
  offset?: [number, number, number];
  anchor?: AnchorPosition;
  
  // Visibility and behavior
  visible?: boolean;
  fadeDistance?: number;        // Distance from camera where annotation fades
  minScale?: number;            // Minimum scale when far
  maxScale?: number;            // Maximum scale when close
  updateFrequency?: number;     // Update rate in Hz (default: 60)
  smoothness?: number;          // Position interpolation smoothness (0.05-0.3, default: 0.15)
  
  // Conditional visibility
  showWhenPlaying?: boolean;    // Only show during simulation
  showWhenPaused?: boolean;     // Only show when paused
  minSpeed?: number;            // Only show when object speed > this value
}

/**
 * Text annotation - displays dynamic text labels
 */
export interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  
  // Content
  contentType?: TextContentType;
  customText?: string | ((physicsData: PhysicsData) => string);
  prefix?: string;              // e.g., "V: "
  suffix?: string;              // e.g., " m/s"
  precision?: number;           // Decimal places (default: 2)
  
  // Styling
  fontSize?: number;            // Default: 16
  fontFamily?: string;          // Default: 'Arial'
  color?: string;               // Text color (default: '#ffffff')
  backgroundColor?: string;     // Background color (default: 'rgba(0,0,0,0.5)')
  padding?: number;             // Padding around text (default: 4)
  borderRadius?: number;        // Border radius (default: 4)
  opacity?: number;             // Overall opacity (default: 1.0)
}

/**
 * Vector annotation - displays arrows for forces, velocity, etc.
 */
export interface VectorAnnotation extends BaseAnnotation {
  type: 'vector';
  
  vectorType: VectorType;
  scale?: number;               // Visual scale multiplier (default: 1.0)
  color?: string;               // Arrow color
  showMagnitude?: boolean;      // Show magnitude label at arrow tip
  magnitudePrefix?: string;     // e.g., "F = "
  magnitudeSuffix?: string;     // e.g., " N"
  
  // Arrow styling
  shaftRadius?: number;         // Shaft thickness
  headLength?: number;          // Arrow head length ratio
  headRadius?: number;          // Arrow head radius ratio
  
  // Custom vector (if vectorType is 'custom')
  customVector?: [number, number, number] | ((physicsData: PhysicsData) => [number, number, number]);
}

/**
 * Trail annotation - motion path visualization
 */
export interface TrailAnnotation extends BaseAnnotation {
  type: 'trail';
  
  maxLength?: number;           // Maximum number of points (default: 100)
  updateInterval?: number;      // Time between trail points in seconds (default: 0.1)
  
  // Styling
  color?: string;               // Trail color
  colorGradient?: boolean;      // Use gradient based on speed
  gradientStartColor?: string;  // Gradient start (slow speed)
  gradientEndColor?: string;    // Gradient end (high speed)
  width?: number;               // Trail width (default: 2)
  opacity?: number;             // Trail opacity (default: 0.8)
  fadeOut?: boolean;            // Fade older points (default: true)
}

/**
 * Symbol annotation - physics symbols and icons
 */
export interface SymbolAnnotation extends BaseAnnotation {
  type: 'symbol';
  
  symbolType?: 'energy' | 'collision' | 'target' | 'direction' | 'custom';
  customSymbol?: string;        // Unicode character or emoji
  
  // SVG path for custom symbols
  svgPath?: string;
  svgSize?: [number, number];   // Width, height
  
  // Styling
  size?: number;                // Symbol size (default: 1.0)
  color?: string;
  rotation?: [number, number, number]; // Euler angles
  billboarding?: boolean;       // Always face camera (default: true)
}

/**
 * Effect annotation - visual effects
 */
export interface EffectAnnotation extends BaseAnnotation {
  type: 'effect';
  
  effectType: 'glow' | 'highlight' | 'spark' | 'heatmap' | 'custom';
  
  // Glow effect
  glowColor?: string;
  glowIntensity?: number;
  glowSize?: number;
  
  // Spark effect (collision impact)
  sparkCount?: number;
  sparkSize?: number;
  sparkDuration?: number;       // Lifetime in seconds
  
  // Trigger conditions
  triggerOnCollision?: boolean;
  triggerOnSpeed?: number;      // Trigger when speed exceeds this
}

/**
 * Union type for all annotation types
 */
export type VisualAnnotation = 
  | TextAnnotation 
  | VectorAnnotation 
  | TrailAnnotation 
  | SymbolAnnotation 
  | EffectAnnotation;

/**
 * Physics data provided to annotation update functions
 */
export interface PhysicsData {
  objectId: string;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation?: [number, number, number];
  angularVelocity?: [number, number, number];
  mass?: number;
  time: number;
  
  // Computed values
  speed?: number;
  kineticEnergy?: number;
  momentum?: [number, number, number];
}

/**
 * Scene configuration with annotations
 */
export interface SceneWithAnnotations {
  id: string;
  name: string;
  objects: any[];
  visualAnnotations?: VisualAnnotation[];
  // ... other scene properties
}

/**
 * Annotation manager configuration
 */
export interface AnnotationManagerConfig {
  enabled?: boolean;
  defaultFontSize?: number;
  defaultColor?: string;
  defaultOpacity?: number;
  performanceMode?: boolean;    // Reduce update frequency for better performance
  maxAnnotations?: number;      // Maximum number of annotations
}

/**
 * Internal annotation state (runtime data)
 */
export interface AnnotationState {
  annotation: VisualAnnotation;
  lastUpdate: number;
  trailPoints?: Array<{ position: [number, number, number]; time: number }>;
  spriteRef?: any;              // THREE.Sprite reference
  canvasTexture?: any;          // THREE.CanvasTexture reference
  needsUpdate: boolean;
}
