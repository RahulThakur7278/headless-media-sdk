// ─────────────────────────────────────────────────────────
// media-ui-native/src/ReelSwiper/types.ts
// ─────────────────────────────────────────────────────────

export interface UseReelSwiperOptions<T> {
  items: T[];
  onActiveChange?: (index: number, item: T) => void;
}

export interface UseReelSwiperReturn<T> {
  activeIndex: number;
  /** Props compatible with React Native FlatList (vertical, paging) */
  getFlatListProps: () => {
    data: T[];
    pagingEnabled: boolean;
    horizontal: false;
    showsVerticalScrollIndicator: boolean;
    snapToAlignment: 'start';
    decelerationRate: 'fast';
    onViewableItemsChanged: (info: { viewableItems: Array<{ index: number | null }> }) => void;
    viewabilityConfig: { itemVisiblePercentThreshold: number };
  };
  items: T[];
  scrollTo: (index: number) => void;
}
