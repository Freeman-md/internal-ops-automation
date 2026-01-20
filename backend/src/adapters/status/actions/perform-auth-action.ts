import { Page } from "playwright";
import { ActionError } from "@/domain/errors/action.error";
import { readAuthenticatedActionValue } from "@/adapters/status/selectors/read-auth-action";

export async function performAuthenticatedAction(page: Page): Promise<string> {
  try {
    await page
      .getByRole("button", { name: /perform authenticated action/i })
      .click();

    return await readAuthenticatedActionValue(page);
  } catch {
    throw new ActionError("Failed to perform authenticated action");
  }
}