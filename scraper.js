const { chromium } = require("playwright");

async function scrapeExampleDotCom() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("https://example.com");
  const title = await page.title();
  await browser.close();
  return title;
}

module.exports = { scrapeExampleDotCom };
