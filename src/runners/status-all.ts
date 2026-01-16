import { runGroup } from "./_run-group";

async function run() {
  await runGroup("status.all", [
    async () => { await import("./status-session") },
    async () => { await import("./status-auth-action") },
  ]);
}

run();