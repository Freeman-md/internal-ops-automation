import { Page } from "playwright";

export async function readSessionStatus(page: Page) {
  const statusBadge = page.getByText(/valid|invalid/i).first();

  const label = (await statusBadge.innerText()).trim();

  return {
    raw: label,
    valid: /valid/i.test(label),
  };
}