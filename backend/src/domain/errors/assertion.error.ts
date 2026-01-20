export class AssertionError extends Error {
  type: "ASSERTION";
  meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>) {
    super(message);
    this.type = "ASSERTION";
    this.meta = meta;
  }
}
