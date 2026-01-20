import { describe, expect, it, vi } from "vitest";
import { VerificationError } from "@/domain/errors/verification.error";
import type { TriageItem } from "@/contracts/adapter.contracts";

vi.mock("@/adapters/triage/selectors/collect-triage-items", () => ({
  collectTriageItems: vi.fn(),
}));

import { verifyTriageResults } from "@/adapters/triage/verifications/verify-triage-results";
import { collectTriageItems } from "@/adapters/triage/selectors/collect-triage-items";

describe("verifyTriageResults", () => {
  it("returns final states when per-item and summary checks pass", async () => {
    const items: TriageItem[] = [
      {
        id: "T-1",
        state: "processed",
        actionButton: { isDisabled: vi.fn().mockResolvedValue(true) },
      },
      {
        id: "T-2",
        state: "failed",
        actionButton: { isDisabled: vi.fn().mockResolvedValue(true) },
      },
    ];

    vi.mocked(collectTriageItems).mockResolvedValueOnce(items as any);

    const values = {
      nth: vi.fn((index: number) => ({
        innerText: vi.fn().mockResolvedValue(
          index === 0 ? "0" : index === 1 ? "2" : "1"
        ),
      })),
    };
    const summaryCard = { locator: vi.fn().mockReturnValue(values) };
    const summaryWrapper = { locator: vi.fn().mockReturnValue(summaryCard) };
    const getByText = vi.fn().mockReturnValue({
      locator: vi.fn().mockReturnValue(summaryWrapper),
    });
    const page = { getByText } as any;

    const result = await verifyTriageResults(
      page,
      ["T-1", "T-2"],
      { pending: 2, processed: 1, failed: 0 }
    );

    expect(result).toEqual({ "T-1": "processed", "T-2": "failed" });
  });

  it("throws when an acted-on item is missing", async () => {
    vi.mocked(collectTriageItems).mockResolvedValueOnce([] as any);
    const page = { getByText: vi.fn() } as any;

    await expect(
      verifyTriageResults(page, ["T-1"], {
        pending: 1,
        processed: 0,
        failed: 0,
      })
    ).rejects.toBeInstanceOf(VerificationError);
  });
});
