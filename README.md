# Project Directory Structure

```text
.
├── src/
│   ├── core/
│   │   ├── browser.ts          # Playwright lifecycle: browser, context, page
│   │   ├── session.ts          # storageState, session validation helpers
│   │   ├── logger.ts           # structured, consistent logs
│   │   ├── errors.ts           # AuthError, SessionExpiredError, etc.
│   │   └── types.ts            # shared Result, WorkflowState, Context types
│   │
│   ├── config/
│   │   ├── app.ts              # APP_URL, routes, selectors
│   │   ├── env.ts              # env loading / defaults
│   │   └── timeouts.ts         # standard timeouts & retries
│   │
│   ├── workflows/
│   │   ├── auth/
│   │   │   ├── authenticate.ts  # login, signup, logout
│   │   │   ├── ensureSession.ts # detect auth → pause → resume
│   │   │   └── index.ts
│   │   │
│   │   ├── ops/
│   │   │   ├── triage.ts        # queue handling, deterministic rules
│   │   │   ├── tickets.ts       # read, reply, close, escalate
│   │   │   ├── verify.ts        # state verification & audit checks
│   │   │   └── index.ts
│   │   │
│   │   └── README.md            # workflow contracts & guarantees
│   │
│   ├── human/
│   │   ├── gates.ts            # pause/resume points
│   │   └── prompts.ts          # “please log in”, “action required”
│   │
│   ├── ai/
│   │   ├── decision.ts         # AI as decision layer (optional)
│   │   ├── classifiers.ts      # urgency, category, routing
│   │   └── adapters/
│   │       ├── openai.ts
│   │       └── anthropic.ts
│   │
│   ├── runners/
│   │   ├── cli.ts              # local execution
│   │   ├── docker.ts           # container entry
│   │   └── n8n.ts              # webhook/trigger adapter
│   │
│   └── index.ts                # main entry point
│
├── tests/
│   ├── contracts/
│   │   ├── auth.spec.ts        # guarantees, not UI tests
│   │   └── session.spec.ts
│   └── smoke/
│       └── ops.spec.ts
│
├── storage/
│   ├── sessions/
│   │   └── internal-ops.json   # persisted login state
│   └── logs/
│       └── runs/
│
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── playwright.config.ts
├── tsconfig.json
├── package.json
└── README.md