import fs from "fs";
import { createPage } from "../core/browser";
import { authenticate } from "../workflows/auth/authenticate";
import { SESSION_PATH } from "../config/app";

async function run() {
  const hasSession = fs.existsSync(SESSION_PATH);

  const { browser, context, page } = await createPage({
    headless: hasSession,
    storageState: hasSession ? SESSION_PATH : undefined,
  });

  try {
    await authenticate(page, context);
  } finally {
    await browser.close();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});