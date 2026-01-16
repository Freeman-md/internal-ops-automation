import { runGroup } from "./_run-group";
import "./triage-inspect";
import "./triage-process";

async function run() {
  await runGroup("triage.all", [
    async () => { await import("./triage-inspect"); },
    async () => { await import("./triage-process"); },
  ]);
}

run();