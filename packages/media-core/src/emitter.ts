// ─────────────────────────────────────────────────────────
// media-core/src/emitter.ts
// Type-safe event emitter with subscribe/unsubscribe
// ─────────────────────────────────────────────────────────

import type { MediaEvent, MediaEventType, EventHandler } from './types';

export class EventEmitter {
  private listeners = new Map<string, Set<EventHandler>>();
  private globalListeners = new Set<EventHandler>();

  /**
   * Subscribe to a specific event type.
   * Returns an unsubscribe function for convenience.
   */
  on<T = unknown>(type: MediaEventType, handler: EventHandler<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as EventHandler);
    return () => this.off(type, handler);
  }

  /**
   * Subscribe to ALL events (useful for logging, analytics).
   */
  onAny(handler: EventHandler): () => void {
    this.globalListeners.add(handler);
    return () => this.globalListeners.delete(handler);
  }

  /**
   * Unsubscribe a handler from a specific event type.
   */
  off<T = unknown>(type: MediaEventType, handler: EventHandler<T>): void {
    this.listeners.get(type)?.delete(handler as EventHandler);
  }

  /**
   * Emit an event to all relevant subscribers.
   */
  emit<T = unknown>(type: MediaEventType, payload: T): MediaEvent<T> {
    const event: MediaEvent<T> = {
      type,
      payload,
      timestamp: Date.now(),
    };

    // Notify type-specific listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      for (const handler of typeListeners) {
        try {
          handler(event as MediaEvent);
        } catch (err) {
          console.error(`[media-core] Error in event handler for "${type}":`, err);
        }
      }
    }

    // Notify global listeners
    for (const handler of this.globalListeners) {
      try {
        handler(event as MediaEvent);
      } catch (err) {
        console.error(`[media-core] Error in global event handler:`, err);
      }
    }

    return event;
  }

  /**
   * Remove all listeners (used during cleanup/destroy).
   */
  removeAll(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }
}

/**
 * Default console logger — auto-registered when enableLogging is true.
 */
export const defaultLogHandler: EventHandler = (event) => {
  const time = new Date(event.timestamp).toISOString();
  console.log(`[media-core][${time}] ${event.type}:`, event.payload);
};
