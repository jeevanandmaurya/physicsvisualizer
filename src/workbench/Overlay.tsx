import React, { useEffect, useRef } from 'react';
import { useTheme, OverlayOpacitySettings } from '../contexts/ThemeContext';
import { useOverlay } from '../contexts/OverlayContext';
import './Overlay.css';

export type OverlayPosition = 'left' | 'right' | 'top' | 'bottom' | 'center' | 'full';
export type OverlayType = keyof OverlayOpacitySettings;

interface OverlayProps {
  children: React.ReactNode;
  type: OverlayType;
  id: string;
  position?: OverlayPosition;
  isOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
  width?: string;
  height?: string;
  maxWidth?: string;
  maxHeight?: string;
  zIndex?: number;
  blurBackground?: boolean;
  onClose?: () => void;
}

const Overlay: React.FC<OverlayProps> = ({
  children,
  type,
  id,
  position = 'center',
  isOpen = true,
  className = '',
  style = {},
  width,
  height,
  maxWidth,
  maxHeight,
  zIndex = 50,
  blurBackground = false,
  onClose
}) => {
  const { overlayOpacity } = useTheme();
  const { registerOverlay, unregisterOverlay, focusOverlay, getZIndex, setOverlayOpen } = useOverlay();
  const opacity = overlayOpacity[type];
  const overlayRef = useRef<HTMLDivElement>(null);

  // Register overlay on mount
  useEffect(() => {
    registerOverlay(id, type, zIndex);
    return () => unregisterOverlay(id);
  }, [id, type, zIndex, registerOverlay, unregisterOverlay]);

  // Update open state
  useEffect(() => {
    setOverlayOpen(id, isOpen);
  }, [id, isOpen, setOverlayOpen]);

  // Handle click to focus
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    focusOverlay(id);
  };

  if (!isOpen) return null;

  const currentZIndex = getZIndex(id);

  const positionClasses: Record<OverlayPosition, string> = {
    left: 'overlay-left',
    right: 'overlay-right',
    top: 'overlay-top',
    bottom: 'overlay-bottom',
    center: 'overlay-center',
    full: 'overlay-full'
  };

  const overlayStyle: React.CSSProperties = {
    '--overlay-opacity': opacity,
    '--overlay-zindex': currentZIndex,
    ...(width && { width }),
    ...(height && { height }),
    ...(maxWidth && { maxWidth }),
    ...(maxHeight && { maxHeight }),
    ...style
  } as React.CSSProperties;

  const isFocused = useOverlay().focusedOverlay === id;

  return (
    <>
      {blurBackground && (
        <div 
          className="overlay-backdrop" 
          style={{ zIndex: currentZIndex - 1 }}
          onClick={onClose}
        />
      )}
      <div
        ref={overlayRef}
        className={`overlay ${positionClasses[position]} ${isFocused ? 'focused' : ''} ${className}`}
        style={overlayStyle}
        onClick={handleClick}
        onMouseDown={handleClick}
      >
        {children}
      </div>
    </>
  );
};

export default Overlay;
