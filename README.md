# Internal Ops Automation

Playwright-driven automation for internal triage workflows with a clean separation
between domain rules, adapters, workflows, infrastructure, and runners.

## Repo Layout

```
backend/   # automation + API server
frontend/  # React UI (Vite + Tailwind + shadcn/ui)
```

## Install (Backend)

```bash
cd backend
npm install
```

## Install (Frontend)

```bash
cd frontend
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

## Run the API Server

```bash
npm run api:dev
```

## Run the Frontend

```bash
npm run dev
```

## Environment Variables

- `HEADED` (`true`/`1`) to run headed for debugging
- `WORKFLOW_RETRIES` (number, default `1`)
- `SLOWMO` or `PLAYWRIGHT_SLOWMO` (milliseconds, default `0`)

## UI Stack

- React + Vite
- Tailwind CSS
- shadcn/ui components
- shadcn AI components: `https://www.shadcn.io/ai`

## Architecture (High-Level)

- `backend/src/config`: environment and app deployment config
- `backend/src/contracts`: shared type contracts
- `backend/src/domain`: pure business rules and domain errors (no Playwright)
- `backend/src/adapters`: Playwright-facing selectors, actions, assertions, verifications
- `backend/src/app`: workflow orchestration
- `backend/src/infra`: browser/auth/logging/session/executor infrastructure
- `backend/src/runners`: CLI entry points
- `backend/src/human`: manual interaction gates
