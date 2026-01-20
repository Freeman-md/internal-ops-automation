import { Page } from "playwright";
import { LOG_MESSAGES, LOG_SCOPE } from "@/infra/logging/log.constants";
import { log } from "@/infra/logging/logger";

export async function waitForHumanLogin(
    page: Page,
    successUrlPattern: RegExp,
    timeoutMs = 5 * 60 * 1000
) {
    log(LOG_SCOPE.FLOW, LOG_MESSAGES.FLOW.AWAITING_MANUAL_LOGIN)

    await page.waitForURL(successUrlPattern, {
        timeout: timeoutMs
    })
}
