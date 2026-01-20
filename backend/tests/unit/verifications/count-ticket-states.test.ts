import { describe, expect, it } from "vitest";
import { countTicketStates } from "@/adapters/tickets/verifications/count-ticket-states";
import { VerificationError } from "@/domain/errors/verification.error";
import type { TicketItem } from "@/contracts/adapter.contracts";

describe("countTicketStates", () => {
  it("counts items by ticket state and groups ids", () => {
    const items: TicketItem[] = [
      { id: "K-1", state: "open", actionButton: {} as TicketItem["actionButton"] },
      { id: "K-2", state: "in_progress", actionButton: {} as TicketItem["actionButton"] },
      { id: "K-3", state: "open", actionButton: {} as TicketItem["actionButton"] },
    ];

    const result = countTicketStates(items);

    expect(result.counts).toEqual({
      open: 2,
      in_progress: 1,
      resolved: 0,
    });
    expect(result.buckets).toEqual({
      open: ["K-1", "K-3"],
      in_progress: ["K-2"],
      resolved: [],
    });
  });

  it("throws when an invalid state is encountered", () => {
    const items: TicketItem[] = [
      { id: "K-1", state: "unknown", actionButton: {} as TicketItem["actionButton"] },
    ];

    expect(() => countTicketStates(items)).toThrowError(VerificationError);
  });
});
