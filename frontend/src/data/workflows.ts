export type WorkflowDefinition = {
  title: string;
  description: string;
  endpoint: string;
  workflowName: string;
  method: "POST";
  tags: string[];
  intent: string;
  payload?: Record<string, unknown>;
};

export const workflowCatalog: WorkflowDefinition[] = [
  {
    title: "Triage Process",
    description: "Process pending triage items with deterministic checks.",
    endpoint: "/api/triage/process",
    workflowName: "triage.process",
    method: "POST",
    tags: ["Triage", "Auth", "Input"],
    intent: "process triage",
    payload: {
      selector: { state: "pending", limit: 10 },
      expectedState: "pending",
    },
  },
  {
    title: "Triage Inspect",
    description: "Verify queue counts and surface state summaries.",
    endpoint: "/api/triage/inspect",
    workflowName: "triage.inspect",
    method: "POST",
    tags: ["Triage", "Auth"],
    intent: "inspect triage queue",
    payload: {},
  },
  {
    title: "Tickets Start",
    description: "Start open tickets and confirm state transitions.",
    endpoint: "/api/tickets/start",
    workflowName: "tickets.start",
    method: "POST",
    tags: ["Tickets", "Auth", "Input"],
    intent: "start tickets",
    payload: {
      selector: { state: "open", limit: 10 },
      expectedState: "open",
    },
  },
  {
    title: "Tickets Resolve",
    description: "Resolve in-progress tickets and verify summaries.",
    endpoint: "/api/tickets/resolve",
    workflowName: "tickets.resolve",
    method: "POST",
    tags: ["Tickets", "Auth", "Input"],
    intent: "resolve tickets",
    payload: {
      selector: { state: "in_progress", limit: 10 },
      expectedState: "in_progress",
    },
  },
  {
    title: "Tickets Inspect",
    description: "Check ticket state integrity without changes.",
    endpoint: "/api/tickets/inspect",
    workflowName: "tickets.inspect",
    method: "POST",
    tags: ["Tickets", "Auth"],
    intent: "inspect tickets",
    payload: {},
  },
  {
    title: "Status Session",
    description: "Verify session health and authenticated user info.",
    endpoint: "/api/status/session",
    workflowName: "status.session",
    method: "POST",
    tags: ["Status", "Auth"],
    intent: "check session",
    payload: {},
  },
  {
    title: "Status Auth Action",
    description: "Run an authenticated action and verify it changed.",
    endpoint: "/api/status/auth-action",
    workflowName: "status.authAction",
    method: "POST",
    tags: ["Status", "Auth"],
    intent: "inspect authenticated action",
    payload: {},
  },
  {
    title: "Authenticate",
    description: "Create or refresh a session state file.",
    endpoint: "/api/auth/authenticate",
    workflowName: "auth.authenticate",
    method: "POST",
    tags: ["Auth"],
    intent: "authenticate",
    payload: {},
  },
];
