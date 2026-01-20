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

export async function runTicketsAll(): Promise<{
  start: WorkflowExecutionResult<WorkflowResult>;
  resolve: WorkflowExecutionResult<WorkflowResult>;
  inspect: WorkflowExecutionResult<WorkflowResult>;
}> {
  const inspect = await runTicketsInspect();
  if (!inspect.success) {
    return { inspect, start: inspect, resolve: inspect };
  }

  const start = await runTicketsStart({
    selector: { state: TICKET_STATES.OPEN, limit: 10 },
    expectedState: TICKET_STATES.OPEN,
  });
  if (!start.success) {
    return { inspect, start, resolve: start };
  }

  const resolve = await runTicketsResolve({
    selector: { state: TICKET_STATES.IN_PROGRESS, limit: 10 },
    expectedState: TICKET_STATES.IN_PROGRESS,
  });

  return { inspect, start, resolve };
}
