import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { executeWorkflow } from "@/infra/execute-workflow";
import { inspectAuthenticatedAction } from "@/app/workflows/status/inspect-auth-action";

async function run() {
  const result = await executeWorkflow(
    {
      name: "status-auth-action",
      requiresAuth: true,
      run: async ({ page }) => inspectAuthenticatedAction(page),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );

  console.log(result);
  if (!result.success) process.exitCode = 1;
}

run();