export const LOG_SCOPE = {
  AUTH: "AUTH",
  SESSION: "SESSION",
  WORKFLOW: "WORKFLOW",
  HUMAN: "HUMAN"
} as const;

export const LOG_MESSAGES = {
  AUTH: {
    CHECKING_STATE: "Checking authentication state",
    UNAUTHENTICATED_DETECTED: "Unauthenticated state detected",
    LOGIN_REDIRECT: "Redirecting to login",
    LOGIN_READY: "Login page ready for human input",
    LOGIN_REQUIRED: "User not authenticated, awaiting manual login",
    MANUAL_LOGIN: "Starting manual authentication flow",
    LOGIN_SUCCESS: "Authentication successful",
    SESSION_VALID: "Session is valid",
    EXISTING_SESSION: "Existing session detected. No human action needed",
    AUTH_COMPLETE: "Authentication phase complete"
  },
  HUMAN: {
    AWAITING_LOGIN: "Waiting for human to complete login",
    LOGIN_DETECTED: "Human login detected",
  },
  SESSION: {
    SAVED_SESSION: "Session saved successfully",
    SAVING_SESSION: "Saving authenticated session"
  }
} as const;