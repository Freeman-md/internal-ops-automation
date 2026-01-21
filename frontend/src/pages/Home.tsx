import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  Gauge,
  Play,
  ScrollText,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { WorkflowCard } from "../components/workflow-card";
import { workflowCatalog } from "../data/workflows";

export function Home() {
  const navigate = useNavigate();
  const [intentPrompt, setIntentPrompt] = useState("");

  function handleRunWorkflow(workflowName: string, input?: Record<string, unknown>) {
    navigate("/run", {
      state: {
        mode: "workflow",
        name: workflowName,
        input,
      },
    });
  }

  function handleRunIntent() {
    const prompt = intentPrompt.trim();
    if (!prompt) return;
    navigate("/run", { state: { mode: "ai", prompt } });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(60%_80%_at_0%_0%,rgba(245,221,179,0.35)_0%,rgba(245,221,179,0)_70%),radial-gradient(60%_80%_at_100%_0%,rgba(198,236,225,0.3)_0%,rgba(198,236,225,0)_70%),linear-gradient(180deg,#fefbf6_0%,#f8f4ee_55%,#f4f0ea_100%)] text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-28 pt-10">
        <header className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border/70 bg-card/80 p-3 shadow-lg shadow-black/5">
                <Workflow className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Internal Ops Automation
                </p>
                <h1 className="text-3xl font-semibold text-foreground">
                  Workflow Control Center
                </h1>
              </div>
            </div>
            <Button variant="outline" className="gap-2">
              <Gauge className="h-4 w-4" />
              Health Check
            </Button>
          </div>

          <div className="grid gap-4 rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm md:grid-cols-[2fr_1fr]">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Choose a deterministic workflow or ask the AI router to pick one
                based on intent. Results stream to a dedicated run view later.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="accent">Deterministic</Badge>
                <Badge variant="outline">Human in the loop</Badge>
                <Badge variant="outline">AI intent routing</Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/60 p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4" />
                Session Required
              </div>
              <p>
                Most workflows require authentication. Use the Authenticate
                workflow before running protected operations.
              </p>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Workflows</h2>
              <p className="text-sm text-muted-foreground">
                Trigger endpoints directly or let AI select the right one.
              </p>
            </div>
            <Button className="gap-2" onClick={() => handleRunWorkflow("triage.inspect")}>
              <Play className="h-4 w-4" />
              Quick Inspect
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {workflowCatalog.map((workflow) => (
              <WorkflowCard
                key={workflow.title}
                {...workflow}
                onRun={() => handleRunWorkflow(workflow.workflowName, workflow.payload)}
              />
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border/60 bg-card/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5" />
                AI Intent Router
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe what you want to run, e.g. 'inspect triage queue' or 'resolve tickets'"
                className="min-h-[120px]"
                value={intentPrompt}
                onChange={(event) => setIntentPrompt(event.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  The AI will map your intent to a workflow and run it
                  immediately.
                </div>
                <Button className="gap-2" onClick={handleRunIntent}>
                  <Bot className="h-4 w-4" />
                  Run Intent
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-background/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ScrollText className="h-5 w-5" />
                Run Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Runs stream in a dedicated view with a back button for quick
                navigation.
              </p>
              <Separator />
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
                  Latest Activity
                </div>
                <div className="rounded-lg border border-dashed border-border/60 bg-card/60 p-4 text-xs">
                  Trigger a workflow or send an AI intent to open the run view.
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
