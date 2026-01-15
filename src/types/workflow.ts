export type WorkFlowInput = {
    selector: {
        state?: string;
        olderThan?: string; //ISO date
        limit?: number;
        priority?: "low" | "medium" | "high"
    },
    expectedState?: string;
    allowedTransitions?: string[]
}

export type WorkflowResult = {
    status: "SUCCESS" | "FAILED" | "SKIPPED";
    reason: string;
    artifacts?: {
        matchedItems?: string[];
        actedOnItems?: string[];
        finalStates?: Record<string, string>
    }
}