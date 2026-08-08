// ─────────────────────────────────────────────────────────
// media-ui-react/src/Grid/useGrid.ts
// Headless grid hook with infinite scroll via IntersectionObserver
// ─────────────────────────────────────────────────────────

import { useCallback, useRef, useEffect } from 'react';
import type { UseGridOptions, UseGridReturn } from './types';

/**
 * Headless grid hook — provides prop-getters for a responsive grid
 * with infinite scroll. Ships NO styles — consumer provides all CSS.
 *
 * ```tsx
 * const grid = useGrid({ items, hasMore, onLoadMore });
 *
 * <div {...grid.getContainerProps()}>
 *   {grid.items.map((item, i) => (
 *     <div {...grid.getItemProps(i)}>
 *       {renderItem(item)}
 *     </div>
 *   ))}
 *   <div ref={grid.sentinelRef} />
 * </div>
 * ```
 */
export function useGrid<T>(options: UseGridOptions<T>): UseGridReturn<T> {
  const {
    items,
    hasMore,
    onLoadMore,
    columns = 3,
    gap = 16,
    rootMargin = '200px',
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelNodeRef = useRef<HTMLElement | null>(null);
  const loadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);

  // Keep refs in sync
  loadMoreRef.current = onLoadMore;
  hasMoreRef.current = hasMore;

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Sentinel ref callback — sets up IntersectionObserver
  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      if (!node) {
        sentinelNodeRef.current = null;
        return;
      }

      sentinelNodeRef.current = node;

      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMoreRef.current) {
            loadMoreRef.current();
          }
        },
        { rootMargin }
      );

      observerRef.current.observe(node);
    },
    [rootMargin]
  );

  const getContainerProps = useCallback(() => {
    return {
      role: 'list' as const,
      'aria-label': 'Media grid',
      style: {
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
      },
    };
  }, [columns, gap]);

  const getItemProps = useCallback(
    (index: number) => {
      return {
        key: `grid-item-${index}`,
        role: 'listitem' as const,
        tabIndex: 0,
        style: {
          // Base item styles — consumer overrides these
          overflow: 'hidden' as const,
        },
      };
    },
    []
  );

  return {
    getContainerProps,
    getItemProps,
    sentinelRef,
    items,
  };
}
