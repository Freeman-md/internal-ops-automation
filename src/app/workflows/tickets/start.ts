import { Page } from "playwright";
import { APP_URL } from "@/config/app.config";
import { WorkflowResult, ProcessTicketsInput } from "@/contracts/workflow.contracts";
import { collectTicketItems } from "@/adapters/tickets/selectors/collect-ticket-items";
import { filterTicketItems } from "@/adapters/tickets/filters/filter-ticket-items";
import { assertTicketsReadyForStart } from "@/adapters/tickets/assertions/assert-tickets-ready-start";
import { startTickets } from "@/adapters/tickets/actions/start-tickets";
import { verifyTicketStates, readTicketStateSummary } from "@/adapters/tickets/verifications/verify-ticket-results";
import { countTicketStates } from "@/adapters/tickets/verifications/count-ticket-states";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE } from "@/infra/logging/log.constants";
import { AssertionError } from "@/domain/errors/assertion.error";
import { TICKET_STATES } from "@/domain/tickets/states";
import { VerificationError } from "@/domain/errors/verification.error";

export async function startTicketWorkflow(
  page: Page,
  input: ProcessTicketsInput
): Promise<WorkflowResult> {
  if (!input.selector?.state) {
    throw new AssertionError("Missing selector.state", { selector: input.selector });
  }

  await page.goto(`${APP_URL}/tickets`);

  log(LOG_SCOPE.TICKETS, "Discovery started");

  const tickets = await collectTicketItems(page);
  log(LOG_SCOPE.TICKETS, "Tickets discovered", { count: tickets.length });

  const filtered = filterTicketItems(tickets, input.selector);
  log(LOG_SCOPE.TICKETS, "Tickets filtered", {
    selector: input.selector,
    count: filtered.length,
  });

  if (filtered.length === 0) {
    return {
      status: "SKIPPED",
      reason: "No tickets matched selector",
      artifacts: { matchedItems: [] },
    };
  }

  log(LOG_SCOPE.TICKETS, "Assertions started");
  await assertTicketsReadyForStart(filtered, input.expectedState);
  log(LOG_SCOPE.TICKETS, "Assertions passed");

  const beforeSnapshot = await collectTicketItems(page);
  const beforeComputed = countTicketStates(beforeSnapshot).counts;
  const beforeSummary = await readTicketStateSummary(page);

  log(LOG_SCOPE.TICKETS, "Computed summary (before)", beforeComputed);
  log(LOG_SCOPE.TICKETS, "UI summary (before)", beforeSummary);

  if (
    beforeSummary.open !== beforeComputed.open ||
    beforeSummary.in_progress !== beforeComputed.in_progress ||
    beforeSummary.resolved !== beforeComputed.resolved
  ) {
    throw new VerificationError("Ticket summary mismatch (before)", {
      computed: beforeComputed,
      summary: beforeSummary,
    });
  }

  log(LOG_SCOPE.TICKETS, "Starting tickets", { items: filtered.map((t) => t.id) });
  const actedOnItems = await startTickets(page, filtered);

  log(LOG_SCOPE.TICKETS, "Verification started");
  const finalStates = await verifyTicketStates(page, actedOnItems, TICKET_STATES.IN_PROGRESS);

  const afterSnapshot = await collectTicketItems(page);
  const afterComputed = countTicketStates(afterSnapshot).counts;
  const afterSummary = await readTicketStateSummary(page);

  log(LOG_SCOPE.TICKETS, "Computed summary (after)", afterComputed);
  log(LOG_SCOPE.TICKETS, "UI summary (after)", afterSummary);

  if (
    afterSummary.open !== afterComputed.open ||
    afterSummary.in_progress !== afterComputed.in_progress ||
    afterSummary.resolved !== afterComputed.resolved
  ) {
    throw new VerificationError("Ticket summary mismatch (after)", {
      computed: afterComputed,
      summary: afterSummary,
    });
  }

  log(LOG_SCOPE.TICKETS, "Workflow completed", { finalStates });

  return {
    status: "SUCCESS",
    reason: "Tickets started",
    artifacts: {
      matchedItems: filtered.map((t) => t.id),
      actedOnItems,
      finalStates,
    },
  };
}