const puppeteer = require('puppeteer');
const readline = require('readline');
const { once } = require('events');

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

  console.log('ok!');
  browser.close();
}

run();
