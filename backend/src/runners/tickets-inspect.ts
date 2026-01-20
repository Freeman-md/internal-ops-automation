import { inspectTicketsQueue } from "@/app/workflows/tickets/inspect-queue";
import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { executeWorkflow } from "@/infra/execute-workflow";

async function run() {
  const result = await executeWorkflow(
    {
      name: "tickets-verify",
      requiresAuth: true,
      run: async ({ page }) => inspectTicketsQueue(page),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );

  console.log(result);

  if (!result.success) {
    process.exitCode = 1;
  }
}

run();