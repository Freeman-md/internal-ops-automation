import { describe, expect, it, vi } from "vitest";
import { AssertionError } from "@/domain/errors/assertion.error";
import { assertTicketsReadyForStart } from "@/adapters/tickets/assertions/assert-tickets-ready-start";
import type { TicketItem } from "@/contracts/adapter.contracts";

describe("assertTicketsReadyForStart", () => {
  it("does not throw when items are ready and action is Start Ticket", async () => {
    const items: TicketItem[] = [
      {
        id: "K-1",
        state: "open",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(false),
          innerText: vi.fn().mockResolvedValue("Start Ticket"),
        },
      },
    ];

    await expect(assertTicketsReadyForStart(items, "open")).resolves.toBeUndefined();
  });

  it("throws when state does not match expected", async () => {
    const items: TicketItem[] = [
      {
        id: "K-2",
        state: "in_progress",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(false),
          innerText: vi.fn().mockResolvedValue("Start Ticket"),
        },
      },
    ];

    await expect(assertTicketsReadyForStart(items, "open")).rejects.toBeInstanceOf(
      AssertionError
    );
  });

  it("throws when action button is disabled", async () => {
    const items: TicketItem[] = [
      {
        id: "K-3",
        state: "open",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(true),
          innerText: vi.fn().mockResolvedValue("Start Ticket"),
        },
      },
    ];

    await expect(assertTicketsReadyForStart(items, "open")).rejects.toBeInstanceOf(
      AssertionError
    );
  });

  it("throws when action label is unexpected", async () => {
    const items: TicketItem[] = [
      {
        id: "K-4",
        state: "open",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(false),
          innerText: vi.fn().mockResolvedValue("Resolve Ticket"),
        },
      },
    ];

    await expect(assertTicketsReadyForStart(items, "open")).rejects.toBeInstanceOf(
      AssertionError
    );
  });
});
