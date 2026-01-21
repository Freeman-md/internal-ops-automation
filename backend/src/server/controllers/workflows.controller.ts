import { Request, Response, NextFunction } from "express";
import { JSONValue, pipeDataStreamToResponse } from "ai";
import { sendWorkflowError } from "@/server/http/responders";
import { registerLogSink, unregisterLogSink } from "@/infra/logging/logger";
import type { LogEvent } from "@/contracts/logging.contracts";
import { runWorkflow, type WorkflowName } from "@/server/services/workflows.service";

type RunWorkflowBody = {
  name?: WorkflowName;
  input?: unknown;
};

export async function runWorkflowStream(
  req: Request<unknown, unknown, RunWorkflowBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const name = req.body?.name;
    if (!name) {
      sendWorkflowError(res, "Missing workflow name", 400);
      return;
    }
    if (
      (name === "triage.process" ||
        name === "tickets.start" ||
        name === "tickets.resolve") &&
      !req.body?.input
    ) {
      sendWorkflowError(res, "Missing workflow input", 400);
      return;
    }

    pipeDataStreamToResponse(res, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
      execute: async (writer) => {
        writer.writeData({ type: "start", name });

        const sink = (event: LogEvent) => {
          writer.writeData({ type: "log", event: event as JSONValue });
        };

        registerLogSink(sink);
        try {
          const result = await runWorkflow(name, req.body?.input);
          writer.writeData({ type: "result", result: result as JSONValue });
        } finally {
          unregisterLogSink(sink);
        }

        writer.writeData({ type: "final" });
      },
      onError: (error) =>
        error instanceof Error ? error.message : "Workflow streaming error",
    });
  } catch (error) {
    next(error);
  }
}
