// ─────────────────────────────────────────────────────────
// VideoGrid.tsx
// Wires useVideos (media-react) → useGrid + useLightbox (media-ui-react)
// ─────────────────────────────────────────────────────────

import { useVideos, useMediaClient } from 'media-react';
import { useGrid, useLightbox } from 'media-ui-react';
import type { PexelsVideo } from 'media-react';

interface VideoGridProps {
  query: string;
}

/**
 * Get the best quality video file URL for playback.
 */
function getBestVideoUrl(video: PexelsVideo): string {
  // Prefer HD quality
  const hd = video.video_files.find((f) => f.quality === 'hd');
  const sd = video.video_files.find((f) => f.quality === 'sd');
  return hd?.link || sd?.link || video.video_files[0]?.link || '';
}

export function VideoGrid({ query }: VideoGridProps) {
  const client = useMediaClient();

  const { videos, loading, error, hasMore, loadMore } = useVideos(
    query || undefined
  );

  const grid = useGrid({
    items: videos,
    hasMore,
    onLoadMore: loadMore,
    columns: 3,
    gap: 16,
  });

  const lightbox = useLightbox({
    items: videos,
    onView: (video: PexelsVideo) => {
      client.emit('view', {
        type: 'video',
        id: video.id,
        duration: video.duration,
      });
    },
  });

  if (error) {
    return <div className="error-message">⚠️ {error.message}</div>;
  }

  if (!loading && videos.length === 0) {
    return (
      <div className="empty-state">
        <h2>No videos found</h2>
        <p>{query ? `No results for "${query}"` : 'Start by searching for something'}</p>
      </div>
    );
  }

  return (
    <>
      <div className="media-grid" {...grid.getContainerProps()}>
        {grid.items.map((video, index) => (
          <div
            className="grid-item"
            key={video.id}
            {...grid.getItemProps(index)}
            onClick={() => lightbox.open(index)}
          >
            <img
              src={video.image}
              alt={`Video by ${video.user.name}`}
              loading="lazy"
            />
            <div className="grid-item-overlay">
              <span className="photographer">{video.user.name}</span>
              <span style={{ marginLeft: 8, opacity: 0.7, fontSize: '0.75rem' }}>
                {video.duration}s
              </span>
            </div>
          </div>
        ))}
        <div className="load-more-sentinel" ref={grid.sentinelRef} />
      </div>

      {loading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}

      {lightbox.isOpen && lightbox.activeItem && (
        <div className="lightbox-overlay" {...lightbox.getOverlayProps()}>
          <button className="lightbox-close" {...lightbox.getCloseButtonProps()}>
            ✕
          </button>
          <button className="lightbox-nav prev" {...lightbox.getPrevButtonProps()}>
            ‹
          </button>
          <div className="lightbox-content" {...lightbox.getContentProps()}>
            <video
              src={getBestVideoUrl(lightbox.activeItem)}
              controls
              autoPlay
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: 12 }}
            />
          </div>
          <button className="lightbox-nav next" {...lightbox.getNextButtonProps()}>
            ›
          </button>
          <div className="lightbox-counter">
            {lightbox.activeIndex + 1} / {videos.length}
          </div>
        </div>
      )}
    </>
  );
}
