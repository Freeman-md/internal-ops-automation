import { describe, expect, it, vi } from "vitest";
import { collectTicketItems } from "@/adapters/tickets/selectors/collect-ticket-items";

describe("collectTicketItems", () => {
  it("collects ticket items from the page", async () => {
    const waitForLoadState = vi.fn().mockResolvedValue(undefined);
    const waitFor = vi.fn().mockResolvedValue(undefined);
    const getByRole = vi.fn().mockReturnValue({ waitFor });

    const row0 = {
      locator: vi.fn((selector: string) => {
        if (selector === "code") return { innerText: vi.fn().mockResolvedValue(" K-1 ") };
        return { last: () => ({ innerText: vi.fn().mockResolvedValue(" open ") }) };
      }),
      getByRole: vi.fn().mockReturnValue({ first: () => ({}) }),
    };
    const row1 = {
      locator: vi.fn((selector: string) => {
        if (selector === "code") return { innerText: vi.fn().mockResolvedValue(" K-2 ") };
        return { last: () => ({ innerText: vi.fn().mockResolvedValue(" in_progress ") }) };
      }),
      getByRole: vi.fn().mockReturnValue({ first: () => ({}) }),
    };

    const rows = {
      count: vi.fn().mockResolvedValue(2),
      nth: vi.fn((index: number) => (index === 0 ? row0 : row1)),
    };

    const locator = vi.fn().mockReturnValue(rows);
    const page = { waitForLoadState, getByRole, locator } as any;

    const result = await collectTicketItems(page);

    expect(waitForLoadState).toHaveBeenCalledWith("networkidle");
    expect(getByRole).toHaveBeenCalledWith("heading", { level: 1, name: "Tickets" });
    expect(result).toEqual([
      { id: "K-1", state: "open", actionButton: {} },
      { id: "K-2", state: "in_progress", actionButton: {} },
    ]);
  });
});
