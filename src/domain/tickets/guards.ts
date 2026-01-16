import { AssertionError } from "@/domain/errors/assertion.error";
import { TICKET_TRANSITIONS } from "@/domain/tickets/rules";
import { TICKET_STATES } from "@/domain/tickets/states";

export function assertValidTicketTransition(
  current: string,
  next: string
) {
  if (!Object.values(TICKET_STATES).includes(current as any)) {
    throw new AssertionError(`Invalid ticket state: ${current}`, { current });
  }

  if (!TICKET_TRANSITIONS[current]?.includes(next)) {
    throw new AssertionError(`Invalid transition: ${current} → ${next}`, {
      current,
      next,
    });
  }
}
