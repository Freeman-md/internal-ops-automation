import { ProcessTicketsInput } from "@/contracts/workflow.contracts";
import { TicketItem } from "@/contracts/adapter.contracts";

export function filterTicketItems(
  items: TicketItem[],
  selector: ProcessTicketsInput["selector"]
): TicketItem[] {
  let result = items;

  if (selector.state) {
    result = result.filter((item) => item.state === selector.state);
  }

  if (selector.limit !== undefined) {
    result = result.slice(0, selector.limit);
  }

  return result;
}