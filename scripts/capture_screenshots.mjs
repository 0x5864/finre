import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const pageUrl = process.env.FINRE_SCREENSHOT_URL || 'http://127.0.0.1:4173/web/';
const outputDir = path.join(repoRoot, 'docs', 'screenshots');

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replaceAll('\u0131', 'i')
    .replaceAll('\u011f', 'g')
    .replaceAll('\u015f', 's')
    .replaceAll('\u00fc', 'u')
    .replaceAll('\u00f6', 'o')
    .replaceAll('\u00e7', 'c');
}

async function fillCurrentAnswer(page) {
  const questionTitle = await page.locator('#questionTitle').textContent();
  const normalized = normalizeText(questionTitle);

  const choiceCount = await page.locator('#answerArea .choice').count();
  if (choiceCount > 0) {
    let preferredIndex = 0;

    if (normalized.includes('geciken odeme')) {
      preferredIndex = 1;
    } else if (normalized.includes('hedefe ulasma tarihi')) {
      preferredIndex = 0;
    } else if (normalized.includes('planli mi yoksa anlik')) {
      preferredIndex = 0;
    }

    const safeIndex = Math.min(preferredIndex, choiceCount - 1);
    await page.locator('#answerArea .choice').nth(safeIndex).click({ force: true });
    return;
  }

  const numberInput = page.locator('#answerArea input[type="number"]');
  if ((await numberInput.count()) > 0) {
    let value = '5000';

    if (normalized.includes('net gelir')) {
      value = '100000';
    } else if (normalized.includes('toplam borc odemen')) {
      value = '12000';
    } else if (normalized.includes('kac aylik temel gider')) {
      value = '4';
    } else if (normalized.includes('kac kisiye finansal destek')) {
      value = '1';
    }

    await numberInput.fill(value);
    return;
  }

  const textArea = page.locator('#answerArea textarea');
  if ((await textArea.count()) > 0) {
    await textArea.fill('Acil fonu buyutmek ve borcu azaltmak istiyorum.');
    return;
  }

  const textInput = page.locator('#answerArea input[type="text"]');
  if ((await textInput.count()) > 0) {
    await textInput.fill('ornek cevap');
  }
}

async function progressUntilResult(page) {
  let previousLabel = '';
  let stuckCount = 0;

  for (let index = 0; index < 120; index += 1) {
    const resultVisible = await page.locator('#resultView:not(.hidden)').count();
    if (resultVisible > 0) {
      return;
    }

    await page.waitForSelector('#questionView:not(.hidden) #questionTitle', {
      timeout: 30000,
    });
    const stepLabel = await page.locator('#stepCounter').textContent();
    if (stepLabel === previousLabel) {
      stuckCount += 1;
    } else {
      previousLabel = stepLabel || '';
      stuckCount = 0;
    }
    if (stuckCount >= 5) {
      throw new Error(`Flow appears stuck at step label: ${stepLabel}`);
    }

    console.log(`progress: ${stepLabel} | ${await page.locator('#questionTitle').textContent()}`);
    await fillCurrentAnswer(page);

    await page.locator('#nextButton').click();
    await page.waitForTimeout(120);
  }

  throw new Error('Result screen did not appear within expected step count.');
}

async function captureDesktopFlow(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#consentView:not(.hidden)', {
    timeout: 30000,
  });
  await page.waitForTimeout(350);

  await page.screenshot({
    path: path.join(outputDir, 'consent-desktop.png'),
    fullPage: false,
  });

  await page.locator('#consentCheckbox').check();
  await page.locator('#nextButton').click();

  await page.waitForSelector('#questionView:not(.hidden) #questionTitle', {
    timeout: 30000,
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(outputDir, 'wizard-desktop.png'),
    fullPage: false,
  });

  await progressUntilResult(page);
  await page.waitForSelector('#resultView:not(.hidden)', { timeout: 30000 });
  await page.waitForTimeout(450);

  await page.screenshot({
    path: path.join(outputDir, 'result-desktop.png'),
    fullPage: false,
  });

  await context.close();
}

async function captureMobile(browser) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto(pageUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#consentView:not(.hidden)', {
    timeout: 30000,
  });
  await page.locator('#consentCheckbox').check();
  await page.locator('#nextButton').click();
  await page.waitForSelector('#questionView:not(.hidden) #questionTitle', {
    timeout: 30000,
  });
  await page.waitForTimeout(500);

  await page.screenshot({
    path: path.join(outputDir, 'wizard-mobile.png'),
    fullPage: false,
  });

  await context.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });

  try {
    await captureDesktopFlow(browser);
    await captureMobile(browser);
  } finally {
    await browser.close();
  }

  console.log('Screenshots created in docs/screenshots');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
