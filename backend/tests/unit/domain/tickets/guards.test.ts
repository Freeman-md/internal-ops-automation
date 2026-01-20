import { describe, expect, it } from "vitest";
import { assertValidTicketTransition } from "@/domain/tickets/guards";
import { AssertionError } from "@/domain/errors/assertion.error";

describe("assertValidTicketTransition", () => {
  it("does not throw for a valid transition", () => {
    expect(() => assertValidTicketTransition("open", "in_progress")).not.toThrow();
  });

  it("throws when the current state is invalid", () => {
    expect(() => assertValidTicketTransition("unknown", "in_progress")).toThrowError(
      AssertionError
    );
  });

  it("throws when the transition is invalid", () => {
    expect(() => assertValidTicketTransition("open", "resolved")).toThrowError(
      AssertionError
    );
  });
});
