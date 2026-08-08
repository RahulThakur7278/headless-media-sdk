// ─────────────────────────────────────────────────────────
// media-core/src/api/videos.ts
// Video API endpoints — search, popular, single fetch
// ─────────────────────────────────────────────────────────

import type {
  PexelsVideo,
  PaginatedResponse,
  SearchParams,
  PaginationParams,
} from '../types';
import type { AuthManager } from '../auth';
import type { RequestCache } from '../cache';
import type { EventEmitter } from '../emitter';
import { NetworkError, RateLimitError, NotFoundError } from '../errors';

const BASE_URL = 'https://api.pexels.com';

async function handleResponse<T>(response: Response, resource: string, id?: string | number): Promise<T> {
  if (response.ok) {
    return response.json();
  }

  switch (response.status) {
    case 401:
      throw new NetworkError('Unauthorized — check your API key', 401);
    case 404:
      throw new NotFoundError(resource, id ?? 'unknown');
    case 429: {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter ? parseInt(retryAfter, 10) : undefined);
    }
    default:
      throw new NetworkError(
        `Request failed: ${response.status} ${response.statusText}`,
        response.status
      );
  }
}

interface VideoSearchApiResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
  videos: PexelsVideo[];
}

export class VideosApi {
  constructor(
    private auth: AuthManager,
    private cache: RequestCache,
    private emitter: EventEmitter
  ) {}

  /**
   * Search videos by query string.
   */
  async search(params: SearchParams): Promise<PaginatedResponse<PexelsVideo>> {
    const { query, page = 1, per_page = 15, orientation, size, locale } = params;

    const queryParams: Record<string, unknown> = {
      query,
      page,
      per_page,
      ...(orientation && { orientation }),
      ...(size && { size }),
      ...(locale && { locale }),
    };

    const cacheKey = RequestCache.makeKey('/videos/search', queryParams);

    this.emitter.emit('search', { type: 'videos', query, page });

    return this.cache.dedupe(cacheKey, async () => {
      const url = new URL(`${BASE_URL}/videos/search`);
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });

      const response = await fetch(url.toString(), {
        headers: this.auth.getHeaders(),
      });

      const raw = await handleResponse<VideoSearchApiResponse>(response, 'videos');

      return {
        page: raw.page,
        per_page: raw.per_page,
        total_results: raw.total_results,
        next_page: raw.next_page,
        prev_page: raw.prev_page,
        data: raw.videos,
      };
    });
  }

  /**
   * Get popular (trending) videos.
   */
  async popular(params?: PaginationParams): Promise<PaginatedResponse<PexelsVideo>> {
    const page = params?.page ?? 1;
    const per_page = params?.per_page ?? 15;

    const cacheKey = RequestCache.makeKey('/videos/popular', { page, per_page });

    return this.cache.dedupe(cacheKey, async () => {
      const url = new URL(`${BASE_URL}/videos/popular`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(per_page));

      const response = await fetch(url.toString(), {
        headers: this.auth.getHeaders(),
      });

      const raw = await handleResponse<VideoSearchApiResponse>(response, 'videos');

      return {
        page: raw.page,
        per_page: raw.per_page,
        total_results: raw.total_results,
        next_page: raw.next_page,
        prev_page: raw.prev_page,
        data: raw.videos,
      };
    });
  }

  /**
   * Fetch a single video by ID.
   */
  async getById(id: number): Promise<PexelsVideo> {
    const cacheKey = RequestCache.makeKey(`/videos/videos/${id}`);

    return this.cache.dedupe(cacheKey, async () => {
      const response = await fetch(`${BASE_URL}/videos/videos/${id}`, {
        headers: this.auth.getHeaders(),
      });

      const video = await handleResponse<PexelsVideo>(response, 'video', id);

      this.emitter.emit('view', { type: 'video', id, duration: video.duration });

      return video;
    });
  }
}
