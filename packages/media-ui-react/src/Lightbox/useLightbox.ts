// ─────────────────────────────────────────────────────────
// media-ui-react/src/Lightbox/useLightbox.ts
// Headless lightbox hook with keyboard nav, focus trap,
// and body scroll lock
// ─────────────────────────────────────────────────────────

import { useState, useCallback, useEffect, useRef } from 'react';
import type { UseLightboxOptions, UseLightboxReturn } from './types';

/**
 * Headless lightbox hook — provides prop-getters for a full-featured
 * lightbox with keyboard navigation and accessibility.
 *
 * ```tsx
 * const lightbox = useLightbox({
 *   items: photos,
 *   onView: (item) => trackView(item),
 * });
 *
 * // In grid item click handler:
 * onClick={() => lightbox.open(index)}
 *
 * // Render lightbox:
 * {lightbox.isOpen && (
 *   <div {...lightbox.getOverlayProps()}>
 *     <button {...lightbox.getCloseButtonProps()}>×</button>
 *     <button {...lightbox.getPrevButtonProps()}>←</button>
 *     <div {...lightbox.getContentProps()}>
 *       <img src={lightbox.activeItem.src} />
 *     </div>
 *     <button {...lightbox.getNextButtonProps()}>→</button>
 *   </div>
 * )}
 * ```
 */
export function useLightbox<T>(options: UseLightboxOptions<T>): UseLightboxReturn<T> {
  const { items, onView, onClose, enableKeyboard = true } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const overlayRef = useRef<HTMLElement | null>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const activeItem = isOpen && items.length > 0 ? items[activeIndex] ?? null : null;
  const hasNext = activeIndex < items.length - 1;
  const hasPrev = activeIndex > 0;

  // ── Open / Close ──────────────────────────────────────

  const open = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return;

      // Save current focus for restoration
      previousActiveElement.current = document.activeElement as HTMLElement;

      setActiveIndex(index);
      setIsOpen(true);

      // Lock body scroll
      document.body.style.overflow = 'hidden';

      // Notify consumer
      onView?.(items[index], index);
    },
    [items, onView]
  );

  const close = useCallback(() => {
    setIsOpen(false);

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore previous focus
    previousActiveElement.current?.focus();

    onClose?.();
  }, [onClose]);

  // ── Navigation ────────────────────────────────────────

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

  // ── Keyboard handling ─────────────────────────────────

  useEffect(() => {
    if (!isOpen || !enableKeyboard) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'Tab':
          // Basic focus trap — keep focus within lightbox
          if (overlayRef.current) {
            const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, enableKeyboard, close, next, prev]);

  // ── Focus management on open ──────────────────────────

  useEffect(() => {
    if (isOpen && overlayRef.current) {
      // Focus the overlay so keyboard events work immediately
      overlayRef.current.focus();
    }
  }, [isOpen]);

  // ── Cleanup on unmount ────────────────────────────────

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ── Prop Getters ──────────────────────────────────────

  const getOverlayProps = useCallback(() => {
    return {
      role: 'dialog' as const,
      'aria-modal': true as const,
      'aria-label': 'Media lightbox',
      tabIndex: -1,
      ref: (node: HTMLElement | null) => {
        overlayRef.current = node;
      },
      onClick: (e: React.MouseEvent) => {
        // Close when clicking the overlay backdrop (not content)
        if (e.target === e.currentTarget) {
          close();
        }
      },
      style: {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    };
  }, [close]);

  const getContentProps = useCallback(() => {
    return {
      role: 'document' as const,
      'aria-label': `Item ${activeIndex + 1} of ${items.length}`,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent closing when clicking content
      },
    };
  }, [activeIndex, items.length]);

  const getCloseButtonProps = useCallback(() => {
    return {
      'aria-label': 'Close lightbox',
      onClick: close,
      type: 'button' as const,
    };
  }, [close]);

  const getNextButtonProps = useCallback(() => {
    return {
      'aria-label': 'Next item',
      onClick: next,
      disabled: !hasNext,
      type: 'button' as const,
    };
  }, [next, hasNext]);

  const getPrevButtonProps = useCallback(() => {
    return {
      'aria-label': 'Previous item',
      onClick: prev,
      disabled: !hasPrev,
      type: 'button' as const,
    };
  }, [prev, hasPrev]);

  return {
    isOpen,
    activeItem,
    activeIndex,
    getOverlayProps,
    getContentProps,
    getCloseButtonProps,
    getNextButtonProps,
    getPrevButtonProps,
    open,
    close,
    next,
    prev,
    hasNext,
    hasPrev,
  };
}
