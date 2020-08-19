const { Builder, By, Key, until } = require("selenium-webdriver");
const cheerio = require("cheerio");

function returnState(abbr) {}

async function foo() {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://data.hrsa.gov/tools/shortage-area/by-address");

    //enter address
    await driver
      .findElement(By.id("inputAddress"))
      .sendKeys("2197 W DIMOND BLVD");

    //enter city
    await driver.findElement(By.id("inputCity")).sendKeys("ANCHORAGE");

    //enter state
    await driver.findElement(By.id("ddlState")).sendKeys("Alabama");

    //click search
    await (await driver.findElement(By.id("btnDrill"))).click();

    //wait for data to fetch
    await driver.wait(until.elementLocated(By.id("btnStartOver")), 13000);

    const pageSource = await driver.getPageSource();
    const $ = cheerio.load(pageSource);
    // console.log($("#resultPanel").html());
    const $$ = cheerio.load($("#resultPanel").html());
    console.log(
      $("strong").attr("class", "rural-analyzer-info-heading").html()
    );
    // console.log(
    //   $$("strong").attr("class", "rural-analyzer-info-heading").html()
    // );
  } finally {
    // await driver.quit();
    console.log("yay all done");
  }
}
foo();
