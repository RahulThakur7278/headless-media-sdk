// ─────────────────────────────────────────────────────────
// media-ui-react/src/ReelSwiper/useReelSwiper.ts
// Headless vertical reel swiper with CSS scroll-snap
// and IntersectionObserver-based active detection
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react';
import type { UseReelSwiperOptions, UseReelSwiperReturn } from './types';

/**
 * Headless reel swiper hook — vertical snap-scroll with active-item
 * detection. No styles shipped — consumer provides all CSS.
 *
 * ```tsx
 * const reels = useReelSwiper({
 *   items: videos,
 *   onActiveChange: (index, video) => console.log('Now playing:', video.id),
 * });
 *
 * <div {...reels.getContainerProps()}>
 *   {reels.items.map((video, i) => (
 *     <div {...reels.getSlideProps(i)}>
 *       <video src={video.url} autoPlay={i === reels.activeIndex} />
 *     </div>
 *   ))}
 * </div>
 * ```
 */
export function useReelSwiper<T>(options: UseReelSwiperOptions<T>): UseReelSwiperReturn<T> {
  const { items, onActiveChange, activeThreshold = 0.6 } = options;

  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const slideRefs = useRef<Map<number, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const onActiveChangeRef = useRef(onActiveChange);

  // Keep callback ref in sync
  onActiveChangeRef.current = onActiveChange;

  // Set up IntersectionObserver for active-item detection
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the most visible entry
        let maxRatio = 0;
        let maxIndex = -1;

        for (const entry of entries) {
          const index = Number(entry.target.getAttribute('data-reel-index'));
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            maxIndex = index;
          }
        }

        if (maxIndex >= 0 && maxRatio >= activeThreshold) {
          setActiveIndex((prev) => {
            if (prev !== maxIndex) {
              onActiveChangeRef.current?.(maxIndex, items[maxIndex]);
              return maxIndex;
            }
            return prev;
          });
        }
      },
      {
        root: containerRef.current,
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1],
      }
    );

    // Observe all slides
    for (const [, el] of slideRefs.current) {
      observerRef.current.observe(el);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [items.length, activeThreshold]);

  // ── Container ref callback ────────────────────────────

  const containerRefCallback = useCallback((node: HTMLElement | null) => {
    containerRef.current = node;
  }, []);

  // ── Slide ref callback ────────────────────────────────

  const getSlideRefCallback = useCallback(
    (index: number) => (node: HTMLElement | null) => {
      if (node) {
        slideRefs.current.set(index, node);
        observerRef.current?.observe(node);
      } else {
        const existing = slideRefs.current.get(index);
        if (existing) {
          observerRef.current?.unobserve(existing);
        }
        slideRefs.current.delete(index);
      }
    },
    []
  );

  // ── Scroll to specific index ──────────────────────────

  const scrollTo = useCallback((index: number) => {
    const el = slideRefs.current.get(index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // ── Prop Getters ──────────────────────────────────────

  const getContainerProps = useCallback(() => {
    return {
      ref: containerRefCallback,
      role: 'feed' as const,
      'aria-label': 'Vertical media reel',
      style: {
        overflowY: 'scroll' as const,
        scrollSnapType: 'y mandatory' as const,
        height: '100%',
        // Hide scrollbar
        scrollbarWidth: 'none' as const,
      },
    };
  }, [containerRefCallback]);

  const getSlideProps = useCallback(
    (index: number) => {
      return {
        ref: getSlideRefCallback(index),
        key: `reel-slide-${index}`,
        role: 'article' as const,
        'aria-label': `Reel ${index + 1} of ${items.length}`,
        'data-reel-index': index,
        'aria-current': index === activeIndex ? ('true' as const) : undefined,
        style: {
          scrollSnapAlign: 'start' as const,
          height: '100%',
          flexShrink: 0,
        },
      };
    },
    [getSlideRefCallback, items.length, activeIndex]
  );

  return {
    activeIndex,
    getContainerProps,
    getSlideProps,
    items,
    scrollTo,
  };
}
