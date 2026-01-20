export const TRIAGE_STATES = {
  PENDING: "pending",
  PROCESSED: "processed",
  FAILED: "failed",
} as const;

export type TriageState =
  (typeof TRIAGE_STATES)[keyof typeof TRIAGE_STATES];
