import { TRIAGE_ACTIONS_BY_STATE } from "@/domain/triage/rules";
import { TRIAGE_STATES } from "@/domain/triage/states";
import { AssertionError } from "@/domain/errors/assertion.error";

export function assertTriageActionAllowed(
  currentState: string,
  action: string
) {
  if (!Object.values(TRIAGE_STATES).includes(currentState as any)) {
    throw new AssertionError(`Invalid triage state: ${currentState}`, {
      currentState,
    });
  }

  if (!TRIAGE_ACTIONS_BY_STATE[currentState]?.includes(action)) {
    throw new AssertionError(
      `Action "${action}" not allowed in triage state "${currentState}"`,
      { currentState, action }
    );
  }
}
