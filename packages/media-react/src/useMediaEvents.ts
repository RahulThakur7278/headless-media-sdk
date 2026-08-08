// ─────────────────────────────────────────────────────────
// media-react/src/useMediaEvents.ts
// Hook for subscribing to SDK events with auto-cleanup
// ─────────────────────────────────────────────────────────

import { useEffect } from 'react';
import type { MediaEventType, EventHandler } from 'media-core';
import { useMediaContext } from './MediaProvider';

/**
 * Subscribe to SDK events — automatically unsubscribes on unmount.
 *
 * ```tsx
 * useMediaEvents('view', (event) => {
 *   analytics.track('media_view', event.payload);
 * });
 *
 * useMediaEvents('download', (event) => {
 *   console.log('Downloaded:', event.payload);
 * });
 * ```
 */
export function useMediaEvents<T = unknown>(
  type: MediaEventType,
  handler: EventHandler<T>
): void {
  const { client } = useMediaContext();

  useEffect(() => {
    const unsubscribe = client.on(type, handler);
    return unsubscribe;
  }, [client, type, handler]);
}

/**
 * Subscribe to ALL SDK events — useful for logging or analytics dashboards.
 */
export function useAllMediaEvents(handler: EventHandler): void {
  const { client } = useMediaContext();

  useEffect(() => {
    const unsubscribe = client.onAny(handler);
    return unsubscribe;
  }, [client, handler]);
}
