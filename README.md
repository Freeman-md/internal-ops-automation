# Internal Ops Automation System

> Playwright-driven internal operations automation with a layered architecture separating domain rules, adapters, workflow orchestration, and infrastructure — exposed via a REST API, a streaming workflow runner, an AI intent router, and a React control panel.

## Project Metadata
- Type: system
- Domain: Internal Operations Automation / Browser Automation
- Status: Active
- Level: Advanced
- Year: 2025
- Featured: true
- Repository URL: Not public
- Live URL: Not deployed
- Thumbnail URL:

## Summary

This system automates browser-based internal operations against a hosted internal ops application (`internal-ops.lovable.app`). It handles triage queue processing, ticket lifecycle management, and session health verification through Playwright-driven workflows. All workflows are deterministic: they assert preconditions, execute actions, and verify outcomes before returning a typed result envelope. The system exposes these workflows via an Express REST API with streaming responses, and provides an AI intent layer backed by OpenAI that routes natural language prompts to the appropriate workflow tool. A React/Vite frontend serves as a control panel for triggering workflows directly or via AI intent.

## Tech Stack

**Backend automation:** Node.js, TypeScript, Playwright 1.57, tsx  
**API server:** Express 4, cors  
**AI layer:** Vercel AI SDK (`ai`, `@ai-sdk/openai`), OpenAI (`gpt-4o-mini` default)  
**Testing:** Vitest 4, `@vitest/browser-playwright`, `@vitest/coverage-v8`  
**Frontend:** React 19, Vite 7, Tailwind CSS 4, shadcn/ui components, React Router 7, lucide-react  
**CI:** GitHub Actions with Playwright test runner

## System Context

Internal operations tooling typically requires human operators to manually process triage queues, progress ticket state machines, and verify session health on a recurring basis. This system replaces that manual loop with a headless automation layer that can be triggered on demand via CLI runners, REST endpoints, streaming API calls, or natural language prompts. A human-in-the-loop gate is retained for authentication: when no valid session exists, the system opens a headed browser and waits for a human login before persisting the session and continuing headlessly.

## System Snapshot

### Core System Idea

A cleanly layered Playwright automation backend that enforces domain rules (state machines, transition guards, typed errors) through a structured adapter pattern, exposed via a streaming REST API with an optional AI routing layer and a React frontend dashboard.

### Main Components

1. **Domain layer** (`src/domain`): Pure TypeScript. Defines state constants (`TICKET_STATES`, `TRIAGE_STATES`), transition rules (`TICKET_TRANSITIONS`, `TRIAGE_ACTIONS_BY_STATE`), and guard functions that throw typed `AssertionError` on invalid transitions. No Playwright dependency.

2. **Adapter layer** (`src/adapters`): Playwright-facing code organized by domain (triage, tickets, status). Each domain has selectors (read UI state), actions (click/interact), assertions (precondition checks), filters (subset selection), and verifications (postcondition checks). Throws `ActionError`, `AssertionError`, or `VerificationError`.

3. **App/workflow layer** (`src/app/workflows`): Orchestrates adapters into end-to-end workflows. Each workflow navigates to a URL, reads state, asserts readiness, executes actions, and verifies outcomes. Returns a typed `WorkflowResult` with `SUCCESS`, `FAILED`, or `SKIPPED` status plus artifact data.

4. **Infrastructure layer** (`src/infra`): Browser lifecycle (`createPage`, `chromium`), session persistence (`saveSession`, `storageState`), authentication flow (`authenticate` with human-in-the-loop gate), workflow execution wrapper (`executeWorkflow` with retry logic and error normalization), and a pluggable logging system with sink registration.

5. **API server** (`src/server`): Express app with route/controller/service separation. Routes map to workflow services. Two streaming endpoints — `/api/workflows/run` and `/api/ai/intent` — use Vercel AI SDK's `pipeDataStreamToResponse` to stream log events and results as SSE. Non-streaming endpoints return the `WorkflowExecutionResult` envelope directly.

6. **AI layer** (`src/ai`): Converts registered workflow functions into AI SDK tools with JSON Schema parameter validation. An intent routing function maps a natural language prompt to `generateText` with `toolChoice: auto`. Falls back to keyword-based inference when the model does not select a tool. Tool IDs are dot-namespaced (`triage.process`, `tickets.inspect`) and converted to underscore form for the AI SDK.

## Design Focus

- **Typed error taxonomy**: `ActionError`, `AssertionError`, and `VerificationError` carry a `type` discriminant and `meta` payload. The `executeWorkflow` runner normalizes all thrown errors into this taxonomy before returning, so callers always receive a structured failure regardless of where in the stack the error occurred.
- **State machine enforcement**: Ticket and triage transitions are codified as immutable records. Guard functions reject invalid transitions before any browser interaction is attempted, preventing partial state corruption.
- **Verify-before and verify-after**: Workflows read and assert state before acting, then re-collect and verify state after acting. UI summary counts are also cross-checked against computed item counts to catch rendering divergence.
- **Browser lifecycle isolation**: Each workflow execution spawns and closes its own browser instance. Session state is loaded from disk if available. This prevents cross-run contamination and makes retries safe.
- **Streaming-first API**: Both the workflow runner and AI intent endpoints stream structured JSON events (`start`, `log`, `result`, `final`) using SSE. The frontend consumes this stream event-by-event without polling.

## Architectural Innovation

The adapter pattern separates Playwright locator logic from both domain rules and workflow orchestration. This means domain guards can be unit-tested in isolation without a browser, adapter selectors can be tested with mock page objects, and workflows can be composed from independently tested pieces. The AI tool layer reuses the same service functions as the REST API, so there is no duplicated execution path between direct API calls and AI-routed calls.

## Implementation Model

**Workflow execution path (REST):**  
`POST /api/workflows/run` → `runWorkflowStream` controller → `pipeDataStreamToResponse` → registers log sink → calls `runWorkflow(name, input)` → service calls `executeWorkflow(workflow, options)` → spins up browser, optionally authenticates, runs workflow function, normalizes result → log events streamed in real time → `result` and `final` events close the stream.

**Workflow execution path (CLI):**  
`npx tsx src/runners/<name>.ts` → calls `executeWorkflow` directly with `HEADED` and `WORKFLOW_RETRIES` from env → logs to stdout → sets `process.exitCode = 1` on failure.

**AI intent path:**  
`POST /api/ai/intent` → `aiIntent` controller → `runAIIntent(prompt)` → `generateText` with all workflow tools → model selects tool → tool `execute` calls service function → result returned in stream alongside tool call metadata.

**Authentication model:**  
On each `executeWorkflow` call with `requiresAuth: true`, `authenticate` navigates to the dashboard. If the heading indicates the user is logged in, it proceeds immediately. If not, it navigates to `/login`, detects the login heading, and calls `waitForHumanLogin` which blocks on `page.waitForURL` until the dashboard URL pattern is matched. Session state is then persisted to `storage/sessions/internal-ops.json` and reloaded on subsequent runs.

**Test structure:**  
Unit tests cover domain guards, state constants, and filter functions. Integration tests cover individual adapter functions (selectors, actions, assertions, verifications) using Vitest with mock page objects. Playwright tests in `tests/example.spec.ts` target the Playwright docs site and serve as a baseline runner check.

## Performance / Operational Profile

### Latency Profile
- Title: Browser-bound, not network-bound
- Description: Workflow execution time is dominated by Playwright navigation, `waitForLoadState("networkidle")`, and element interaction waits (up to 5s per item action). A triage process run over 10 items will typically take 30–90 seconds end-to-end depending on the target application's response time. The API server itself adds negligible overhead; streaming begins within milliseconds of workflow start.

### System Focus
- Title: Correctness over throughput
- Description: The system is designed for reliable, verifiable single-pass execution rather than high-concurrency throughput. One browser instance per workflow invocation, sequential item processing within each workflow, and explicit before/after state verification all prioritize correctness. Concurrent multi-workflow execution is not currently modeled.

## Outcomes

The system produces verifiable, artifact-carrying results for each workflow run. A successful triage process run returns the IDs of matched, acted-on, and final-state items. A session health check returns the user ID and email. A ticket inspect run returns buckets of IDs per state. All outcomes are serializable and streamable, making them consumable by the React frontend, CI pipelines, or downstream integrations.

## Why This Matters

Playwright is typically used for testing. This system demonstrates using it as an operations automation runtime with production-grade reliability patterns: typed contracts, state machine enforcement, layered error handling, session management, retry logic, and a human-in-the-loop escape hatch. The same architectural patterns apply to any scenario requiring reliable, verifiable browser-based automation against web applications that do not expose a direct API.

## Future Improvements

From `docs/future-improvements.md`:

**Input validation for streamed workflows:** The `/api/workflows/run` endpoint does not validate `input` structure before execution, so missing `selector.state` causes a mid-workflow failure rather than a clean 400 at the controller boundary.

**Auth guard execution model:** The current model opens a headed browser and waits for human login even when the session file exists but has expired. The documented target model uses a deterministic authenticated action to prove session validity before deciding whether human intervention is needed, reducing unnecessary headed browser launches.

**AI intent — human-in-the-loop conversation:** The current AI intent flow is one-shot (prompt → tool selection → immediate execution). The planned improvement adds a stateful chat layer where the AI proposes a workflow, waits for explicit user approval, then executes — with full conversation history and audit logging.
