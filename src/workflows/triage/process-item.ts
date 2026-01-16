import { ProcessTriageInput, WorkflowResult, WorkflowStatus } from "@/types/workflow";
import { Page } from "playwright";
import { collectTriageItems } from "@/domains/triage/selectors/collect-triage-items";
import { APP_URL } from "@/config/app";
import { filterTriageItems } from "@/domains/triage/filters/filter-triage-items";

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
      artifacts: {
        matchedItems: [],
      },
    };
  }

  return {
    status: WorkflowStatus.SUCCESS,
    reason: "Triage items discovered",
    artifacts: {
      matchedItems: filteredTriageItems.map(item => item.id),
    },
  };
}