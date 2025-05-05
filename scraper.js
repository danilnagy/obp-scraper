const fs = require("fs/promises");
const path = require("path");
const AdmZip = require("adm-zip");
const { chromium } = require("playwright");

async function scrapeExampleDotCom(username, password) {
  // const browser = await chromium.launch();
  // const page = await browser.newPage();
  // await page.goto("https://example.com");
  // const title = await page.title();
  // await browser.close();
  // return title;
  const browser = await chromium.launch({ headless: false }); // headless on the server
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  // —— 1. Login ————————————————————————————————
  await page.goto("https://duquesnelight.com/");
  await page.getByRole("link", { name: "Log In" }).click();
  await page.waitForSelector('input[formcontrolname="username"]');
  await page.fill('input[formcontrolname="username"]', username);
  await page.fill('input[formcontrolname="password"]', password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "networkidle" }),
    page.click('button[type="submit"], input[type="submit"]'),
  ]);

  await page.goto(
    "https://duquesnelight.com/account-billing/my-account-summary"
  );

  // —— 2. Navigate to “My Electric Use” and open export dialog —
  await page.getByRole("link", { name: /My Electric Use/i }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForSelector(".green-button");
  await page.click(".green-button");

  // —— 3. Pick the date range and trigger the download ——
  await page.click('label[for="period-date"]');
  await page.waitForSelector("input#period-date:checked", { timeout: 5000 });

  // —— 4. Fill in From and To dates with focus + confirmation
  await page.waitForSelector("#date-selector--select-date-from", {
    timeout: 10000,
  });
  await page.waitForSelector("#date-selector--select-date-to", {
    timeout: 10000,
  });

  const fromInput = page.locator("#date-selector--select-date-from");
  const toInput = page.locator("#date-selector--select-date-to");

  await fromInput.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await fromInput.fill("01/01/2024");

  await toInput.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await toInput.fill("12/31/2024");
  await page.keyboard.press("Tab"); // blur the input

  // —— 5. Fill in From and To dates with focus + confirmationWait for Export button to be enabled, then click and wait for download
  const exportButton = page.getByRole("button", { name: "Export" });
  await exportButton.waitFor({ state: "visible", timeout: 5000 });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    exportButton.click(),
  ]);

  // Wait until Playwright finishes downloading
  const filePath = await download.path();
  if (!filePath) throw new Error("Download failed or file path not available");

  // Then save to desired location
  console.log("process.cwd()", process.cwd());
  const tmpZip = path.join(process.cwd(), "tmp-export.zip");

  await download.saveAs(tmpZip);
  await browser.close();

  // —— 6. Extract the CSV from the ZIP ————————————
  const zip = new AdmZip(tmpZip);
  const entry = zip.getEntries().find((e) => e.entryName.endsWith(".csv"));
  if (!entry) throw new Error("CSV not found in export");
  const csv = zip.readAsText(entry);
  await fs.unlink(tmpZip); // tidy up

  return csv;
}

module.exports = { scrapeExampleDotCom };
