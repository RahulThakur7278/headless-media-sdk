// ─────────────────────────────────────────────────────────
// media-core/src/errors.ts
// Typed error hierarchy for the media SDK
// ─────────────────────────────────────────────────────────

export class MediaError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;

  constructor(message: string, code: string, statusCode?: number) {
    super(message);
    this.name = 'MediaError';
    this.code = code;
    this.statusCode = statusCode;
    // Fix prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthError extends MediaError {
  constructor(message = 'Invalid or missing API key') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthError';
  }
}

export class NetworkError extends MediaError {
  constructor(message = 'Network request failed', statusCode?: number) {
    super(message, 'NETWORK_ERROR', statusCode);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends MediaError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number) {
    super(
      `Rate limit exceeded${retryAfter ? `. Retry after ${retryAfter}s` : ''}`,
      'RATE_LIMIT_ERROR',
      429
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class NotFoundError extends MediaError {
  constructor(resource: string, id: string | number) {
    super(`${resource} with id ${id} not found`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends MediaError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
