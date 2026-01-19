import { describe, expect, it } from "vitest";
import { assertTriageActionAllowed } from "@/domain/triage/guards";
import { AssertionError } from "@/domain/errors/assertion.error";

describe("assertTriageActionAllowed", () => {
  it("does not throw for a valid action in a valid state", () => {
    expect(() => assertTriageActionAllowed("pending", "processed")).not.toThrow();
  });

  it("throws when the state is invalid", () => {
    expect(() => assertTriageActionAllowed("unknown", "processed")).toThrowError(
      AssertionError
    );
  });

  it("throws when the action is not allowed for the state", () => {
    expect(() => assertTriageActionAllowed("processed", "processed")).toThrowError(
      AssertionError
    );
  });
});
