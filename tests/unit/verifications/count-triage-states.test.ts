import { describe, expect, it } from "vitest";
import { countTriageStates } from "@/adapters/triage/verifications/count-triage-states";
import { VerificationError } from "@/domain/errors/verification.error";
import type { TriageItem } from "@/contracts/adapter.contracts";

describe("countTriageStates", () => {
  it("counts items by triage state and groups ids", () => {
    const items: TriageItem[] = [
      { id: "T-1", state: "pending", actionButton: {} as TriageItem["actionButton"] },
      { id: "T-2", state: "processed", actionButton: {} as TriageItem["actionButton"] },
      { id: "T-3", state: "pending", actionButton: {} as TriageItem["actionButton"] },
    ];

    const result = countTriageStates(items);

    expect(result.counts).toEqual({
      pending: 2,
      processed: 1,
      failed: 0,
    });
    expect(result.buckets).toEqual({
      pending: ["T-1", "T-3"],
      processed: ["T-2"],
      failed: [],
    });
  });

  it("throws when an invalid state is encountered", () => {
    const items: TriageItem[] = [
      { id: "T-1", state: "unknown", actionButton: {} as TriageItem["actionButton"] },
    ];

    expect(() => countTriageStates(items)).toThrowError(VerificationError);
  });
});
