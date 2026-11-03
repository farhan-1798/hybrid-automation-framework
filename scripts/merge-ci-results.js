const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ALLURE_RESULTS = path.join(ROOT_DIR, 'allure-results');
const WEB_RESULTS = path.join(ALLURE_RESULTS, 'web');
const ANDROID_RESULTS = path.join(ALLURE_RESULTS, 'android');

console.log('[CI] Consolidating Web and Android Allure test results...');

if (!fs.existsSync(ALLURE_RESULTS)) {
  fs.mkdirSync(ALLURE_RESULTS, { recursive: true });
}

function copyFiles(sourceDir) {
  if (!fs.existsSync(sourceDir)) return 0;
  let count = 0;
  const items = fs.readdirSync(sourceDir);
  for (const item of items) {
    const srcPath = path.join(sourceDir, item);
    const destPath = path.join(ALLURE_RESULTS, item);
    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

const webCopied = copyFiles(WEB_RESULTS);
const androidCopied = copyFiles(ANDROID_RESULTS);

console.log(`[CI] Merged ${webCopied} web result files and ${androidCopied} android result files.`);

// Generate CI environment properties
const envPropertiesPath = path.join(ALLURE_RESULTS, 'environment.properties');
const envContent = [
  'Framework=Hybrid Playwright + WebdriverIO + Appium',
  'CI.Platform=GitHub Actions',
  `CI.Run.ID=${process.env.GITHUB_RUN_ID || 'local'}`,
  `CI.Run.Number=${process.env.GITHUB_RUN_NUMBER || '1'}`,
  `CI.Branch=${process.env.GITHUB_REF_NAME || 'local'}`,
  `CI.Commit.SHA=${(process.env.GITHUB_SHA || '').substring(0, 7) || 'local'}`,
  `CI.Trigger=${process.env.GITHUB_EVENT_NAME || 'manual'}`,
  'Report.Deployment=GitHub Pages',
  'Report.URL=https://farhan-1798.github.io/hybrid-automation-framework/',
  'Report.Recipient=farhan.naser71@gmail.com',
  'Web.Platform=Linux / Chromium',
  'Web.Target.URL=https://www.saucedemo.com',
  'Mobile.Platform=Android (API 30/33)',
  'Mobile.Driver=UiAutomator2 (v4.2.9)',
  'Mobile.Server=Appium (v2.19.0)',
  'Mobile.Application=Sauce Labs React Native Demo (v1.3.0)',
  'TestData.Management=testdata.csv',
].join('\n');

fs.writeFileSync(envPropertiesPath, envContent, 'utf-8');
console.log('[CI] Generated environment.properties successfully.');

