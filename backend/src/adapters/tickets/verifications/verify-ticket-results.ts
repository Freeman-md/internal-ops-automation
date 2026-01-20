import { Page } from "playwright";
import { TicketState, TICKET_STATES } from "@/domain/tickets/states";
import { VerificationError } from "@/domain/errors/verification.error";
import { collectTicketItems } from "@/adapters/tickets/selectors/collect-ticket-items";

export async function verifyTicketStates(
  page: Page,
  actedOnItems: string[],
  expectedFinalState: TicketState
): Promise<Record<string, TicketState>> {
  const snapshot = await collectTicketItems(page);
  const finalStates: Record<string, TicketState> = {};

  for (const id of actedOnItems) {
    const item = snapshot.find((i) => i.id === id);

    if (!item) {
      throw new VerificationError(`Acted ticket ${id} missing after action`, { id });
    }

    if (item.state !== expectedFinalState) {
      throw new VerificationError(`Ticket ${id} ended in "${item.state}", expected "${expectedFinalState}"`, {
        id,
        state: item.state,
        expectedFinalState,
      });
    }

    const label = (await item.actionButton.innerText()).trim();
    const disabled = await item.actionButton.isDisabled();

    if (expectedFinalState === TICKET_STATES.IN_PROGRESS) {
      if (!/resolve ticket/i.test(label)) {
        throw new VerificationError(`Ticket ${id} missing "Resolve Ticket" action after start`, {
          id,
          label,
        });
      }
      if (disabled) {
        throw new VerificationError(`Ticket ${id} action button unexpectedly disabled after start`, {
          id,
        });
      }
    }

    if (expectedFinalState === TICKET_STATES.RESOLVED) {
      if (!/no actions/i.test(label)) {
        throw new VerificationError(`Ticket ${id} missing "No Actions" after resolve`, {
          id,
          label,
        });
      }
      if (!disabled) {
        throw new VerificationError(`Ticket ${id} action button still enabled after resolve`, {
          id,
        });
      }
    }

    finalStates[id] = item.state as TicketState;
  }

  return finalStates;
}

export async function readTicketStateSummary(page: Page) {
  const summaryCard = page.getByText(/state summary/i).locator("..").locator("..");
  const values = summaryCard.locator("div.text-2xl.font-semibold");

  // Order in UI: Open, In Progress, Resolved
  return {
    open: Number((await values.nth(0).innerText()).trim()),
    in_progress: Number((await values.nth(1).innerText()).trim()),
    resolved: Number((await values.nth(2).innerText()).trim()),
  };
}