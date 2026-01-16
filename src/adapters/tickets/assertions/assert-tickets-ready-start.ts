import { TicketState, TICKET_STATES } from "@/domain/tickets/states";
import { assertValidTicketTransition } from "@/domain/tickets/guards";
import { AssertionError } from "@/domain/errors/assertion.error";
import { TicketItem } from "@/adapters/tickets/selectors/collect-ticket-items";

export async function assertTicketsReadyForStart(
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

    // open -> in_progress
    assertValidTicketTransition(item.state, TICKET_STATES.IN_PROGRESS);

    const disabled = await item.actionButton.isDisabled();
    if (disabled) {
      throw new AssertionError(`Action button disabled for ticket ${item.id}`, {
        id: item.id,
        state: item.state,
      });
    }

    const label = (await item.actionButton.innerText()).trim();
    if (!/start ticket/i.test(label)) {
      throw new AssertionError(`Unexpected action button for ticket ${item.id}: "${label}"`, {
        id: item.id,
        label,
        expected: "Start Ticket",
      });
    }
  }
}