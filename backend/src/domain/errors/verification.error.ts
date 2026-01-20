export class VerificationError extends Error {
  type: "VERIFICATION";
  meta?: Record<string, unknown>;

  constructor(message: string, meta?: Record<string, unknown>) {
    super(message);
    this.type = "VERIFICATION";
    this.meta = meta;
  }
}
