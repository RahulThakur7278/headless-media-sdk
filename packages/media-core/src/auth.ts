// ─────────────────────────────────────────────────────────
// media-core/src/auth.ts
// API key management — encapsulates auth so it doesn't
// leak into business logic
// ─────────────────────────────────────────────────────────

import { AuthError } from './errors';

export class AuthManager {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new AuthError('API key is required and must be a non-empty string');
    }
    this.apiKey = apiKey.trim();
  }

  /**
   * Returns the headers object with the Authorization header set.
   * This is the ONLY place the API key surfaces.
   */
  getHeaders(): Record<string, string> {
    return {
      Authorization: this.apiKey,
    };
  }

  /**
   * Validate that the key is set (runtime guard).
   */
  validate(): boolean {
    return this.apiKey.length > 0;
  }
}
