import { Page } from "playwright";
import { APP_URL } from "@/config/app.config";
import { WorkflowResult } from "@/contracts/workflow.contracts";
import { performAuthenticatedAction } from "@/adapters/status/actions/perform-auth-action";
import { readVerificationSummary } from "@/adapters/status/selectors/read-verification-summary";
import { verifyAuthAction } from "@/adapters/status/verifications/verify-auth-action";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE } from "@/infra/logging/log.constants";

export async function inspectAuthenticatedAction(
  page: Page
): Promise<WorkflowResult> {
  await page.goto(`${APP_URL}/status`);

  log(LOG_SCOPE.FLOW, "Performing authenticated action");

  const before = await page
    .locator("text=/last authenticated action/i")
    .locator("..")
    .locator("span")
    .innerText();

  const after = await performAuthenticatedAction(page);
  const summary = await readVerificationSummary(page);

  verifyAuthAction(before.trim(), after, summary);

  return {
    status: "SUCCESS",
    reason: "Authenticated action verified",
    artifacts: {
      finalStates: {
        before,
        after,
      },
    },
  };
}