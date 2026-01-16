# Workflow Contract

## Workflow Input Shape

1. `WorkFlowInput`
   1. `selector.state` (optional string)
   2. `selector.olderThan` (optional ISO date string)
   3. `selector.limit` (optional number)
   4. `selector.priority` (optional "low" | "medium" | "high")
   5. `expectedState` (optional string)
2. `ProcessTriageInput` extends `WorkFlowInput`
   1. `selector.state` (required triage state)
   2. `selector.limit` (required number)
   3. `selector.priority` (optional "low" | "medium" | "high")
   4. `selector.olderThan` (optional ISO date string)
   5. `expectedState` (required triage state)

## Execution Flow

1. Runner calls the workflow executor with a workflow definition and options
2. Executor initializes browser context -> loads storage -> optionally authenticates -> runs workflow
3. Workflow coordinates domain modules -> selectors -> assertions -> actions -> verifications
4. Workflow returns `WorkflowResult` on success or throws an error on failure

## Error Propagation Rules

1. Assertions throw `AssertionError`
2. Actions throw `ActionError`
3. Verifications throw `VerificationError`
4. Errors propagate to the executor, which logs and returns a failure result

## Output Contract

1. `WorkflowResult.status` is `"SUCCESS"` or `"SKIPPED"` for successful completion
2. `WorkflowResult.reason` is a human-readable summary
3. `WorkflowResult.artifacts` includes optional matched items, acted-on items, and final states
4. Executor returns `WorkflowExecutionResult` wrapping workflow success or failure
