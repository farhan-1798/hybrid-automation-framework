import { Page } from '@playwright/test';
import { ILogin } from '../../contracts/ILogin.js';

export class WebLogin implements ILogin {
  private page: Page;

  // Web-specific locators (CSS / data-test attributes)
  private readonly usernameInput = '[data-test="username"]';
  private readonly passwordInput = '[data-test="password"]';
  private readonly loginButton = '[data-test="login-button"]';
  private readonly errorMessage = '[data-test="error"]';
  private readonly inventoryContainer = '.inventory_list';

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto('https://www.saucedemo.com');
  }

  async login(username: string, password: string): Promise<void> {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);
  }

  async getErrorMessage(): Promise<string> {
    const errorEl = this.page.locator(this.errorMessage);
    await errorEl.waitFor({ state: 'visible', timeout: 5000 });
    return (await errorEl.textContent()) || '';
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.inventoryContainer, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

