import { Page } from "playwright";
import { LOG_MESSAGES, LOG_SCOPE } from "../config/logging";
import { log } from "../core/logger";

export async function waitForHumanLogin(
    page: Page,
    successUrlPattern: RegExp,
    timeoutMs = 5 * 60 * 1000
) {
    log(LOG_SCOPE.HUMAN, LOG_MESSAGES.HUMAN.AWAITING_LOGIN)

    await page.waitForURL(successUrlPattern, {
        timeout: timeoutMs
    })

    log(LOG_SCOPE.HUMAN, LOG_MESSAGES.HUMAN.LOGIN_DETECTED)
}