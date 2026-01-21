import type { ProcessTicketsInput, ProcessTriageInput, WorkflowResult } from "@/contracts/workflow.contracts";
import type { WorkflowExecutionResult } from "@/infra/execute-workflow";
import { runTriageInspect, runTriageProcess } from "@/server/services/triage.service";
import {
  runTicketsAll,
  runTicketsInspect,
  runTicketsResolve,
  runTicketsStart,
} from "@/server/services/tickets.service";
import {
  runStatusAll,
  runStatusAuthAction,
  runStatusSession,
} from "@/server/services/status.service";
import { runAuthenticate } from "@/server/services/auth.service";

export type WorkflowName =
  | "triage.process"
  | "triage.inspect"
  | "tickets.start"
  | "tickets.resolve"
  | "tickets.inspect"
  | "tickets.all"
  | "status.session"
  | "status.authAction"
  | "status.all"
  | "auth.authenticate";

export type WorkflowRunResult =
  | WorkflowExecutionResult<WorkflowResult>
  | WorkflowExecutionResult<void>
  | WorkflowExecutionResult<{
      session: WorkflowExecutionResult<WorkflowResult>;
      authAction: WorkflowExecutionResult<WorkflowResult>;
    }>
  | WorkflowExecutionResult<{
      start: WorkflowExecutionResult<WorkflowResult>;
      resolve: WorkflowExecutionResult<WorkflowResult>;
      inspect: WorkflowExecutionResult<WorkflowResult>;
    }>;

export async function runWorkflow(
  name: WorkflowName,
  input?: unknown
): Promise<WorkflowRunResult> {
  switch (name) {
    case "triage.process":
      return runTriageProcess(input as ProcessTriageInput);
    case "triage.inspect":
      return runTriageInspect();
    case "tickets.start":
      return runTicketsStart(input as ProcessTicketsInput);
    case "tickets.resolve":
      return runTicketsResolve(input as ProcessTicketsInput);
    case "tickets.inspect":
      return runTicketsInspect();
    case "tickets.all":
      return runTicketsAll();
    case "status.session":
      return runStatusSession();
    case "status.authAction":
      return runStatusAuthAction();
    case "status.all":
      return runStatusAll();
    case "auth.authenticate":
      return runAuthenticate();
    default:
      throw new Error(`Unsupported workflow: ${name}`);
  }
}
