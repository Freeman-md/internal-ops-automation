import { BrowserContext, Page } from "playwright";
import { authenticate } from "@/infra/auth/authenticate";

export async function withAuth(
  page: Page,
  context: BrowserContext,
  next: () => Promise<void>
) {
  await authenticate(page, context);
  await next();
}
