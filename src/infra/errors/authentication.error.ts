export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired or unauthenticated");
  }
}

export class AuthenticationFailedError extends Error {
  constructor() {
    super("Authentication failed after retries");
  }
}
