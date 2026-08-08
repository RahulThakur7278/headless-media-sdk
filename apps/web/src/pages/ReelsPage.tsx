// ─────────────────────────────────────────────────────────
// ReelsPage.tsx — Vertical video reels
// Wires media-react (data) → media-ui-react (display)
// ─────────────────────────────────────────────────────────

import { VideoReels } from '../components/VideoReels';

export function ReelsPage() {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 4 }}>
          Video Reels
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Scroll or swipe to browse popular videos
        </p>
      </div>
      <VideoReels />
    </div>
  );
}
