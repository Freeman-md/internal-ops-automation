import { Page, Locator } from "playwright";
import { TicketItem } from "@/contracts/adapter.contracts";

export async function collectTicketItems(
  page: Page
): Promise<TicketItem<Locator>[]> {
  await page.waitForLoadState("networkidle");
  await page.getByRole("heading", { level: 1, name: "Tickets" }).waitFor();

  const rows = page.locator("div.divide-y > div.flex.items-center.justify-between");

  const count = await rows.count();
  const items: TicketItem<Locator>[] = [];

  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);

    const id = await row.locator("code").innerText();
    const state = await row
      .locator("div[role='status'], div.inline-flex")
      .last()
      .innerText();

    // Always exists, sometimes disabled with "No Actions"
    const actionButton = row.getByRole("button").first();

    items.push({
      id: id.trim(),
      state: state.trim(),
      actionButton,
    });
  }

  return items;
}
