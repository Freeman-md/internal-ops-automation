import { TRIAGE_ACTIONS_BY_STATE } from "@/config/platform-constraints";
import { BrowserContext, Page } from "playwright";
import { TICKET_STATES, TICKET_TRANSITIONS, TRIAGE_STATES } from "@/config/platform-constraints";
import { authenticate } from "@/workflows/authenticate";
import { AssertionError } from "@/core/errors";

export function assertValidTicketTransition(
    current: string,
    next: string
) {
    if (!Object.values(TICKET_STATES).includes(current as any)) {
        throw new AssertionError(`Invalid ticket state: ${current}`, { current });
    }

    if (!TICKET_TRANSITIONS[current]?.includes(next)) {
        throw new AssertionError(`Invalid transition: ${current} → ${next}`, { current, next });
    }
}

export function assertTriageActionAllowed(
  currentState: string,
  action: string
) {
  if (!Object.values(TRIAGE_STATES).includes(currentState as any)) {
    throw new AssertionError(`Invalid triage state: ${currentState}`, { currentState });
  }

  if (!TRIAGE_ACTIONS_BY_STATE[currentState]?.includes(action)) {
    throw new AssertionError(
      `Action "${action}" not allowed in triage state "${currentState}"`,
      { currentState, action }
    );
  }
}

export async function withAuth(
  page: Page,
  context: BrowserContext,
  next: () => Promise<void>
) {
  await authenticate(page, context);
  await next();
}
