import { WorkflowResult } from "@/contracts/workflow.contracts";
import { executeWorkflow, WorkflowExecutionResult } from "@/infra/execute-workflow";
import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { inspectSessionStatus } from "@/app/workflows/status/inspect-session";
import { inspectAuthenticatedAction } from "@/app/workflows/status/inspect-auth-action";

export async function runStatusSession(): Promise<
  WorkflowExecutionResult<WorkflowResult>
> {
  return executeWorkflow(
    {
      name: "status-session",
      requiresAuth: true,
      run: async ({ page }) => inspectSessionStatus(page),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}

export async function runStatusAuthAction(): Promise<
  WorkflowExecutionResult<WorkflowResult>
> {
  return executeWorkflow(
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
}

export async function runStatusAll(): Promise<{
  session: WorkflowExecutionResult<WorkflowResult>;
  authAction: WorkflowExecutionResult<WorkflowResult>;
}> {
  const session = await runStatusSession();
  if (!session.success) {
    return { session, authAction: session };
  }

  const authAction = await runStatusAuthAction();

  return { session, authAction };
}
