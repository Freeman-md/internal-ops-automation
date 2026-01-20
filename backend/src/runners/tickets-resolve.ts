import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { executeWorkflow } from "@/infra/execute-workflow";
import { resolveTicketWorkflow } from "@/app/workflows/tickets/resolve";
import { TICKET_STATES } from "@/domain/tickets/states";

async function run() {
  const result = await executeWorkflow(
    {
      name: "tickets-resolve",
      requiresAuth: true,
      run: async ({ page }) =>
        resolveTicketWorkflow(page, {
          selector: {
            state: TICKET_STATES.IN_PROGRESS,
            limit: 10,
          },
          expectedState: TICKET_STATES.IN_PROGRESS,
        }),
    },
    {
      headed: HEADED,
      retries: WORKFLOW_RETRIES,
      storagePath: SESSION_PATH,
    }
  );

  console.log(result);

  if (!result.success) {
    process.exitCode = 1;
  }
}

run();