import { test as base, expect, chromium } from '@playwright/test';
import type { Browser as PlaywrightBrowser, BrowserContext, Page } from '@playwright/test';
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
  platformContext: async ({}, use) => {
    const platform = (process.env.PLATFORM || 'web').toLowerCase();
    const isMobile = platform === 'android' || platform === 'mobile';

    if (isMobile) {
      console.log('[INFO] Connecting to Appium server for Android (No web browser launched)...');
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
        console.log('[INFO] Ending Appium session...');
        await driver.deleteSession();
      }
    } else {
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
