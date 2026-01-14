import { runWithAuthGuard } from "../workflows/auth/auth-guard"

async function run() {
  await runWithAuthGuard(async (page) => {
    console.log("[TEST] Authenticated flow resumed");
    await page.goto("https://internal-ops.lovable.app/dashboard");
  });
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});