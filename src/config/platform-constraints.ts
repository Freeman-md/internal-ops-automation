// src/config/platform-constraints.ts

export const TRIAGE_STATES = {
  PENDING: "pending",
  PROCESSED: "processed",
  FAILED: "failed",
} as const;

export type TriageState =
  (typeof TRIAGE_STATES)[keyof typeof TRIAGE_STATES];

export const TICKET_STATES = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
} as const;

export type TicketState =
  (typeof TICKET_STATES)[keyof typeof TICKET_STATES];

export const TICKET_TRANSITIONS: Record<TicketState, TicketState[]> = {
  [TICKET_STATES.OPEN]: [TICKET_STATES.IN_PROGRESS],
  [TICKET_STATES.IN_PROGRESS]: [TICKET_STATES.RESOLVED],
  [TICKET_STATES.RESOLVED]: [],
};

export const TRIAGE_ACTIONS_BY_STATE: Record<TriageState, string[]> = {
  [TRIAGE_STATES.PENDING]: ["processed"],
  [TRIAGE_STATES.PROCESSED]: [],
  [TRIAGE_STATES.FAILED]: [],
};

export const TICKET_ACTIONS_BY_STATE: Record<TicketState, string[]> = {
  [TICKET_STATES.OPEN]: ["start"],
  [TICKET_STATES.IN_PROGRESS]: ["resolve"],
  [TICKET_STATES.RESOLVED]: [],
};