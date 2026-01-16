import fs from "fs";
import { createPage } from "@/core/browser";
import { SESSION_PATH } from "@/config/app";
import { withAuth } from "@/core/guards";
import { processTriageItem } from "@/workflows/triage/process-item";

async function run() {
  const hasSession = fs.existsSync(SESSION_PATH);

  const { browser, context, page } = await createPage({
    headless: false,
    storageState: hasSession ? SESSION_PATH : undefined,
  });

  try {
    await withAuth(page, context, async () => {
      const result = await processTriageItem(page, {
        selector: {
          state: "pending",
          limit: 10,
        },
        expectedState: "pending",
      });

      console.log(result);
    });
  } finally {
    await browser.close();
  }
}

run();