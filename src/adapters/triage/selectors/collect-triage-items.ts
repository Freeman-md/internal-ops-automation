import { Page, Locator } from "playwright";
import { TriageItem } from "@/contracts/adapter.contracts";

export async function collectTriageItems(
  page: Page
): Promise<TriageItem<Locator>[]> {
  // Assert page loaded
  await page.waitForLoadState("networkidle");
  
  await page.getByRole("heading", { level: 1, name: "Triage" }).waitFor();

  const rows = page.locator("div.divide-y > div.flex.items-center.justify-between");

  const count = await rows.count();
  const items: TriageItem<Locator>[] = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    const id = await row.locator("code").innerText();
    const state = await row.locator("div[role='status'], div.inline-flex").last().innerText();
    const actionButton = row.getByRole("button", { name: "Process Item" });

    items.push({
      id: id.trim(),
      state: state.trim() as string,
      actionButton,
    });
  }

  return items;
}
