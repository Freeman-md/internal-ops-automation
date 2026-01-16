import { TicketItem } from "@/adapters/tickets/selectors/collect-ticket-items";
import { TICKET_STATES, TicketState } from "@/domain/tickets/states";
import { VerificationError } from "@/domain/errors/verification.error";

export type TicketStateCounts = Record<TicketState, number>;
export type TicketStateBuckets = Record<TicketState, string[]>;

export function countTicketStates(items: TicketItem[]): {
  counts: TicketStateCounts;
  buckets: TicketStateBuckets;
} {
  const counts: TicketStateCounts = {
    open: 0,
    in_progress: 0,
    resolved: 0,
  };

  const buckets: TicketStateBuckets = {
    open: [],
    in_progress: [],
    resolved: [],
  };

  for (const item of items) {
    if (!Object.values(TICKET_STATES).includes(item.state as TicketState)) {
      throw new VerificationError("Invalid ticket state detected", {
        id: item.id,
        state: item.state,
      });
    }

    const state = item.state as TicketState;
    counts[state]++;
    buckets[state].push(item.id);
  }

  return { counts, buckets };
}