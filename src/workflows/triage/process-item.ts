import { ProcessTriageInput, WorkflowResult, WorkflowStatus } from "@/types/workflow";
import { Page } from "playwright";
import { collectTriageItems } from "@/domains/triage/selectors/collect-triage-items";
import { APP_URL } from "@/config/app";
import { filterTriageItems } from "@/domains/triage/filters/filter-triage-items";
import { assertTriageItemsReady } from "@/domains/triage/assertions/assert-triage-items-ready";
import { processTriageItems } from "@/domains/triage/actions/process-triage-items";
import { readStateSummary, verifyTriageResults } from "@/domains/triage/verifications/verify-triage-results";
import { log } from "@/core/logger";
import { LOG_SCOPE } from "@/config/logging";
import { AssertionError } from "@/core/errors";

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
      status: WorkflowStatus.SKIPPED,
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
    status: WorkflowStatus.SUCCESS,
    reason: "Triage items processed",
    artifacts: {
      matchedItems: filteredTriageItems.map(item => item.id),
      actedOnItems,
      finalStates,
    },
  };
}
