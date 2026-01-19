import { describe, expect, it } from "vitest";
import { filterTicketItems } from "@/adapters/tickets/filters/filter-ticket-items";
import type { TicketItem } from "@/contracts/adapter.contracts";

const items: TicketItem[] = [
  { id: "K-1", state: "open", actionButton: {} as TicketItem["actionButton"] },
  { id: "K-2", state: "in_progress", actionButton: {} as TicketItem["actionButton"] },
  { id: "K-3", state: "open", actionButton: {} as TicketItem["actionButton"] },
];

describe("filterTicketItems", () => {
  it("filters by state", () => {
    const result = filterTicketItems(items, { state: "open" });
    expect(result.map((item) => item.id)).toEqual(["K-1", "K-3"]);
  });

  it("applies limit after filtering", () => {
    const result = filterTicketItems(items, {
      state: "open",
      limit: 1,
    });
    expect(result.map((item) => item.id)).toEqual(["K-1"]);
  });
});
