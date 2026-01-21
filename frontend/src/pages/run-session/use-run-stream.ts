import { useCallback, useEffect, useRef, useState } from "react";
import type { RunState, StreamEvent } from "./types";

type RunStatus = "idle" | "running" | "done" | "error";

export function useRunStream(apiBase: string, state: RunState | null) {
  const [status, setStatus] = useState<RunStatus>("idle");
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [resultSummary, setResultSummary] = useState<string>("");
  const counterRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  useEffect(() => {
    if (!state) return;

    runIdRef.current += 1;
    const runId = runIdRef.current;
    counterRef.current = 0;

    const controller = new AbortController();
    controllerRef.current = controller;

    const run = async () => {
      setStatus("running");
      setEvents([]);
      setResultSummary("");

      const body =
        state.mode === "ai"
          ? { prompt: state.prompt }
          : { name: state.name, input: state.input };

      const endpoint =
        state.mode === "ai" ? "/api/ai/intent" : "/api/workflows/run";

      const response = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.body) {
        setStatus("error");
        setResultSummary("No stream available from the server.");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const pushEvent = (payload: { type?: string }) => {
        counterRef.current += 1;
        const id = `${runId}-${counterRef.current}`;
        const eventType = payload.type ?? "data";

        setEvents((prev) => [
          ...prev,
          {
            id,
            type: eventType,
            payload,
            receivedAt: Date.now(),
          },
        ]);

        if (eventType === "result") {
          setResultSummary(JSON.stringify(payload.result ?? payload, null, 2));
        }
        if (eventType === "final") {
          setStatus("done");
        }
      };

      const handleLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        const separatorIndex = trimmed.indexOf(":");
        if (separatorIndex === -1) return;
        const jsonPart = trimmed.slice(separatorIndex + 1);

        try {
          const parsed = JSON.parse(jsonPart);
          const items = Array.isArray(parsed) ? parsed : [parsed];
          items.forEach((payload) => pushEvent(payload));
        } catch {
          // Silently ignore JSON parsing errors
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(handleLine);
      }

      if (!controller.signal.aborted) {
        setStatus("done");
      }
    };

    run().catch((error) => {
      if (controller.signal.aborted) return;
      setStatus("error");
      setResultSummary(
        error instanceof Error ? error.message : "Stream failed"
      );
    });

    return () => {
      controller.abort();
      controllerRef.current = null;
    };
  }, [apiBase, state]);

  return {
    status,
    events,
    resultSummary,
    cancel,
  };
}
