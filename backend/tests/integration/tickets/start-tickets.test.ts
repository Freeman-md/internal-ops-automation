import { describe, expect, it, vi } from "vitest";
import { ActionError } from "@/domain/errors/action.error";
import { startTickets } from "@/adapters/tickets/actions/start-tickets";
import type { TicketItem } from "@/contracts/adapter.contracts";

describe("startTickets", () => {
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
      { id: "K-1", state: "open", actionButton: { click: vi.fn() } },
      { id: "K-2", state: "open", actionButton: { click: vi.fn() } },
    ];

    const result = await startTickets(page, items);

    expect(items[0].actionButton.click).toHaveBeenCalled();
    expect(items[1].actionButton.click).toHaveBeenCalled();
    expect(result).toEqual(["K-1", "K-2"]);
  });

  it("throws ActionError when clicking fails", async () => {
    const page = { locator: vi.fn() } as any;
    const items: TicketItem<{ click: () => Promise<void> }>[] = [
      {
        id: "K-9",
        state: "open",
        actionButton: { click: vi.fn().mockRejectedValue(new Error("fail")) },
      },
    ];

    await expect(startTickets(page, items)).rejects.toBeInstanceOf(ActionError);
  });
});
