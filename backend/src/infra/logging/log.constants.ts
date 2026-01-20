export const LOG_SCOPE = {
  AUTH: "AUTH",
  SESSION: "SESSION",
  NAV: "NAV",
  FLOW: "FLOW",
  TRIAGE: "TRIAGE",
  TICKETS: "TICKETS",
} as const;

export const LOG_MESSAGES = {
  AUTH: {
    CHECKING_STATE: "Checking authentication state",
    SUCCESS: "Authentication successful"
  },
  SESSION: {
    VALID: "Session valid",
    MISSING: "Session missing",
    SAVING: "Saving session",
    SAVED: "Session saved"
  },
  NAV: {
    REDIRECT_LOGIN: "Redirecting to login"
  },
  FLOW: {
    AWAITING_MANUAL_LOGIN: "Awaiting manual login"
  }
} as const;
