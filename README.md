# Internal Ops Automation

Playwright-driven automation for internal triage workflows with a clean separation
between domain rules, adapters, workflows, infrastructure, and runners.

## Install

```bash
npm install
```

## Authenticate

```bash
npx tsx src/runners/authenticate.ts
```

## Run the Triage Workflow

```bash
npx tsx src/runners/triage-workflow.ts
```

## Environment Variables

- `HEADED` (`true`/`1`) to run headed for debugging
- `WORKFLOW_RETRIES` (number, default `1`)
- `SLOWMO` or `PLAYWRIGHT_SLOWMO` (milliseconds, default `0`)

## Architecture (High-Level)

- `src/config`: environment and app deployment config
- `src/contracts`: shared type contracts
- `src/domain`: pure business rules and domain errors (no Playwright)
- `src/adapters`: Playwright-facing selectors, actions, assertions, verifications
- `src/app`: workflow orchestration
- `src/infra`: browser/auth/logging/session/executor infrastructure
- `src/runners`: CLI entry points
- `src/human`: manual interaction gates
