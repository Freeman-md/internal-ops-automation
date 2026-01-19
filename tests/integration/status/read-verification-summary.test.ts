import { describe, expect, it, vi } from "vitest";
import { readVerificationSummary } from "@/adapters/status/selectors/read-verification-summary";

describe("readVerificationSummary", () => {
  it("reads and trims summary items", async () => {
    const innerText0 = vi.fn().mockResolvedValue("  Session valid ");
    const innerText1 = vi.fn().mockResolvedValue("  Action ok ");
    const items = {
      count: vi.fn().mockResolvedValue(2),
      nth: vi.fn((index: number) =>
        index === 0
          ? { innerText: innerText0 }
          : { innerText: innerText1 }
      ),
    };
    const card = {
      locator: vi.fn().mockReturnValue(items),
    };

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

    const result = await readVerificationSummary(page);

    expect(result).toEqual(["Session valid", "Action ok"]);
    expect(locator).toHaveBeenCalledWith("h3", {
      hasText: /verification summary/i,
    });
    expect(locator).toHaveBeenCalledWith("div.rounded-lg", {
      has: expect.any(Object),
    });
    expect(card.locator).toHaveBeenCalledWith("div.flex.items-center span");
  });
});
