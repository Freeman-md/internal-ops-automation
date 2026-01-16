import { SESSION_PATH } from "@/config/app";
import { processTriageItem } from "@/workflows/triage/process-item";
import { executeWorkflow } from "@/infra/workflow-executor";

async function run() {
  const headed = process.env.HEADED === "1" || process.env.HEADED === "true";
  const retries = Number(process.env.WORKFLOW_RETRIES ?? "1");

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
