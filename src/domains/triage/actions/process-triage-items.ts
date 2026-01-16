import { Page } from "playwright";
import { TriageItem } from "../selectors/collect-triage-items";
import { TRIAGE_STATES } from "@/config/platform-constraints";

export async function processTriageItems(
  page: Page,
  items: TriageItem[]
): Promise<string[]> {
  const actedOn: string[] = [];

  for (const item of items) {
    // Click action
    await item.actionButton.click();

    // Wait for either:
    // 1. Success alert mentioning the item
    // 2. State badge changing to "processed"
    await Promise.race([
      page.getByRole("alert")
        .filter({ hasText: item.id })
        .waitFor({ timeout: 5_000 }),

      page.locator(`code:text("${item.id}")`)
        .locator("..")
        .locator(`text=${TRIAGE_STATES.PROCESSED}`)
        .waitFor({ timeout: 5_000 }),
    ]);

    actedOn.push(item.id);
  }

  return actedOn;
}