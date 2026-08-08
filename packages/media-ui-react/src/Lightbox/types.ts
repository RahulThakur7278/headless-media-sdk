// ─────────────────────────────────────────────────────────
// media-ui-react/src/Lightbox/types.ts
// Lightbox component types — generic, no media knowledge
// ─────────────────────────────────────────────────────────

import type { HTMLAttributes } from 'react';

export interface UseLightboxOptions<T> {
  /** The array of items that can be viewed in the lightbox */
  items: T[];
  /** Called when an item becomes the active/viewed item */
  onView?: (item: T, index: number) => void;
  /** Called when the lightbox is closed */
  onClose?: () => void;
  /** Enable keyboard navigation (default: true) */
  enableKeyboard?: boolean;
}

export interface UseLightboxReturn<T> {
  /** Whether the lightbox is currently open */
  isOpen: boolean;
  /** The currently active item */
  activeItem: T | null;
  /** Index of the currently active item */
  activeIndex: number;
  /** Props for the overlay/backdrop element */
  getOverlayProps: () => HTMLAttributes<HTMLElement> & { style: React.CSSProperties };
  /** Props for the content wrapper element */
  getContentProps: () => HTMLAttributes<HTMLElement>;
  /** Props for the close button */
  getCloseButtonProps: () => HTMLAttributes<HTMLButtonElement>;
  /** Props for the next button */
  getNextButtonProps: () => HTMLAttributes<HTMLButtonElement>;
  /** Props for the previous button */
  getPrevButtonProps: () => HTMLAttributes<HTMLButtonElement>;
  /** Open lightbox at a specific index */
  open: (index: number) => void;
  /** Close the lightbox */
  close: () => void;
  /** Go to next item */
  next: () => void;
  /** Go to previous item */
  prev: () => void;
  /** Whether there is a next item */
  hasNext: boolean;
  /** Whether there is a previous item */
  hasPrev: boolean;
}
