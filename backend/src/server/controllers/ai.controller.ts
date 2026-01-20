import { Request, Response, NextFunction } from "express";
import { JSONValue, pipeDataStreamToResponse } from "ai";
import { runAIIntent } from "@/ai/adapter";
import { sendWorkflowError } from "@/server/http/responders";

type AIIntentBody = {
  prompt?: string;
};

export async function aiIntent(
  req: Request<unknown, unknown, AIIntentBody>,
  res: Response,
  next: NextFunction
) {
  try {
    const prompt = req.body?.prompt?.trim();
    if (!prompt) {
      sendWorkflowError(res, "Missing prompt", 400);
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
        writer.writeData({ type: "start" });

        const result = await runAIIntent(prompt);

        writer.writeData({ type: "message", text: result.text });
        writer.writeData({
          type: "tool_calls",
          calls: result.toolCalls as JSONValue,
        });
        writer.writeData({
          type: "tool_results",
          results: result.toolResults as JSONValue,
        });
        writer.writeData({ type: "final", matched: result.matched });
      },
      onError: (error) =>
        error instanceof Error ? error.message : "AI streaming error",
    });
  } catch (error) {
    next(error);
  }
}
