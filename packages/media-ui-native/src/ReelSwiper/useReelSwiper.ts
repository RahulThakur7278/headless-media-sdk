// ─────────────────────────────────────────────────────────
// media-ui-native/src/ReelSwiper/useReelSwiper.ts
// Headless reel swiper for React Native — FlatList-based
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from 'react';
import type { UseReelSwiperOptions, UseReelSwiperReturn } from './types';

/**
 * Headless reel swiper for React Native.
 * Returns props compatible with a vertical paging FlatList.
 *
 * ```tsx
 * const reels = useReelSwiper({ items: videos, onActiveChange: handleActive });
 *
 * <FlatList
 *   {...reels.getFlatListProps()}
 *   renderItem={({ item, index }) => (
 *     <VideoPlayer video={item} isActive={index === reels.activeIndex} />
 *   )}
 * />
 * ```
 */
export function useReelSwiper<T>(options: UseReelSwiperOptions<T>): UseReelSwiperReturn<T> {
  const { items, onActiveChange } = options;

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  const onViewableItemsChanged = useCallback(
    (info: { viewableItems: Array<{ index: number | null }> }) => {
      if (info.viewableItems.length > 0) {
        const firstVisible = info.viewableItems[0].index;
        if (firstVisible !== null && firstVisible !== undefined) {
          setActiveIndex((prev) => {
            if (prev !== firstVisible) {
              onActiveChangeRef.current?.(firstVisible, items[firstVisible]);
              return firstVisible;
            }
            return prev;
          });
        }
      }
    },
    [items]
  );

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const getFlatListProps = useCallback(() => ({
    data: items,
    pagingEnabled: true as const,
    horizontal: false as const,
    showsVerticalScrollIndicator: false,
    snapToAlignment: 'start' as const,
    decelerationRate: 'fast' as const,
    onViewableItemsChanged,
    viewabilityConfig,
  }), [items, onViewableItemsChanged, viewabilityConfig]);

  const scrollTo = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  return {
    activeIndex,
    getFlatListProps,
    items,
    scrollTo,
  };
}
