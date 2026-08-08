// ─────────────────────────────────────────────────────────
// media-ui-native/src/Lightbox/useLightbox.ts
// Headless lightbox for React Native — uses Modal pattern
// ─────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import type { UseLightboxOptions, UseLightboxReturn } from './types';

/**
 * Headless lightbox for React Native.
 * Consumer renders RN Modal + gesture handlers.
 *
 * ```tsx
 * const lightbox = useLightbox({ items: photos, onView: trackView });
 *
 * <Modal visible={lightbox.isOpen} onRequestClose={lightbox.close}>
 *   {lightbox.activeItem && <Image source={{ uri: lightbox.activeItem.src }} />}
 * </Modal>
 * ```
 */
export function useLightbox<T>(options: UseLightboxOptions<T>): UseLightboxReturn<T> {
  const { items, onView, onClose } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = isOpen && items.length > 0 ? items[activeIndex] ?? null : null;
  const hasNext = activeIndex < items.length - 1;
  const hasPrev = activeIndex > 0;

  const open = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return;
    setActiveIndex(index);
    setIsOpen(true);
    onView?.(items[index], index);
  }, [items, onView]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const next = useCallback(() => {
    if (!hasNext) return;
    const nextIndex = activeIndex + 1;
    setActiveIndex(nextIndex);
    onView?.(items[nextIndex], nextIndex);
  }, [activeIndex, hasNext, items, onView]);

  const prev = useCallback(() => {
    if (!hasPrev) return;
    const prevIndex = activeIndex - 1;
    setActiveIndex(prevIndex);
    onView?.(items[prevIndex], prevIndex);
  }, [activeIndex, hasPrev, items, onView]);

  return { isOpen, activeItem, activeIndex, open, close, next, prev, hasNext, hasPrev };
}
