// ─────────────────────────────────────────────────────────
// media-react/src/useMediaClient.ts
// Direct access to the raw MediaClient instance
// ─────────────────────────────────────────────────────────

import { useMediaContext } from './MediaProvider';
import type { MediaClient } from 'media-core';

/**
 * Get direct access to the MediaClient instance.
 * Use this for advanced scenarios — prefer the specialised hooks
 * (usePhotos, useVideos, etc.) for most use cases.
 */
export function useMediaClient(): MediaClient {
  const { client } = useMediaContext();
  return client;
}
