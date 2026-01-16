import { Page } from "playwright";
import { TriageItem } from "../selectors/collect-triage-items";
import { TRIAGE_STATES } from "@/config/platform-constraints";
import { ActionError } from "@/core/errors";

export async function processTriageItems(
  page: Page,
  items: TriageItem[]
): Promise<string[]> {
  const actedOn: string[] = [];

  for (const item of items) {
    try {
      // Click action
      await item.actionButton.click();

      const row = page
        .locator("code", { hasText: item.id })
        .locator("..")
        .locator("..");

      // Wait for either processed OR failed outcome
      await Promise.race([
        page
          .getByRole("alert")
          .filter({ hasText: item.id })
          .waitFor({ timeout: 5_000 }),

        row.locator(`text=${TRIAGE_STATES.PROCESSED}`).waitFor({ timeout: 5_000 }),

        row.locator(`text=${TRIAGE_STATES.FAILED}`).waitFor({ timeout: 5_000 }),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown triage action error";

      throw new ActionError(`Failed to process triage item ${item.id}`, {
        id: item.id,
        error: message,
      });
    }

    actedOn.push(item.id);
  }

  return actedOn;
}
