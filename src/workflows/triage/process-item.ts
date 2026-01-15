import { ProcessTriageInput, WorkflowResult, WorkflowStatus } from "@/types/workflow";
import { Page } from "playwright";
import { collectTriageItems } from "@/domains/triage/selectors/triage-items";

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

  await page.goto("/triage");

  const items = await collectTriageItems(page);

  return {
    status: WorkflowStatus.SUCCESS,
    reason: "Triage items discovered",
    artifacts: {
      matchedItems: items.map(i => i.id),
    },
  };
}