const puppeteer = require('puppeteer');
const readline = require('readline');
const { once } = require('events');
const moment = require('moment');

async function waitForSignIn() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Please sign in then press enter to continue. ', (_) => {
    rl.close();
  });
  await once(rl, 'close');
}

async function selectMenu(selector, itemText, page) {
  console.log(`picking ${selector} ${itemText}`);
  await page.click(`.${selector}-picker`);
  const itemsText = await page.$$eval(`.${selector}-picker .goog-menuitem-content`, menuItems => {
    return menuItems.map(menuItem => menuItem.innerText);
  });
  const menuItems = await page.$$(`.${selector}-picker .goog-menuitem-content`);
  for (let i = 0; i < menuItems.length; ++i) {
    if (itemsText[i] != itemText) {
      continue;
    }
    await menuItems[i].click();
    break;
  }
}

async function run() {
  const launchOptions = {
    headless: false,
    userDataDir: './user-data'
  };
  const browser = await puppeteer.launch(launchOptions);
  // console.log(await browser.version());
  const page = await browser.newPage();

  await page.goto('https://www.google.com/maps/timeline');
  let url = page.url();

  if (url.startsWith('https://accounts.google.com/signin')) {
    await waitForSignIn();
  }

  if (!url.startsWith('https://www.google.com/maps/timeline') &&
      !url.startsWith('https://google.com/maps/timeline')) {
    console.log('Not on the timeline. Please try running and logging in again.');
    browser.close();
    return;
  }

  const startDateStr = process.argv[2];
  const startDate = startDateStr ? moment(startDateStr) : moment().startOf('day').subtract(30, 'day');
  const endDateStr = process.argv[3];
  const endDate = endDateStr ? moment(endDateStr) : moment().startOf('day').subtract(8, 'day');
  console.log(`Deleting from ${startDate.format('YYYY-MM-DD')} to ${endDate.format('YYYY-MM-DD')}`);

  for (let m = startDate; m.isSameOrBefore(moment(endDate)); m = m.add(1, 'days')) {
    await selectMenu('year', m.format('YYYY'), page);
    await selectMenu('month', m.format('MMMM'), page);

    console.log(`picking day ${m.format('D MMM')}`);
    await page.click('.day-picker');
    await page.click(`.day-picker td[aria-label="${m.format('D MMM')}"]`);

    console.log('wait for day to load (xpath)');
    await page.waitForXPath(`//div[contains(text(), "${m.format('MMMM D, YYYY')}")]`);
    await page.waitForSelector('#page-header-buffer-bar', {hidden: true});
    await page.click('i.delete-button');

    console.log('wait for delete dialog');
    await page.waitForSelector('button.delete-button');
    await page.click('button.delete-button');

    console.log('wait for snackbar to appear');
    await page.waitForSelector('.snack-bar', {visible: true});
    console.log('wait for snackbar to hide');
    await page.waitForSelector('.snack-bar', {hidden: true});
  }


  console.log('ok!');
  browser.close();
}

run();
