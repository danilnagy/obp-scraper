const { scraper: dlcScraper } = require("./lib/dlc");

async function scraper(service, params) {
  switch (service.toLowerCase()) {
    case "dlc":
      return await dlcScraper(params);
    // case "pseg":
    //   return await psegScraper(username, password);
    // case "coned":
    //   return await conedScraper(username, password);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
}

module.exports = { scraper };
