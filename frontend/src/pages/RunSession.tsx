import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  ScrollText,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

type RunState =
  | {
      mode: "workflow";
      name: string;
      input?: Record<string, unknown>;
    }
  | {
      mode: "ai";
      prompt: string;
    };

type StreamEvent = {
  id: string;
  type: string;
  payload: unknown;
  receivedAt: number;
};

type LogPayload = {
  scope?: string;
  level?: string;
  message?: string;
  meta?: Record<string, unknown>;
  timeStamp?: number;
};

type WorkflowResultPayload = {
  success?: boolean;
  data?: {
    status?: string;
    reason?: string;
    artifacts?: Record<string, unknown>;
  };
  error?: {
    type?: string;
    message?: string;
    meta?: Record<string, unknown>;
  };
  durationMs?: number;
};

export function RunSession() {
  const apiBase = import.meta.env.VITE_API_BASE ?? "http://0.0.0.0:3000";
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RunState | null;
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [resultSummary, setResultSummary] = useState<string>("");
  const counterRef = useRef(0);
  const controllerRef = useRef<AbortController | null>(null);
  const runIdRef = useRef(0);

  const heading = useMemo(() => {
    if (!state) return "No run selected";
    if (state.mode === "ai") return "AI Intent Session";
    return `Workflow: ${state.name}`;
  }, [state]);

  const formatTime = (value: number) =>
    new Date(value).toLocaleTimeString();

  const formatValue = (value: unknown) => {
    if (value === null || value === undefined) return "—";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "None";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const renderEventHeader = (event: StreamEvent) => {
    const payload = event.payload as Record<string, unknown>;
    const logEvent = (payload.event ?? payload) as LogPayload;
    const resultPayload = (payload.result ?? payload) as WorkflowResultPayload;

    if (event.type === "log") {
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="outline">{logEvent.scope ?? "LOG"}</Badge>
          <span className="font-medium text-foreground">
            {logEvent.message ?? "Log event"}
          </span>
        </div>
      );
    }

    if (event.type === "result") {
      const success = resultPayload.success === true;
      return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {success ? (
            <Badge variant="accent" className="gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Success
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <XCircle className="h-3.5 w-3.5" />
              Failed
            </Badge>
          )}
          <span className="font-medium text-foreground">
            {resultPayload.data?.reason ?? "Workflow result"}
          </span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">{event.type}</Badge>
        <span className="font-medium text-foreground">Event received</span>
      </div>
    );
  };

  const renderEventDetails = (event: StreamEvent) => {
    const payload = event.payload as Record<string, unknown>;

    switch (event.type) {
      case "log": {
        const logEvent = (payload.event ?? payload) as LogPayload;
        if (!logEvent.meta || Object.keys(logEvent.meta).length === 0) {
          return <span className="text-xs text-muted-foreground">No metadata.</span>;
        }

        return (
          <div className="grid gap-2 text-xs text-muted-foreground">
            {Object.entries(logEvent.meta).map(([key, value]) => (
              <div key={key} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  {key}
                </span>
                <span className="text-sm text-foreground">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
        );
      }
      case "result": {
        const result = (payload.result ?? payload) as WorkflowResultPayload;
        const success = result.success === true;
        const artifacts = result.data?.artifacts ?? {};
        return (
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                Status
              </span>
              <span className="font-medium text-foreground">
                {result.data?.status ?? (success ? "SUCCESS" : "FAILED")}
              </span>
              {typeof result.durationMs === "number" ? (
                <span className="text-xs text-muted-foreground">
                  {(result.durationMs / 1000).toFixed(2)}s
                </span>
              ) : null}
            </div>
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                Reason
              </span>
              <p className="mt-1 text-sm text-foreground">
                {result.data?.reason ?? result.error?.message ?? "No details."}
              </p>
            </div>
            {Object.keys(artifacts).length > 0 ? (
              <div className="grid gap-3">
                {Object.entries(artifacts).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                      {key}
                    </span>
                    <p className="mt-1 text-sm text-foreground">
                      {formatValue(value)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No artifacts.</span>
            )}
          </div>
        );
      }
      case "message": {
        return (
          <div className="text-sm text-foreground">
            {String(payload.text ?? "")}
          </div>
        );
      }
      case "tool_calls": {
        const calls = (payload.calls ?? []) as Array<Record<string, unknown>>;
        return (
          <div className="space-y-2 text-xs text-muted-foreground">
            {calls.length === 0 ? (
              <span>No tool calls returned.</span>
            ) : (
              calls.map((call, index) => (
                <div key={`call-${event.id}-${index}`} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {String(call.name ?? "tool")}
                  </p>
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {JSON.stringify(call.args ?? {}, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        );
      }
      case "tool_results": {
        const results = (payload.results ?? []) as Array<Record<string, unknown>>;
        return (
          <div className="space-y-2 text-xs text-muted-foreground">
            {results.length === 0 ? (
              <span>No tool results returned.</span>
            ) : (
              results.map((result, index) => (
                <div key={`result-${event.id}-${index}`} className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {String(result.name ?? "tool")}
                  </p>
                  <pre className="whitespace-pre-wrap font-mono text-xs">
                    {JSON.stringify(result.result ?? {}, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        );
      }
      case "start": {
        return (
          <div className="text-xs text-muted-foreground">
            Run initialized.
          </div>
        );
      }
      case "final": {
        return (
          <div className="text-xs text-muted-foreground">
            Stream completed.
          </div>
        );
      }
      default:
        return (
          <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
            {JSON.stringify(payload, null, 2)}
          </pre>
        );
    }
  };

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

  return (
    <div className="min-h-screen bg-[radial-gradient(70%_90%_at_0%_0%,rgba(205,220,255,0.4)_0%,rgba(205,220,255,0)_70%),radial-gradient(60%_80%_at_100%_0%,rgba(255,223,197,0.35)_0%,rgba(255,223,197,0)_70%),linear-gradient(180deg,#f7f7fb_0%,#f3f2f7_55%,#efedf2_100%)] text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-20 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                controllerRef.current?.abort();
                navigate("/");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Run Session
              </p>
              <h1 className="text-2xl font-semibold">{heading}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{state?.mode ?? "none"}</Badge>
            {status === "running" ? (
              <Badge variant="accent" className="gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Running
              </Badge>
            ) : (
              <Badge variant="accent" className="gap-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {status === "error" ? "Error" : "Complete"}
              </Badge>
            )}
          </div>
        </div>

        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScrollText className="h-5 w-5" />
              Live Stream
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {events.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 bg-background/70 p-4">
                Waiting for stream events...
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <details
                    key={event.id}
                    className="rounded-lg border border-border/60 bg-background/70 p-4 open:bg-background/90"
                  >
                    <summary className="flex cursor-pointer items-center justify-between gap-4">
                      {renderEventHeader(event)}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatTime(event.receivedAt)}</span>
                        <span className="open:hidden">
                          <ChevronDown className="h-4 w-4" />
                        </span>
                        <span className="hidden open:inline">
                          <ChevronUp className="h-4 w-4" />
                        </span>
                      </div>
                    </summary>
                    <div className="mt-3 border-t border-border/60 pt-3">
                      {renderEventDetails(event)}
                    </div>
                  </details>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-background/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5" />
              Result Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-dashed border-border/60 bg-card/60 p-4 text-xs">
              {resultSummary ? (
                <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">
                  {resultSummary}
                </pre>
              ) : (
                "Result payload will appear here once available."
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ScrollText className="h-5 w-5" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Streaming events include AI messages, tool calls, tool results, and
            workflow logs. Use the back button to start another run.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
