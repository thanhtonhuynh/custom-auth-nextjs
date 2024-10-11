export class GenericError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenericError';
  }
}

export class RateLimitError extends Error {
  constructor() {
    super('Too many attempts. Please try again later.');
    this.name = 'RateLimitError';
  }
}

export class AuthenticationError extends Error {
  constructor() {
    super('Authentication failed');
    this.name = 'AuthenticationError';
  }
}

export class TokenExpiredError extends Error {
  constructor() {
    super(
      'Invalid or expired verification code. Please try again or request a new one.'
    );
    this.name = 'TokenExpiredError';
  }
}
