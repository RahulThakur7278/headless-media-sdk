// ─────────────────────────────────────────────────────────
// media-react/src/usePhotos.ts
// Hook for searching & browsing photos with pagination
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PexelsPhoto, SearchParams, Orientation, Size } from 'media-core';
import { useMediaContext } from './MediaProvider';

export interface UsePhotosOptions {
  orientation?: Orientation;
  size?: Size;
  perPage?: number;
  enabled?: boolean; // default true — set false to delay fetching
}

export interface UsePhotosResult {
  photos: PexelsPhoto[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalResults: number;
  loadMore: () => void;
  refresh: () => void;
}

/**
 * Fetch photos — pass a query for search, or omit for curated.
 *
 * ```tsx
 * const { photos, loading, hasMore, loadMore } = usePhotos('nature');
 * const { photos: curated } = usePhotos(); // curated/trending
 * ```
 */
export function usePhotos(
  query?: string,
  options: UsePhotosOptions = {}
): UsePhotosResult {
  const { client } = useMediaContext();
  const { orientation, size, perPage = 15, enabled = true } = options;

  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Track the current query to handle resets
  const currentQuery = useRef(query);

  const fetchPhotos = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!enabled) return;

      setLoading(true);
      setError(null);

      try {
        let result;

        if (query && query.trim().length > 0) {
          const params: SearchParams = {
            query: query.trim(),
            page: pageNum,
            per_page: perPage,
            ...(orientation && { orientation }),
            ...(size && { size }),
          };
          result = await client.searchPhotos(params);
        } else {
          result = await client.getCuratedPhotos({
            page: pageNum,
            per_page: perPage,
          });
        }

        setPhotos((prev) => (append ? [...prev, ...result.data] : result.data));
        setTotalResults(result.total_results);
        setHasMore(!!result.next_page);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [client, query, orientation, size, perPage, enabled]
  );

  // Reset and fetch when query changes
  useEffect(() => {
    if (currentQuery.current !== query) {
      currentQuery.current = query;
      setPhotos([]);
      setPage(1);
      setHasMore(true);
    }
    fetchPhotos(1, false);
  }, [query, fetchPhotos]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPhotos(nextPage, true);
    }
  }, [loading, hasMore, page, fetchPhotos]);

  const refresh = useCallback(() => {
    setPhotos([]);
    setPage(1);
    setHasMore(true);
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  return { photos, loading, error, hasMore, totalResults, loadMore, refresh };
}
