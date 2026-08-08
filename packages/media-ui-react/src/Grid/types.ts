// ─────────────────────────────────────────────────────────
// media-ui-react/src/Grid/types.ts
// Grid component types — completely generic, no media knowledge
// ─────────────────────────────────────────────────────────

import type { HTMLAttributes, RefCallback } from 'react';

export interface UseGridOptions<T> {
  /** The array of items to render in the grid */
  items: T[];
  /** Whether there are more items available to load */
  hasMore: boolean;
  /** Callback to load the next page of items */
  onLoadMore: () => void;
  /** Number of columns (default: 3) */
  columns?: number;
  /** Gap between items in pixels (default: 16) */
  gap?: number;
  /** IntersectionObserver root margin for pre-fetching (default: '200px') */
  rootMargin?: string;
}

export interface UseGridReturn<T> {
  /** Props to spread on the grid container element */
  getContainerProps: () => HTMLAttributes<HTMLElement> & { style: React.CSSProperties };
  /** Props to spread on each grid item element */
  getItemProps: (index: number) => HTMLAttributes<HTMLElement> & {
    key: string;
    style: React.CSSProperties;
  };
  /** Ref callback to attach to the sentinel element for infinite scroll */
  sentinelRef: RefCallback<HTMLElement>;
  /** The items (pass-through for convenience) */
  items: T[];
}
