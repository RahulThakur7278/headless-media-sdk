// ─────────────────────────────────────────────────────────
// media-ui-native/src/Grid/useGrid.ts
// Headless grid for React Native — FlatList adapter
// ─────────────────────────────────────────────────────────

import { useCallback, useRef } from 'react';
import type { UseGridOptions, UseGridReturn } from './types';

/**
 * Headless grid hook for React Native.
 * Returns prop-getters compatible with FlatList.
 *
 * ```tsx
 * const grid = useGrid({ items: photos, hasMore, onLoadMore: loadMore });
 * <FlatList {...grid.getFlatListProps()} renderItem={({ item }) => <PhotoCard photo={item} />} />
 * ```
 */
export function useGrid<T>(options: UseGridOptions<T>): UseGridReturn<T> {
  const {
    items,
    hasMore,
    onLoadMore,
    numColumns = 3,
    keyExtractor = (_: T, index: number) => String(index),
  } = options;

  const loadMoreRef = useRef(onLoadMore);
  const hasMoreRef = useRef(hasMore);
  loadMoreRef.current = onLoadMore;
  hasMoreRef.current = hasMore;

  const handleEndReached = useCallback(() => {
    if (hasMoreRef.current) {
      loadMoreRef.current();
    }
  }, []);

  const getFlatListProps = useCallback(() => ({
    data: items,
    numColumns,
    onEndReached: handleEndReached,
    onEndReachedThreshold: 0.5,
    keyExtractor,
  }), [items, numColumns, handleEndReached, keyExtractor]);

  return {
    getFlatListProps,
    items,
  };
}
