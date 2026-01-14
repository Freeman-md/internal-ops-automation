import fs from "fs";
import { createPage } from "../../core/browser";
import { manualAuthentication } from "./manual-auth";
import { ensureAuthenticated } from "./ensure-authenticated";
import { SESSION_PATH } from "../../config/app";
import { log } from "../../core/logger";
import { LOG_SCOPE, LOG_MESSAGES } from "../../config/logging";

export async function runWithAuthGuard(
    next: (page: any) => Promise<void>
) {
    const hasSession = fs.existsSync(SESSION_PATH)

    const { browser, context, page } = await createPage({
        headless: hasSession,
        storageState: hasSession ? SESSION_PATH : undefined
    })

    try {
        try {
            await ensureAuthenticated(page);
        } catch {
            log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.MISSING);

            await manualAuthentication(page, context);
        }

        // Resume normal workflow
        await next(page);
    } finally {
        await browser.close();
    }


}