import { describe, expect, it, vi } from "vitest";
import { AssertionError } from "@/domain/errors/assertion.error";
import { assertTriageItemsReady } from "@/adapters/triage/assertions/assert-triage-items-ready";
import type { TriageItem } from "@/contracts/adapter.contracts";

describe("assertTriageItemsReady", () => {
  it("does not throw when items match expected state and buttons are enabled", async () => {
    const items: TriageItem[] = [
      {
        id: "T-1",
        state: "pending",
        actionButton: { isDisabled: vi.fn().mockResolvedValue(false) },
      },
    ];

    await expect(assertTriageItemsReady(items, "pending")).resolves.toBeUndefined();
  });

  it("throws when an item is in a different state", async () => {
    const items: TriageItem[] = [
      {
        id: "T-2",
        state: "processed",
        actionButton: { isDisabled: vi.fn().mockResolvedValue(false) },
      },
    ];

    await expect(assertTriageItemsReady(items, "pending")).rejects.toBeInstanceOf(
      AssertionError
    );
  });

  it("throws when an action button is disabled", async () => {
    const items: TriageItem[] = [
      {
        id: "T-3",
        state: "pending",
        actionButton: { isDisabled: vi.fn().mockResolvedValue(true) },
      },
    ];

    await expect(assertTriageItemsReady(items, "pending")).rejects.toBeInstanceOf(
      AssertionError
    );
  });
});
