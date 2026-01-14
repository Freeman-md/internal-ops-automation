import { Page, BrowserContext } from "playwright";
import { authenticate } from "./authenticate";

export async function withAuth(
  page: Page,
  context: BrowserContext,
  next: () => Promise<void>
) {
  await authenticate(page, context);
  await next();
}