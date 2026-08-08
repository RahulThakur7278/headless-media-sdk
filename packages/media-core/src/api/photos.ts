// ─────────────────────────────────────────────────────────
// media-core/src/api/photos.ts
// Photo API endpoints — search, curated, single fetch
// ─────────────────────────────────────────────────────────

import type {
  PexelsPhoto,
  PaginatedResponse,
  SearchParams,
  PaginationParams,
} from '../types';
import type { AuthManager } from '../auth';
import type { RequestCache } from '../cache';
import type { EventEmitter } from '../emitter';
import { NetworkError, RateLimitError, NotFoundError } from '../errors';

const BASE_URL = 'https://api.pexels.com/v1';

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

interface PhotoSearchApiResponse {
  page: number;
  per_page: number;
  total_results: number;
  next_page?: string;
  prev_page?: string;
  photos: PexelsPhoto[];
}

export class PhotosApi {
  constructor(
    private auth: AuthManager,
    private cache: RequestCache,
    private emitter: EventEmitter
  ) {}

  /**
   * Search photos by query string.
   */
  async search(params: SearchParams): Promise<PaginatedResponse<PexelsPhoto>> {
    const { query, page = 1, per_page = 15, orientation, size, locale } = params;

    const queryParams: Record<string, unknown> = {
      query,
      page,
      per_page,
      ...(orientation && { orientation }),
      ...(size && { size }),
      ...(locale && { locale }),
    };

    const cacheKey = RequestCache.makeKey('/v1/search', queryParams);

    this.emitter.emit('search', { type: 'photos', query, page });

    return this.cache.dedupe(cacheKey, async () => {
      const url = new URL(`${BASE_URL}/search`);
      Object.entries(queryParams).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.set(k, String(v));
      });

      const response = await fetch(url.toString(), {
        headers: this.auth.getHeaders(),
      });

      const raw = await handleResponse<PhotoSearchApiResponse>(response, 'photos');

      return {
        page: raw.page,
        per_page: raw.per_page,
        total_results: raw.total_results,
        next_page: raw.next_page,
        prev_page: raw.prev_page,
        data: raw.photos,
      };
    });
  }

  /**
   * Get curated (trending) photos.
   */
  async curated(params?: PaginationParams): Promise<PaginatedResponse<PexelsPhoto>> {
    const page = params?.page ?? 1;
    const per_page = params?.per_page ?? 15;

    const cacheKey = RequestCache.makeKey('/v1/curated', { page, per_page });

    return this.cache.dedupe(cacheKey, async () => {
      const url = new URL(`${BASE_URL}/curated`);
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(per_page));

      const response = await fetch(url.toString(), {
        headers: this.auth.getHeaders(),
      });

      const raw = await handleResponse<PhotoSearchApiResponse>(response, 'photos');

      return {
        page: raw.page,
        per_page: raw.per_page,
        total_results: raw.total_results,
        next_page: raw.next_page,
        prev_page: raw.prev_page,
        data: raw.photos,
      };
    });
  }

  /**
   * Fetch a single photo by ID.
   */
  async getById(id: number): Promise<PexelsPhoto> {
    const cacheKey = RequestCache.makeKey(`/v1/photos/${id}`);

    return this.cache.dedupe(cacheKey, async () => {
      const response = await fetch(`${BASE_URL}/photos/${id}`, {
        headers: this.auth.getHeaders(),
      });

      const photo = await handleResponse<PexelsPhoto>(response, 'photo', id);

      this.emitter.emit('view', { type: 'photo', id, photographer: photo.photographer });

      return photo;
    });
  }
}
