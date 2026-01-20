import { describe, expect, it } from "vitest";
import { TICKET_STATES } from "@/domain/tickets/states";

describe("TICKET_STATES", () => {
  it("defines the expected ticket state values", () => {
    expect(TICKET_STATES).toEqual({
      OPEN: "open",
      IN_PROGRESS: "in_progress",
      RESOLVED: "resolved",
    });
  });
});
