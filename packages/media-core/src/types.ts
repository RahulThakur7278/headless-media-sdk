// ─────────────────────────────────────────────────────────
// media-core/src/types.ts
// All public TypeScript types for the media SDK
// ─────────────────────────────────────────────────────────

/** Configuration to initialise the MediaClient */
export interface MediaCoreConfig {
  apiKey: string;
  baseUrl?: string;
  defaultPerPage?: number;
  cacheTTL?: number; // milliseconds, default 300_000 (5 min)
  enableLogging?: boolean;
}

// ── Pexels Photo types ───────────────────────────────────

export interface PhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

export interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PhotoSrc;
  liked: boolean;
  alt: string;
}

// ── Pexels Video types ───────────────────────────────────

export interface VideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

export interface VideoPicture {
  id: number;
  picture: string;
  nr: number;
}

export interface VideoUser {
  id: number;
  name: string;
  url: string;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string; // poster/thumbnail
  duration: number;
  user: VideoUser;
  video_files: VideoFile[];
  video_pictures: VideoPicture[];
}

// ── Pagination ───────────────────────────────────────────

export interface PaginatedResponse<T> {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
  data: T[];
}

// ── Search params ────────────────────────────────────────

export type Orientation = 'landscape' | 'portrait' | 'square';
export type Size = 'large' | 'medium' | 'small';

export interface SearchParams {
  query: string;
  orientation?: Orientation;
  size?: Size;
  locale?: string;
  page?: number;
  per_page?: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// ── Events ───────────────────────────────────────────────

export type MediaEventType = 'view' | 'download' | 'search' | 'error' | string;

export interface MediaEvent<T = unknown> {
  type: MediaEventType;
  payload: T;
  timestamp: number;
}

export type EventHandler<T = unknown> = (event: MediaEvent<T>) => void;
