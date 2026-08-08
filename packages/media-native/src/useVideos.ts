// ─────────────────────────────────────────────────────────
// media-native/src/useVideos.ts
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PexelsVideo, SearchParams, Orientation, Size } from 'media-core';
import { useMediaContext } from './MediaProvider';

export interface UseVideosOptions {
  orientation?: Orientation;
  size?: Size;
  perPage?: number;
  enabled?: boolean;
}

export interface UseVideosResult {
  videos: PexelsVideo[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  totalResults: number;
  loadMore: () => void;
  refresh: () => void;
}

export function useVideos(
  query?: string,
  options: UseVideosOptions = {}
): UseVideosResult {
  const { client } = useMediaContext();
  const { orientation, size, perPage = 15, enabled = true } = options;

  const [videos, setVideos] = useState<PexelsVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const currentQuery = useRef(query);

  const fetchVideos = useCallback(
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
          result = await client.searchVideos(params);
        } else {
          result = await client.getPopularVideos({ page: pageNum, per_page: perPage });
        }
        setVideos((prev) => (append ? [...prev, ...result.data] : result.data));
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

  useEffect(() => {
    if (currentQuery.current !== query) {
      currentQuery.current = query;
      setVideos([]);
      setPage(1);
      setHasMore(true);
    }
    fetchVideos(1, false);
  }, [query, fetchVideos]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchVideos(nextPage, true);
    }
  }, [loading, hasMore, page, fetchVideos]);

  const refresh = useCallback(() => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    fetchVideos(1, false);
  }, [fetchVideos]);

  return { videos, loading, error, hasMore, totalResults, loadMore, refresh };
}
