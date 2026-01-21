import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  XCircle,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { formatTime, formatValue } from "./utils";
import type { LogPayload, StreamEvent, WorkflowResultPayload } from "./types";

type StreamEventCardProps = {
  event: StreamEvent;
};

function getPayloadRecord(payload: unknown) {
  return (payload ?? {}) as Record<string, unknown>;
}

function getLogPayload(payload: unknown): LogPayload {
  const record = getPayloadRecord(payload);
  return (record.event ?? record) as LogPayload;
}

function getResultPayload(payload: unknown): WorkflowResultPayload {
  const record = getPayloadRecord(payload);
  return (record.result ?? record) as WorkflowResultPayload;
}

function EventHeader({ event }: StreamEventCardProps) {
  const payload = event.payload;
  const logEvent = getLogPayload(payload);
  const resultPayload = getResultPayload(payload);

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

  if (event.type === "message") {
    const record = getPayloadRecord(payload);
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="outline">AI</Badge>
        <span className="font-medium text-foreground">
          {String(record.text ?? "Message")}
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
}

function EventDetails({ event }: StreamEventCardProps) {
  const payload = event.payload;
  const record = getPayloadRecord(payload);

  switch (event.type) {
    case "log": {
      const logEvent = getLogPayload(payload);
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
      const result = getResultPayload(payload);
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
          {String(record.text ?? "")}
        </div>
      );
    }
    case "tool_calls": {
      const calls = (record.calls ?? []) as Array<Record<string, unknown>>;
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
      const results = (record.results ?? []) as Array<Record<string, unknown>>;
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
    case "start":
      return <div className="text-xs text-muted-foreground">Run initialized.</div>;
    case "final":
      return <div className="text-xs text-muted-foreground">Stream completed.</div>;
    default:
      return (
        <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
          {JSON.stringify(record, null, 2)}
        </pre>
      );
  }
}

export function StreamEventCard({ event }: StreamEventCardProps) {
  return (
    <details className="rounded-lg border border-border/60 bg-background/70 p-4 open:bg-background/90">
      <summary className="flex cursor-pointer items-center justify-between gap-4">
        <EventHeader event={event} />
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
        <EventDetails event={event} />
      </div>
    </details>
  );
}
