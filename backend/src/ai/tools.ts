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

export type JsonSchema = {
  type: "object";
  properties: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
};

export type JsonSchemaProperty =
  | { type: "string"; description?: string }
  | { type: "number"; description?: string }
  | { type: "boolean"; description?: string }
  | JsonSchema;

type ToolDefinition<TInput, TOutput> = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
  run: (input: TInput) => Promise<TOutput>;
};

type ToolOutput =
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

const triageProcessSchema: JsonSchema = {
  type: "object",
  properties: {
    selector: {
      type: "object",
      properties: {
        state: { type: "string", description: "Triage state filter" },
        limit: { type: "number", description: "Max items to process" },
      },
      required: ["state"],
      additionalProperties: false,
    },
    expectedState: { type: "string", description: "Expected current state" },
  },
  required: ["selector", "expectedState"],
  additionalProperties: false,
};

const triageInspectSchema: JsonSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

const ticketsProcessSchema: JsonSchema = {
  type: "object",
  properties: {
    selector: {
      type: "object",
      properties: {
        state: { type: "string", description: "Ticket state filter" },
        limit: { type: "number", description: "Max items to process" },
      },
      required: ["state"],
      additionalProperties: false,
    },
    expectedState: { type: "string", description: "Expected current state" },
  },
  required: ["selector", "expectedState"],
  additionalProperties: false,
};

const noInputSchema: JsonSchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export const aiTools = [
  {
    name: "triage.process",
    description: "Process triage items by selector and expected state.",
    inputSchema: triageProcessSchema,
    run: (input: ProcessTriageInput) =>
      runTriageProcess(input),
  },
  {
    name: "triage.inspect",
    description: "Inspect the triage queue and validate counts.",
    inputSchema: triageInspectSchema,
    run: () => runTriageInspect(),
  },
  {
    name: "tickets.start",
    description: "Start open tickets based on selector and expected state.",
    inputSchema: ticketsProcessSchema,
    run: (input: ProcessTicketsInput) =>
      runTicketsStart(input),
  },
  {
    name: "tickets.resolve",
    description: "Resolve in-progress tickets based on selector and expected state.",
    inputSchema: ticketsProcessSchema,
    run: (input: ProcessTicketsInput) =>
      runTicketsResolve(input),
  },
  {
    name: "tickets.inspect",
    description: "Inspect ticket state integrity and summary.",
    inputSchema: noInputSchema,
    run: () => runTicketsInspect(),
  },
  {
    name: "tickets.all",
    description: "Inspect, start, and resolve tickets in sequence.",
    inputSchema: noInputSchema,
    run: () => runTicketsAll(),
  },
  {
    name: "status.session",
    description: "Check session health and authenticated user info.",
    inputSchema: noInputSchema,
    run: () => runStatusSession(),
  },
  {
    name: "status.authAction",
    description: "Perform authenticated action and verify results.",
    inputSchema: noInputSchema,
    run: () => runStatusAuthAction(),
  },
  {
    name: "status.all",
    description: "Run session and authenticated-action checks.",
    inputSchema: noInputSchema,
    run: () => runStatusAll(),
  },
  {
    name: "auth.authenticate",
    description: "Create or refresh an authenticated session.",
    inputSchema: noInputSchema,
    run: () => runAuthenticate(),
  },
] as const satisfies readonly ToolDefinition<unknown, ToolOutput>[];

export type AIToolName = (typeof aiTools)[number]["name"];

export function getToolByName(name: string) {
  return aiTools.find((tool) => tool.name === name);
}
