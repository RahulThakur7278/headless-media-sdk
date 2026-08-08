// ─────────────────────────────────────────────────────────
// SearchPage.tsx
// Search bar → Photo/Video Grid → Lightbox
// This is the KEY wiring layer: media-react ↔ media-ui-react
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { PhotoGrid } from '../components/PhotoGrid';
import { VideoGrid } from '../components/VideoGrid';

type MediaType = 'photos' | 'videos';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('photos');

  return (
    <div>
      <SearchBar value={query} onChange={setQuery} />

      <div className="media-type-toggle">
        <button
          className={`type-btn ${mediaType === 'photos' ? 'active' : ''}`}
          onClick={() => setMediaType('photos')}
        >
          📷 Photos
        </button>
        <button
          className={`type-btn ${mediaType === 'videos' ? 'active' : ''}`}
          onClick={() => setMediaType('videos')}
        >
          🎬 Videos
        </button>
      </div>

      {mediaType === 'photos' ? (
        <PhotoGrid query={query} />
      ) : (
        <VideoGrid query={query} />
      )}
    </div>
  );
}
