import { BrowserContext } from "playwright";
import { log } from "@/core/logger";
import { LOG_MESSAGES, LOG_SCOPE } from "@/config/logging";

export async function saveSession(
    context: BrowserContext,
    path: string
) {
    log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.SAVING, { path })

    await context.storageState({ path })

    log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.SAVED)
}
