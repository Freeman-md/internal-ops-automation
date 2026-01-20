# Internal Ops Automation

Playwright-driven automation for internal triage workflows with a clean separation
between domain rules, adapters, workflows, infrastructure, and runners.

## Repo Layout

```
backend/   # automation codebase (current)
frontend/  # UI (future)
```

## Install

```bash
cd backend
npm install
```

## Authenticate

```bash
npx tsx src/runners/authenticate.ts
```

## Run the Triage Workflow

```bash
npx tsx src/runners/triage-process.ts
```

## Environment Variables

- `HEADED` (`true`/`1`) to run headed for debugging
- `WORKFLOW_RETRIES` (number, default `1`)
- `SLOWMO` or `PLAYWRIGHT_SLOWMO` (milliseconds, default `0`)

## Architecture (High-Level)

- `backend/src/config`: environment and app deployment config
- `backend/src/contracts`: shared type contracts
- `backend/src/domain`: pure business rules and domain errors (no Playwright)
- `backend/src/adapters`: Playwright-facing selectors, actions, assertions, verifications
- `backend/src/app`: workflow orchestration
- `backend/src/infra`: browser/auth/logging/session/executor infrastructure
- `backend/src/runners`: CLI entry points
- `backend/src/human`: manual interaction gates
