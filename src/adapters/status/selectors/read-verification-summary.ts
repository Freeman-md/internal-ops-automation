import { Page } from "playwright";

export async function readVerificationSummary(page: Page): Promise<string[]> {
  const card = page.locator("div.rounded-lg", {
    has: page.locator("h3", { hasText: /verification summary/i }),
  });

  const items = card.locator("div.flex.items-center span");

  const count = await items.count();
  const results: string[] = [];

  for (let i = 0; i < count; i++) {
    results.push((await items.nth(i).innerText()).trim());
  }

  return results;
}