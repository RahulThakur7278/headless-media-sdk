// ─────────────────────────────────────────────────────────
// media-ui-native/src/Lightbox/types.ts
// ─────────────────────────────────────────────────────────

export interface UseLightboxOptions<T> {
  items: T[];
  onView?: (item: T, index: number) => void;
  onClose?: () => void;
}

export interface UseLightboxReturn<T> {
  isOpen: boolean;
  activeItem: T | null;
  activeIndex: number;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}
