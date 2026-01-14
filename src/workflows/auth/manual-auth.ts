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
    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.LOGIN_REQUIRED)

    await ensureAuthenticated(page)

    const currentUrl = page.url()

    if (currentUrl.includes(ROUTES.login)) {
        log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.LOGIN_REQUIRED)

        await waitForHumanLogin(page, /\/dashboard$/);

        await saveSession(context, SESSION_PATH);
    } else {
        log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.EXISTING_SESSION)
    }

    log("AUTH", LOG_MESSAGES.AUTH.AUTH_COMPLETE);
}