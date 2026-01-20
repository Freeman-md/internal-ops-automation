import { describe, expect, it, vi } from "vitest";
import { VerificationError } from "@/domain/errors/verification.error";
import type { TicketItem } from "@/contracts/adapter.contracts";

vi.mock("@/adapters/tickets/selectors/collect-ticket-items", () => ({
  collectTicketItems: vi.fn(),
}));

import { verifyTicketStates } from "@/adapters/tickets/verifications/verify-ticket-results";
import { collectTicketItems } from "@/adapters/tickets/selectors/collect-ticket-items";

describe("verifyTicketStates", () => {
  it("returns final states when items match expected final state", async () => {
    const items: TicketItem[] = [
      {
        id: "K-1",
        state: "in_progress",
        actionButton: {
          innerText: vi.fn().mockResolvedValue("Resolve Ticket"),
          isDisabled: vi.fn().mockResolvedValue(false),
        },
      },
      {
        id: "K-2",
        state: "in_progress",
        actionButton: {
          innerText: vi.fn().mockResolvedValue("Resolve Ticket"),
          isDisabled: vi.fn().mockResolvedValue(false),
        },
      },
    ];

    vi.mocked(collectTicketItems).mockResolvedValueOnce(items as any);

    const page = {} as any;
    const result = await verifyTicketStates(page, ["K-1", "K-2"], "in_progress");

    expect(result).toEqual({ "K-1": "in_progress", "K-2": "in_progress" });
  });

  it("throws when an acted-on item is missing", async () => {
    vi.mocked(collectTicketItems).mockResolvedValueOnce([] as any);

    await expect(
      verifyTicketStates({} as any, ["K-1"], "in_progress")
    ).rejects.toBeInstanceOf(VerificationError);
  });
});
