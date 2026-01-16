import fs from "fs";
import { BrowserContext, Page } from "playwright";
import { createPage } from "@/core/browser";
import { authenticate } from "@/workflows/authenticate";
import { ActionError, AssertionError, VerificationError } from "@/core/errors";

export type WorkflowExecution<T> = {
  name: string;
  requiresAuth?: boolean;
  run: (ctx: { page: Page; context: BrowserContext }) => Promise<T>;
};

export type WorkflowError = {
  type: "ASSERTION" | "ACTION" | "VERIFICATION" | "UNKNOWN";
  message: string;
  meta?: unknown;
};

export type WorkflowExecutionResult<T> =
  | {
      success: true;
      data: T;
      durationMs: number;
    }
  | {
      success: false;
      error: WorkflowError;
      durationMs: number;
    };

type WorkflowExecutionOptions = {
  headed?: boolean;
  retries?: number;
  storagePath?: string;
};

function normalizeError(
  error: unknown
): WorkflowError {
  const message = error instanceof Error ? error.message : "Unknown error";

  if (error instanceof AssertionError) {
    return { type: "ASSERTION", message, meta: error.meta };
  }

  if (error instanceof ActionError) {
    return { type: "ACTION", message, meta: error.meta };
  }

  if (error instanceof VerificationError) {
    return { type: "VERIFICATION", message, meta: error.meta };
  }

  return { type: "UNKNOWN", message };
}

export async function executeWorkflow<T>(
  workflow: WorkflowExecution<T>,
  options: WorkflowExecutionOptions = {}
): Promise<WorkflowExecutionResult<T>> {
  const startedAt = Date.now();
  const retries = typeof options.retries === "number" ? options.retries : 1;
  const maxAttempts =
    Number.isFinite(retries) && retries > 0 ? Math.floor(retries) : 1;
  const slowMoEnv = Number(process.env.PLAYWRIGHT_SLOWMO ?? process.env.SLOWMO ?? "0");
  const slowMo = Number.isFinite(slowMoEnv) && slowMoEnv > 0 ? slowMoEnv : undefined;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let browser: { close: () => Promise<void> } | undefined;

    try {
      const storageState =
        options.storagePath && fs.existsSync(options.storagePath)
          ? options.storagePath
          : undefined;

      const { browser: createdBrowser, context, page } = await createPage({
        headless: !options.headed,
        slowMo,
        storageState,
      });

      browser = createdBrowser;

      if (workflow.requiresAuth) {
        await authenticate(page, context);
      }

      const data = await workflow.run({ page, context });
      const durationMs = Date.now() - startedAt;

      console.log(`[EXECUTOR] ${workflow.name} succeeded`);

      return { success: true, data, durationMs };
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "Unknown error";

      console.error(
        `[EXECUTOR] ${workflow.name} failed (attempt ${attempt}/${maxAttempts}): ${message}`
      );
    } finally {
      if (browser) {
        try {
          await browser.close();
        } catch {
        }
      }
    }
  }

  const durationMs = Date.now() - startedAt;

  return {
    success: false,
    error: normalizeError(lastError),
    durationMs,
  };
}
