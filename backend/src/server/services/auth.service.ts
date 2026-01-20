import { WorkflowExecutionResult } from "@/infra/execute-workflow";
import { executeWorkflow } from "@/infra/execute-workflow";
import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { authenticate } from "@/infra/auth/authenticate";

export async function runAuthenticate(): Promise<WorkflowExecutionResult<void>> {
  return executeWorkflow(
    {
      name: "authenticate",
      requiresAuth: false,
      run: async ({ page, context }) => authenticate(page, context),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}
