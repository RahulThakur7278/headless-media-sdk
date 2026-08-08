// ─────────────────────────────────────────────────────────
// media-react — Public API
// ─────────────────────────────────────────────────────────

// Provider
export { MediaProvider } from './MediaProvider';
export type { MediaProviderProps } from './MediaProvider';

// Hooks
export { useMediaClient } from './useMediaClient';
export { usePhotos } from './usePhotos';
export type { UsePhotosOptions, UsePhotosResult } from './usePhotos';
export { useVideos } from './useVideos';
export type { UseVideosOptions, UseVideosResult } from './useVideos';
export { useMediaItem } from './useMediaItem';
export type { UseMediaItemResult } from './useMediaItem';
export { useMediaEvents, useAllMediaEvents } from './useMediaEvents';

// Re-export commonly needed types from core so consumers
// don't need to import media-core directly
export type {
  PexelsPhoto,
  PexelsVideo,
  MediaEvent,
  MediaEventType,
  SearchParams,
  PaginatedResponse,
} from 'media-core';
