// ─────────────────────────────────────────────────────────
// media-react/src/useMediaItem.ts
// Hook for fetching a single photo or video by ID
// ─────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import type { PexelsPhoto, PexelsVideo } from 'media-core';
import { useMediaContext } from './MediaProvider';

type MediaType = 'photo' | 'video';
type MediaItem = PexelsPhoto | PexelsVideo;

export interface UseMediaItemResult<T extends MediaItem> {
  item: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch a single media item by type and ID.
 *
 * ```tsx
 * const { item: photo, loading } = useMediaItem('photo', 12345);
 * const { item: video } = useMediaItem('video', 67890);
 * ```
 */
export function useMediaItem<T extends MediaType>(
  type: T,
  id: number | null
): UseMediaItemResult<T extends 'photo' ? PexelsPhoto : PexelsVideo> {
  const { client } = useMediaContext();

  type ResultType = T extends 'photo' ? PexelsPhoto : PexelsVideo;

  const [item, setItem] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (id === null) {
      setItem(null);
      return;
    }

    let cancelled = false;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const result =
          type === 'photo'
            ? await client.getPhoto(id)
            : await client.getVideo(id);

        if (!cancelled) {
          setItem(result as ResultType);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      cancelled = true;
    };
  }, [client, type, id]);

  return { item, loading, error };
}
