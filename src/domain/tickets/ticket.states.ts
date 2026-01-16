export const TICKET_STATES = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
} as const;

export type TicketState =
  (typeof TICKET_STATES)[keyof typeof TICKET_STATES];
