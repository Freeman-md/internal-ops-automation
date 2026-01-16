import { SESSION_PATH } from "@/config/app.config";
import { HEADED, WORKFLOW_RETRIES } from "@/config/runtime.config";
import { executeWorkflow } from "@/infra/execute-workflow";
import { startTicketWorkflow } from "@/app/workflows/tickets/start";
import { TICKET_STATES } from "@/domain/tickets/states";

async function run() {
  const result = await executeWorkflow(
    {
      name: "tickets-start",
      requiresAuth: true,
      run: async ({ page }) =>
        startTicketWorkflow(page, {
          selector: {
            state: TICKET_STATES.OPEN,
            limit: 10,
          },
          expectedState: TICKET_STATES.OPEN,
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