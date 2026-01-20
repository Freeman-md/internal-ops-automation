import { Page } from "playwright";
import { WorkflowResult } from "@/contracts/workflow.contracts";
import { APP_URL } from "@/config/app.config";
import { collectTriageItems } from "@/adapters/triage/selectors/collect-triage-items";
import { readStateSummary } from "@/adapters/triage/verifications/verify-triage-results";
import { countTriageStates } from "@/adapters/triage/verifications/count-triage-states";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE } from "@/infra/logging/log.constants";
import { VerificationError } from "@/domain/errors/verification.error";

export async function inspectTriageQueue(
  page: Page
): Promise<WorkflowResult> {
  await page.goto(`${APP_URL}/triage`);

  log(LOG_SCOPE.TRIAGE, "Inspecting triage queue");

  const items = await collectTriageItems(page);
  const { counts, buckets } = countTriageStates(items);

  log(LOG_SCOPE.TRIAGE, "Computed triage counts", counts);

  const summary = await readStateSummary(page);
  log(LOG_SCOPE.TRIAGE, "UI summary counts", summary);

  if (
    summary.pending !== counts.pending ||
    summary.processed !== counts.processed ||
    summary.failed !== counts.failed
  ) {
    throw new VerificationError("Triage summary mismatch", {
      computed: counts,
      summary,
    });
  }

  log(LOG_SCOPE.TRIAGE, "Triage queue verified");

  return {
    status: "SUCCESS",
    reason: "Triage queue inspected successfully",
    artifacts: {
      finalStates: {
        pending: buckets.pending.join(","),
        processed: buckets.processed.join(","),
        failed: buckets.failed.join(","),
      },
    },
  };
}