import { describe, expect, it } from "vitest";
import { TRIAGE_ACTIONS_BY_STATE } from "@/domain/triage/rules";
import { TRIAGE_STATES } from "@/domain/triage/states";

describe("TRIAGE_ACTIONS_BY_STATE", () => {
  it("maps actions to each triage state", () => {
    expect(TRIAGE_ACTIONS_BY_STATE).toEqual({
      [TRIAGE_STATES.PENDING]: ["processed"],
      [TRIAGE_STATES.PROCESSED]: [],
      [TRIAGE_STATES.FAILED]: [],
    });
  });
});
