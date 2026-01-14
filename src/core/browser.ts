import { Browser, BrowserContext, chromium, Page } from "playwright";

type CreatePageOptions = {
    headless?: boolean;
    slowMo?: number;
    storageState?: string;
}



export async function createPage(
    options: CreatePageOptions = {}
): Promise<{
    browser: Browser;
    context: BrowserContext;
    page: Page
}> {
    const browser = await chromium.launch({
        headless: options.headless ?? true,
        slowMo: options.slowMo
    });

    const context = await browser.newContext({
        storageState: options.storageState
    })

    const page = await context.newPage();

    return {
        browser,
        context,
        page
    }
}