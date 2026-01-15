import fs from "fs";
import { createPage } from "@/core/browser";
import { SESSION_PATH } from "@/config/app";
import { withAuth } from "@/core/guards";

async function run() {
  const hasSession = fs.existsSync(SESSION_PATH);

  const { browser, context, page } = await createPage({
    headless: false,
    storageState: hasSession ? SESSION_PATH : undefined,
  });

  try {
    await withAuth(page, context, async () => {
      console.log("[FLOW] Protected workflow running");
      await page.goto("https://internal-ops.lovable.app/dashboard");
    });
  } finally {
    await browser.close();
  }
}

run();
