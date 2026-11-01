import { Page } from '@playwright/test';
import type { Browser } from 'webdriverio';
import { ILogin, IInventory, ICheckout } from '../contracts/index.js';
import { WebLogin, WebInventory, WebCheckout } from '../adapters/web/index.js';
import { MobileLogin, MobileInventory, MobileCheckout } from '../adapters/mobile/index.js';

export interface PlatformContext {
  page?: Page;
  driver?: Browser;
}

export class PageFactory {
  private static isMobilePlatform(): boolean {
    const platform = (process.env.PLATFORM || 'web').toLowerCase();
    return platform === 'android' || platform === 'mobile';
  }

  static getLoginPage(context: PlatformContext): ILogin {
    if (this.isMobilePlatform()) {
      if (!context.driver) {
        throw new Error('Mobile driver must be provided when running on Android/Mobile platform');
      }
      return new MobileLogin(context.driver);
    }

    if (!context.page) {
      throw new Error('Playwright page must be provided when running on Web platform');
    }
    return new WebLogin(context.page);
  }

  static getInventoryPage(context: PlatformContext): IInventory {
    if (this.isMobilePlatform()) {
      if (!context.driver) {
        throw new Error('Mobile driver must be provided when running on Android/Mobile platform');
      }
      return new MobileInventory(context.driver);
    }

    if (!context.page) {
      throw new Error('Playwright page must be provided when running on Web platform');
    }
    return new WebInventory(context.page);
  }

  static getCheckoutPage(context: PlatformContext): ICheckout {
    if (this.isMobilePlatform()) {
      if (!context.driver) {
        throw new Error('Mobile driver must be provided when running on Android/Mobile platform');
      }
      return new MobileCheckout(context.driver);
    }

    if (!context.page) {
      throw new Error('Playwright page must be provided when running on Web platform');
    }
    return new WebCheckout(context.page);
  }
}

