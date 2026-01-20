import { Page } from "playwright";
import { ActionError } from "@/domain/errors/action.error";
import { TICKET_STATES } from "@/domain/tickets/states";
import { TicketItem } from "@/contracts/adapter.contracts";

export async function startTickets(page: Page, items: TicketItem[]): Promise<string[]> {
  const actedOn: string[] = [];

  for (const item of items) {
    try {
      await item.actionButton.click();

      const row = page
        .locator("code", { hasText: item.id })
        .locator("..")
        .locator("..");

      const stateBadge = row.locator("div[role='status'], div.inline-flex").last();
      const button = row.getByRole("button").first();

      await Promise.race([
        stateBadge.filter({ hasText: TICKET_STATES.IN_PROGRESS }).waitFor({ timeout: 5_000 }),
        button.filter({ hasText: /resolve ticket/i }).waitFor({ timeout: 5_000 }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown ticket action error";
      throw new ActionError(`Failed to start ticket ${item.id}`, { id: item.id, error: message });
    }

    actedOn.push(item.id);
  }

  return actedOn;
}