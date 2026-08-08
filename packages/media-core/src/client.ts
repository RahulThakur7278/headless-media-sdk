// ─────────────────────────────────────────────────────────
// media-core/src/client.ts
// Main MediaClient — the single entry point for consumers
// ─────────────────────────────────────────────────────────

import type {
  MediaCoreConfig,
  MediaEventType,
  EventHandler,
  PexelsPhoto,
  PexelsVideo,
  PaginatedResponse,
  SearchParams,
  PaginationParams,
} from './types';
import { AuthManager } from './auth';
import { RequestCache } from './cache';
import { EventEmitter, defaultLogHandler } from './emitter';
import { PhotosApi } from './api/photos';
import { VideosApi } from './api/videos';
import { ValidationError } from './errors';

export class MediaClient {
  private auth: AuthManager;
  private cache: RequestCache;
  private emitterInstance: EventEmitter;
  private photosApi: PhotosApi;
  private videosApi: VideosApi;
  private destroyed = false;

  private constructor(config: MediaCoreConfig) {
    this.auth = new AuthManager(config.apiKey);
    this.cache = new RequestCache(config.cacheTTL);
    this.emitterInstance = new EventEmitter();

    // Register default console logger if enabled
    if (config.enableLogging !== false) {
      this.emitterInstance.onAny(defaultLogHandler);
    }

    // Compose API modules
    this.photosApi = new PhotosApi(this.auth, this.cache, this.emitterInstance);
    this.videosApi = new VideosApi(this.auth, this.cache, this.emitterInstance);
  }

  /**
   * Factory method — the recommended way to create a MediaClient.
   */
  static create(config: MediaCoreConfig): MediaClient {
    return new MediaClient(config);
  }

  // ── Photo methods ────────────────────────────────────

  /** Search photos by query */
  async searchPhotos(params: SearchParams): Promise<PaginatedResponse<PexelsPhoto>> {
    this.ensureAlive();
    return this.photosApi.search(params);
  }

  /** Get curated/trending photos */
  async getCuratedPhotos(params?: PaginationParams): Promise<PaginatedResponse<PexelsPhoto>> {
    this.ensureAlive();
    return this.photosApi.curated(params);
  }

  /** Fetch a single photo by ID */
  async getPhoto(id: number): Promise<PexelsPhoto> {
    this.ensureAlive();
    return this.photosApi.getById(id);
  }

  // ── Video methods ────────────────────────────────────

  /** Search videos by query */
  async searchVideos(params: SearchParams): Promise<PaginatedResponse<PexelsVideo>> {
    this.ensureAlive();
    return this.videosApi.search(params);
  }

  /** Get popular/trending videos */
  async getPopularVideos(params?: PaginationParams): Promise<PaginatedResponse<PexelsVideo>> {
    this.ensureAlive();
    return this.videosApi.popular(params);
  }

  /** Fetch a single video by ID */
  async getVideo(id: number): Promise<PexelsVideo> {
    this.ensureAlive();
    return this.videosApi.getById(id);
  }

  // ── Event methods ────────────────────────────────────

  /** Subscribe to a specific event type */
  on<T = unknown>(type: MediaEventType, handler: EventHandler<T>): () => void {
    return this.emitterInstance.on(type, handler);
  }

  /** Subscribe to all events */
  onAny(handler: EventHandler): () => void {
    return this.emitterInstance.onAny(handler);
  }

  /** Unsubscribe from a specific event type */
  off<T = unknown>(type: MediaEventType, handler: EventHandler<T>): void {
    this.emitterInstance.off(type, handler);
  }

  /** Emit a custom event (e.g., 'download', 'view') */
  emit<T = unknown>(type: MediaEventType, payload: T): void {
    this.emitterInstance.emit(type, payload);
  }

  // ── Lifecycle ────────────────────────────────────────

  /** Clear the request cache */
  clearCache(): void {
    this.cache.clear();
  }

  /** Destroy the client — cleans up all listeners and cache */
  destroy(): void {
    this.emitterInstance.removeAll();
    this.cache.clear();
    this.destroyed = true;
  }

  private ensureAlive(): void {
    if (this.destroyed) {
      throw new ValidationError('MediaClient has been destroyed. Create a new instance.');
    }
  }
}
