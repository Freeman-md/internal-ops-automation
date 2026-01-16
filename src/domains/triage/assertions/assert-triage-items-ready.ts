import { TRIAGE_STATES, TriageState } from "@/config/platform-constraints";
import { TriageItem } from "../selectors/collect-triage-items";
import { assertTriageActionAllowed } from "@/core/guards";
import { AssertionError } from "@/core/errors";

export async function assertTriageItemsReady(
    items: TriageItem[],
    expectedState: TriageState
) {
    for (const item of items) {
        if (item.state !== expectedState) {
            throw new AssertionError(
                `Item ${item.id} is in state "${item.state}", expected "${expectedState}"`,
                { id: item.id, state: item.state, expectedState }
            );
        }

        assertTriageActionAllowed(item.state, TRIAGE_STATES.PROCESSED);

        const disabled = await item.actionButton.isDisabled();

        if (disabled) {
            throw new AssertionError(`Action button disabled for item ${item.id}`, {
                id: item.id,
                state: item.state,
            });
        }
    }
}
