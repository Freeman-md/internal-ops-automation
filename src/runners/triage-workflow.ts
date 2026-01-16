import fs from "fs";
import { createPage } from "@/core/browser";
import { SESSION_PATH } from "@/config/app";
import { withAuth } from "@/core/guards";
import { processTriageItem } from "@/workflows/triage/process-item";
import { executeWorkflow } from "@/runners/execute-workflow";
import { WorkflowResult } from "@/types/workflow";

async function run() {
  const hasSession = fs.existsSync(SESSION_PATH);
  const headed = process.env.HEADED === "1" || process.env.HEADED === "true";
  const retries = Number(process.env.WORKFLOW_RETRIES ?? "1");
  const maxAttempts = Number.isFinite(retries) && retries > 0 ? Math.floor(retries) : 1;

  const { browser, context, page } = await createPage({
    headless: false,
    storageState: hasSession ? SESSION_PATH : undefined,
  });

  try {
    let result: WorkflowResult | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await executeWorkflow({
          name: "triage-workflow",
          execute: async () => {
            await withAuth(page, context, async () => {
              result = await processTriageItem(page, {
                selector: {
                  state: "processed",
                  limit: 10,
                },
                expectedState: "pending",
              });
            });
          },
        });
        break;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }

    if (result) {
      console.log(result);
    }
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
