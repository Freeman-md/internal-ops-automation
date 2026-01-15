import { TRIAGE_STATES } from "@/config/platform-constraints";

export const WorkflowStatus = {
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
} as const;

export const Priority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

export type WorkFlowInput = {
    selector: {
        state?: string;
        olderThan?: string; //ISO date
        limit?: number;
        priority?: typeof Priority[keyof typeof Priority];
    },
    expectedState?: string;
    allowedTransitions?: string[]
}

export type WorkflowResult = {
    status: typeof WorkflowStatus[keyof typeof WorkflowStatus];
    reason: string;
    artifacts?: {
        matchedItems?: string[];
        actedOnItems?: string[];
        finalStates?: Record<string, string>
    }
}

export type ProcessTriageInput = WorkFlowInput & {
  selector: {
    state: typeof TRIAGE_STATES[keyof typeof TRIAGE_STATES];
    limit: number;                    
    priority?: typeof Priority[keyof typeof Priority];
    olderThan?: string;
  };
  expectedState: typeof TRIAGE_STATES[keyof typeof TRIAGE_STATES];
};