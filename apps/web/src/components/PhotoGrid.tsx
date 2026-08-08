// ─────────────────────────────────────────────────────────
// PhotoGrid.tsx
// THE WIRING LAYER: usePhotos (media-react) → useGrid + useLightbox (media-ui-react)
// This is where data meets display — the app's core job
// ─────────────────────────────────────────────────────────

import { usePhotos, useMediaClient } from 'media-react';
import { useGrid, useLightbox } from 'media-ui-react';
import type { PexelsPhoto } from 'media-react';

interface PhotoGridProps {
  query: string;
}

export function PhotoGrid({ query }: PhotoGridProps) {
  const client = useMediaClient();

  // DATA — from media-react (wrapper around media-core)
  const { photos, loading, error, hasMore, loadMore } = usePhotos(
    query || undefined
  );

  // DISPLAY — from media-ui-react (headless, knows nothing about Pexels)
  const grid = useGrid({
    items: photos,
    hasMore,
    onLoadMore: loadMore,
    columns: 3,
    gap: 16,
  });

  const lightbox = useLightbox({
    items: photos,
    onView: (photo: PexelsPhoto) => {
      // Emit a 'view' event through the SDK
      client.emit('view', {
        type: 'photo',
        id: photo.id,
        photographer: photo.photographer,
      });
    },
  });

  if (error) {
    return <div className="error-message">⚠️ {error.message}</div>;
  }

  if (!loading && photos.length === 0) {
    return (
      <div className="empty-state">
        <h2>No photos found</h2>
        <p>{query ? `No results for "${query}"` : 'Start by searching for something'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid — consumer-styled, using prop-getters from headless hook */}
      <div className="media-grid" {...grid.getContainerProps()}>
        {grid.items.map((photo, index) => (
          <div
            className="grid-item"
            key={photo.id}
            {...grid.getItemProps(index)}
            onClick={() => lightbox.open(index)}
          >
            <img
              src={photo.src.medium}
              alt={photo.alt || `Photo by ${photo.photographer}`}
              loading="lazy"
            />
            <div className="grid-item-overlay">
              <span className="photographer">{photo.photographer}</span>
            </div>
          </div>
        ))}
        {/* Sentinel for infinite scroll */}
        <div className="load-more-sentinel" ref={grid.sentinelRef} />
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      {/* Lightbox — consumer-styled overlay */}
      {lightbox.isOpen && lightbox.activeItem && (
        <div className="lightbox-overlay" {...lightbox.getOverlayProps()}>
          <button className="lightbox-close" {...lightbox.getCloseButtonProps()}>
            ✕
          </button>
          <button className="lightbox-nav prev" {...lightbox.getPrevButtonProps()}>
            ‹
          </button>
          <div className="lightbox-content" {...lightbox.getContentProps()}>
            <img
              src={lightbox.activeItem.src.large2x}
              alt={lightbox.activeItem.alt || `Photo by ${lightbox.activeItem.photographer}`}
            />
          </div>
          <button className="lightbox-nav next" {...lightbox.getNextButtonProps()}>
            ›
          </button>
          <div className="lightbox-counter">
            {lightbox.activeIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
