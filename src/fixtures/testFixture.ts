import { test as base, expect, chromium } from '@playwright/test';
import type { Browser as PlaywrightBrowser, BrowserContext, Page } from '@playwright/test';
import { allure } from 'allure-playwright';
import { remote } from 'webdriverio';
import type { Browser as WdioBrowser } from 'webdriverio';
import { PageFactory, PlatformContext } from '../factory/PageFactory.js';
import { mobileConfig } from '../config/mobile.config.js';
import { ILogin, IInventory, ICheckout } from '../contracts/index.js';

export interface FrameworkFixtures {
  platformContext: PlatformContext;
  loginPage: ILogin;
  inventoryPage: IInventory;
  checkoutPage: ICheckout;
}

export const test = base.extend<FrameworkFixtures>({
  platformContext: async ({}, use, testInfo) => {
    const platform = (process.env.PLATFORM || 'web').toLowerCase();
    const isMobile = platform === 'android' || platform === 'mobile';

    if (isMobile) {
      console.log('[INFO] Connecting to Appium server for Android (No web browser launched)...');

      // 1. Tag and configure Allure for Android platform isolation
      try {
        await allure.parentSuite('Android Mobile Platform');
        await allure.suite('MyDemoAppRN Native Application');
        await allure.parameter('Platform', 'Android Mobile');
        await allure.parameter('Automation Engine', 'Appium UiAutomator2');
        await allure.parameter('Device / Target', process.env.ANDROID_DEVICE_NAME || 'emulator-5554');
        await allure.tag('android');
        await allure.tag('mobile');
      } catch {
        // Fallback if allure reporter context is not initialized
      }
      testInfo.annotations.push({ type: 'Platform', description: 'Android Mobile (UiAutomator2)' });

      let driver: WdioBrowser | undefined;
      try {
        driver = await remote(mobileConfig);
      } catch (err: any) {
        console.error(
          '\n[ERROR] Could not connect to Appium server. Please ensure an Appium server is running at http://127.0.0.1:4723 (e.g., via "npx appium") and an Android emulator/device is connected.\n',
        );
        throw err;
      }

      await use({ driver });

      if (driver) {
        // Capture screenshot on test failure for Allure report
        if (testInfo.status !== testInfo.expectedStatus) {
          try {
            const screenshotBase64 = await driver.takeScreenshot();
            await testInfo.attach('Android-Failure-Screenshot', {
              body: Buffer.from(screenshotBase64, 'base64'),
              contentType: 'image/png',
            });
          } catch {
            // Ignore capture error
          }
        }

        console.log('[INFO] Ending Appium session...');
        await driver.deleteSession();
      }
    } else {
      // 2. Tag and configure Allure for Web platform isolation
      try {
        await allure.parentSuite('Web Desktop Platform');
        await allure.suite('SauceDemo Web Application');
        await allure.parameter('Platform', 'Web Desktop');
        await allure.parameter('Automation Engine', 'Playwright Chromium');
        await allure.parameter('Device / Target', 'Chromium (Headed)');
        await allure.tag('web');
        await allure.tag('desktop');
      } catch {
        // Fallback
      }
      testInfo.annotations.push({ type: 'Platform', description: 'Web Desktop (Chromium)' });

      // Launch web browser in headed mode by default unless HEADLESS=true is explicitly set
      const isHeadless = process.env.HEADLESS === 'true';
      const browser: PlaywrightBrowser = await chromium.launch({ headless: isHeadless });
      const context: BrowserContext = await browser.newContext();
      const page: Page = await context.newPage();

      await use({ page });

      await context.close();
      await browser.close();
    }
  },

  loginPage: async ({ platformContext }, use) => {
    const login = PageFactory.getLoginPage(platformContext);
    await use(login);
  },

  inventoryPage: async ({ platformContext }, use) => {
    const inventory = PageFactory.getInventoryPage(platformContext);
    await use(inventory);
  },

  checkoutPage: async ({ platformContext }, use) => {
    const checkout = PageFactory.getCheckoutPage(platformContext);
    await use(checkout);
  },
});

export { expect };
