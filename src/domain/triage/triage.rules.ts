import { TRIAGE_STATES, TriageState } from "@/domain/triage/triage.states";

export const TRIAGE_ACTIONS_BY_STATE: Record<TriageState, string[]> = {
  [TRIAGE_STATES.PENDING]: ["processed"],
  [TRIAGE_STATES.PROCESSED]: [],
  [TRIAGE_STATES.FAILED]: [],
};
