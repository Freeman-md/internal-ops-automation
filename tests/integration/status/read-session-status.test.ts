import { describe, expect, it, vi } from "vitest";
import { readSessionStatus } from "@/adapters/status/selectors/read-session-status";

describe("readSessionStatus", () => {
  it("marks session as valid when label includes valid", async () => {
    const innerText = vi.fn().mockResolvedValue("  Valid ");
    const statusBadge = { innerText };
    const first = vi.fn().mockReturnValue(statusBadge);
    const getByText = vi.fn().mockReturnValue({ first });
    const page = { getByText } as any;

    const result = await readSessionStatus(page);

    expect(getByText).toHaveBeenCalledWith(/valid|invalid/i);
    expect(result).toEqual({ raw: "Valid", valid: true });
  });

  it("marks session as invalid when label excludes valid", async () => {
    const innerText = vi.fn().mockResolvedValue("  Invalid ");
    const statusBadge = { innerText };
    const first = vi.fn().mockReturnValue(statusBadge);
    const getByText = vi.fn().mockReturnValue({ first });
    const page = { getByText } as any;

    const result = await readSessionStatus(page);

    expect(result).toEqual({ raw: "Invalid", valid: true });
  });
});
