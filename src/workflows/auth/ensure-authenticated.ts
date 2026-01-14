import { SessionExpiredError } from './../../core/errors';
import { ROUTES, APP_URL, AUTH_INDICATORS } from './../../config/app';
import { Page } from "playwright";
import { log } from "../../core/logger";
import { LOG_MESSAGES, LOG_SCOPE } from "../../config/logging";

export async function ensureAuthenticated(page: Page) {
    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.CHECKING_STATE)

    await page.goto(`${APP_URL}${ROUTES.dashboard}`, {
        waitUntil: "domcontentloaded"
    });

    await page.waitForLoadState("networkidle");

    const loggedIn = await page
        .getByRole("heading", { name: AUTH_INDICATORS.loggedInHeading })
        .isVisible()
        .catch(() => false);

    const loggedOut = await page
        .getByRole("heading", { name: AUTH_INDICATORS.loginHeading })
        .isVisible()
        .catch(() => false);

    if (loggedIn && !loggedOut) {
        log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.VALID);
        return;
    }

    if (loggedOut) {
        log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.MISSING);
        throw new SessionExpiredError();
    }

    throw new SessionExpiredError();
}

async function redirectToLogin(page: Page) {
    log(LOG_SCOPE.NAV, LOG_MESSAGES.NAV.REDIRECT_LOGIN)

    if (!page.url().includes(ROUTES.login)) {
        await page.goto(`${APP_URL}${ROUTES.login}`, {
            waitUntil: "domcontentloaded",
        });
    }

    await page
        .getByRole("heading", { name: AUTH_INDICATORS.loginHeading })
        .waitFor({ timeout: 10_000 });
}
