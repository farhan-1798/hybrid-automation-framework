const { spawnSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const target = (process.argv[2] || 'all').toLowerCase();

console.log(`\n==================================================`);
console.log(`🚀 Starting Hybrid Automation Test Run: [${target.toUpperCase()}]`);
console.log(`==================================================\n`);

function getCleanEnv(extraEnv = {}) {
  const defaultSdkPath = path.join(os.homedir(), 'Android/Sdk');
  const androidHome = process.env.ANDROID_HOME || defaultSdkPath;
  const platformTools = path.join(androidHome, 'platform-tools');
  const emulatorDir = path.join(androidHome, 'emulator');

  const clean = {
    ...process.env,
    ANDROID_HOME: androidHome,
    ANDROID_SDK_ROOT: androidHome,
    PATH: `${platformTools}:${emulatorDir}:${process.env.PATH || ''}`,
    ...extraEnv,
  };
  delete clean.LD_LIBRARY_PATH;
  delete clean.LD_PRELOAD;
  return clean;
}

function runCommand(command, envVars = {}) {
  const result = spawnSync(command, {
    shell: true,
    stdio: 'inherit',
    env: getCleanEnv(envVars),
  });
  return result.status ?? 0;
}

async function isAppiumRunning() {
  try {
    const res = await fetch('http://127.0.0.1:4723/status', { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

function checkConnectedDevices() {
  try {
    const output = spawnSync('adb', ['devices'], { encoding: 'utf-8', env: getCleanEnv() });
    if (output.status === 0) {
      const lines = output.stdout.trim().split('\n').slice(1);
      const devices = lines.filter((l) => l.includes('\tdevice'));
      return devices.length > 0;
    }
  } catch {
    // adb not installed or not in PATH
  }
  return false;
}

async function ensureAppiumServer() {
  console.log('[INFO] Checking Appium server status on port 4723...');
  const running = await isAppiumRunning();
  if (running) {
    console.log('[INFO] Appium server is already running and ready.\n');
    return null;
  }

  console.log('[INFO] Starting Appium server in background...');
  const appiumProc = spawn('npx', ['appium', '--port', '4723'], {
    env: getCleanEnv(),
    stdio: 'pipe',
  });

  // Wait for Appium to become ready
  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await isAppiumRunning()) {
      console.log('[INFO] Appium server successfully started!\n');
      return appiumProc;
    }
  }

  console.warn('[WARNING] Could not auto-start Appium server. Tests may fail if port 4723 is unreachable.\n');
  return appiumProc;
}

async function main() {
  let appiumProcess = null;

  // Clean old test run artifacts so the Allure report shows only the current run
  const resultsDir = path.resolve(__dirname, '../allure-results');
  if (fs.existsSync(resultsDir)) {
    fs.rmSync(resultsDir, { recursive: true, force: true });
  }

  try {
    let testStatus = 0;

    if (target === 'android' || target === 'all') {
      const hasDevice = checkConnectedDevices();
      if (!hasDevice) {
        console.log('--------------------------------------------------');
        console.log('⚠️  NO ANDROID DEVICE OR EMULATOR DETECTED!');
        console.log('Please ensure one of the following is active:');
        console.log('  1. An Android Emulator is launched (via Android Studio Device Manager)');
        console.log('  2. A physical Android phone is connected via USB with "USB Debugging" enabled');
        console.log('--------------------------------------------------\n');
      }

      appiumProcess = await ensureAppiumServer();
    }

    if (target === 'web') {
      console.log('[INFO] Executing Web automation in headed mode (Project: Web-Desktop)...\n');
      testStatus = runCommand('npx playwright test --project=Web-Desktop --headed', { PLATFORM: 'web' });
    } else if (target === 'android') {
      console.log('[INFO] Executing Android mobile automation in headed mode on device/emulator (Project: Android-Mobile)...\n');
      testStatus = runCommand('npx playwright test --project=Android-Mobile', { PLATFORM: 'android' });
    } else if (target === 'all') {
      console.log('[INFO] Step 1 of 2: Executing Web automation in headed mode (Project: Web-Desktop)...\n');
      const webStatus = runCommand('npx playwright test --project=Web-Desktop --headed', { PLATFORM: 'web' });

      console.log('\n[INFO] Step 2 of 2: Executing Android mobile automation in headed mode (Project: Android-Mobile)...\n');
      const androidStatus = runCommand('npx playwright test --project=Android-Mobile', { PLATFORM: 'android' });

      testStatus = webStatus !== 0 ? webStatus : androidStatus;
    } else {
      console.error(`[ERROR] Unknown target: "${target}". Expected "web", "android", or "all".`);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('📊 Opening Allure Report...');
    console.log('==================================================\n');

    // Launch the report viewer server & browser
    const openReportScript = path.resolve(__dirname, 'open-report.js');
    spawnSync('node', [openReportScript], {
      stdio: 'inherit',
      env: getCleanEnv(),
    });

    process.exit(testStatus);
  } finally {
    if (appiumProcess) {
      console.log('[INFO] Stopping background Appium server...');
      appiumProcess.kill();
    }
  }
}

main();
