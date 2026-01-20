import { Response } from "express";

export function sendWorkflowError(
  res: Response,
  message: string,
  status = 400,
  type: "ASSERTION" | "ACTION" | "VERIFICATION" | "UNKNOWN" = "UNKNOWN",
  meta?: unknown
) {
  res.status(status).json({
    success: false,
    error: {
      type,
      message,
      meta,
    },
    durationMs: 0,
  });
}
