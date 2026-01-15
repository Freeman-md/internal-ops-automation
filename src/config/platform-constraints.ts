export const TRIAGE_STATES = ["pending", "processed"] as const;

export const TICKET_STATES = ["open", "in_progress", "resolved"] as const;

export const TICKET_TRANSITIONS: Record<string, string[]> = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: []
};

export const TRIAGE_ACTIONS_BY_STATE: Record<string, string[]> = {
  pending: ["processed"],
  processed: [],
};

export const TICKET_ACTIONS_BY_STATE: Record<string, string[]> = {
  open: ["start"],
  in_progress: ["resolve"],
  resolved: []
};