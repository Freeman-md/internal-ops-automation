import { TriageItem } from "@/contracts/adapter.contracts";
import { TRIAGE_STATES, TriageState } from "@/domain/triage/states";
import { VerificationError } from "@/domain/errors/verification.error";

export type TriageStateCounts = Record<TriageState, number>;
export type TriageStateBuckets = Record<TriageState, string[]>;

export function countTriageStates(items: TriageItem[]): {
  counts: TriageStateCounts;
  buckets: TriageStateBuckets;
} {
  const counts: TriageStateCounts = {
    pending: 0,
    processed: 0,
    failed: 0,
  };

  const buckets: TriageStateBuckets = {
    pending: [],
    processed: [],
    failed: [],
  };

  for (const item of items) {
    if (!Object.values(TRIAGE_STATES).includes(item.state as TriageState)) {
      throw new VerificationError("Invalid triage state detected", {
        id: item.id,
        state: item.state,
      });
    }

    const state = item.state as TriageState;
    counts[state]++;
    buckets[state].push(item.id);
  }

  return { counts, buckets };
}