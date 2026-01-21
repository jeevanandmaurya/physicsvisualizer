/**
 * MediaDetector - Utility for detecting and extracting media from messages
 * Automatically identifies images, videos, PDFs, and other media in text
 */

import { MediaContent } from '../../../ui-logic/chat/Conversation';

export interface MediaDetectionResult {
  hasMedia: boolean;
  mediaContent?: MediaContent;
  cleanText: string; // Text with media URLs removed
}

/**
 * Detect media URLs in message text and extract media content
 */
export function detectMediaInMessage(text: string): MediaDetectionResult {
  if (!text) {
    return { hasMedia: false, cleanText: text };
  }

  // URL regex pattern
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];

  for (const url of urls) {
    const mediaContent = detectMediaType(url);
    if (mediaContent) {
      // Remove URL from text
      const cleanText = text.replace(url, '').trim();
      return {
        hasMedia: true,
        mediaContent,
        cleanText
      };
    }
  }

  return { hasMedia: false, cleanText: text };
}

/**
 * Detect media type from URL
 */
export function detectMediaType(url: string): MediaContent | null {
  const urlLower = url.toLowerCase();

  // Image detection
  if (/\.(jpg|jpeg|png|gif|webp|bmp|ico)(\?|$)/i.test(urlLower)) {
    return {
      type: 'image',
      src: url,
      title: extractFilename(url)
    };
  }

  // Video detection
  if (/\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(urlLower)) {
    return {
      type: 'video',
      src: url,
      title: extractFilename(url)
    };
  }

  // PDF detection
  if (/\.pdf(\?|$)/i.test(urlLower)) {
    return {
      type: 'pdf',
      src: url,
      title: extractFilename(url)
    };
  }

  // SVG detection
  if (/\.svg(\?|$)/i.test(urlLower)) {
    return {
      type: 'svg',
      src: url,
      title: extractFilename(url)
    };
  }

  // YouTube detection
  if (/youtube\.com\/watch\?v=|youtu\.be\//i.test(url)) {
    const videoId = extractYouTubeId(url);
    if (videoId) {
      return {
        type: 'iframe',
        src: `https://www.youtube.com/embed/${videoId}`,
        title: 'YouTube Video',
        thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
      };
    }
  }

  // Vimeo detection
  if (/vimeo\.com\/(\d+)/i.test(url)) {
    const videoId = url.match(/vimeo\.com\/(\d+)/i)?.[1];
    if (videoId) {
      return {
        type: 'iframe',
        src: `https://player.vimeo.com/video/${videoId}`,
        title: 'Vimeo Video'
      };
    }
  }

  return null;
}

/**
 * Extract filename from URL
 */
function extractFilename(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'Media';
    return decodeURIComponent(filename.replace(/\.[^.]+$/, '')); // Remove extension
  } catch {
    return 'Media';
  }
}

/**
 * Extract YouTube video ID
 */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/i,
    /youtu\.be\/([^?]+)/i,
    /youtube\.com\/embed\/([^?]+)/i
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Create media content for a simulation
 */
export function createSimulationMedia(
  sceneId: string,
  sceneName: string,
  objectCount: number,
  thumbnailPath?: string
): MediaContent {
  return {
    type: 'simulation',
    sceneId,
    title: sceneName,
    description: 'Interactive physics simulation',
    thumbnail: thumbnailPath || `/scenes/${sceneId}/thumbnail.png`,
    metadata: {
      objectCount
    }
  };
}

/**
 * Create media content for an image
 */
export function createImageMedia(
  src: string,
  title?: string,
  dimensions?: { width: number; height: number }
): MediaContent {
  return {
    type: 'image',
    src,
    title: title || extractFilename(src),
    metadata: dimensions ? { dimensions } : undefined
  };
}

/**
 * Create media content for a video
 */
export function createVideoMedia(
  src: string,
  title?: string,
  thumbnail?: string,
  duration?: number
): MediaContent {
  return {
    type: 'video',
    src,
    title: title || extractFilename(src),
    thumbnail,
    metadata: duration ? { duration } : undefined
  };
}

/**
 * Get file size from Content-Length header
 */
export async function getMediaMetadata(url: string): Promise<Partial<MediaContent['metadata']>> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    const contentType = response.headers.get('Content-Type');

    const metadata: any = {};

    if (contentLength) {
      const bytes = parseInt(contentLength, 10);
      metadata.fileSize = formatFileSize(bytes);
    }

    if (contentType?.startsWith('image/')) {
      // For images, we could load to get dimensions, but that's expensive
      // Better to pass dimensions explicitly if known
    }

    return metadata;
  } catch (error) {
    console.warn('Failed to fetch media metadata:', error);
    return {};
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate media URL (check if accessible)
 */
export async function validateMediaUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Extract all media from message text
 */
export function extractAllMedia(text: string): MediaContent[] {
  const urlRegex = /(https?:\/\/[^\s]+)/gi;
  const urls = text.match(urlRegex) || [];
  
  const mediaItems: MediaContent[] = [];
  
  for (const url of urls) {
    const media = detectMediaType(url);
    if (media) {
      mediaItems.push(media);
    }
  }
  
  return mediaItems;
}

/**
 * Check if text contains media URLs
 */
export function hasMediaUrls(text: string): boolean {
  const detection = detectMediaInMessage(text);
  return detection.hasMedia;
}

/**
 * Process AI response and add media if scene was generated
 */
export function processAIResponseMedia(
  response: any,
  sceneGenerated: boolean,
  sceneId?: string,
  sceneName?: string,
  objectCount?: number
): MediaContent | undefined {
  // If AI generated a scene, add simulation media
  if (sceneGenerated && sceneId && sceneName) {
    return createSimulationMedia(sceneId, sceneName, objectCount || 0);
  }

  // Check if response text contains media URLs
  const detection = detectMediaInMessage(response.message || response.text || '');
  if (detection.hasMedia) {
    return detection.mediaContent;
  }

  return undefined;
}

export default {
  detectMediaInMessage,
  detectMediaType,
  createSimulationMedia,
  createImageMedia,
  createVideoMedia,
  getMediaMetadata,
  formatFileSize,
  validateMediaUrl,
  extractAllMedia,
  hasMediaUrls,
  processAIResponseMedia
};
