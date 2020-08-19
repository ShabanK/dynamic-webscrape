const { Builder, By, Key, until } = require("selenium-webdriver");
const cheerio = require("cheerio");

const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("testData.json");
const db = low(adapter);

//todo
//figure out how to pass states as abbreviations
//loop

// function returnState(abbr) {}

async function main() {
  const arrOfAddresses = await db.get("Sheet1").value();
  const { Address, City, State } = arrOfAddresses[0];
  await foo(Address, City, State, 0, arrOfAddresses);
}

async function foo(Address, City, State, Index, arrOfAddresses) {
  let driver = await new Builder().forBrowser("chrome").build();
  try {
    await driver.get("https://data.hrsa.gov/tools/shortage-area/by-address");

    //enter address
    await driver.findElement(By.id("inputAddress")).sendKeys(Address);

    //enter city
    await driver.findElement(By.id("inputCity")).sendKeys(City);

    //enter state
    await driver.findElement(By.id("ddlState")).sendKeys(State);

    //click search
    await (await driver.findElement(By.id("btnDrill"))).click();

    //wait for data to fetch
    await driver.wait(until.elementLocated(By.id("btnStartOver")), 15000);

    const pageSource = await driver.getPageSource();
    let $ = cheerio.load(pageSource);
    let $$ = cheerio.load($("#resultPanel").html());
    let list = [];
    $$("div[class='col-xs-12 col-md-4 col-md-pull-8']")
      .find("div>p")
      .each((index, element) => {
        list.push($(element));
      });
    console.log(list.length);
    console.log("START");
    let $$$ = cheerio.load(list[4].html());
    let strYes = $$$("strong.text-success").text();
    let strNo = $$$("strong.text-danger").text();

    let $$$$ = cheerio.load(list[5].html());
    let str2Yes = $$$$("strong.text-success").text();
    let str2No = $$$$("strong.text-danger").text();

    let HSPA;
    let MUA;

    if (strYes) {
      HSPA = "Y";
    }
    if (strNo) {
      HSPA = "N";
    }

    if (str2Yes) {
      MUA = "Y";
    }
    if (str2No) {
      MUA = "N";
    }

    db.get("Sheet1")
      .find({
        Address: Address,
        City: City,
        State: State,
      })
      .assign({ "Primary Care HPSA?": HSPA, "MUA?": MUA })
      .write();
  } catch (err) {
    console.log(err);
  } finally {
    await driver.quit();
    console.log("here");
    //condition for recursion
    if (Index < arrOfAddresses.length - 2) {
      Index++;
      const { Address, City, State } = arrOfAddresses[Index];
      await foo(Address, City, State, Index, arrOfAddresses);
    }
    console.log("yay all done");
  }
}

main();
