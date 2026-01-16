export async function runGroup(
  name: string,
  runners: (() => Promise<void>)[]
) {
  console.log(`\n[GROUP] Starting ${name}\n`);

  for (const run of runners) {
    try {
      await run();
    } catch (err) {
      console.error(`[GROUP] Runner failed`, err);
    }
  }

  console.log(`\n[GROUP] Finished ${name}\n`);
}