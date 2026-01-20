import { runGroup } from "./_run-group";

async function run() {
  await runGroup("tickets.all", [
    async () => { await import("./tickets-inspect") },
    async () => { await import("./tickets-start") },
    async () => { await import("./tickets-resolve") },
  ]);
}

run();