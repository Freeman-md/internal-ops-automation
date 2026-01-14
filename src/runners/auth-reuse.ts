
import { createPage } from "../core/browser";
import { SESSION_PATH } from '../config/app';
import { ensureAuthenticated } from "../workflows/auth/ensure-authenticated";


async function run() {
    const { browser, page } = await createPage({
        headless: true,
        storageState: SESSION_PATH
    })

    try {
        await ensureAuthenticated(page)
        console.log("[SESSION] Reuse successful");
    } finally {
        await browser.close()
    }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});