import { Page } from "playwright";

export async function readAuthenticatedActionValue(page: Page): Promise<string> {
  const card = page.locator("div.rounded-lg", {
    has: page.locator("h3", { hasText: /authenticated action test/i }),
  });

  const row = card.locator("div.grid", {
    hasText: /last authenticated action/i,
  });

  
  const value = row.locator(":scope > :nth-child(2)");

  return (await value.innerText()).trim();
}