---
name: media-data-wiring
description: |
  Teaches AI how to wire up the media SDK for data fetching: MediaProvider setup,
  hooks (usePhotos, useVideos, useMediaItem), event subscription, auth config,
  and pagination patterns. Use this skill when building any UI that needs to
  fetch and display media from Pexels.
---

# Media Data Wiring Skill

## When to Use

Use this skill when you need to:
- Set up a React app to fetch photos/videos from Pexels
- Wire data hooks to UI components
- Handle pagination, loading, and error states
- Subscribe to SDK events (view, download, search)
- Configure API authentication

## Architecture Rule — NEVER BREAK

```
app → media-react → media-core
app → media-ui-react (SEPARATE — no import of media-core or media-react)
```

The **app** is the ONLY place that imports both `media-react` (data) and `media-ui-react` (display).
Components in `media-ui-react` must NEVER import from `media-core` or `media-react`.

---

## Step 1: Provider Setup

Wrap your app root with `MediaProvider`. The API key is the only required prop.

```tsx
import { MediaProvider } from 'media-react';

function App() {
  return (
    <MediaProvider
      apiKey={import.meta.env.VITE_PEXELS_API_KEY}
      config={{
        enableLogging: true,    // Console logs all events
        cacheTTL: 300_000,      // Cache for 5 minutes
        defaultPerPage: 15,
      }}
    >
      <YourApp />
    </MediaProvider>
  );
}
```

> **IMPORTANT**: Never hardcode the API key. Use environment variables.
> Create `.env` with `VITE_PEXELS_API_KEY=your_key_here`.

---

## Step 2: Fetching Photos

### Search Photos
```tsx
import { usePhotos } from 'media-react';

function PhotoSearch({ query }: { query: string }) {
  const { photos, loading, error, hasMore, loadMore, totalResults } = usePhotos(query, {
    perPage: 15,
    orientation: 'landscape',  // optional: 'landscape' | 'portrait' | 'square'
    size: 'medium',            // optional: 'large' | 'medium' | 'small'
  });

  // photos: PexelsPhoto[] — array of photo objects
  // loading: boolean
  // error: Error | null
  // hasMore: boolean — true if more pages available
  // loadMore: () => void — call to fetch next page (appends to photos)
  // totalResults: number
}
```

### Curated Photos (no query)
```tsx
const { photos, loadMore } = usePhotos(); // No query = curated/trending
```

### Photo Object Shape
```typescript
interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color: string;
  alt: string;
  src: {
    original: string;
    large2x: string;   // Best for lightbox
    large: string;
    medium: string;     // Best for grid thumbnails
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}
```

---

## Step 3: Fetching Videos

```tsx
import { useVideos } from 'media-react';

function VideoSearch({ query }: { query: string }) {
  const { videos, loading, error, hasMore, loadMore } = useVideos(query, {
    perPage: 10,
  });
  // videos: PexelsVideo[]
}

// Popular videos (no query):
const { videos } = useVideos();
```

### Video Object Shape
```typescript
interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;            // Poster/thumbnail URL
  duration: number;         // In seconds
  user: { id: number; name: string; url: string };
  video_files: Array<{
    id: number;
    quality: string;        // 'hd' | 'sd'
    file_type: string;      // 'video/mp4'
    width: number;
    height: number;
    link: string;           // Playback URL
  }>;
}
```

### Getting the Best Video URL
```tsx
function getBestVideoUrl(video: PexelsVideo): string {
  const hd = video.video_files.find(f => f.quality === 'hd');
  const sd = video.video_files.find(f => f.quality === 'sd');
  return hd?.link || sd?.link || video.video_files[0]?.link || '';
}
```

---

## Step 4: Single Item Fetch

```tsx
import { useMediaItem } from 'media-react';

// Fetch a single photo
const { item: photo, loading, error } = useMediaItem('photo', photoId);

// Fetch a single video
const { item: video, loading, error } = useMediaItem('video', videoId);

// Pass null to skip fetching
const { item } = useMediaItem('photo', selectedId ?? null);
```

---

## Step 5: Event Subscription

The SDK emits events for tracking user activity.

### Subscribe to Specific Events
```tsx
import { useMediaEvents } from 'media-react';

function MyComponent() {
  useMediaEvents('view', (event) => {
    // event.type === 'view'
    // event.payload — { type: 'photo', id: 123, ... }
    // event.timestamp — number (Date.now())
    analytics.track('media_view', event.payload);
  });

  useMediaEvents('download', (event) => {
    analytics.track('media_download', event.payload);
  });
}
```

### Subscribe to ALL Events
```tsx
import { useAllMediaEvents } from 'media-react';

function EventLogger() {
  useAllMediaEvents((event) => {
    console.log(`[${event.type}]`, event.payload);
  });
}
```

### Emitting Custom Events
```tsx
import { useMediaClient } from 'media-react';

function PhotoCard({ photo }) {
  const client = useMediaClient();

  const handleDownload = () => {
    client.emit('download', { type: 'photo', id: photo.id });
    // Trigger actual download...
  };
}
```

---

## Step 6: Direct Client Access

For advanced use cases, access the raw `MediaClient`:

```tsx
import { useMediaClient } from 'media-react';

function AdvancedComponent() {
  const client = useMediaClient();

  // Direct API calls (bypasses React state management)
  const result = await client.searchPhotos({ query: 'nature', page: 1 });

  // Cache management
  client.clearCache();

  // Event emission
  client.emit('custom-event', { data: 'value' });
}
```

---

## Common Patterns

### Debounced Search
```tsx
const [debouncedQuery, setDebouncedQuery] = useState('');
const { photos } = usePhotos(debouncedQuery || undefined);

// In search input onChange, debounce before setting debouncedQuery
```

### Conditional Fetching
```tsx
const { photos } = usePhotos(query, {
  enabled: query.length >= 2,  // Don't fetch until 2+ chars
});
```

### Query Reset
When the query changes, `usePhotos` automatically:
1. Clears the current photos array
2. Resets to page 1
3. Fetches fresh results
No manual reset needed.

---

## Error Handling

All hooks return typed errors:
```tsx
const { error } = usePhotos(query);

if (error) {
  if (error.message.includes('Rate limit')) {
    // Show "try again later"
  } else if (error.message.includes('Unauthorized')) {
    // Check API key
  } else {
    // Generic error display
  }
}
```
