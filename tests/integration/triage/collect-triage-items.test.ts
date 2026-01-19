import { describe, expect, it, vi } from "vitest";
import { collectTriageItems } from "@/adapters/triage/selectors/collect-triage-items";

describe("collectTriageItems", () => {
  it("collects triage items from the page", async () => {
    const waitForLoadState = vi.fn().mockResolvedValue(undefined);
    const waitFor = vi.fn().mockResolvedValue(undefined);
    const getByRole = vi.fn().mockReturnValue({ waitFor });

    const row0 = {
      locator: vi.fn((selector: string) => {
        if (selector === "code") return { innerText: vi.fn().mockResolvedValue(" T-1 ") };
        return { last: () => ({ innerText: vi.fn().mockResolvedValue(" pending ") }) };
      }),
      getByRole: vi.fn().mockReturnValue({}),
    };
    const row1 = {
      locator: vi.fn((selector: string) => {
        if (selector === "code") return { innerText: vi.fn().mockResolvedValue(" T-2 ") };
        return { last: () => ({ innerText: vi.fn().mockResolvedValue(" processed ") }) };
      }),
      getByRole: vi.fn().mockReturnValue({}),
    };

    const rows = {
      count: vi.fn().mockResolvedValue(2),
      nth: vi.fn((index: number) => (index === 0 ? row0 : row1)),
    };

    const locator = vi.fn().mockReturnValue(rows);
    const page = { waitForLoadState, getByRole, locator } as any;

    const result = await collectTriageItems(page);

    expect(waitForLoadState).toHaveBeenCalledWith("networkidle");
    expect(getByRole).toHaveBeenCalledWith("heading", { level: 1, name: "Triage" });
    expect(result).toEqual([
      { id: "T-1", state: "pending", actionButton: {} },
      { id: "T-2", state: "processed", actionButton: {} },
    ]);
  });
});
