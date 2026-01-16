import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { inspectTriageQueue } from "@/app/workflows/triage/inspect-queue";
import { executeWorkflow } from "@/infra/execute-workflow";

async function run() {
  const result = await executeWorkflow(
    {
      name: "triage-inspect",
      requiresAuth: true,
      run: async ({ page }) => inspectTriageQueue(page),
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