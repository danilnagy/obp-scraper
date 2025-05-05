// server.js
const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = 3232;

// Optional: add basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Scrape endpoint
app.get("/scrape", async (req, res) => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://example.com");

    const title = await page.title();
    const content = await page.textContent("body");

    await browser.close();

    res.json({
      status: "success",
      title,
      content: content?.substring(0, 200) || "", // limit to first 200 characters
    });
  } catch (err) {
    if (browser) await browser.close();
    console.error("Scraping failed:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Playwright Scraper is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
