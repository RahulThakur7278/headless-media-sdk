// ─────────────────────────────────────────────────────────
// media-ui-react/src/ReelSwiper/types.ts
// ReelSwiper types — vertical snap paging, no media knowledge
// ─────────────────────────────────────────────────────────

import type { HTMLAttributes, RefCallback } from 'react';

export interface UseReelSwiperOptions<T> {
  /** The array of items to render as vertical reels */
  items: T[];
  /** Called when the active (most visible) item changes */
  onActiveChange?: (index: number, item: T) => void;
  /** IntersectionObserver threshold for active detection (default: 0.6) */
  activeThreshold?: number;
}

export interface UseReelSwiperReturn<T> {
  /** Index of the currently most-visible (active) item */
  activeIndex: number;
  /** Props to spread on the scroll container */
  getContainerProps: () => HTMLAttributes<HTMLElement> & {
    ref: RefCallback<HTMLElement>;
    style: React.CSSProperties;
  };
  /** Props to spread on each slide/reel element */
  getSlideProps: (index: number) => HTMLAttributes<HTMLElement> & {
    ref: RefCallback<HTMLElement>;
    key: string;
    style: React.CSSProperties;
  };
  /** The items (pass-through) */
  items: T[];
  /** Scroll to a specific item index */
  scrollTo: (index: number) => void;
}
