import { ROUTES, APP_URL, AUTH_INDICATORS } from './../../config/app';
import { Page } from "playwright";
import { log } from "../../core/logger";
import { LOG_MESSAGES, LOG_SCOPE } from "../../config/logging";
import { SessionExpiredError } from '../../core/errors';

export async function ensureAuthenticated(page: Page) {
    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.CHECKING_STATE)

    await page.goto(`${APP_URL}${ROUTES.dashboard}`, {
        waitUntil: "domcontentloaded"
    });

    const isAuthenticated = await Promise.race([
        page
            .getByRole("heading", { name: AUTH_INDICATORS.loggedInHeading })
            .waitFor({ state: "visible", timeout: 5000 })
            .then(() => true)
            .catch(() => false),

        page
            .getByRole("heading", { name: AUTH_INDICATORS.loginHeading })
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => false)
            .catch(() => false)
    ]);

    if (isAuthenticated) {
        log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.SESSION_VALID)
        return;
    }

    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.UNAUTHENTICATED_DETECTED);
    await redirectToLogin(page);
}

async function redirectToLogin(page: Page) {
    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.LOGIN_REDIRECT)

    await page.goto(`${APP_URL}${ROUTES.login}`, {
        waitUntil: "domcontentloaded",
    });

    const loginVisible = await page
        .getByRole("heading", { name: AUTH_INDICATORS.loginHeading })
        .isVisible()
        .catch(() => false)

    if (!loginVisible) {
        throw new SessionExpiredError();
    }

    log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.LOGIN_READY);
}