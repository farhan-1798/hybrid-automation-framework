const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

const APK_URL =
  'https://github.com/saucelabs/my-demo-app-rn/releases/download/v1.3.0/Android-MyDemoAppRN.1.3.0.build-244.apk';
const APPS_DIR = path.resolve(__dirname, '../apps');
const TARGET_PATH = path.join(APPS_DIR, 'saucedemo.apk');

async function downloadApk() {
  if (!fs.existsSync(APPS_DIR)) {
    fs.mkdirSync(APPS_DIR, { recursive: true });
  }

  if (fs.existsSync(TARGET_PATH)) {
    console.log(`[INFO] APK already exists at: ${TARGET_PATH}`);
    return;
  }

  console.log(`[INFO] Downloading Sauce Labs Demo APK from: ${APK_URL}`);
  const response = await fetch(APK_URL);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download APK: ${response.status} ${response.statusText}`);
  }

  const fileStream = fs.createWriteStream(TARGET_PATH);
  await finished(Readable.fromWeb(response.body).pipe(fileStream));

  console.log(`[SUCCESS] APK downloaded successfully to: ${TARGET_PATH}`);
}

downloadApk().catch((err) => {
  console.error('[ERROR] Download failed:', err);
  process.exit(1);
});

