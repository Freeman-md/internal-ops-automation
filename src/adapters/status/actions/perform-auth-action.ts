import { Page } from "playwright";
import { ActionError } from "@/domain/errors/action.error";

export async function performAuthenticatedAction(page: Page): Promise<string> {
  try {
    const button = page.getByRole("button", {
      name: /perform authenticated action/i,
    });

    await button.click();

    const value = await page
      .locator("text=/last authenticated action/i")
      .locator("..")
      .locator("span")
      .innerText();

    return value.trim();
  } catch (err) {
    throw new ActionError("Failed to perform authenticated action");
  }
}