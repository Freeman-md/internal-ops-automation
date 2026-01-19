import { describe, expect, it, vi } from "vitest";
import { ActionError } from "@/domain/errors/action.error";
import { processTriageItems } from "@/adapters/triage/actions/process-triage-items";
import type { TriageItem } from "@/contracts/adapter.contracts";

describe("processTriageItems", () => {
  it("clicks action buttons and returns acted-on ids", async () => {
    const waitFor = vi.fn().mockResolvedValue(undefined);
    const row = { locator: vi.fn().mockReturnValue({ waitFor }) };
    const rowWrapper = { locator: vi.fn().mockReturnValue(row) };
    const codeLocator = { locator: vi.fn().mockReturnValue(rowWrapper) };
    const page = {
      locator: vi.fn().mockReturnValue(codeLocator),
      getByRole: vi.fn().mockReturnValue({
        filter: vi.fn().mockReturnValue({ waitFor }),
      }),
    } as any;

    const items: TriageItem<{ click: () => Promise<void> }>[] = [
      { id: "T-1", state: "pending", actionButton: { click: vi.fn() } },
      { id: "T-2", state: "pending", actionButton: { click: vi.fn() } },
    ];

    const result = await processTriageItems(page, items);

    expect(items[0].actionButton.click).toHaveBeenCalled();
    expect(items[1].actionButton.click).toHaveBeenCalled();
    expect(result).toEqual(["T-1", "T-2"]);
  });

  it("throws ActionError when clicking fails", async () => {
    const page = { locator: vi.fn(), getByRole: vi.fn() } as any;
    const items: TriageItem<{ click: () => Promise<void> }>[] = [
      {
        id: "T-9",
        state: "pending",
        actionButton: { click: vi.fn().mockRejectedValue(new Error("fail")) },
      },
    ];

    await expect(processTriageItems(page, items)).rejects.toBeInstanceOf(ActionError);
  });
});
