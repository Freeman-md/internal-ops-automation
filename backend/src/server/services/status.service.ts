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

export async function runStatusAll(): Promise<
  WorkflowExecutionResult<{
    session: WorkflowExecutionResult<WorkflowResult>;
    authAction: WorkflowExecutionResult<WorkflowResult>;
  }>
> {
  const startedAt = Date.now();
  const session = await runStatusSession();
  if (!session.success) {
    const failed = session as Extract<typeof session, { success: false }>;
    return {
      success: false,
      error: failed.error,
      durationMs: Date.now() - startedAt,
    };
  }

  const authAction = await runStatusAuthAction();
  if (!authAction.success) {
    const failed = authAction as Extract<typeof authAction, { success: false }>;
    return {
      success: false,
      error: failed.error,
      durationMs: Date.now() - startedAt,
    };
  }

  return {
    success: true,
    data: { session, authAction },
    durationMs: Date.now() - startedAt,
  };
}
