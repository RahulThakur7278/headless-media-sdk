// ─────────────────────────────────────────────────────────
// EventLogger.tsx — Displays SDK events in real-time
// Shows the event emitter system in action
// ─────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { useAllMediaEvents } from 'media-react';
import type { MediaEvent } from 'media-react';

interface LogEntry {
  id: number;
  type: string;
  payload: string;
  time: string;
}

let idCounter = 0;

export function EventLogger() {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const handler = useCallback((event: MediaEvent) => {
    const entry: LogEntry = {
      id: ++idCounter,
      type: event.type,
      payload: JSON.stringify(event.payload).slice(0, 80),
      time: new Date(event.timestamp).toLocaleTimeString(),
    };

    setEntries((prev) => [entry, ...prev].slice(0, 50));
  }, []);

  useAllMediaEvents(handler);

  return (
    <div className="event-logger">
      <div className="event-logger-header">
        <span>📡 SDK Events ({entries.length})</span>
        <button
          className="event-logger-toggle"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>
      {!isMinimized && (
        <div className="event-logger-body">
          {entries.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', padding: 8, textAlign: 'center' }}>
              Waiting for events...
            </div>
          ) : (
            entries.map((entry) => (
              <div className="event-log-entry" key={entry.id}>
                <span className="event-type">{entry.type}</span>
                <span className="event-time">{entry.time}</span>
                <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {entry.payload}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
