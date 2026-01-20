import { TRIAGE_STATES } from "@/domain/triage/states";
import { TICKET_STATES } from "@/domain/tickets/states";
import type { ProcessTicketsInput, ProcessTriageInput } from "@/contracts/workflow.contracts";

const triageStates = new Set(Object.values(TRIAGE_STATES));
const ticketStates = new Set(Object.values(TICKET_STATES));

export function validateTriageInput(input: ProcessTriageInput) {
  if (!input?.selector?.state) {
    throw new Error("Missing selector.state");
  }
  if (!triageStates.has(input.selector.state)) {
    throw new Error(`Invalid triage selector.state: ${input.selector.state}`);
  }
  if (!input.expectedState) {
    throw new Error("Missing expectedState");
  }
  if (!triageStates.has(input.expectedState)) {
    throw new Error(`Invalid expectedState: ${input.expectedState}`);
  }
}

export function validateTicketsInput(input: ProcessTicketsInput) {
  if (!input?.selector?.state) {
    throw new Error("Missing selector.state");
  }
  if (!ticketStates.has(input.selector.state)) {
    throw new Error(`Invalid ticket selector.state: ${input.selector.state}`);
  }
  if (!input.expectedState) {
    throw new Error("Missing expectedState");
  }
  if (!ticketStates.has(input.expectedState)) {
    throw new Error(`Invalid expectedState: ${input.expectedState}`);
  }
}

export function validateNoInput(input: unknown) {
  if (input && Object.keys(input as Record<string, unknown>).length > 0) {
    throw new Error("Unexpected input");
  }
}
