import { ProcessTriageInput, WorkflowResult } from "@/contracts/workflow.contracts";
import { Page } from "playwright";
import { collectTriageItems } from "@/adapters/triage/selectors/collect-triage-items";
import { APP_URL } from "@/config/app.config";
import { filterTriageItems } from "@/adapters/triage/filters/filter-triage-items";
import { assertTriageItemsReady } from "@/adapters/triage/assertions/assert-triage-items-ready";
import { processTriageItems } from "@/adapters/triage/actions/process-triage-items";
import { readStateSummary, verifyTriageResults } from "@/adapters/triage/verifications/verify-triage-results";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE } from "@/infra/logging/log.constants";
import { AssertionError } from "@/domain/errors/assertion.error";

export async function processTriageItem(
  page: Page,
  input: ProcessTriageInput
): Promise<WorkflowResult> {
  if (!input.selector.state) {
    throw new AssertionError("Missing selector.state", { selector: input.selector });
  }

  await page.goto(`${APP_URL}/triage`);

  log(LOG_SCOPE.TRIAGE, "Discovery started");

  const triageItems = await collectTriageItems(page);
  log(LOG_SCOPE.TRIAGE, "Items discovered", { count: triageItems.length });

  const filteredTriageItems = filterTriageItems(triageItems, input.selector);
  log(LOG_SCOPE.TRIAGE, "Items filtered", {
    selector: input.selector,
    count: filteredTriageItems.length,
  });

  if (filteredTriageItems.length === 0) {
    return {
      status: "SKIPPED",
      reason: "No triage items matched selector",
      artifacts: { matchedItems: [] },
    };
  }

  log(LOG_SCOPE.TRIAGE, "Assertions started");
  await assertTriageItemsReady(filteredTriageItems, input.expectedState);
  log(LOG_SCOPE.TRIAGE, "Assertions passed");

  const beforeCounts = await readStateSummary(page);

  log(LOG_SCOPE.TRIAGE, "Processing items", {
    items: filteredTriageItems.map(i => i.id),
  });

  const actedOnItems = await processTriageItems(page, filteredTriageItems);

  log(LOG_SCOPE.TRIAGE, "Verification started");
  const finalStates = await verifyTriageResults(
    page,
    actedOnItems,
    beforeCounts
  );

  log(LOG_SCOPE.TRIAGE, "Workflow completed", { finalStates });

  return {
    status: "SUCCESS",
    reason: "Triage items processed",
    artifacts: {
      matchedItems: filteredTriageItems.map(item => item.id),
      actedOnItems,
      finalStates,
    },
  };
}
