// ─────────────────────────────────────────────────────────
// media-core — Public API
// ─────────────────────────────────────────────────────────

// Main client
export { MediaClient } from './client';

// Types
export type {
  MediaCoreConfig,
  PexelsPhoto,
  PexelsVideo,
  PhotoSrc,
  VideoFile,
  VideoPicture,
  VideoUser,
  PaginatedResponse,
  SearchParams,
  PaginationParams,
  Orientation,
  Size,
  MediaEventType,
  MediaEvent,
  EventHandler,
} from './types';

// Errors
export {
  MediaError,
  AuthError,
  NetworkError,
  RateLimitError,
  NotFoundError,
  ValidationError,
} from './errors';

// Event utilities
export { EventEmitter, defaultLogHandler } from './emitter';
