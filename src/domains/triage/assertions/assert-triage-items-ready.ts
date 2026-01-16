import { TRIAGE_STATES, TriageState } from "@/config/platform-constraints";
import { TriageItem } from "../selectors/collect-triage-items";
import { assertTriageActionAllowed } from "@/core/guards";

export async function assertTriageItemsReady(
    items: TriageItem[],
    expectedState: TriageState
) {
    for (const item of items) {
        if (item.state !== expectedState) {
            throw new Error(
                `Item ${item.id} is in state "${item.state}", expected "${expectedState}"`
            );
        }

        assertTriageActionAllowed(item.state, TRIAGE_STATES.PROCESSED);

        const disabled = await item.actionButton.isDisabled();

        if (disabled) {
            throw new Error(`Action button disabled for item ${item.id}`);
        }
    }
}