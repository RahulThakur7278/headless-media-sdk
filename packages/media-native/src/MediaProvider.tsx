// ─────────────────────────────────────────────────────────
// media-native/src/MediaProvider.tsx
// React Native wrapper — same contract as media-react
// but adapted for React Native idioms
// ─────────────────────────────────────────────────────────

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { MediaClient } from 'media-core';
import type { MediaCoreConfig } from 'media-core';

interface MediaContextValue {
  client: MediaClient;
}

const MediaContext = createContext<MediaContextValue | null>(null);

export interface MediaProviderProps {
  apiKey: string;
  config?: Omit<MediaCoreConfig, 'apiKey'>;
  children: React.ReactNode;
}

/**
 * MediaProvider for React Native — identical API to the web version.
 * Differences from web:
 * - Could integrate with AppState for background/foreground lifecycle
 * - Could integrate with NetInfo for network-aware caching
 */
export function MediaProvider({ apiKey, config, children }: MediaProviderProps) {
  const clientRef = useRef<MediaClient | null>(null);

  if (!clientRef.current) {
    clientRef.current = MediaClient.create({
      apiKey,
      ...config,
    });
  }

  useEffect(() => {
    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (clientRef.current) {
      clientRef.current.destroy();
    }
    clientRef.current = MediaClient.create({
      apiKey,
      ...config,
    });
  }, [apiKey]);

  return (
    <MediaContext.Provider value={{ client: clientRef.current }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMediaContext(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error(
      'useMediaContext must be used within a <MediaProvider>. ' +
        'Wrap your app root with <MediaProvider apiKey="...">'
    );
  }
  return ctx;
}
