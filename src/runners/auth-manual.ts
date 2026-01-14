import { createPage } from "../core/browser";
import { manualAuthentication } from "../workflows/auth/manual-auth";


async function run() {
    const { browser, context, page } = await createPage({
        headless: false
    })

    try {
        await manualAuthentication(page, context);
    } finally {
        await browser.close();
    }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});