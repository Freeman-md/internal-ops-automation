# Future Improvements

## Input Validation for Streamed Workflows

Diagnosis:
`POST /api/workflows/run` allows empty `input` objects. This can trigger
workflow execution and then fail inside the workflow when required fields
are missing (e.g. `selector.state`).

Suggested improvement:
- Validate required fields at the controller boundary before execution.
- Apply the same validation rules used by workflow inputs (e.g. `selector.state`, `expectedState`).

---

## Auth Guard – Correct Execution Model (Final)

Case 1: Session is valid (no human needed)
1. Start headless browser
2. Load session state
3. Run deterministic authenticated action (proof, not UI check)
4. If action succeeds → continue workflow in same browser

Result:
1 browser (headless)

---

Case 2: Session exists but is invalid / expired
1. Start headless browser
2. Load session state
3. Run deterministic authenticated action
4. Action fails → close browser
5. Start headed browser
6. User logs in manually
7. Save session state → close browser
8. Start new headless browser
9. Load fresh session
10. Continue workflow

Result:
3 browsers (headless → headed → headless)

---

Rule (non-negotiable)
- File existence ≠ valid session
- Only a protected action can prove auth
- Headless mode is decided after verification, not before

---

Why this is correct
- No false positives
- No invisible human waits
- Deterministic behavior
- Safe for production + CI

---

## AI Intent – Human-in-the-Loop Conversation

Diagnosis:
The current AI intent flow is a one-shot request: the model selects tools
and executes immediately. There is no conversational context, approval step,
or guided decision layer.

Suggested improvement:
- Provide a stateful chat experience with memory of user intent.
- Have the AI suggest workflows and await explicit user approval.
- Run workflows only after approval and return results in the same chat thread.
- Store logs for auditing; show a human-friendly summary in chat and a full
  log view for reference.
- Support scheduled runs or manual triggers to reinforce the “human in the loop”
  model.
