import { ProcessTriageInput } from "@/types/workflow";
import { TriageItem } from "../selectors/collect-triage-items";

export function filterTriageItems(
    items: TriageItem[],
    selector: ProcessTriageInput["selector"]
): TriageItem[] {
    let result = items;

    if (selector.state) {
        result = result.filter(
            item => item.state === selector.state
        )
    }

    // 2. olderThan (future-ready, no suitable fields in UI)
    // if (selector.olderThan) {}

    // 3. priority (future-ready, no suitable fields in UI)
    // if (selector.priority) {}

    if (selector.limit !== undefined) {
        result = result.slice(0, selector.limit)
    }

    return result
}