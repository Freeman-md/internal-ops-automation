import { Page } from "playwright";

export async function readAuthenticatedUser(page: Page) {
  const userCard = page
    .getByRole("heading", { name: /authenticated user/i })
    .locator("..")
    .locator("..");

  const rows = userCard.locator("div.grid");

  const userIdRow = rows.filter({ hasText: /user id/i });
  const emailRow = rows.filter({ hasText: /^email:/i });

  const userId = await userIdRow.locator("code").innerText();
  const email = await emailRow.locator("span.font-medium").innerText();

  return {
    userId: userId.trim(),
    email: email.trim(),
  };
}