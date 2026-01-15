import { TRIAGE_ACTIONS_BY_STATE } from './../config/platform-constraints';
import { BrowserContext, Page } from "playwright";
import { TICKET_STATES, TICKET_TRANSITIONS, TRIAGE_STATES } from "../config/platform-constraints";
import { authenticate } from "../workflows/authenticate";

export function assertValidTicketTransition(
    current: string,
    next: string
) {
    if (!TICKET_STATES.includes(current as any)) {
        throw new Error(`Invalid ticket state: ${current}`);
    }

    if (!TICKET_TRANSITIONS[current]?.includes(next)) {
        throw new Error(`Invalid transition: ${current} → ${next}`);
    }
}

export function assertTriageActionAllowed(
  currentState: string,
  action: string
) {
  if (!TRIAGE_STATES.includes(currentState as any)) {
    throw new Error(`Invalid triage state: ${currentState}`);
  }

  if (!TRIAGE_ACTIONS_BY_STATE[currentState]?.includes(action)) {
    throw new Error(
      `Action "${action}" not allowed in triage state "${currentState}"`
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