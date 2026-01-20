import { describe, expect, it, vi } from "vitest";
import { AssertionError } from "@/domain/errors/assertion.error";
import { assertTicketsReadyForResolve } from "@/adapters/tickets/assertions/assert-tickets-ready-resolve";
import type { TicketItem } from "@/contracts/adapter.contracts";

describe("assertTicketsReadyForResolve", () => {
  it("does not throw when items are ready and action is Resolve Ticket", async () => {
    const items: TicketItem[] = [
      {
        id: "K-1",
        state: "in_progress",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(false),
          innerText: vi.fn().mockResolvedValue("Resolve Ticket"),
        },
      },
    ];

    await expect(
      assertTicketsReadyForResolve(items, "in_progress")
    ).resolves.toBeUndefined();
  });

  it("throws when state does not match expected", async () => {
    const items: TicketItem[] = [
      {
        id: "K-2",
        state: "open",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(false),
          innerText: vi.fn().mockResolvedValue("Resolve Ticket"),
        },
      },
    ];

    await expect(
      assertTicketsReadyForResolve(items, "in_progress")
    ).rejects.toBeInstanceOf(AssertionError);
  });

  it("throws when action button is disabled", async () => {
    const items: TicketItem[] = [
      {
        id: "K-3",
        state: "in_progress",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(true),
          innerText: vi.fn().mockResolvedValue("Resolve Ticket"),
        },
      },
    ];

    await expect(
      assertTicketsReadyForResolve(items, "in_progress")
    ).rejects.toBeInstanceOf(AssertionError);
  });

  it("throws when action label is unexpected", async () => {
    const items: TicketItem[] = [
      {
        id: "K-4",
        state: "in_progress",
        actionButton: {
          isDisabled: vi.fn().mockResolvedValue(false),
          innerText: vi.fn().mockResolvedValue("Start Ticket"),
        },
      },
    ];

    await expect(
      assertTicketsReadyForResolve(items, "in_progress")
    ).rejects.toBeInstanceOf(AssertionError);
  });
});
