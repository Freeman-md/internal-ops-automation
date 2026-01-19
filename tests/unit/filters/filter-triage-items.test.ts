import { describe, expect, it } from "vitest";
import { filterTriageItems } from "@/adapters/triage/filters/filter-triage-items";
import type { TriageItem } from "@/contracts/adapter.contracts";

const items: TriageItem[] = [
  { id: "T-1", state: "pending", actionButton: {} as TriageItem["actionButton"] },
  { id: "T-2", state: "processed", actionButton: {} as TriageItem["actionButton"] },
  { id: "T-3", state: "pending", actionButton: {} as TriageItem["actionButton"] },
];

describe("filterTriageItems", () => {
  it("filters by state", () => {
    const result = filterTriageItems(items, { state: "pending" });
    expect(result.map((item) => item.id)).toEqual(["T-1", "T-3"]);
  });

  it("applies limit after filtering", () => {
    const result = filterTriageItems(items, {
      state: "pending",
      limit: 1,
    });
    expect(result.map((item) => item.id)).toEqual(["T-1"]);
  });
});
