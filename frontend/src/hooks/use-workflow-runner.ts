import { useState } from "react";
import type { WorkflowDefinition } from "../data/workflows";

export function useWorkflowRunner(apiBase: string) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowResult, setWorkflowResult] = useState<string>("");

  async function runWorkflow(workflow: WorkflowDefinition) {
    setActiveWorkflow(workflow.title);
    setWorkflowResult("");
    try {
      const response = await fetch(`${apiBase}${workflow.endpoint}`, {
        method: workflow.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(workflow.payload ?? {}),
      });
      const data = await response.json();
      setWorkflowResult(JSON.stringify(data, null, 2));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setWorkflowResult(
        JSON.stringify({ success: false, error: message }, null, 2)
      );
    } finally {
      setActiveWorkflow(null);
    }
  }

  return { activeWorkflow, workflowResult, runWorkflow };
}
