import { Page } from "playwright";

export async function readVerificationSummary(page: Page): Promise<string[]> {
  const items = page.locator("h3", { hasText: /verification summary/i })
    .locator("..")
    .locator("div.flex.items-center");

  const count = await items.count();
  const results: string[] = [];

  for (let i = 0; i < count; i++) {
    results.push((await items.nth(i).innerText()).trim());
  }

  return results;
}