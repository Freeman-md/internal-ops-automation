import { describe, expect, it } from "vitest";
import { TRIAGE_STATES } from "@/domain/triage/states";

describe("TRIAGE_STATES", () => {
  it("defines the expected triage state values", () => {
    expect(TRIAGE_STATES).toEqual({
      PENDING: "pending",
      PROCESSED: "processed",
      FAILED: "failed",
    });
  });
});
