# Headless Media SDK Ecosystem

A monorepo implementing a headless media SDK ecosystem: a framework-agnostic core, thin per-platform wrappers, an independent pure-UI component library, and a demo app that wires them together.

**Data Source:** [Pexels API](https://www.pexels.com/api/) (free key) — photos + videos.

## Architecture

```
┌─────────────────────────────────────────┐
│              media-app (Web)            │  ← The ONLY place that imports
│     imports: media-react + media-ui-react  both data and display
└──────┬──────────────┬───────────────────┘
       │              │
       ▼              ▼
┌──────────────┐  ┌───────────────────┐
│  media-react │  │  media-ui-react   │  ← INDEPENDENT packages
│  (hooks)     │  │  (headless UI)    │     They never import each other
└──────┬───────┘  └───────────────────┘
       │              ▲
       ▼              │ ✕ NO import
┌──────────────┐      │
│  media-core  │──────┘
│  (SDK)       │
└──────────────┘
```

### Dependency Rules (strictly enforced)

| Package | Can Import | Cannot Import |
|---|---|---|
| `media-core` | Nothing (zero deps) | Any wrapper or UI package |
| `media-react` | `media-core` only | `media-ui-react`, `media-ui-native` |
| `media-native` | `media-core` only | `media-ui-react`, `media-ui-native` |
| `media-ui-react` | React only | `media-core`, `media-react` |
| `media-ui-native` | React/RN only | `media-core`, `media-native` |
| `media-app` | `media-react` + `media-ui-react` | `media-core` directly |

## Packages

### `packages/media-core` — Framework-Agnostic SDK
- Pexels API client: search, curated/trending, pagination, single-item fetch
- Auth: API key management (no leakage into business logic)
- Event emitter: `view`, `download`, `search` events with subscribe/unsubscribe
- In-memory LRU cache with TTL + request deduplication
- Typed responses, error hierarchy, pure TypeScript

### `packages/media-react` — React Wrapper
- `MediaProvider` — creates and manages `MediaClient` in context
- `usePhotos(query?, options?)` — search/curated photos with pagination
- `useVideos(query?, options?)` — search/popular videos with pagination
- `useMediaItem(type, id)` — single item fetch
- `useMediaEvents(type, handler)` — subscribe to SDK events
- `useMediaClient()` — direct client access
- **Zero business logic** — only adapts `media-core` to React idioms

### `packages/media-native` — React Native Wrapper
- Same API surface as `media-react`, adapted for RN patterns
- Structure and types fully implemented (no RN test environment)

### `packages/media-ui-react` — Headless UI Components
- **`useGrid`** — infinite scroll via IntersectionObserver, prop-getters for container/items
- **`useLightbox`** — keyboard nav (Escape/arrows), focus trap, body scroll lock
- **`useReelSwiper`** — CSS scroll-snap vertical paging, active-item detection
- Headless pattern: hooks + prop-getters, NO shipped styles
- **Independent of `media-core`** — takes data purely as props

### `packages/media-ui-native` — Headless RN Components
- Same prop-getter API, adapted for FlatList/Modal patterns

### `apps/web` — Demo App
- Search bar → Grid → Lightbox → Reels
- Event logger showing SDK events in real-time
- The ONLY place that wires data (media-react) to display (media-ui-react)

### `skills/` — AI Coding Skills
- `media-data-wiring/SKILL.md` — How to use hooks, provider, auth, events
- `media-components/SKILL.md` — How to use headless components, prop-getters, styling

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Free [Pexels API key](https://www.pexels.com/api/)

### Setup

```bash
# Clone the repo
git clone <your-repo-url>
cd headless-media-sdk

# Install dependencies
npm install

# Set your Pexels API key
cp apps/web/.env.example apps/web/.env
# Edit .env and add your key: VITE_PEXELS_API_KEY=your_key_here

# Start the dev server
npm run dev
```

### Environment Variables

Create `apps/web/.env`:
```
VITE_PEXELS_API_KEY=your_pexels_api_key_here
```

## AI Usage & Transparency

### What Was AI-Assisted
- **Architecture scaffolding** — Initial monorepo structure and package boundaries were co-designed with AI
- **Boilerplate generation** — Package configs, TypeScript configs, barrel exports
- **Type definitions** — Pexels API response types based on documentation
- **CSS styles** — App styling was AI-assisted with manual refinement

### What Was Hand-Written
- **Core SDK design decisions** — Auth encapsulation, event emitter pattern, cache strategy
- **Headless component API design** — Prop-getter contracts, hook signatures
- **Wiring layer** — How data flows from SDK to UI in the app
- **Architecture boundaries** — Dependency rules and module boundaries

### How Skills Were Used
The two `SKILL.md` documents were:
1. Written iteratively during development
2. Tested by feeding them to the AI assistant when building the app's wiring layer
3. Refined based on whether the AI correctly followed the prop-getter pattern and dependency rules

## Scoping Decisions

Given the time constraints, here's what was prioritized:

| Feature | Status | Rationale |
|---|---|---|
| Core SDK (full) | ✅ | Foundation of everything |
| React wrapper (full) | ✅ | Needed for the web app |
| RN wrapper (types only) | ⚡ | Same API as React — can't test without RN env |
| Web headless components (full) | ✅ | Grid, Lightbox, ReelSwiper all implemented |
| RN headless components (types only) | ⚡ | Adapted for FlatList — can't test without RN env |
| Web app (full) | ✅ | Search, grid, lightbox, reels, event logger |
| Skills (full) | ✅ | Both skills written and tested |
| Unit tests | ❌ | Cut for time — would add jest + testing-library |
| SDK docs (TypeDoc) | ❌ | Cut for time — types are self-documenting |
| CI/CD | ❌ | Cut for time — standard GitHub Actions setup |

## License

MIT
