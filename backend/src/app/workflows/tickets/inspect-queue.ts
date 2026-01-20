import { Page } from "playwright";
import { APP_URL } from "@/config/app.config";
import { WorkflowResult } from "@/contracts/workflow.contracts";
import { collectTicketItems } from "@/adapters/tickets/selectors/collect-ticket-items";
import { countTicketStates } from "@/adapters/tickets/verifications/count-ticket-states";
import { readTicketStateSummary } from "@/adapters/tickets/verifications/verify-ticket-results";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE } from "@/infra/logging/log.constants";
import { VerificationError } from "@/domain/errors/verification.error";
import { TICKET_STATES, TicketState } from "@/domain/tickets/states";

export async function inspectTicketsQueue(
  page: Page
): Promise<WorkflowResult> {
  await page.goto(`${APP_URL}/tickets`);

  log(LOG_SCOPE.TICKETS, "Verifying ticket state integrity");

  const items = await collectTicketItems(page);
  const { counts, buckets } = countTicketStates(items);

  log(LOG_SCOPE.TICKETS, "Computed ticket counts", counts);

  // Per-ticket integrity checks
  for (const item of items) {
    if (!Object.values(TICKET_STATES).includes(item.state as TicketState)) {
      throw new VerificationError("Invalid ticket state detected", {
        id: item.id,
        state: item.state,
      });
    }

    if (item.state === TICKET_STATES.RESOLVED) {
      const label = (await item.actionButton.innerText()).trim();
      const disabled = await item.actionButton.isDisabled();

      if (!/no actions/i.test(label)) {
        throw new VerificationError(
          `Resolved ticket ${item.id} has unexpected action`,
          { id: item.id, label }
        );
      }

      if (!disabled) {
        throw new VerificationError(
          `Resolved ticket ${item.id} action button not disabled`,
          { id: item.id }
        );
      }
    }
  }

  const summary = await readTicketStateSummary(page);
  log(LOG_SCOPE.TICKETS, "UI ticket summary", summary);

  if (
    summary.open !== counts.open ||
    summary.in_progress !== counts.in_progress ||
    summary.resolved !== counts.resolved
  ) {
    throw new VerificationError("Ticket summary mismatch", {
      computed: counts,
      summary,
    });
  }

  log(LOG_SCOPE.TICKETS, "Ticket state integrity verified");

  return {
    status: "SUCCESS",
    reason: "Ticket state integrity verified",
    artifacts: {
      finalStates: {
        open: buckets.open.join(","),
        in_progress: buckets.in_progress.join(","),
        resolved: buckets.resolved.join(","),
      },
    },
  };
}