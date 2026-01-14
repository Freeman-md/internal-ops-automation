import { BrowserContext, Page } from "playwright";
import { log } from "../../core/logger";
import { LOG_MESSAGES, LOG_SCOPE } from "../../config/logging";
import { ensureAuthenticated } from "./ensure-authenticated";
import { waitForHumanLogin } from "../../human/gates";
import { ROUTES, SESSION_PATH } from "../../config/app";
import { saveSession } from "../../core/session";


export async function manualAuthentication(
    page: Page,
    context: BrowserContext
) {
    await ensureAuthenticated(page)

    const currentUrl = page.url()

    if (currentUrl.includes(ROUTES.login)) {
        await waitForHumanLogin(page, /\/dashboard$/);

        await saveSession(context, SESSION_PATH);
    }

    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.SUCCESS);
}
