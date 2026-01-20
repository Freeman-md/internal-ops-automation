import { ProcessTriageInput, WorkflowResult } from "@/contracts/workflow.contracts";
import { executeWorkflow, WorkflowExecutionResult } from "@/infra/execute-workflow";
import { processTriageItem } from "@/app/workflows/triage/process-item";
import { inspectTriageQueue } from "@/app/workflows/triage/inspect-queue";
import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";

export async function runTriageProcess(
  input: ProcessTriageInput
): Promise<WorkflowExecutionResult<WorkflowResult>> {
  return executeWorkflow(
    {
      name: "triage-process",
      requiresAuth: true,
      run: async ({ page }) => processTriageItem(page, input),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}

export async function runTriageInspect(): Promise<
  WorkflowExecutionResult<WorkflowResult>
> {
  return executeWorkflow(
    {
      name: "triage-inspect",
      requiresAuth: true,
      run: async ({ page }) => inspectTriageQueue(page),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );
}
