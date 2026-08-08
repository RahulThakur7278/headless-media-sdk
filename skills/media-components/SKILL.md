---
name: media-components
description: |
  Teaches AI how to use the headless media-ui-react components: Grid (with infinite scroll),
  Lightbox (with keyboard navigation), and ReelSwiper (vertical snap paging). Covers the
  prop-getter pattern, styling contract, accessibility, and how to wire data to components.
---

# Media Components Skill

## When to Use

Use this skill when you need to:
- Render a grid of media items with infinite scroll
- Open items in a lightbox with keyboard navigation
- Build vertical video reels with snap scrolling
- Style headless components (they ship NO CSS)
- Ensure accessibility in media components

## Core Concept — Headless Prop-Getter Pattern

All components in `media-ui-react` are **headless**: they provide behavior/state
through hooks and **prop-getters** (functions that return HTML props). They ship
**zero styles** — you provide all CSS.

```tsx
// Prop-getter pattern — the hook gives you FUNCTIONS that return props
const grid = useGrid({ items, hasMore, onLoadMore });

// You spread those props onto YOUR elements with YOUR styles
<div className="my-custom-grid" {...grid.getContainerProps()}>
  {items.map((item, i) => (
    <div className="my-card" {...grid.getItemProps(i)}>
      {/* Your custom rendering */}
    </div>
  ))}
</div>
```

## CRITICAL: Dependency Boundary

`media-ui-react` components **know NOTHING** about:
- Pexels API
- `media-core`
- `media-react`

They accept generic data as props. The **app** is where you wire
data (from `media-react`) to display (from `media-ui-react`).

---

## Component 1: Grid (useGrid)

### Import
```tsx
import { useGrid } from 'media-ui-react';
```

### API
```tsx
const grid = useGrid({
  items: any[],              // Your data array
  hasMore: boolean,          // Are more items available?
  onLoadMore: () => void,    // Called when sentinel is visible
  columns?: number,          // Grid columns (default: 3)
  gap?: number,              // Gap in px (default: 16)
  rootMargin?: string,       // IntersectionObserver margin (default: '200px')
});
```

### Return Value
```tsx
grid.getContainerProps()  // Spread on grid container: role, aria-label, style
grid.getItemProps(index)  // Spread on each item: key, role, tabIndex, style
grid.sentinelRef          // Ref callback for the infinite scroll sentinel
grid.items                // Pass-through of your items array
```

### Complete Example — Photo Grid
```tsx
import { usePhotos } from 'media-react';
import { useGrid } from 'media-ui-react';

function PhotoGrid() {
  // DATA (from media-react)
  const { photos, hasMore, loadMore } = usePhotos('nature');

  // DISPLAY (from media-ui-react — generic, no Pexels knowledge)
  const grid = useGrid({
    items: photos,
    hasMore,
    onLoadMore: loadMore,
    columns: 3,
    gap: 16,
  });

  return (
    <div className="my-grid" {...grid.getContainerProps()}>
      {grid.items.map((photo, i) => (
        <div className="my-card" {...grid.getItemProps(i)}>
          {/* Consumer renders whatever they want */}
          <img src={photo.src.medium} alt={photo.alt} />
          <span>{photo.photographer}</span>
        </div>
      ))}
      {/* REQUIRED: Sentinel for infinite scroll */}
      <div ref={grid.sentinelRef} style={{ height: 1 }} />
    </div>
  );
}
```

### Styling the Grid
The `getContainerProps()` returns a CSS Grid style. Override it with your class:
```css
.my-grid {
  /* These are set by getContainerProps, you can override: */
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.my-card {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 150ms ease;
}

.my-card:hover {
  transform: translateY(-4px);
}
```

---

## Component 2: Lightbox (useLightbox)

### Import
```tsx
import { useLightbox } from 'media-ui-react';
```

### API
```tsx
const lightbox = useLightbox({
  items: any[],                        // Items that can be viewed
  onView?: (item, index) => void,      // Called when item becomes active
  onClose?: () => void,                // Called when lightbox closes
  enableKeyboard?: boolean,            // Default: true
});
```

### Return Value
```tsx
lightbox.isOpen           // boolean
lightbox.activeItem       // Currently displayed item (or null)
lightbox.activeIndex      // Current index
lightbox.hasNext          // boolean
lightbox.hasPrev          // boolean

// Actions
lightbox.open(index)      // Open at specific index
lightbox.close()          // Close lightbox
lightbox.next()           // Go to next item
lightbox.prev()           // Go to previous item

// Prop Getters (spread on YOUR elements)
lightbox.getOverlayProps()      // For the backdrop: role="dialog", aria-modal, scroll lock
lightbox.getContentProps()      // For the content area: stops event propagation
lightbox.getCloseButtonProps()  // For close button: aria-label, onClick
lightbox.getNextButtonProps()   // For next button: aria-label, onClick, disabled
lightbox.getPrevButtonProps()   // For prev button: aria-label, onClick, disabled
```

### Keyboard Handling (built-in)
- **Escape** → closes lightbox
- **Arrow Right** → next item
- **Arrow Left** → previous item
- **Tab** → focus-trapped within lightbox

### Complete Example
```tsx
const lightbox = useLightbox({
  items: photos,
  onView: (photo) => client.emit('view', { id: photo.id }),
});

// Open from grid item click:
<div onClick={() => lightbox.open(index)}>...</div>

// Render the lightbox:
{lightbox.isOpen && lightbox.activeItem && (
  <div className="my-overlay" {...lightbox.getOverlayProps()}>
    <button className="my-close-btn" {...lightbox.getCloseButtonProps()}>✕</button>
    <button className="my-prev-btn" {...lightbox.getPrevButtonProps()}>‹</button>
    <div className="my-content" {...lightbox.getContentProps()}>
      <img src={lightbox.activeItem.src.large2x} alt="..." />
    </div>
    <button className="my-next-btn" {...lightbox.getNextButtonProps()}>›</button>
    <span>{lightbox.activeIndex + 1} / {photos.length}</span>
  </div>
)}
```

### Styling the Lightbox
```css
.my-overlay {
  /* getOverlayProps sets: position fixed, inset 0, z-index 9999, flex center */
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
}

.my-close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  /* Your button styles */
}

.my-prev-btn, .my-next-btn {
  position: fixed;
  top: 50%;
  /* Your navigation button styles */
}
```

### Accessibility Contract
The lightbox automatically provides:
- `role="dialog"` and `aria-modal="true"` on overlay
- `aria-label` on all buttons
- `disabled` on nav buttons when at boundaries
- Focus trap (Tab cycles within lightbox)
- Focus restoration on close

---

## Component 3: ReelSwiper (useReelSwiper)

### Import
```tsx
import { useReelSwiper } from 'media-ui-react';
```

### API
```tsx
const reels = useReelSwiper({
  items: any[],                                    // Items to display as reels
  onActiveChange?: (index, item) => void,          // Called when visible reel changes
  activeThreshold?: number,                        // Visibility threshold (default: 0.6)
});
```

### Return Value
```tsx
reels.activeIndex          // Index of the most-visible item
reels.items                // Pass-through
reels.scrollTo(index)      // Programmatic scroll to index

reels.getContainerProps()  // For scroll container: scroll-snap, ref, role="feed"
reels.getSlideProps(index) // For each slide: scroll-snap-align, ref, aria attrs
```

### Complete Example
```tsx
import { useVideos } from 'media-react';
import { useReelSwiper } from 'media-ui-react';

function VideoReels() {
  const { videos } = useVideos(undefined, { perPage: 10 });

  const reels = useReelSwiper({
    items: videos,
    onActiveChange: (index, video) => {
      client.emit('view', { type: 'video', id: video.id });
    },
  });

  return (
    <div className="reels-wrapper" {...reels.getContainerProps()}>
      {reels.items.map((video, i) => (
        <div className="reel-slide" {...reels.getSlideProps(i)}>
          <video
            src={getBestVideoUrl(video)}
            autoPlay={i === reels.activeIndex}
            loop
            muted
            playsInline
          />
          <div className="reel-info">
            <strong>{video.user.name}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Styling the Reels
```css
.reels-wrapper {
  /* getContainerProps sets: overflow-y scroll, scroll-snap-type y mandatory, height 100% */
  height: calc(100vh - 64px);
  border-radius: 16px;
  scrollbar-width: none;  /* Hide scrollbar */
}

.reels-wrapper::-webkit-scrollbar {
  display: none;
}

.reel-slide {
  /* getSlideProps sets: scroll-snap-align start, height 100% */
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
```

### Active Item Detection
The `activeIndex` updates automatically via IntersectionObserver when
a slide becomes >60% visible (configurable via `activeThreshold`).
Use this to:
- Auto-play/pause videos
- Track view analytics
- Highlight dot indicators

---

## Wiring Pattern Summary

The app always follows this pattern:

```tsx
// 1. Get DATA from media-react
const { photos, hasMore, loadMore } = usePhotos(query);

// 2. Get BEHAVIOR from media-ui-react (generic — no Pexels knowledge)
const grid = useGrid({ items: photos, hasMore, onLoadMore: loadMore });
const lightbox = useLightbox({ items: photos, onView: trackView });

// 3. Render YOUR markup with spread prop-getters
<div {...grid.getContainerProps()}>
  {photos.map((p, i) => (
    <div {...grid.getItemProps(i)} onClick={() => lightbox.open(i)}>
      <img src={p.src.medium} />
    </div>
  ))}
  <div ref={grid.sentinelRef} />
</div>
```

## Common Mistakes to Avoid

1. **DON'T** import `media-core` in UI components
2. **DON'T** pass the `MediaClient` to headless hooks — they don't need it
3. **DON'T** forget the sentinel element for infinite scroll
4. **DON'T** forget to conditionally render the lightbox (`{lightbox.isOpen && ...}`)
5. **DO** spread prop-getters on your elements for accessibility
6. **DO** use `loading="lazy"` on grid images
7. **DO** use `autoPlay={i === reels.activeIndex}` for video reels
