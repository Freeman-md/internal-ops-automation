import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { authenticate } from "@/infra/auth/authenticate";
import { executeWorkflow } from "@/infra/execute-workflow";

async function run() {
  const headed = HEADED;
  const retries = WORKFLOW_RETRIES;

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
