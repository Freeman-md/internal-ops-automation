import { Page } from "playwright";
import { APP_URL } from "@/config/app.config";
import { WorkflowResult } from "@/contracts/workflow.contracts";
import { readSessionStatus } from "@/adapters/status/selectors/read-session-status";
import { readAuthenticatedUser } from "@/adapters/status/selectors/read-user-info";
import { readVerificationSummary } from "@/adapters/status/selectors/read-verification-summary";
import { verifySessionHealth } from "@/adapters/status/verifications/verify-session-health";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE } from "@/infra/logging/log.constants";

export async function inspectSessionStatus(page: Page): Promise<WorkflowResult> {
  await page.goto(`${APP_URL}/status`);

  log(LOG_SCOPE.FLOW, "Inspecting session health");

  const status = await readSessionStatus(page);
  const user = await readAuthenticatedUser(page);
  const summary = await readVerificationSummary(page);

  verifySessionHealth(status, user, summary);

  return {
    status: "SUCCESS",
    reason: "Session health verified",
    artifacts: {
      finalStates: {
        session: status.raw,
        userId: user.userId,
        email: user.email,
      },
    },
  };
}