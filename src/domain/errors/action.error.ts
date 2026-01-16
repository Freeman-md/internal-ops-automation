export class ActionError extends Error {
  type: "ACTION";
  meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>) {
    super(message);
    this.type = "ACTION";
    this.meta = meta;
  }
}
