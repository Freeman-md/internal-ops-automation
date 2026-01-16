import { TICKET_STATES, TicketState } from "@/domain/tickets/ticket.states";

export const TICKET_TRANSITIONS: Record<TicketState, TicketState[]> = {
  [TICKET_STATES.OPEN]: [TICKET_STATES.IN_PROGRESS],
  [TICKET_STATES.IN_PROGRESS]: [TICKET_STATES.RESOLVED],
  [TICKET_STATES.RESOLVED]: [],
};

export const TICKET_ACTIONS_BY_STATE: Record<TicketState, string[]> = {
  [TICKET_STATES.OPEN]: ["start"],
  [TICKET_STATES.IN_PROGRESS]: ["resolve"],
  [TICKET_STATES.RESOLVED]: [],
};
