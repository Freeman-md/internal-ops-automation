type ExecuteWorkflowOptions<T> = {
  name: string;
  execute: () => Promise<T>;
};

export async function executeWorkflow<T>({
  name,
  execute,
}: ExecuteWorkflowOptions<T>): Promise<T> {
  const startedAt = Date.now();

  try {
    const result = await execute();
    const durationMs = Date.now() - startedAt;

    console.log(`[RUNNER] ${name} completed`, { durationMs });
    process.exitCode = 0;

    return result;
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error(`[RUNNER] ${name} failed`, { durationMs, error: message });
    process.exitCode = 1;

    throw error;
  }
}
