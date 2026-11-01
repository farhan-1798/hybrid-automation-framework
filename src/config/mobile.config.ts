import * as path from 'path';
import * as os from 'os';

const defaultSdkPath = path.join(os.homedir(), 'Android/Sdk');
if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
  process.env.ANDROID_HOME = defaultSdkPath;
  process.env.ANDROID_SDK_ROOT = defaultSdkPath;
}

if (process.env.ANDROID_HOME) {
  const platformTools = path.join(process.env.ANDROID_HOME, 'platform-tools');
  const emulatorDir = path.join(process.env.ANDROID_HOME, 'emulator');
  if (!process.env.PATH?.includes(platformTools)) {
    process.env.PATH = `${platformTools}:${emulatorDir}:${process.env.PATH}`;
  }
}

export const mobileConfig = {
  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  path: '/',
  capabilities: {
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.ANDROID_DEVICE_NAME || 'emulator-5554',
    'appium:app': process.env.APP_PATH || path.resolve(process.cwd(), 'apps/saucedemo.apk'),
    'appium:appPackage': 'com.saucelabs.mydemoapp.rn',
    'appium:appActivity': 'com.saucelabs.mydemoapp.rn.MainActivity',
    'appium:appWaitActivity': 'com.saucelabs.mydemoapp.rn.*',
    'appium:newCommandTimeout': 240,
    'appium:noReset': false,
    'appium:fullReset': false,
    'appium:isHeadless': false,
  },
};
