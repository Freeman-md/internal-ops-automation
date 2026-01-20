import { describe, expect, it, vi } from "vitest";
import { ActionError } from "@/domain/errors/action.error";
import { resolveTickets } from "@/adapters/tickets/actions/resolve-tickets";
import type { TicketItem } from "@/contracts/adapter.contracts";

describe("resolveTickets", () => {
  it("clicks action buttons and returns acted-on ids", async () => {
    const waitFor = vi.fn().mockResolvedValue(undefined);
    const row = {
      locator: vi.fn().mockReturnValue({ last: () => ({ filter: () => ({ waitFor }) }) }),
      getByRole: vi.fn().mockReturnValue({ first: () => ({ filter: () => ({ waitFor }) }) }),
    };
    const rowWrapper = { locator: vi.fn().mockReturnValue(row) };
    const codeLocator = { locator: vi.fn().mockReturnValue(rowWrapper) };
    const page = { locator: vi.fn().mockReturnValue(codeLocator) } as any;

    const items: TicketItem<{ click: () => Promise<void> }>[] = [
      { id: "K-1", state: "in_progress", actionButton: { click: vi.fn() } },
      { id: "K-2", state: "in_progress", actionButton: { click: vi.fn() } },
    ];

    const result = await resolveTickets(page, items);

    expect(items[0].actionButton.click).toHaveBeenCalled();
    expect(items[1].actionButton.click).toHaveBeenCalled();
    expect(result).toEqual(["K-1", "K-2"]);
  });

  it("throws ActionError when clicking fails", async () => {
    const page = { locator: vi.fn() } as any;
    const items: TicketItem<{ click: () => Promise<void> }>[] = [
      {
        id: "K-9",
        state: "in_progress",
        actionButton: { click: vi.fn().mockRejectedValue(new Error("fail")) },
      },
    ];

    await expect(resolveTickets(page, items)).rejects.toBeInstanceOf(ActionError);
  });
});
