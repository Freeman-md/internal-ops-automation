import { TicketState, TICKET_STATES } from "@/domain/tickets/states";
import { assertValidTicketTransition } from "@/domain/tickets/guards";
import { AssertionError } from "@/domain/errors/assertion.error";
import { TicketItem } from "@/contracts/adapter.contracts";

export async function assertTicketsReadyForResolve(
  items: TicketItem[],
  expectedState: TicketState
) {
  for (const item of items) {
    if (item.state !== expectedState) {
      throw new AssertionError(
        `Ticket ${item.id} is in state "${item.state}", expected "${expectedState}"`,
        { id: item.id, state: item.state, expectedState }
      );
    }

    // in_progress -> resolved
    assertValidTicketTransition(item.state, TICKET_STATES.RESOLVED);

    const disabled = await item.actionButton.isDisabled();
    if (disabled) {
      throw new AssertionError(`Action button disabled for ticket ${item.id}`, {
        id: item.id,
        state: item.state,
      });
    }

    const label = (await item.actionButton.innerText()).trim();
    if (!/resolve ticket/i.test(label)) {
      throw new AssertionError(`Unexpected action button for ticket ${item.id}: "${label}"`, {
        id: item.id,
        label,
        expected: "Resolve Ticket",
      });
    }
  }
}