import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { processTriageItem } from "@/app/workflows/triage/process-item";
import { executeWorkflow } from "@/infra/execute-workflow";

async function run() {
  const headed = HEADED ?? true;
  const retries = WORKFLOW_RETRIES;

  const result = await executeWorkflow(
    {
      name: "triage-workflow",
      requiresAuth: true,
      run: async ({ page }) =>
        processTriageItem(page, {
          selector: {
            state: "pending",
            limit: 10,
          },
          expectedState: "pending",
        }),
    },
    {
      headed,
      retries,
      storagePath: SESSION_PATH,
    }
  );

  console.log(result);

  if (!result.success) {
    process.exitCode = 1;
  }
}

run();
