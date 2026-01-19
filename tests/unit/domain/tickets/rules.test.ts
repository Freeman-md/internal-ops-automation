import { describe, expect, it } from "vitest";
import { TICKET_ACTIONS_BY_STATE, TICKET_TRANSITIONS } from "@/domain/tickets/rules";
import { TICKET_STATES } from "@/domain/tickets/states";

describe("TICKET_TRANSITIONS", () => {
  it("maps valid transitions for each ticket state", () => {
    expect(TICKET_TRANSITIONS).toEqual({
      [TICKET_STATES.OPEN]: [TICKET_STATES.IN_PROGRESS],
      [TICKET_STATES.IN_PROGRESS]: [TICKET_STATES.RESOLVED],
      [TICKET_STATES.RESOLVED]: [],
    });
  });
});

describe("TICKET_ACTIONS_BY_STATE", () => {
  it("maps actions to each ticket state", () => {
    expect(TICKET_ACTIONS_BY_STATE).toEqual({
      [TICKET_STATES.OPEN]: ["start"],
      [TICKET_STATES.IN_PROGRESS]: ["resolve"],
      [TICKET_STATES.RESOLVED]: [],
    });
  });
});
