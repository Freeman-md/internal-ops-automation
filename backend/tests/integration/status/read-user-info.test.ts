import { describe, expect, it, vi } from "vitest";
import { readAuthenticatedUser } from "@/adapters/status/selectors/read-user-info";

describe("readAuthenticatedUser", () => {
  it("reads and trims user id and email", async () => {
    const userIdText = vi.fn().mockResolvedValue("  user-1 ");
    const emailText = vi.fn().mockResolvedValue(" user@example.com ");

    const userIdRow = {
      locator: vi.fn().mockReturnValue({ innerText: userIdText }),
    };
    const emailRow = {
      locator: vi.fn().mockReturnValue({ innerText: emailText }),
    };

    const rows = {
      filter: vi.fn((opts: { hasText: RegExp }) => {
        return opts.hasText.toString().includes("user id") ? userIdRow : emailRow;
      }),
    };

    const userCard = {
      locator: vi.fn().mockReturnValue(rows),
    };

    const headingParent = { locator: vi.fn().mockReturnValue(userCard) };
    const heading = { locator: vi.fn().mockReturnValue(headingParent) };
    const getByRole = vi.fn().mockReturnValue(heading);

    const page = { getByRole } as any;

    const result = await readAuthenticatedUser(page);

    expect(getByRole).toHaveBeenCalledWith("heading", {
      name: /authenticated user/i,
    });
    expect(userCard.locator).toHaveBeenCalledWith("div.grid");
    expect(result).toEqual({
      userId: "user-1",
      email: "user@example.com",
    });
  });
});
