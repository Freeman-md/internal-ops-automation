export type TriageItem<ActionButton = unknown> = {
  id: string;
  state: string;
  actionButton: ActionButton;
};

export type TicketItem<ActionButton = unknown> = {
  id: string;
  state: string;
  actionButton: ActionButton;
};
