import { describe, expect, it, vi } from "vitest";
import { readAuthenticatedActionValue } from "@/adapters/status/selectors/read-auth-action";

describe("readAuthenticatedActionValue", () => {
  it("reads and trims the authenticated action value", async () => {
    const innerText = vi.fn().mockResolvedValue("  2024-01-01  ");
    const value = { innerText };
    const row = { locator: vi.fn().mockReturnValue(value) };
    const card = { locator: vi.fn().mockReturnValue(row) };

    const locator = vi.fn((selector: string) => {
      if (selector === "h3") {
        return {};
      }
      if (selector === "div.rounded-lg") {
        return card;
      }
      return {};
    });

    const page = { locator } as any;

    const result = await readAuthenticatedActionValue(page);

    expect(result).toBe("2024-01-01");
    expect(locator).toHaveBeenCalledWith("h3", {
      hasText: /authenticated action test/i,
    });
    expect(locator).toHaveBeenCalledWith("div.rounded-lg", {
      has: expect.any(Object),
    });
    expect(card.locator).toHaveBeenCalledWith("div.grid", {
      hasText: /last authenticated action/i,
    });
    expect(row.locator).toHaveBeenCalledWith(":scope > :nth-child(2)");
  });
});
