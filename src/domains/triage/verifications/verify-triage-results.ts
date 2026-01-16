import { TRIAGE_STATES, TriageState } from "@/config/platform-constraints";
import { Page } from "playwright";
import { collectTriageItems } from "../selectors/collect-triage-items";

export async function verifyTriageResults(
    page: Page,
    actedOnItems: string[],
    beforeCounts: { pending: number; processed: number; failed: number }
): Promise<Record<string, TriageState>> {
    const snapshot = await collectTriageItems(page);
    const finalStates: Record<string, TriageState> = {};

    // Per-item verification
    for (const id of actedOnItems) {
        const item = snapshot.find(i => i.id === id);

        if (!item) {
            throw new Error(`Acted item ${id} missing after action`);
        }

        if (
            item.state !== TRIAGE_STATES.PROCESSED &&
            item.state !== TRIAGE_STATES.FAILED
        ) {
            throw new Error(`Invalid final state for ${id}: ${item.state}`);
        }

        if (!(await item.actionButton.isDisabled())) {
            throw new Error(`Action button still enabled for ${id}`);
        }

        finalStates[id] = item.state;
    }

    // Global verification
    const afterCounts = await readStateSummary(page);

    if (afterCounts.pending >= beforeCounts.pending) {
        throw new Error("Pending count did not decrease");
    }

    if (
        afterCounts.processed <= beforeCounts.processed &&
        afterCounts.failed <= beforeCounts.failed
    ) {
        throw new Error("Neither processed nor failed count increased");
    }

    return finalStates;
}

export async function readStateSummary(page: Page) {
  const summaryCard = page
    .getByText(/state summary/i)
    .locator("..")
    .locator("..");

  const values = summaryCard.locator("div.text-2xl.font-semibold");

  return {
    pending: Number(await values.nth(0).innerText()),
    processed: Number(await values.nth(1).innerText()),
    failed: Number(await values.nth(2).innerText()),
  };
}