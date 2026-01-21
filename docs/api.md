# API Contract

Base URL: `http://0.0.0.0:3000/api`

All non-streaming responses return a `WorkflowExecutionResult<T>` envelope:

```json
{
  "success": true,
  "data": {},
  "durationMs": 1234
}
```

```json
{
  "success": false,
  "error": {
    "type": "ASSERTION | ACTION | VERIFICATION | UNKNOWN",
    "message": "string",
    "meta": {}
  },
  "durationMs": 1234
}
```

## Health

`GET /health`

Response:
```json
{ "ok": true }
```

## Triage

`POST /triage/process`

Request body:
```json
{
  "selector": {
    "state": "pending",
    "limit": 10
  },
  "expectedState": "pending"
}
```

`POST /triage/inspect`

Request body: `{}` (no input)

## Tickets

`POST /tickets/start`

Request body:
```json
{
  "selector": {
    "state": "open",
    "limit": 10
  },
  "expectedState": "open"
}
```

`POST /tickets/resolve`

Request body:
```json
{
  "selector": {
    "state": "in_progress",
    "limit": 10
  },
  "expectedState": "in_progress"
}
```

`POST /tickets/inspect`

Request body: `{}` (no input)

`POST /tickets/all`

Request body: `{}` (no input)

## Status

`POST /status/session`

Request body: `{}` (no input)

`POST /status/auth-action`

Request body: `{}` (no input)

`POST /status/all`

Request body: `{}` (no input)

## Auth

`POST /auth/authenticate`

Request body: `{}` (no input)

## AI (stream)

`POST /ai/intent`

Request body:
```json
{
  "prompt": "inspect triage queue"
}
```

Streaming response uses `text/event-stream` with `writeData(...)` parts:

```json
{ "type": "start" }
```

```json
{ "type": "message", "text": "..." }
```

```json
{ "type": "tool_calls", "calls": [{ "name": "...", "args": {} }] }
```

```json
{ "type": "tool_results", "results": [{ "name": "...", "result": {} }] }
```

```json
{ "type": "final", "matched": true }
```

## Workflows (stream)

`POST /workflows/run`

Request body:
```json
{
  "name": "triage.process",
  "input": {
    "selector": {
      "state": "pending",
      "limit": 10
    },
    "expectedState": "pending"
  }
}
```

Streaming response parts:
```json
{ "type": "start", "name": "triage.process" }
```

```json
{ "type": "log", "event": { "scope": "...", "level": "...", "message": "...", "meta": {}, "timeStamp": 0 } }
```

```json
{ "type": "result", "result": { "success": true, "data": {}, "durationMs": 1234 } }
```

```json
{ "type": "final" }
```
