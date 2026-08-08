// ─────────────────────────────────────────────────────────
// media-native — Public API
// ─────────────────────────────────────────────────────────

export { MediaProvider } from './MediaProvider';
export type { MediaProviderProps } from './MediaProvider';
export { usePhotos } from './usePhotos';
export type { UsePhotosOptions, UsePhotosResult } from './usePhotos';
export { useVideos } from './useVideos';
export type { UseVideosOptions, UseVideosResult } from './useVideos';
export { useMediaItem } from './useMediaItem';
export type { UseMediaItemResult } from './useMediaItem';
export { useMediaEvents, useAllMediaEvents } from './useMediaEvents';

export type {
  PexelsPhoto,
  PexelsVideo,
  MediaEvent,
  MediaEventType,
  SearchParams,
  PaginatedResponse,
} from 'media-core';
