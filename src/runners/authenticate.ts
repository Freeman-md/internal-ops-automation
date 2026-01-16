import { SESSION_PATH } from "@/config/app";
import { authenticate } from "@/workflows/authenticate";
import { executeWorkflow } from "@/infra/workflow-executor";

async function run() {
  const headed = process.env.HEADED === "1" || process.env.HEADED === "true";
  const retries = Number(process.env.WORKFLOW_RETRIES ?? "1");

  const result = await executeWorkflow(
    {
      name: "authenticate",
      requiresAuth: false,
      run: async ({ page, context }) => authenticate(page, context),
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
