// ─────────────────────────────────────────────────────────
// App.tsx — Root component
// Wires MediaProvider (auth/data) and routes
// ─────────────────────────────────────────────────────────

import { useState } from 'react';
import { MediaProvider } from 'media-react';
import { SearchPage } from './pages/SearchPage';
import { ReelsPage } from './pages/ReelsPage';
import { EventLogger } from './components/EventLogger';

// API key — in production this would come from env vars
const API_KEY = import.meta.env.VITE_PEXELS_API_KEY || 'YOUR_PEXELS_API_KEY';

type View = 'search' | 'reels';

export default function App() {
  const [view, setView] = useState<View>('search');

  return (
    <MediaProvider apiKey={API_KEY} config={{ enableLogging: true }}>
      <div className="app-layout">
        {/* ── Header ─────────────────────────────────────── */}
        <header className="app-header">
          <div className="header-inner">
            <h1 className="app-logo">Media Explorer</h1>
            <nav>
              <ul className="nav-links">
                <li>
                  <a
                    href="#search"
                    className={view === 'search' ? 'active' : ''}
                    onClick={(e) => { e.preventDefault(); setView('search'); }}
                  >
                    🔍 Search
                  </a>
                </li>
                <li>
                  <a
                    href="#reels"
                    className={view === 'reels' ? 'active' : ''}
                    onClick={(e) => { e.preventDefault(); setView('reels'); }}
                  >
                    📱 Reels
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* ── Main Content ───────────────────────────────── */}
        <main className="app-main">
          {view === 'search' && <SearchPage />}
          {view === 'reels' && <ReelsPage />}
        </main>

        {/* ── Event Logger (shows SDK events) ────────────── */}
        <EventLogger />
      </div>
    </MediaProvider>
  );
}
