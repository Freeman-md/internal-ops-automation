import { ProcessTriageInput } from "@/contracts/workflow.contracts";
import { TriageItem } from "@/contracts/adapter.contracts";

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

    if (selector.limit !== undefined) {
        result = result.slice(0, selector.limit)
    }

    return result
}
