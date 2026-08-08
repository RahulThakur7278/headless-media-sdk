// ─────────────────────────────────────────────────────────
// media-react/src/MediaProvider.tsx
// React Context provider — creates and manages a MediaClient
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
 * MediaProvider — wrap your app to provide the MediaClient to all hooks.
 *
 * ```tsx
 * <MediaProvider apiKey="YOUR_KEY">
 *   <App />
 * </MediaProvider>
 * ```
 */
export function MediaProvider({ apiKey, config, children }: MediaProviderProps) {
  const clientRef = useRef<MediaClient | null>(null);

  // Create client once (or recreate if apiKey changes)
  if (!clientRef.current) {
    clientRef.current = MediaClient.create({
      apiKey,
      ...config,
    });
  }

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      clientRef.current?.destroy();
      clientRef.current = null;
    };
  }, []);

  // Recreate if apiKey changes
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

/**
 * Internal hook to access the MediaContext.
 * Throws if used outside a MediaProvider.
 */
export function useMediaContext(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) {
    throw new Error(
      'useMediaContext must be used within a <MediaProvider>. ' +
        'Wrap your component tree with <MediaProvider apiKey="...">'
    );
  }
  return ctx;
}
