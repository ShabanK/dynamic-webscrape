const cheerio = require("cheerio");
const lowdb = require("lowdb");
const request = require("request");

request(
  "https://data.hrsa.gov/tools/shortage-area/by-address",
  (err, res, html) => {
    if (!err && res.statusCode == 200) {
      const $ = cheerio.load(html);
      console.log($("#inputAddress").parentNode);
    }
  }
);
