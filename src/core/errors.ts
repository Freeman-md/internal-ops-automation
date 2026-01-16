export class SessionExpiredError extends Error {
    constructor() {
        super("Session expired or unauthenticated")
    }
}

export class NavigationError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class AuthenticationFailedError extends Error {
  constructor() {
    super("Authentication failed after retries");
  }
}

export class AssertionError extends Error {
  type: "ASSERTION";
  meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>) {
    super(message);
    this.type = "ASSERTION";
    this.meta = meta;
  }
}

export class ActionError extends Error {
  type: "ACTION";
  meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>) {
    super(message);
    this.type = "ACTION";
    this.meta = meta;
  }
}

export class VerificationError extends Error {
  type: "VERIFICATION";
  meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>) {
    super(message);
    this.type = "VERIFICATION";
    this.meta = meta;
  }
}
