// ─────────────────────────────────────────────────────────
// VideoReels.tsx
// Wires useVideos (media-react) → useReelSwiper (media-ui-react)
// ─────────────────────────────────────────────────────────

import { useCallback } from 'react';
import { useVideos, useMediaClient } from 'media-react';
import { useReelSwiper } from 'media-ui-react';
import type { PexelsVideo } from 'media-react';

function getBestVideoUrl(video: PexelsVideo): string {
  const hd = video.video_files.find((f) => f.quality === 'hd');
  const sd = video.video_files.find((f) => f.quality === 'sd');
  return hd?.link || sd?.link || video.video_files[0]?.link || '';
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoReels() {
  const client = useMediaClient();
  const { videos, loading, error } = useVideos(undefined, { perPage: 10 });

  const handleActiveChange = useCallback(
    (index: number, video: PexelsVideo) => {
      client.emit('view', {
        type: 'video',
        id: video.id,
        context: 'reel',
      });
    },
    [client]
  );

  const reels = useReelSwiper({
    items: videos,
    onActiveChange: handleActiveChange,
  });

  if (error) {
    return <div className="error-message">⚠️ {error.message}</div>;
  }

  if (loading && videos.length === 0) {
    return (
      <div className="loading-spinner">
        <div className="spinner" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="empty-state">
        <h2>No videos available</h2>
        <p>Check back later for popular videos</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', maxWidth: 500, margin: '0 auto' }}>
      <div className="reels-container" {...reels.getContainerProps()}>
        {reels.items.map((video, index) => (
          <div className="reel-slide" {...reels.getSlideProps(index)}>
            <video
              src={getBestVideoUrl(video)}
              loop
              muted
              playsInline
              autoPlay={index === reels.activeIndex}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onLoadedData={(e) => {
                // Auto-play the active reel, pause others
                if (index === reels.activeIndex) {
                  (e.target as HTMLVideoElement).play().catch(() => {});
                }
              }}
            />
            <div className="reel-info">
              <div className="reel-user">{video.user.name}</div>
              <div className="reel-duration">{formatDuration(video.duration)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator dots */}
      <div className="reel-indicator">
        {videos.slice(0, 8).map((_, i) => (
          <div
            key={i}
            className={`reel-dot ${i === reels.activeIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
