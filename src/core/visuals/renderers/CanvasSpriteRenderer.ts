/**
 * Canvas Sprite Renderer
 * Renders text and graphics to canvas textures for use with THREE.js sprites
 */

import * as THREE from 'three';
import { PhysicsData } from '../types';

export class CanvasSpriteRenderer {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private defaultFontSize: number = 16;
  private defaultFontFamily: string = 'Arial, sans-serif';

  constructor() {
    // Create off-screen canvas for texture rendering
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
  }

  /**
   * Render text to canvas texture
   */
  renderText(options: {
    text: string;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    padding?: number;
    borderRadius?: number;
    opacity?: number;
    resolutionScale?: number;
  }): { texture: THREE.CanvasTexture; width: number; height: number } {
    const {
      text,
      fontSize = this.defaultFontSize,
      fontFamily = this.defaultFontFamily,
      color = '#ffffff',
      backgroundColor = 'rgba(0, 0, 0, 0.7)',
      padding = 8,
      borderRadius = 4,
      opacity = 1.0,
      resolutionScale = 4.0 // Default to 4x resolution for sharpness
    } = options;

    // Apply resolution scale to all dimensions
    const scaledFontSize = fontSize * resolutionScale;
    const scaledPadding = padding * resolutionScale;
    const scaledBorderRadius = borderRadius * resolutionScale;

    // Set font to measure text
    this.context.font = `${scaledFontSize}px ${fontFamily}`;
    const metrics = this.context.measureText(text);
    
    // Calculate canvas size with padding
    const textWidth = metrics.width;
    const textHeight = scaledFontSize * 1.2; // Approximate height
    const canvasWidth = Math.ceil(textWidth + scaledPadding * 2);
    const canvasHeight = Math.ceil(textHeight + scaledPadding * 2);

    // Resize canvas (powers of 2 for better performance)
    this.canvas.width = this.nextPowerOf2(canvasWidth);
    this.canvas.height = this.nextPowerOf2(canvasHeight);

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Set font again (canvas resize resets context)
    this.context.font = `${scaledFontSize}px ${fontFamily}`;
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'left';

    // Draw background with rounded corners
    if (backgroundColor && backgroundColor !== 'transparent') {
      this.context.globalAlpha = opacity;
      this.context.fillStyle = backgroundColor;
      this.roundRect(
        this.context,
        0,
        0,
        canvasWidth,
        canvasHeight,
        scaledBorderRadius
      );
      this.context.fill();
    }

    // Draw text
    this.context.globalAlpha = opacity;
    this.context.fillStyle = color;
    this.context.fillText(text, scaledPadding, canvasHeight / 2);

    // Create texture
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.needsUpdate = true;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16; // Max anisotropy for sharpness at angles

    return {
      texture,
      width: canvasWidth / resolutionScale,
      height: canvasHeight / resolutionScale
    };
  }

  /**
   * Render arrow to canvas texture
   */
  renderArrow(options: {
    length: number;
    color?: string;
    shaftWidth?: number;
    headLength?: number;
    headWidth?: number;
  }): { texture: THREE.CanvasTexture; width: number; height: number } {
    const {
      length,
      color = '#00ff88',
      shaftWidth = 4,
      headLength = 20,
      headWidth = 12
    } = options;

    // Calculate canvas size
    const canvasWidth = Math.ceil(length + 10);
    const canvasHeight = Math.ceil(headWidth + 10);

    this.canvas.width = this.nextPowerOf2(canvasWidth);
    this.canvas.height = this.nextPowerOf2(canvasHeight);

    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const centerY = canvasHeight / 2;
    const startX = 5;
    const endX = startX + length;

    // Draw arrow shaft
    this.context.fillStyle = color;
    this.context.fillRect(
      startX,
      centerY - shaftWidth / 2,
      length - headLength,
      shaftWidth
    );

    // Draw arrow head (triangle)
    this.context.beginPath();
    this.context.moveTo(endX, centerY);
    this.context.lineTo(endX - headLength, centerY - headWidth / 2);
    this.context.lineTo(endX - headLength, centerY + headWidth / 2);
    this.context.closePath();
    this.context.fill();

    // Create texture
    const texture = new THREE.CanvasTexture(this.canvas);
    texture.needsUpdate = true;

    return {
      texture,
      width: canvasWidth,
      height: canvasHeight
    };
  }

  /**
   * Render custom SVG path to canvas
   */
  renderSVGPath(options: {
    path: string;
    size: [number, number];
    color?: string;
    scale?: number;
  }): { texture: THREE.CanvasTexture; width: number; height: number } {
    const {
      path,
      size,
      color = '#ffffff',
      scale = 1.0
    } = options;

    const [width, height] = size;
    const canvasWidth = Math.ceil(width * scale);
    const canvasHeight = Math.ceil(height * scale);

    this.canvas.width = this.nextPowerOf2(canvasWidth);
    this.canvas.height = this.nextPowerOf2(canvasHeight);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw SVG path
    this.context.fillStyle = color;
    this.context.scale(scale, scale);
    
    const path2D = new Path2D(path);
    this.context.fill(path2D);

    const texture = new THREE.CanvasTexture(this.canvas);
    texture.needsUpdate = true;

    return {
      texture,
      width: canvasWidth,
      height: canvasHeight
    };
  }

  /**
   * Render symbol (emoji/character) to canvas
   */
  renderSymbol(options: {
    symbol: string;
    size?: number;
    color?: string;
    backgroundColor?: string;
  }): { texture: THREE.CanvasTexture; width: number; height: number } {
    const {
      symbol,
      size = 32,
      color = '#ffffff',
      backgroundColor = 'transparent'
    } = options;

    const canvasSize = size * 1.5;
    this.canvas.width = this.nextPowerOf2(canvasSize);
    this.canvas.height = this.nextPowerOf2(canvasSize);

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Background
    if (backgroundColor !== 'transparent') {
      this.context.fillStyle = backgroundColor;
      this.context.fillRect(0, 0, canvasSize, canvasSize);
    }

    // Draw symbol
    this.context.font = `${size}px Arial`;
    this.context.textAlign = 'center';
    this.context.textBaseline = 'middle';
    this.context.fillStyle = color;
    this.context.fillText(symbol, canvasSize / 2, canvasSize / 2);

    const texture = new THREE.CanvasTexture(this.canvas);
    texture.needsUpdate = true;

    return {
      texture,
      width: canvasSize,
      height: canvasSize
    };
  }

  /**
   * Update existing texture with new text
   */
  updateTextTexture(
    texture: THREE.CanvasTexture,
    text: string,
    options: any
  ): void {
    const result = this.renderText({ text, ...options });
    texture.image = result.texture.image;
    texture.needsUpdate = true;
  }

  /**
   * Helper: Draw rounded rectangle
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Helper: Get next power of 2 (for texture size optimization)
   */
  private nextPowerOf2(value: number): number {
    return Math.pow(2, Math.ceil(Math.log2(value)));
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // Canvas will be garbage collected
  }
}

/**
 * Format physics values for display
 */
export class PhysicsFormatter {
  /**
   * Format vector to string
   */
  static formatVector(
    vector: [number, number, number],
    precision: number = 2
  ): string {
    return `(${vector[0].toFixed(precision)}, ${vector[1].toFixed(precision)}, ${vector[2].toFixed(precision)})`;
  }

  /**
   * Format scalar value
   */
  static formatScalar(value: number, precision: number = 2): string {
    if (Math.abs(value) < 0.01 && value !== 0) {
      return value.toExponential(precision);
    }
    return value.toFixed(precision);
  }

  /**
   * Calculate magnitude of vector
   */
  static magnitude(vector: [number, number, number]): number {
    return Math.sqrt(
      vector[0] * vector[0] + 
      vector[1] * vector[1] + 
      vector[2] * vector[2]
    );
  }

  /**
   * Calculate kinetic energy: KE = 0.5 * m * v²
   */
  static kineticEnergy(mass: number, velocity: [number, number, number]): number {
    const speed = this.magnitude(velocity);
    return 0.5 * mass * speed * speed;
  }

  /**
   * Calculate momentum: p = m * v
   */
  static momentum(
    mass: number,
    velocity: [number, number, number]
  ): [number, number, number] {
    return [
      mass * velocity[0],
      mass * velocity[1],
      mass * velocity[2]
    ];
  }

  /**
   * Get formatted text based on content type
   */
  static getFormattedText(
    contentType: string,
    physicsData: PhysicsData,
    precision: number = 2
  ): string {
    switch (contentType) {
      case 'speed':
        return this.formatScalar(physicsData.speed || 0, precision);
      
      case 'velocity':
        return this.formatVector(physicsData.velocity, precision);
      
      case 'position':
        return this.formatVector(physicsData.position, precision);
      
      case 'mass':
        return this.formatScalar(physicsData.mass || 0, precision);
      
      case 'kineticEnergy':
        return this.formatScalar(physicsData.kineticEnergy || 0, precision);
      
      case 'momentum':
        return physicsData.momentum 
          ? this.formatVector(physicsData.momentum, precision)
          : 'N/A';
      
      case 'acceleration':
        // Would need to calculate from velocity history
        return 'N/A';
      
      default:
        return '';
    }
  }
}
