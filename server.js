// server.js
const express = require("express");
const { scrapeExampleDotCom } = require("./scraper");

const app = express();
const PORT = 3232;

// Optional: add basic logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Scrape endpoint
app.get("/scrape", async (req, res) => {
  try {
    const title = await scrapeExampleDotCom();
    res.json({ status: "success", title });
  } catch (err) {
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
