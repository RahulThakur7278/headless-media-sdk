// ─────────────────────────────────────────────────────────
// media-native/src/useMediaEvents.ts
// ─────────────────────────────────────────────────────────

import { useEffect } from 'react';
import type { MediaEventType, EventHandler } from 'media-core';
import { useMediaContext } from './MediaProvider';

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

export function useAllMediaEvents(handler: EventHandler): void {
  const { client } = useMediaContext();

  useEffect(() => {
    const unsubscribe = client.onAny(handler);
    return unsubscribe;
  }, [client, handler]);
}
