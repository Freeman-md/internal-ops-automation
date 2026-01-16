import fs from "fs";
import { createPage } from "@/core/browser";
import { authenticate } from "@/workflows/authenticate";
import { SESSION_PATH } from "@/config/app";
import { executeWorkflow } from "@/runners/execute-workflow";

async function run() {
  const hasSession = fs.existsSync(SESSION_PATH);
  const headed = process.env.HEADED === "1" || process.env.HEADED === "true";
  const retries = Number(process.env.WORKFLOW_RETRIES ?? "1");
  const maxAttempts = Number.isFinite(retries) && retries > 0 ? Math.floor(retries) : 1;

  const { browser, context, page } = await createPage({
    headless: !headed,
    storageState: hasSession ? SESSION_PATH : undefined,
  });

  try {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await executeWorkflow({
          name: "authenticate",
          execute: async () => {
            await authenticate(page, context);
          },
        });
        break;
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
      }
    }
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
