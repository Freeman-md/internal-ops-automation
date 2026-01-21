import { useMemo } from "react";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Loader2,
  ScrollText,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { StreamEventCard } from "./run-session/stream-event-card";
import { useRunStream } from "./run-session/use-run-stream";
import type { RunState } from "./run-session/types";

export function RunSession() {
  const apiBase = import.meta.env.VITE_API_BASE ?? "http://0.0.0.0:3000";
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as RunState | null;
  const { status, events, resultSummary, cancel } = useRunStream(apiBase, state);

  const heading = useMemo(() => {
    if (!state) return "No run selected";
    if (state.mode === "ai") return "AI Intent Session";
    return `Workflow: ${state.name}`;
  }, [state]);


  return (
    <div className="min-h-screen bg-[radial-gradient(70%_90%_at_0%_0%,rgba(205,220,255,0.4)_0%,rgba(205,220,255,0)_70%),radial-gradient(60%_80%_at_100%_0%,rgba(255,223,197,0.35)_0%,rgba(255,223,197,0)_70%),linear-gradient(180deg,#f7f7fb_0%,#f3f2f7_55%,#efedf2_100%)] text-foreground">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 pb-20 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                cancel();
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
                  <StreamEventCard key={event.id} event={event} />
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
