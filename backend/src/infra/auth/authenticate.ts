import fs from "fs";
import { Page, BrowserContext } from "playwright";
import { APP_URL, ROUTES, SESSION_PATH, AUTH_INDICATORS } from "@/config/app.config";
import { log } from "@/infra/logging/logger";
import { LOG_SCOPE, LOG_MESSAGES } from "@/infra/logging/log.constants";
import { saveSession } from "@/infra/session/save-session";
import { waitForHumanLogin } from "@/human/gates";

export async function authenticate(
  page: Page,
  context: BrowserContext
): Promise<void> {
  log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.CHECKING_STATE);

  const hasSessionFile = fs.existsSync(SESSION_PATH);

  await page.goto(`${APP_URL}${ROUTES.dashboard}`, {
    waitUntil: "domcontentloaded",
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

  // Session valid
  if (loggedIn && !loggedOut) {
    log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.VALID);
    return;
  }

  // Session file exists but UI says logged out → expired
  if (hasSessionFile && loggedOut) {
    log(LOG_SCOPE.SESSION, "Session expired, re-authentication required");
  }

  // At this point, authentication is required
  log(LOG_SCOPE.SESSION, LOG_MESSAGES.SESSION.MISSING);

  // Ensure we are on login page
  if (!page.url().includes(ROUTES.login)) {
    log(LOG_SCOPE.NAV, LOG_MESSAGES.NAV.REDIRECT_LOGIN);

    await page.goto(`${APP_URL}${ROUTES.login}`, {
      waitUntil: "domcontentloaded",
    });
  }

  // Confirm login UI exists
  await page
    .getByRole("heading", { name: AUTH_INDICATORS.loginHeading })
    .waitFor({ timeout: 15_000 });

  // Human-in-the-loop
  await waitForHumanLogin(page, new RegExp(`${ROUTES.dashboard}$`));

  // Persist session
  await saveSession(context, SESSION_PATH);

  log(LOG_SCOPE.AUTH, LOG_MESSAGES.AUTH.SUCCESS);
}
