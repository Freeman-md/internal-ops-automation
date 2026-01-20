import { ProcessTicketsInput, WorkflowResult } from "@/contracts/workflow.contracts";
import { executeWorkflow, WorkflowExecutionResult } from "@/infra/execute-workflow";
import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { startTicketWorkflow } from "@/app/workflows/tickets/start";
import { resolveTicketWorkflow } from "@/app/workflows/tickets/resolve";
import { inspectTicketsQueue } from "@/app/workflows/tickets/inspect-queue";
import { TICKET_STATES } from "@/domain/tickets/states";

export async function runTicketsStart(
  input: ProcessTicketsInput
): Promise<WorkflowExecutionResult<WorkflowResult>> {
  return executeWorkflow(
    {
      name: "tickets-start",
      requiresAuth: true,
      run: async ({ page }) => startTicketWorkflow(page, input),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}

export async function runTicketsResolve(
  input: ProcessTicketsInput
): Promise<WorkflowExecutionResult<WorkflowResult>> {
  return executeWorkflow(
    {
      name: "tickets-resolve",
      requiresAuth: true,
      run: async ({ page }) => resolveTicketWorkflow(page, input),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}

export async function runTicketsInspect(): Promise<
  WorkflowExecutionResult<WorkflowResult>
> {
  return executeWorkflow(
    {
      name: "tickets-inspect",
      requiresAuth: true,
      run: async ({ page }) => inspectTicketsQueue(page),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}

export async function runTicketsAll(): Promise<
  WorkflowExecutionResult<{
    start: WorkflowExecutionResult<WorkflowResult>;
    resolve: WorkflowExecutionResult<WorkflowResult>;
    inspect: WorkflowExecutionResult<WorkflowResult>;
  }>
> {
  const startedAt = Date.now();
  const inspect = await runTicketsInspect();
  if (!inspect.success) {
    const failed = inspect as Extract<typeof inspect, { success: false }>;
    return {
      success: false,
      error: failed.error,
      durationMs: Date.now() - startedAt,
    };
  }

  const start = await runTicketsStart({
    selector: { state: TICKET_STATES.OPEN, limit: 10 },
    expectedState: TICKET_STATES.OPEN,
  });
  if (!start.success) {
    const failed = start as Extract<typeof start, { success: false }>;
    return {
      success: false,
      error: failed.error,
      durationMs: Date.now() - startedAt,
    };
  }

  const resolve = await runTicketsResolve({
    selector: { state: TICKET_STATES.IN_PROGRESS, limit: 10 },
    expectedState: TICKET_STATES.IN_PROGRESS,
  });
  if (!resolve.success) {
    const failed = resolve as Extract<typeof resolve, { success: false }>;
    return {
      success: false,
      error: failed.error,
      durationMs: Date.now() - startedAt,
    };
  }

  return {
    success: true,
    data: { inspect, start, resolve },
    durationMs: Date.now() - startedAt,
  };
}
