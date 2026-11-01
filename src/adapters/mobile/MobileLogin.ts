import type { Browser } from 'webdriverio';
import { ILogin } from '../../contracts/ILogin.js';

export class MobileLogin implements ILogin {
  private driver: Browser;

  // Real Accessibility IDs verified from Sauce Labs MyDemoAppRN
  private readonly menuButton = '~open menu';
  private readonly loginMenuItem = '~menu item log in';
  private readonly usernameInput = '~Username input field';
  private readonly passwordInput = '~Password input field';
  private readonly loginButton = '~Login button';
  private readonly errorMessage = '~generic-error-message';
  private readonly cartIcon = '~cart badge';

  constructor(driver: Browser) {
    this.driver = driver;
  }

  async open(): Promise<void> {
    const menu = await this.driver.$(this.menuButton);
    await menu.waitForDisplayed({ timeout: 15000 });
    await menu.click();

    const loginItem = await this.driver.$(this.loginMenuItem);
    await loginItem.waitForDisplayed({ timeout: 5000 });
    await loginItem.click();
  }

  async login(username: string, password: string): Promise<void> {
    // Platform credential mapping for agnostic test spec compatibility
    let appUser = username;
    let appPass = password;

    if (username === 'standard_user') {
      appUser = 'bob@example.com';
      appPass = '10203040';
    } else if (username === 'locked_out_user') {
      appUser = 'alice@example.com';
      appPass = '10203040';
    }

    const userField = await this.driver.$(this.usernameInput);
    await userField.waitForDisplayed({ timeout: 5000 });
    await userField.setValue(appUser);

    const passField = await this.driver.$(this.passwordInput);
    await passField.setValue(appPass);

    const submitBtn = await this.driver.$(this.loginButton);
    await submitBtn.click();
  }

  async getErrorMessage(): Promise<string> {
    const errorContainer = await this.driver.$(this.errorMessage);
    await errorContainer.waitForDisplayed({ timeout: 5000 });

    // Retrieve text from child TextView inside the generic-error-message ViewGroup
    const textEl = await errorContainer.$('android.widget.TextView');
    if (await textEl.isExisting()) {
      const text = await textEl.getText();
      if (text) return text;
    }
    return await errorContainer.getText();
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Upon successful login, the app redirects back to products screen with cart badge
      const cart = await this.driver.$(this.cartIcon);
      await cart.waitForDisplayed({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
