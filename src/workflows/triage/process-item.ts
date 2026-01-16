import { ProcessTriageInput, WorkflowResult, WorkflowStatus } from "@/types/workflow";
import { Page } from "playwright";
import { collectTriageItems } from "@/domains/triage/selectors/collect-triage-items";
import { APP_URL } from "@/config/app";
import { filterTriageItems } from "@/domains/triage/filters/filter-triage-items";
import { assertTriageItemsReady } from "@/domains/triage/assertions/assert-triage-items-ready";
import { processTriageItems } from "@/domains/triage/actions/process-triage-items";
import { readStateSummary, verifyTriageResults } from "@/domains/triage/verifications/verify-triage-results";

export async function processTriageItem(
  page: Page,
  input: ProcessTriageInput
): Promise<WorkflowResult> {
  if (!input.selector.state) {
    return {
      status: WorkflowStatus.FAILED,
      reason: "Missing selector.state",
    };
  }

  await page.goto(`${APP_URL}/triage`);

  const triageItems = await collectTriageItems(page);
  const filteredTriageItems = filterTriageItems(triageItems, input.selector)

  if (filteredTriageItems.length === 0) {
    return {
      status: WorkflowStatus.SKIPPED,
      reason: "No triage items matched selector",
      artifacts: { matchedItems: [] },
    };
  }

  await assertTriageItemsReady(filteredTriageItems, input.expectedState);

  const beforeCounts = await readStateSummary(page);

  const actedOnItems = await processTriageItems(page, filteredTriageItems);

  const finalStates = await verifyTriageResults(
    page,
    actedOnItems,
    beforeCounts
  );

  return {
    status: WorkflowStatus.SUCCESS,
    reason: "Triage items discovered",
    artifacts: {
      matchedItems: filteredTriageItems.map(item => item.id),
      actedOnItems,
      finalStates
    },
  };
}