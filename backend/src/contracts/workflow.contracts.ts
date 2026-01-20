import { Priority, TicketState, TriageState } from "@/contracts/domain.contracts";

export type WorkflowStatus = "SUCCESS" | "FAILED" | "SKIPPED";

export type WorkFlowInput = {
    selector: {
        state?: string;
        olderThan?: string; //ISO date
        limit?: number;
        priority?: Priority;
    },
    expectedState?: string;
}

export type WorkflowResult = {
    status: WorkflowStatus;
    reason: string;
    artifacts?: {
        matchedItems?: string[];
        actedOnItems?: string[];
        finalStates?: Record<string, string>
    }
}

export type ProcessTriageInput = WorkFlowInput & {
  selector: {
    state: TriageState;
    limit?: number;
  };
  expectedState: TriageState;
};


export type ProcessTicketsInput = {
  selector: {
    state: TicketState;
    limit?: number;
  };
  expectedState: TicketState;
};